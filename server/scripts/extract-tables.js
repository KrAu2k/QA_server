const fs = require('fs');
const path = require('path');

/**
 * 从实体文件中提取表名
 */
function extractTableNames() {
  const entityFiles = [
    'src/department/entities/department.entity.ts',
    'src/user/entities/user.entity.ts',
    'src/log/entities/log.entity.ts',
    'src/goods/entities/goods.entity.ts',
    'src/goods/entities/goods-category.entity.ts',
    'src/report/entities/report-data.entity.ts',
  ];

  const tableNames = [];
  const entityClassNames = [];

  for (const entityFile of entityFiles) {
    try {
      const filePath = path.resolve(__dirname, '..', entityFile);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 提取 @Entity() 装饰器中的表名
      const entityMatch = content.match(/@Entity\(['"`]([^'"`]+)['"`]\)/);
      const classMatch = content.match(/export class (\w+)/);
      
      if (entityMatch) {
        // 显式指定了表名
        tableNames.push(entityMatch[1]);
        if (classMatch) {
          entityClassNames.push(classMatch[1]);
        }
      } else if (content.includes('@Entity()') && classMatch) {
        // 没有显式指定表名，使用类名的小写形式
        const className = classMatch[1];
        // TypeORM 默认使用类名的小写形式作为表名
        const tableName = className.toLowerCase();
        tableNames.push(tableName);
        entityClassNames.push(className);
      }
    } catch (error) {
      console.warn(`无法读取文件 ${entityFile}:`, error.message);
    }
  }

  return { tableNames, entityClassNames };
}

/**
 * 生成表白名单配置
 */
function generateTableWhitelist() {
  const { tableNames, entityClassNames } = extractTableNames();
  
  console.log('发现的实体类和表名:');
  for (let i = 0; i < tableNames.length; i++) {
    console.log(`  ${entityClassNames[i]} -> ${tableNames[i]}`);
  }
  
  console.log('\n表名白名单:');
  console.log(JSON.stringify(tableNames, null, 2));
  
  // 生成配置文件
  const config = {
    tableWhitelist: tableNames,
    entityClasses: entityClassNames,
    description: 'myserver 项目中实际使用的数据库表白名单',
    createdAt: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    path.resolve(__dirname, 'migration-tables.json'),
    JSON.stringify(config, null, 2)
  );
  
  console.log('\n配置已保存到 scripts/migration-tables.json');
  
  return tableNames;
}

if (require.main === module) {
  generateTableWhitelist();
}

module.exports = { extractTableNames, generateTableWhitelist };
