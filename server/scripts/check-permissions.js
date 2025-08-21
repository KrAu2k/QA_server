#!/usr/bin/env node

const mysql = require('mysql2/promise');

// 数据库配置
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

class DatabasePermissionChecker {
  constructor() {
    this.sourceConnection = null;
    this.targetConnection = null;
  }

  async log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    if (isError) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  }

  async checkServerConnection(dbConfig, name) {
    try {
      await this.log(`🔍 Checking ${name} server connection...`);
      
      // 尝试连接到服务器（不指定数据库）
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
      });
      
      await this.log(`✅ ${name} server connection successful`);
      await connection.end();
      return true;
    } catch (error) {
      await this.log(`❌ ${name} server connection failed: ${error.message}`, true);
      return false;
    }
  }

  async checkDatabaseAccess(dbConfig, name) {
    try {
      await this.log(`🔍 Checking ${name} database access...`);
      
      const connection = await mysql.createConnection(dbConfig);
      
      // 测试基本查询
      await connection.execute('SELECT 1');
      await this.log(`✅ ${name} database access successful`);
      
      await connection.end();
      return true;
    } catch (error) {
      await this.log(`❌ ${name} database access failed: ${error.message}`, true);
      return false;
    }
  }

  async checkDatabaseExists(dbConfig, name) {
    try {
      await this.log(`🔍 Checking if ${name} database exists...`);
      
      const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
      });
      
      const [rows] = await connection.execute(
        'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
        [dbConfig.database]
      );
      
      if (rows.length > 0) {
        await this.log(`✅ ${name} database '${dbConfig.database}' exists`);
        await connection.end();
        return true;
      } else {
        await this.log(`⚠️  ${name} database '${dbConfig.database}' does not exist`);
        await connection.end();
        return false;
      }
    } catch (error) {
      await this.log(`❌ Failed to check ${name} database existence: ${error.message}`, true);
      return false;
    }
  }

  async createTargetDatabase() {
    try {
      await this.log(`🔧 Attempting to create target database '${config.target.database}'...`);
      
      const connection = await mysql.createConnection({
        host: config.target.host,
        port: config.target.port,
        user: config.target.user,
        password: config.target.password
      });
      
      await connection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${config.target.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      
      await this.log(`✅ Target database '${config.target.database}' created successfully`);
      await connection.end();
      return true;
    } catch (error) {
      await this.log(`❌ Failed to create target database: ${error.message}`, true);
      return false;
    }
  }

  async checkTablePermissions(dbConfig, name) {
    try {
      await this.log(`🔍 Checking ${name} table permissions...`);
      
      const connection = await mysql.createConnection(dbConfig);
      
      // 测试创建表权限
      const testTableName = `permission_test_${Date.now()}`;
      await connection.execute(`CREATE TABLE IF NOT EXISTS \`${testTableName}\` (id INT)`);
      await this.log(`✅ ${name} CREATE TABLE permission verified`);
      
      // 测试删除表权限
      await connection.execute(`DROP TABLE IF EXISTS \`${testTableName}\``);
      await this.log(`✅ ${name} DROP TABLE permission verified`);
      
      await connection.end();
      return true;
    } catch (error) {
      await this.log(`❌ ${name} table permissions check failed: ${error.message}`, true);
      return false;
    }
  }

  async checkUserPrivileges(dbConfig, name) {
    try {
      await this.log(`🔍 Checking ${name} user privileges...`);
      
      const connection = await mysql.createConnection(dbConfig);
      
      const [rows] = await connection.execute('SHOW GRANTS FOR CURRENT_USER()');
      
      await this.log(`📋 ${name} user privileges:`);
      for (const row of rows) {
        const grant = Object.values(row)[0];
        await this.log(`   ${grant}`);
      }
      
      await connection.end();
      return true;
    } catch (error) {
      await this.log(`❌ Failed to check ${name} user privileges: ${error.message}`, true);
      return false;
    }
  }

  async runChecks() {
    await this.log('🚀 Starting database permission checks...');
    await this.log('='.repeat(60));
    
    let allChecksOK = true;

    // 1. 检查服务器连接
    await this.log('\n1️⃣  Server Connection Checks');
    await this.log('-'.repeat(30));
    
    const sourceServerOK = await this.checkServerConnection(config.source, 'Source');
    const targetServerOK = await this.checkServerConnection(config.target, 'Target');
    
    if (!sourceServerOK || !targetServerOK) {
      allChecksOK = false;
      await this.log('\n❌ Server connection checks failed. Please verify host, port, username, and password.');
      return;
    }

    // 2. 检查数据库是否存在
    await this.log('\n2️⃣  Database Existence Checks');
    await this.log('-'.repeat(30));
    
    const sourceExistsOK = await this.checkDatabaseExists(config.source, 'Source');
    const targetExistsOK = await this.checkDatabaseExists(config.target, 'Target');
    
    if (!sourceExistsOK) {
      allChecksOK = false;
      await this.log(`\n❌ Source database '${config.source.database}' does not exist!`);
      return;
    }

    // 3. 如果目标数据库不存在，尝试创建
    if (!targetExistsOK) {
      await this.log('\n3️⃣  Creating Target Database');
      await this.log('-'.repeat(30));
      
      const createOK = await this.createTargetDatabase();
      if (!createOK) {
        allChecksOK = false;
        await this.log('\n❌ Failed to create target database. Please create it manually or grant CREATE privileges.');
        return;
      }
    }

    // 4. 检查数据库访问权限
    await this.log('\n4️⃣  Database Access Checks');
    await this.log('-'.repeat(30));
    
    const sourceAccessOK = await this.checkDatabaseAccess(config.source, 'Source');
    const targetAccessOK = await this.checkDatabaseAccess(config.target, 'Target');
    
    if (!sourceAccessOK || !targetAccessOK) {
      allChecksOK = false;
      await this.log('\n❌ Database access checks failed. Please verify database names and permissions.');
      return;
    }

    // 5. 检查表操作权限
    await this.log('\n5️⃣  Table Operation Permissions');
    await this.log('-'.repeat(30));
    
    const sourceTableOK = await this.checkTablePermissions(config.source, 'Source');
    const targetTableOK = await this.checkTablePermissions(config.target, 'Target');
    
    if (!sourceTableOK || !targetTableOK) {
      allChecksOK = false;
      await this.log('\n❌ Table operation permissions insufficient.');
    }

    // 6. 显示用户权限
    await this.log('\n6️⃣  User Privileges Information');
    await this.log('-'.repeat(30));
    
    await this.checkUserPrivileges(config.source, 'Source');
    await this.checkUserPrivileges(config.target, 'Target');

    // 总结
    await this.log('\n' + '='.repeat(60));
    if (allChecksOK) {
      await this.log('🎉 All permission checks passed! Migration should work.');
      await this.log('💡 You can now run: npm run migrate:selective');
    } else {
      await this.log('❌ Some permission checks failed. Please resolve the issues above.');
      await this.log('💡 Common solutions:');
      await this.log('   - Verify database credentials in .env file');
      await this.log('   - Ask DBA to grant necessary privileges');
      await this.log('   - Create target database manually if needed');
    }
  }
}

// 主程序
async function main() {
  const checker = new DatabasePermissionChecker();
  
  try {
    await checker.runChecks();
  } catch (error) {
    console.error('Permission check failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabasePermissionChecker;
