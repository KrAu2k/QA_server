import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'qa_system',
});

async function checkTableStructure() {
  try {
    await dataSource.initialize();
    
    // 查看表结构
    const result = await dataSource.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'qa_system' AND TABLE_NAME = 'project_update_logs'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('project_update_logs 表结构:');
    console.table(result);
    
    // 查看外键约束
    const foreignKeys = await dataSource.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'qa_system' 
        AND TABLE_NAME = 'project_update_logs'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    console.log('\n外键约束:');
    console.table(foreignKeys);
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

checkTableStructure();
