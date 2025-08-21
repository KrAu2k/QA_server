#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 数据库配置
const config = {
  source: {
    host: '8.135.6.60',
    port: 3307,
    user: 'ranci01',
    password: 'Ranci@mysql2022',
    database: 'ranci'
  },
  target: {
    host: '8.135.6.60',
    port: 3307,
    user: 'ranci01',
    password: 'Ranci@mysql2022',
    database: 'report'
  }
};

// 需要排除的表（系统表、日志表等）
const excludeTables = [
  'migrations',
  'typeorm_metadata'
];

// 需要忽略的数据表（只创建结构，不复制数据）
const structureOnlyTables = [
  'log', // 日志表只要结构
];

class DatabaseMigrator {
  constructor() {
    this.sourceConnection = null;
    this.targetConnection = null;
    this.totalTables = 0;
    this.processedTables = 0;
    this.logFile = path.join(__dirname, `migration-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`);
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
      this.sourceConnection = await mysql.createConnection(config.source);
      this.targetConnection = await mysql.createConnection(config.target);
      
      await this.log('✅ Successfully connected to both databases');
    } catch (error) {
      await this.log(`❌ Connection failed: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (this.sourceConnection) {
      await this.sourceConnection.end();
    }
    if (this.targetConnection) {
      await this.targetConnection.end();
    }
    await this.log('🔌 Disconnected from databases');
  }

  async createTargetDatabase() {
    try {
      // 连接到MySQL服务器（不指定数据库）
      const adminConnection = await mysql.createConnection({
        host: config.target.host,
        port: config.target.port,
        user: config.target.user,
        password: config.target.password
      });

      // 创建目标数据库（如果不存在）
      await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.target.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await this.log(`✅ Target database '${config.target.database}' is ready`);
      
      await adminConnection.end();
    } catch (error) {
      await this.log(`❌ Failed to create target database: ${error.message}`);
      throw error;
    }
  }

  async getTables() {
    try {
      const [rows] = await this.sourceConnection.execute(
        'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
        [config.source.database]
      );
      
      const tables = rows
        .map(row => row.TABLE_NAME)
        .filter(tableName => !excludeTables.includes(tableName));
      
      this.totalTables = tables.length;
      await this.log(`📋 Found ${this.totalTables} tables to migrate`);
      
      return tables;
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

  async copyTableData(tableName) {
    try {
      const rowCount = await this.getTableRowCount(tableName);
      
      if (rowCount === 0) {
        await this.log(`ℹ️  Table ${tableName} is empty, skipping data copy`);
        return;
      }

      if (structureOnlyTables.includes(tableName)) {
        await this.log(`ℹ️  Table ${tableName} is structure-only, skipping data copy`);
        return;
      }

      await this.log(`📦 Copying ${rowCount} rows from table: ${tableName}`);

      // 分批处理大表
      const batchSize = 1000;
      let offset = 0;
      let copiedRows = 0;

      while (offset < rowCount) {
        const [rows] = await this.sourceConnection.execute(
          `SELECT * FROM \`${tableName}\` LIMIT ${batchSize} OFFSET ${offset}`
        );

        if (rows.length === 0) break;

        // 获取列名
        const columns = Object.keys(rows[0]);
        const columnNames = columns.map(col => `\`${col}\``).join(', ');
        const placeholders = columns.map(() => '?').join(', ');

        // 准备批量插入
        const values = rows.map(row => columns.map(col => row[col]));
        
        for (const rowValues of values) {
          await this.targetConnection.execute(
            `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`,
            rowValues
          );
        }

        copiedRows += rows.length;
        offset += batchSize;

        // 显示进度
        const progress = Math.round((copiedRows / rowCount) * 100);
        await this.log(`  📊 Progress: ${copiedRows}/${rowCount} (${progress}%)`);
      }

      await this.log(`✅ Completed copying data for table: ${tableName} (${copiedRows} rows)`);
    } catch (error) {
      await this.log(`❌ Failed to copy data for table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  async migrateTable(tableName) {
    try {
      this.processedTables++;
      await this.log(`\n🔄 Processing table ${this.processedTables}/${this.totalTables}: ${tableName}`);

      // 获取表结构
      const createStatement = await this.getTableCreateStatement(tableName);
      
      // 创建表
      await this.createTable(tableName, createStatement);
      
      // 复制数据
      await this.copyTableData(tableName);

      await this.log(`✅ Completed migration for table: ${tableName}`);
    } catch (error) {
      await this.log(`❌ Failed to migrate table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  async validateMigration() {
    try {
      await this.log('\n🔍 Validating migration...');
      
      const tables = await this.getTables();
      let validationErrors = 0;

      for (const tableName of tables) {
        try {
          // 比较行数
          const sourceCount = await this.getTableRowCount(tableName);
          
          const [targetRows] = await this.targetConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          const targetCount = targetRows[0].count;

          if (structureOnlyTables.includes(tableName)) {
            await this.log(`✅ Table ${tableName}: Structure only (Source: ${sourceCount}, Target: ${targetCount})`);
          } else if (sourceCount === targetCount) {
            await this.log(`✅ Table ${tableName}: ${sourceCount} rows (matches)`);
          } else {
            await this.log(`❌ Table ${tableName}: Mismatch! Source: ${sourceCount}, Target: ${targetCount}`);
            validationErrors++;
          }
        } catch (error) {
          await this.log(`❌ Table ${tableName}: Validation failed - ${error.message}`);
          validationErrors++;
        }
      }

      if (validationErrors === 0) {
        await this.log('🎉 Migration validation passed! All tables migrated successfully.');
      } else {
        await this.log(`⚠️  Migration validation completed with ${validationErrors} error(s).`);
      }

      return validationErrors === 0;
    } catch (error) {
      await this.log(`❌ Validation failed: ${error.message}`);
      return false;
    }
  }

  async migrate() {
    const startTime = Date.now();
    
    try {
      await this.log('🚀 Starting database migration...');
      await this.log(`📍 Source: ${config.source.host}:${config.source.port}/${config.source.database}`);
      await this.log(`📍 Target: ${config.target.host}:${config.target.port}/${config.target.database}`);
      
      // 创建目标数据库
      await this.createTargetDatabase();
      
      // 连接数据库
      await this.connect();
      
      // 禁用外键检查
      await this.targetConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // 获取表列表
      const tables = await this.getTables();
      
      // 迁移每个表
      for (const tableName of tables) {
        await this.migrateTable(tableName);
      }
      
      // 启用外键检查
      await this.targetConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
      
      // 验证迁移
      const isValid = await this.validateMigration();
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      if (isValid) {
        await this.log(`\n🎉 Migration completed successfully in ${duration} seconds!`);
        await this.log(`📊 Total tables migrated: ${this.totalTables}`);
        await this.log(`📁 Log file: ${this.logFile}`);
      } else {
        await this.log(`\n⚠️  Migration completed with errors in ${duration} seconds.`);
        await this.log(`📁 Check log file for details: ${this.logFile}`);
      }
      
    } catch (error) {
      await this.log(`💥 Migration failed: ${error.message}`);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// 主函数
async function main() {
  // 检查是否安装了mysql2
  try {
    require('mysql2/promise');
  } catch (error) {
    console.error('❌ mysql2 package is required. Please install it with: npm install mysql2');
    process.exit(1);
  }

  // 确认用户意图
  if (process.argv.includes('--confirm')) {
    const migrator = new DatabaseMigrator();
    
    try {
      await migrator.migrate();
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log(`
🔄 Database Migration Script
============================

This script will migrate data from:
  Source: ranci01@8.135.6.60:3307/ranci
  Target: ranci01@8.135.6.60:3307/report

⚠️  WARNING: This will DROP and recreate all tables in the target database!

To proceed, run the script with --confirm flag:
  node migrate-database.js --confirm

Make sure you have backed up your target database if it contains important data.
`);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DatabaseMigrator, config };
