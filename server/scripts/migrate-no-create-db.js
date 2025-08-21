#!/usr/bin/env node

// 简化版迁移脚本 - 跳过数据库创建，假设目标数据库已存在

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

// 需要排除的系统表
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

class SimpleMigrator {
  constructor() {
    this.sourceConnection = null;
    this.targetConnection = null;
    this.totalTables = 0;
    this.processedTables = 0;
    this.logFile = path.join(__dirname, `simple-migration-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`);
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

  async connect() {
    try {
      await this.log('🔗 Connecting to databases...');
      
      // 直接连接到数据库（假设已存在）
      this.sourceConnection = await mysql.createConnection(config.source);
      await this.log(`✅ Connected to source database: ${config.source.database}`);
      
      this.targetConnection = await mysql.createConnection(config.target);
      await this.log(`✅ Connected to target database: ${config.target.database}`);
      
    } catch (error) {
      await this.log(`❌ Connection failed: ${error.message}`);
      await this.log('💡 Tip: Make sure the target database exists or run npm run migrate:check');
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.sourceConnection) {
        await this.sourceConnection.end();
      }
      if (this.targetConnection) {
        await this.targetConnection.end();
      }
      await this.log('🔌 Disconnected from databases');
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
      
      if (tableWhitelist.length > 0) {
        // 使用白名单过滤
        filteredTables = allTables.filter(tableName => 
          !systemTables.includes(tableName) && tableWhitelist.includes(tableName)
        );
        
        const skippedCount = allTables.length - filteredTables.length;
        await this.log(`📋 源数据库共有 ${allTables.length} 个表，将迁移 ${filteredTables.length} 个，跳过 ${skippedCount} 个`);
      } else {
        // 排除系统表
        filteredTables = allTables.filter(tableName => !systemTables.includes(tableName));
        await this.log(`📋 将迁移 ${filteredTables.length} 个表（排除系统表）`);
      }
      
      this.totalTables = filteredTables.length;
      return filteredTables;
    } catch (error) {
      await this.log(`❌ Failed to get tables: ${error.message}`);
      throw error;
    }
  }

  async migrateTable(tableName) {
    try {
      this.processedTables++;
      await this.log(`🔄 Processing table ${this.processedTables}/${this.totalTables}: ${tableName}`);

      // 获取表结构
      const [createRows] = await this.sourceConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
      const createStatement = createRows[0]['Create Table'];
      
      // 删除目标表（如果存在）
      await this.targetConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
      
      // 创建表
      await this.targetConnection.execute(createStatement);
      await this.log(`✅ Created table structure: ${tableName}`);

      // 复制数据（除非是只要结构的表）
      if (!structureOnlyTables.includes(tableName)) {
        const [countRows] = await this.sourceConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        const rowCount = countRows[0].count;

        if (rowCount > 0) {
          await this.log(`📊 Copying ${rowCount} rows...`);
          
          // 简单的数据复制（适用于小表）
          const [dataRows] = await this.sourceConnection.execute(`SELECT * FROM \`${tableName}\``);
          
          if (dataRows.length > 0) {
            const columns = Object.keys(dataRows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            const insertSql = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;

            for (const row of dataRows) {
              const values = columns.map(col => row[col]);
              await this.targetConnection.execute(insertSql, values);
            }
          }
          
          await this.log(`✅ Copied ${rowCount} rows`);
        } else {
          await this.log(`⚪ Table is empty, no data to copy`);
        }
      } else {
        await this.log(`⚪ Structure-only table, skipping data`);
      }

      const progress = Math.round((this.processedTables / this.totalTables) * 100);
      await this.log(`✅ Completed ${tableName} (${progress}%)`);
      
      return true;
    } catch (error) {
      await this.log(`❌ Failed to migrate table ${tableName}: ${error.message}`);
      return false;
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      await this.log('🚀 Starting simple database migration...');
      await this.log(`📍 Source: ${config.source.database}@${config.source.host}:${config.source.port}`);
      await this.log(`📍 Target: ${config.target.database}@${config.target.host}:${config.target.port}`);
      
      await this.connect();

      // 禁用外键检查
      await this.targetConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // 获取需要迁移的表
      const tables = await this.getFilteredTables();

      if (tables.length === 0) {
        await this.log('❌ No tables to migrate');
        return;
      }

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

      // 启用外键检查
      await this.targetConnection.execute('SET FOREIGN_KEY_CHECKS = 1');

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      await this.log('\n' + '='.repeat(50));
      await this.log('📊 MIGRATION SUMMARY');
      await this.log('='.repeat(50));
      await this.log(`✅ Successfully migrated: ${successCount} tables`);
      await this.log(`❌ Failed migrations: ${failureCount} tables`);
      await this.log(`⏱️  Total duration: ${duration} seconds`);
      await this.log(`📄 Log file: ${this.logFile}`);

      if (failureCount === 0) {
        await this.log('🎉 Migration completed successfully!');
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
  console.log('💡 This is a simplified migration script that assumes the target database already exists.');
  console.log('💡 If you get connection errors, please create the target database manually first.');
  console.log('💡 Or run: npm run migrate:check to diagnose permission issues.\n');

  const migrator = new SimpleMigrator();
  
  try {
    await migrator.run();
    process.exit(0);
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Run: npm run migrate:check');
    console.log('2. Create target database manually if needed');
    console.log('3. Check DATABASE-PERMISSION-SOLUTION.md for details');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleMigrator;
