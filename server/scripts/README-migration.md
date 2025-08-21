# 数据库迁移脚本使用说明

## 概述

这个脚本用于将 `ranci` 数据库的所有数据迁移到新的 `report` 数据库。

## 功能特点

- ✅ 自动创建目标数据库
- ✅ 完整的表结构复制
- ✅ 分批数据迁移（处理大表）
- ✅ 迁移验证和日志记录
- ✅ 外键约束处理
- ✅ 错误处理和回滚

## 安装依赖

```bash
# 进入项目目录
cd /Users/StingZZ/CODE/jserptest/myserver

# 安装mysql2依赖（如果还没有安装）
npm install mysql2
```

## 使用方法

### 1. 查看帮助信息
```bash
node scripts/migrate-database.js
```

### 2. 执行迁移
```bash
node scripts/migrate-database.js --confirm
```

## 迁移过程

1. **准备阶段**
   - 连接源数据库和目标数据库
   - 创建目标数据库（如果不存在）
   - 获取需要迁移的表列表

2. **迁移阶段**
   - 逐表复制结构和数据
   - 处理外键约束
   - 分批处理大表数据

3. **验证阶段**
   - 比较源和目标数据库的行数
   - 生成迁移报告

## 配置说明

脚本中的数据库配置：

```javascript
const config = {
  source: {
    host: '8.135.6.60',
    port: 3307,
    user: 'ranci01',
    password: 'Ranci@mysql2022',
    database: 'ranci'        // 源数据库
  },
  target: {
    host: '8.135.6.60',
    port: 3307,
    user: 'ranci01',
    password: 'Ranci@mysql2022',
    database: 'report'       // 目标数据库
  }
};
```

## 排除和特殊处理

### 排除的表
- `migrations` - TypeORM迁移表
- `typeorm_metadata` - TypeORM元数据表

### 仅结构迁移的表
- `log` - 日志表（只复制结构，不复制数据）

## 日志记录

脚本会生成详细的日志文件：
- 文件名格式：`migration-log-YYYY-MM-DDTHH-MM-SS.txt`
- 记录所有操作步骤和错误信息
- 包含迁移验证结果

## 注意事项

⚠️ **重要警告**：
- 此脚本会删除并重建目标数据库中的所有表
- 请确保已备份目标数据库的重要数据
- 建议先在测试环境中验证脚本

## 故障排除

### 常见错误

1. **连接失败**
   ```
   Error: connect ECONNREFUSED
   ```
   检查数据库服务器是否运行，网络连接是否正常

2. **权限错误**
   ```
   Error: Access denied for user
   ```
   确保数据库用户有足够的权限

3. **内存不足**
   ```
   Error: JavaScript heap out of memory
   ```
   对于超大表，可以调整 `batchSize` 参数

### 手动调整

如果需要修改配置，编辑 `scripts/migrate-database.js` 文件：

```javascript
// 调整批处理大小
const batchSize = 500; // 默认1000

// 添加需要排除的表
const excludeTables = [
  'migrations',
  'typeorm_metadata',
  'your_custom_table' // 添加自定义排除表
];

// 添加仅结构迁移的表
const structureOnlyTables = [
  'log',
  'audit_log' // 添加自定义仅结构表
];
```

## 验证迁移结果

迁移完成后，您可以：

1. 检查日志文件了解详细过程
2. 连接到 `report` 数据库验证数据
3. 运行应用程序测试功能

```sql
-- 检查表数量
SELECT COUNT(*) as table_count 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'report';

-- 检查特定表的行数
SELECT COUNT(*) FROM report.your_table_name;
```

## 示例输出

```
🚀 Starting database migration...
📍 Source: 8.135.6.60:3307/ranci
📍 Target: 8.135.6.60:3307/report
✅ Target database 'report' is ready
✅ Successfully connected to both databases
📋 Found 15 tables to migrate

🔄 Processing table 1/15: users
✅ Created table: users
📦 Copying 150 rows from table: users
✅ Completed copying data for table: users (150 rows)

🔍 Validating migration...
✅ Table users: 150 rows (matches)
🎉 Migration validation passed! All tables migrated successfully.
🎉 Migration completed successfully in 45 seconds!
```
