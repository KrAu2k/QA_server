#!/usr/bin/env node

// 数据库迁移完整使用示例

console.log('🚀 数据库迁移工具使用示例');
console.log('==========================================');

console.log('\n📋 步骤1：生成表白名单');
console.log('命令：npm run extract:tables');
console.log('作用：扫描所有实体文件，生成迁移表白名单');

console.log('\n⚙️  步骤2：配置环境变量');
console.log('命令：cp .env.migration.example .env.migration');
console.log('作用：复制配置模板并根据实际情况修改');

console.log('\n🔧 步骤3：选择迁移方式');
console.log('');
console.log('权限检查（推荐先执行）：');
console.log('  npm run migrate:check');
console.log('  特点：检查数据库连接和权限，诊断问题');
console.log('');
console.log('选择性迁移（完整版）：');
console.log('  npm run migrate:selective');
console.log('  特点：自动创建目标数据库，只迁移白名单中的表');
console.log('');
console.log('选择性迁移（无创建数据库）：');
console.log('  npm run migrate:no-create');
console.log('  特点：假设目标数据库已存在，适用于权限受限环境');
console.log('');
console.log('全量迁移：');
console.log('  npm run migrate:db');
console.log('  特点：迁移所有表（除系统表）');
console.log('');
console.log('简化迁移：');
console.log('  npm run migrate:simple');
console.log('  特点：基本迁移功能');

console.log('\n📊 步骤4：查看迁移结果');
console.log('- 控制台会显示迁移进度和结果');
console.log('- 生成详细的日志文件');
console.log('- 自动验证数据完整性');

console.log('\n📁 相关文件说明：');
console.log('- scripts/migration-tables.json : 表白名单配置');
console.log('- scripts/selective-migration-log-*.txt : 迁移日志');
console.log('- .env.migration : 数据库连接配置');

console.log('\n💡 最佳实践：');
console.log('1. 迁移前备份目标数据库');
console.log('2. 先在测试环境验证'); 
console.log('3. 仔细检查迁移日志');
console.log('4. 验证关键业务数据');

console.log('\n🎯 推荐使用流程：');
console.log('1. npm run extract:tables  # 生成表白名单');
console.log('2. npm run migrate:check   # 检查权限');
console.log('3. npm run migrate:no-create  # 执行迁移（如果权限受限）');
console.log('   或 npm run migrate:selective  # 执行迁移（如果权限充足）');

console.log('\n⚠️  如果遇到权限错误：');
console.log('1. 运行 npm run migrate:check 诊断问题');
console.log('2. 查看 scripts/DATABASE-PERMISSION-SOLUTION.md');
console.log('3. 手动创建目标数据库后使用 npm run migrate:no-create');

console.log('\n==========================================');
console.log('📖 更多详情请查看：scripts/README-migration-selective.md');
