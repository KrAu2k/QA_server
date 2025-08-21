#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 加载表白名单配置
let tableWhitelist = [];
try {
  const configPath = path.join(__dirname, 'migration-tables.json');
  const configContent = require(configPath);
  tableWhitelist = configContent.tableWhitelist || [];
  console.log(`✅ 已加载表白名单，包含 ${tableWhitelist.length} 个表`);
} catch (error) {
  console.warn('⚠️  无法加载表白名单配置，将迁移所有表');
}

// 从环境变量读取数据库配置
const config = {
  source: {
    host: process.env.SOURCE_DB_HOST || '8.135.6.60',
    port: parseInt(process.env.SOURCE_DB_PORT) || 3307,
    user: process.env.SOURCE_DB_USER || 'ranci01',
    password: process.env.SOURCE_DB_PASSWORD || 'Ranci@mysql2022',
    database: process.env.SOURCE_DB_NAME || 'ranci'
  },
  target: {
    host: process.env.TARGET_DB_HOST || '8.135.6.60',
    port: parseInt(process.env.TARGET_DB_PORT) || 3307,
    user: process.env.TARGET_DB_USER || 'ranci01',
    password: process.env.TARGET_DB_PASSWORD || 'Ranci@mysql2022',
    database: process.env.TARGET_DB_NAME || 'report'
  }
};

// 需要排除的系统表（即使在白名单中也要排除）
const systemTables = [
  'migrations',
  'typeorm_metadata',
  'mysql',
  'information_schema',
  'performance_schema',
  'sys'
];

// 需要忽略的数据表（只创建结构，不复制数据）
const structureOnlyTables = [
  'logs', // 日志表只要结构
];

class SelectiveDatabaseMigrator {
  constructor() {
    this.sourceConnection = null;
    this.targetConnection = null;
    this.totalTables = 0;
    this.processedTables = 0;
    this.skippedTables = 0;
    this.logFile = path.join(__dirname, `selective-migration-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`);
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    try {
      await fs.appendFile(this.logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async createTargetDatabase() {
    try {
      // 首先连接到服务器（不指定数据库）
      const adminConnection = await mysql.createConnection({
        host: config.target.host,
        port: config.target.port,
        user: config.target.user,
        password: config.target.password
      });

      await this.log(`🔗 Connected to MySQL server for database creation`);

      // 创建目标数据库（如果不存在）
      await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.target.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await this.log(`✅ Target database '${config.target.database}' is ready`);
      
      await adminConnection.end();
    } catch (error) {
      await this.log(`❌ Failed to create target database: ${error.message}`);
      throw error;
    }
  }

  async connect() {
    try {
      // 首先创建目标数据库
      await this.createTargetDatabase();
      
      // 连接到源数据库
      this.sourceConnection = await mysql.createConnection(config.source);
      await this.log(`🔗 Connected to source database: ${config.source.database}`);
      
      // 连接到目标数据库
      this.targetConnection = await mysql.createConnection(config.target);
      await this.log(`🔗 Connected to target database: ${config.target.database}`);
      
    } catch (error) {
      await this.log(`❌ Connection failed: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.sourceConnection) {
        await this.sourceConnection.end();
        await this.log('🔌 Disconnected from source database');
      }
      if (this.targetConnection) {
        await this.targetConnection.end();
        await this.log('🔌 Disconnected from target database');
      }
    } catch (error) {
      await this.log(`⚠️  Error during disconnect: ${error.message}`);
    }
  }

  async getFilteredTables() {
    try {
      const [rows] = await this.sourceConnection.execute(
        'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
        [config.source.database]
      );
      
      const allTables = rows.map(row => row.TABLE_NAME);
      let filteredTables = [];
      let skippedTables = [];
      
      if (tableWhitelist.length > 0) {
        // 使用白名单过滤
        for (const tableName of allTables) {
          if (systemTables.includes(tableName)) {
            skippedTables.push(`${tableName} (系统表)`);
            continue;
          }
          
          if (tableWhitelist.includes(tableName)) {
            filteredTables.push(tableName);
          } else {
            skippedTables.push(`${tableName} (不在白名单中)`);
          }
        }
        
        // 检查白名单中是否有不存在的表
        const missingTables = tableWhitelist.filter(table => !allTables.includes(table));
        if (missingTables.length > 0) {
          await this.log(`⚠️  警告：白名单中以下表在源数据库中不存在：${missingTables.join(', ')}`);
        }
      } else {
        // 没有白名单，排除系统表
        filteredTables = allTables.filter(tableName => !systemTables.includes(tableName));
        skippedTables = allTables.filter(tableName => systemTables.includes(tableName))
                                 .map(name => `${name} (系统表)`);
      }
      
      this.totalTables = filteredTables.length;
      this.skippedTables = skippedTables.length;
      
      await this.log(`📋 源数据库共有 ${allTables.length} 个表`);
      await this.log(`✅ 将迁移 ${this.totalTables} 个表`);
      await this.log(`⏭️  跳过 ${this.skippedTables} 个表`);
      
      if (skippedTables.length > 0) {
        await this.log(`跳过的表：${skippedTables.join(', ')}`);
      }
      
      return filteredTables;
    } catch (error) {
      await this.log(`❌ Failed to get tables: ${error.message}`);
      throw error;
    }
  }

  async getTableCreateStatement(tableName) {
    try {
      const [rows] = await this.sourceConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      return rows[0]['Create Table'];
    } catch (error) {
      await this.log(`❌ Failed to get create statement for table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  async createTable(tableName, createStatement) {
    try {
      // 删除目标表（如果存在）
      await this.targetConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
      
      // 创建表
      await this.targetConnection.execute(createStatement);
      await this.log(`✅ Created table: ${tableName}`);
    } catch (error) {
      await this.log(`❌ Failed to create table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  async getTableRowCount(tableName) {
    try {
      const [rows] = await this.sourceConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      return rows[0].count;
    } catch (error) {
      await this.log(`❌ Failed to count rows in table ${tableName}: ${error.message}`);
      return 0;
    }
  }

  async migrateTableData(tableName, batchSize = 1000) {
    try {
      // 检查是否为只迁移结构的表
      if (structureOnlyTables.includes(tableName)) {
        await this.log(`⚪ Table ${tableName} is structure-only, skipping data migration`);
        return 0;
      }

      const totalRows = await this.getTableRowCount(tableName);
      if (totalRows === 0) {
        await this.log(`⚪ Table ${tableName} is empty, skipping data migration`);
        return 0;
      }

      await this.log(`📊 Migrating ${totalRows} rows from table ${tableName}...`);

      let migratedRows = 0;
      for (let offset = 0; offset < totalRows; offset += batchSize) {
        const [rows] = await this.sourceConnection.execute(
          `SELECT * FROM \`${tableName}\` LIMIT ${batchSize} OFFSET ${offset}`
        );

        if (rows.length === 0) break;

        // 生成插入语句
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const insertSql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;

        // 批量插入
        for (const row of rows) {
          const values = columns.map(col => row[col]);
          await this.targetConnection.execute(insertSql, values);
        }

        migratedRows += rows.length;
        const progress = ((migratedRows / totalRows) * 100).toFixed(1);
        await this.log(`📈 Progress for ${tableName}: ${migratedRows}/${totalRows} (${progress}%)`);
      }

      await this.log(`✅ Successfully migrated ${migratedRows} rows to table ${tableName}`);
      return migratedRows;
    } catch (error) {
      await this.log(`❌ Failed to migrate data for table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  async verifyMigration(tableName) {
    try {
      const sourceCount = await this.getTableRowCount(tableName);
      
      const [targetRows] = await this.targetConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      const targetCount = targetRows[0].count;

      // 对于只迁移结构的表，目标应该为空
      if (structureOnlyTables.includes(tableName)) {
        if (targetCount === 0) {
          await this.log(`✅ Verification passed for ${tableName}: structure-only table (0 rows as expected)`);
          return true;
        } else {
          await this.log(`⚠️  Warning for ${tableName}: structure-only table but has ${targetCount} rows`);
          return false;
        }
      }

      if (sourceCount === targetCount) {
        await this.log(`✅ Verification passed for ${tableName}: ${sourceCount} rows`);
        return true;
      } else {
        await this.log(`❌ Verification failed for ${tableName}: source=${sourceCount}, target=${targetCount}`);
        return false;
      }
    } catch (error) {
      await this.log(`❌ Verification error for ${tableName}: ${error.message}`);
      return false;
    }
  }

  async migrateTable(tableName) {
    try {
      await this.log(`🔄 Starting migration for table: ${tableName}`);

      // 1. 获取并创建表结构
      const createStatement = await this.getTableCreateStatement(tableName);
      await this.createTable(tableName, createStatement);

      // 2. 迁移数据
      const migratedRows = await this.migrateTableData(tableName);

      // 3. 验证迁移
      const verified = await this.verifyMigration(tableName);

      this.processedTables++;
      const progress = ((this.processedTables / this.totalTables) * 100).toFixed(1);

      await this.log(`🎯 Completed ${tableName} (${this.processedTables}/${this.totalTables}, ${progress}%)`);
      await this.log('─'.repeat(50));

      return verified;
    } catch (error) {
      await this.log(`💥 Failed to migrate table ${tableName}: ${error.message}`);
      return false;
    }
  }

  async checkDatabasePermissions() {
    try {
      // 检查源数据库访问权限
      const [sourceResult] = await this.sourceConnection.execute('SELECT 1');
      await this.log(`✅ Source database access verified`);
      
      // 检查目标数据库权限
      const [targetResult] = await this.targetConnection.execute('SELECT 1');
      await this.log(`✅ Target database access verified`);
      
      // 检查创建表权限
      try {
        await this.targetConnection.execute('CREATE TABLE IF NOT EXISTS `permission_test` (id INT)');
        await this.targetConnection.execute('DROP TABLE IF EXISTS `permission_test`');
        await this.log(`✅ Create/drop table permissions verified`);
      } catch (error) {
        await this.log(`❌ Insufficient permissions for table operations: ${error.message}`);
        throw new Error('Insufficient database permissions');
      }
      
    } catch (error) {
      await this.log(`❌ Permission check failed: ${error.message}`);
      throw error;
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      await this.log('🚀 Starting selective database migration...');
      await this.log(`Source: ${config.source.database}@${config.source.host}:${config.source.port}`);
      await this.log(`Target: ${config.target.database}@${config.target.host}:${config.target.port}`);
      
      if (tableWhitelist.length > 0) {
        await this.log(`🎯 Using table whitelist with ${tableWhitelist.length} tables`);
      } else {
        await this.log('⚠️  No whitelist found, will migrate all non-system tables');
      }

      // 连接数据库
      await this.connect();
      
      // 检查权限
      await this.checkDatabasePermissions();

      // 获取需要迁移的表
      const tables = await this.getFilteredTables();

      if (tables.length === 0) {
        await this.log('❌ No tables to migrate');
        return;
      }

      // 禁用外键检查
      await this.targetConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
      await this.log('🔧 Disabled foreign key checks for migration');

      let successCount = 0;
      let failureCount = 0;

      // 逐个迁移表
      for (const tableName of tables) {
        const success = await this.migrateTable(tableName);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      }

      // 重新启用外键检查
      await this.targetConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
      await this.log('🔧 Re-enabled foreign key checks');

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      await this.log('='.repeat(60));
      await this.log('📊 MIGRATION SUMMARY');
      await this.log('='.repeat(60));
      await this.log(`✅ Successfully migrated: ${successCount} tables`);
      await this.log(`❌ Failed migrations: ${failureCount} tables`);
      await this.log(`⏭️  Skipped tables: ${this.skippedTables} tables`);
      await this.log(`⏱️  Total duration: ${duration} seconds`);
      await this.log(`📄 Log file: ${this.logFile}`);

      if (failureCount === 0) {
        await this.log('🎉 All migrations completed successfully!');
      } else {
        await this.log('⚠️  Some migrations failed. Please check the logs.');
      }

    } catch (error) {
      await this.log(`💥 Migration failed: ${error.message}`);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// 主程序
async function main() {
  const migrator = new SelectiveDatabaseMigrator();
  
  try {
    await migrator.run();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SelectiveDatabaseMigrator;
