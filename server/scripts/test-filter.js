#!/usr/bin/env node

// 模拟测试迁移脚本的过滤逻辑

const path = require('path');

// 加载表白名单配置
let tableWhitelist = [];
try {
  const configPath = path.join(__dirname, 'migration-tables.json');
  const configContent = require(configPath);
  tableWhitelist = configContent.tableWhitelist || [];
  console.log(`✅ 已加载表白名单，包含 ${tableWhitelist.length} 个表`);
} catch (error) {
  console.warn('⚠️  无法加载表白名单配置');
  process.exit(1);
}

// 模拟源数据库中的所有表
const mockSourceTables = [
  // 业务表（在白名单中）
  'departments',
  'user', 
  'goods',
  'customer',
  'supplier',
  'sell_order',
  'sell_order_details',
  
  // 测试表（不在白名单中）
  'test_users',
  'temp_data',
  'old_backup_table',
  'sample_test',
  
  // 系统表（应该被排除）
  'migrations',
  'typeorm_metadata',
  
  // 其他无关表（不在白名单中）
  'some_other_table',
  'legacy_data',
];

// 需要排除的系统表
const systemTables = [
  'migrations',
  'typeorm_metadata',
  'mysql',
  'information_schema',
  'performance_schema',
  'sys'
];

function testTableFiltering() {
  console.log('\n📋 开始测试表过滤逻辑...');
  console.log(`模拟源数据库共有 ${mockSourceTables.length} 个表`);
  
  let filteredTables = [];
  let skippedTables = [];
  
  for (const tableName of mockSourceTables) {
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
  const missingTables = tableWhitelist.filter(table => !mockSourceTables.includes(table));
  
  console.log('\n📊 过滤结果：');
  console.log(`✅ 将迁移 ${filteredTables.length} 个表：`);
  filteredTables.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table}`);
  });
  
  console.log(`\n⏭️  跳过 ${skippedTables.length} 个表：`);
  skippedTables.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table}`);
  });
  
  if (missingTables.length > 0) {
    console.log(`\n⚠️  警告：白名单中以下表在源数据库中不存在：`);
    missingTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
  }
  
  console.log('\n✅ 表过滤逻辑测试完成');
  
  return {
    filtered: filteredTables,
    skipped: skippedTables,
    missing: missingTables
  };
}

if (require.main === module) {
  testTableFiltering();
}

module.exports = { testTableFiltering };
