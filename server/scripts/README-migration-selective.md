# 数据库迁移工具使用指南

本工具包含多个数据库迁移脚本，支持从源数据库（ranci）迁移数据到目标数据库（report）。

## 功能特性

- ✅ **智能表过滤**：基于实体文件自动生成表白名单
- ✅ **批量数据迁移**：支持大表分批处理
- ✅ **结构与数据分离**：可选择只迁移表结构
- ✅ **迁移验证**：自动验证数据完整性
- ✅ **详细日志**：完整的迁移过程记录
- ✅ **环境变量配置**：灵活的配置方式

## 迁移脚本说明

### 1. 选择性迁移（推荐）
`migrate-selective.js` - 基于实体文件白名单的智能迁移

**特点：**
- 只迁移 myserver 项目实际使用的表
- 自动排除测试表和系统表
- 支持环境变量配置

### 2. 全量迁移
`migrate-database.js` - 迁移所有表（除排除列表）

### 3. 简化迁移
`migrate-simple.js` - 基本的迁移功能

### 4. 表名提取工具
`extract-tables.js` - 从实体文件提取表名生成白名单

## 快速开始

### 第一步：生成表白名单（首次使用）

```bash
npm run extract:tables
```

这会：
- 扫描所有 `*.entity.ts` 文件
- 提取表名和实体类名
- 生成 `scripts/migration-tables.json` 配置文件

### 第二步：配置环境变量

复制环境变量模板：
```bash
cp .env.migration.example .env.migration
```

编辑 `.env.migration` 文件：
```env
# 源数据库配置
SOURCE_DB_HOST=8.135.6.60
SOURCE_DB_PORT=3307
SOURCE_DB_USER=ranci01
SOURCE_DB_PASSWORD=Ranci@mysql2022
SOURCE_DB_NAME=ranci

# 目标数据库配置  
TARGET_DB_HOST=8.135.6.60
TARGET_DB_PORT=3307
TARGET_DB_USER=ranci01
TARGET_DB_PASSWORD=Ranci@mysql2022
TARGET_DB_NAME=report
```

### 第三步：执行迁移

**选择性迁移（推荐）：**
```bash
npm run migrate:selective
```

**其他迁移方式：**
```bash
# 全量迁移
npm run migrate:db

# 简化迁移
npm run migrate:simple
```

## 白名单配置

`scripts/migration-tables.json` 包含：

```json
{
  "tableWhitelist": [
    "departments",
    "user", 
    "logs",
    "goods",
    "sales_quote_details",
    "sales_quotes",
    "goods_category",
    "purchase_stock_in",
    "purchase_stock_in_details",
    "report_data",
    "customer_category",
    "sell_order",
    "customer",
    "sell_order_details",
    "supplier",
    "supplier_category",
    "purchase_return_details",
    "purchase_return",
    "sales_deliveries",
    "sales_delivery_details"
  ],
  "entityClasses": [...],
  "description": "myserver 项目中实际使用的数据库表白名单",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 特殊配置

### 只迁移结构的表

在脚本中修改 `structureOnlyTables` 数组：
```javascript
const structureOnlyTables = [
  'logs', // 日志表只要结构
];
```

### 系统表排除

系统表会自动排除：
- `migrations`
- `typeorm_metadata`
- `mysql`
- `information_schema`
- `performance_schema`
- `sys`

## 迁移过程

1. **连接验证**：检查源数据库和目标数据库连接
2. **表过滤**：基于白名单筛选需要迁移的表
3. **结构迁移**：创建表结构（会删除已存在的表）
4. **数据迁移**：分批复制数据
5. **验证检查**：对比源表和目标表的记录数
6. **生成报告**：输出迁移结果和日志文件

## 日志文件

迁移过程会生成详细的日志文件：
- 文件名格式：`selective-migration-log-YYYY-MM-DD-HH-mm-ss.txt`
- 包含每个步骤的详细信息
- 记录成功/失败的表和原因

## 常见问题

### Q: 如何添加新的表到迁移列表？
A: 
1. 确保在 `src/*/entities/` 下有对应的实体文件
2. 运行 `npm run extract:tables` 重新生成白名单
3. 或手动编辑 `scripts/migration-tables.json`

### Q: 迁移失败了怎么办？
A: 
1. 检查日志文件了解具体错误原因
2. 确认数据库连接配置正确
3. 检查目标数据库是否有足够的权限和空间
4. 可以重新运行迁移（会覆盖已存在的表）

### Q: 如何跳过某些表的数据迁移？
A: 将表名添加到 `structureOnlyTables` 数组中

### Q: 可以迁移到不同的数据库服务器吗？
A: 可以，修改环境变量中的 `TARGET_DB_HOST` 等配置

## 最佳实践

1. **迁移前备份**：确保目标数据库有备份
2. **测试环境验证**：先在测试环境执行迁移
3. **检查日志**：仔细查看迁移日志确认无误
4. **验证数据**：迁移后验证关键业务数据的完整性
5. **更新白名单**：当添加新实体时及时更新表白名单

## 技术支持

如遇到问题，请检查：
1. 数据库连接配置
2. 网络连通性
3. 数据库权限
4. 日志文件中的错误信息
