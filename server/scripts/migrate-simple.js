#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 从环境变量读取配置，如果没有则使用默认值
const config = {
  source: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ranci'
  },
  target: {
    host: process.env.TARGET_DB_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.TARGET_DB_PORT) || parseInt(process.env.DB_PORT) || 3306,
    user: process.env.TARGET_DB_USERNAME || process.env.DB_USERNAME || 'root',
    password: process.env.TARGET_DB_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.TARGET_DB_NAME || 'report'
  }
};

console.log('📋 Migration Configuration:');
console.log(`   Source: ${config.source.user}@${config.source.host}:${config.source.port}/${config.source.database}`);
console.log(`   Target: ${config.target.user}@${config.target.host}:${config.target.port}/${config.target.database}`);

// 简化版迁移类
class SimpleMigrator {
  constructor() {
    this.sourceConn = null;
    this.targetConn = null;
  }

  async connect() {
    console.log('🔌 Connecting to databases...');
    this.sourceConn = await mysql.createConnection(config.source);
    this.targetConn = await mysql.createConnection(config.target);
    console.log('✅ Connected successfully');
  }

  async createTargetDatabase() {
    const adminConn = await mysql.createConnection({
      host: config.target.host,
      port: config.target.port,
      user: config.target.user,
      password: config.target.password
    });

    await adminConn.execute(`CREATE DATABASE IF NOT EXISTS \`${config.target.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${config.target.database}' ready`);
    await adminConn.end();
  }

  async getTables() {
    const [rows] = await this.sourceConn.execute(
      'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "BASE TABLE"',
      [config.source.database]
    );
    return rows.map(row => row.TABLE_NAME).filter(name => !['migrations', 'typeorm_metadata'].includes(name));
  }

  async migrateTable(tableName) {
    console.log(`🔄 Migrating: ${tableName}`);
    
    // 获取创建语句
    const [createRows] = await this.sourceConn.execute(`SHOW CREATE TABLE \`${tableName}\``);
    const createStatement = createRows[0]['Create Table'];
    
    // 删除并创建表
    await this.targetConn.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
    await this.targetConn.execute(createStatement);
    
    // 复制数据
    const [countRows] = await this.sourceConn.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    const rowCount = countRows[0].count;
    
    if (rowCount > 0 && tableName !== 'log') {
      console.log(`   📦 Copying ${rowCount} rows...`);
      
      const [rows] = await this.sourceConn.execute(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const columnNames = columns.map(col => `\`${col}\``).join(', ');
        const placeholders = columns.map(() => '?').join(', ');
        
        for (const row of rows) {
          const values = columns.map(col => row[col]);
          await this.targetConn.execute(
            `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`,
            values
          );
        }
      }
    }
    
    console.log(`   ✅ Completed: ${tableName}`);
  }

  async migrate() {
    try {
      console.log('🚀 Starting migration...');
      
      await this.createTargetDatabase();
      await this.connect();
      
      await this.targetConn.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      const tables = await this.getTables();
      console.log(`📋 Found ${tables.length} tables`);
      
      for (const table of tables) {
        await this.migrateTable(table);
      }
      
      await this.targetConn.execute('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log('🎉 Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    } finally {
      if (this.sourceConn) await this.sourceConn.end();
      if (this.targetConn) await this.targetConn.end();
    }
  }
}

// 主函数
async function main() {
  try {
    require('mysql2/promise');
  } catch (error) {
    console.error('❌ Please install mysql2: npm install mysql2');
    process.exit(1);
  }

  if (process.argv.includes('--run')) {
    const migrator = new SimpleMigrator();
    await migrator.migrate();
  } else {
    console.log(`
🔄 Simple Database Migration Script
===================================

This will migrate from: ${config.source.database} → ${config.target.database}

To run the migration:
  node scripts/migrate-simple.js --run

⚠️  This will overwrite the target database!
`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
