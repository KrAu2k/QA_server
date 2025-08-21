# 数据库权限问题解决方案

## 问题分析
根据权限检查结果，用户 `ranci01` 没有创建数据库 `report` 的权限。

## 解决方案

### 方案 1：手动创建目标数据库（推荐）

请联系数据库管理员或使用有权限的账户执行以下 SQL：

```sql
-- 创建 report 数据库
CREATE DATABASE IF NOT EXISTS `report` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 授予 ranci01 用户对 report 数据库的完整权限
GRANT ALL PRIVILEGES ON `report`.* TO 'ranci01'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

### 方案 2：使用现有数据库

如果不能创建新数据库，可以使用现有的数据库作为目标：

1. 修改环境变量 `TARGET_DB_NAME` 为现有数据库名
2. 注意：这会覆盖目标数据库中的同名表

### 方案 3：修改迁移脚本跳过数据库创建

临时修改迁移脚本，注释掉数据库创建步骤：

```javascript
// 在 migrate-selective.js 中注释掉这行：
// await this.createTargetDatabase();
```

## 验证步骤

执行以下命令验证权限：

```bash
# 1. 检查权限
npm run migrate:check

# 2. 如果权限OK，执行迁移
npm run migrate:selective
```

## 完整的 SQL 创建脚本

```sql
-- 连接到 MySQL 服务器
-- mysql -h 8.135.6.60 -P 3307 -u [管理员用户] -p

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `report` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci
COMMENT '报表数据库，用于存储从 ranci 迁移的业务数据';

-- 授予权限（根据实际需要调整）
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX 
ON `report`.* TO 'ranci01'@'%';

-- 或者授予所有权限（如果需要）
-- GRANT ALL PRIVILEGES ON `report`.* TO 'ranci01'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证权限
SHOW GRANTS FOR 'ranci01'@'%';
```

## 常见权限问题

1. **CREATE 权限不足**：需要 CREATE 权限来创建数据库
2. **DROP 权限不足**：需要 DROP 权限来删除已存在的表
3. **ALTER 权限不足**：某些表结构操作需要 ALTER 权限

## 下一步

执行上述任一方案后，重新运行：

```bash
npm run migrate:check && npm run migrate:selective
```
