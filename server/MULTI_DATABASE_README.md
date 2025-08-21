# 多数据库配置说明

## 概述

本项目支持多数据库配置，目前配置了两个数据库：
- **主数据库** (`default`): 存储主要的业务数据
- **报表数据库** (`report`): 存储报表相关数据

## 配置方法

### 1. 环境变量配置

在 `.env` 文件中配置以下变量：

```env
# 主数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=erp_db

# 报表数据库配置
REPORT_DB_NAME=report
```

### 2. 自动配置脚本

运行配置脚本自动设置环境变量：

```bash
chmod +x setup-env.sh
./setup-env.sh
```

### 3. 测试数据库连接

```bash
node test-multi-db.js
```

## 使用方法

### 在模块中使用主数据库（默认）

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YourEntity } from './entities/your.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([YourEntity]), // 默认使用 'default' 数据源
  ],
  // ...
})
export class YourModule {}
```

### 在模块中使用报表数据库

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity], 'report'), // 指定使用 'report' 数据源
  ],
  // ...
})
export class ReportModule {}
```

### 在服务中注入仓库

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YourEntity } from './entities/your.entity';

@Injectable()
export class YourService {
  constructor(
    // 主数据库
    @InjectRepository(YourEntity)
    private yourRepository: Repository<YourEntity>,
    
    // 报表数据库
    @InjectRepository(ReportEntity, 'report')
    private reportRepository: Repository<ReportEntity>,
  ) {}
}
```

## 数据库创建

### 手动创建

```sql
-- 创建主数据库
CREATE DATABASE IF NOT EXISTS erp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建报表数据库
CREATE DATABASE IF NOT EXISTS report CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 自动创建

项目启动时会自动创建数据库（如果不存在），但需要确保：
1. 数据库用户有创建数据库的权限
2. 数据库服务器允许创建数据库

## 示例模块

参考 `src/report/` 模块，这是一个使用报表数据库的完整示例：

- `entities/report-data.entity.ts` - 实体定义
- `dto/` - 数据传输对象
- `report.service.ts` - 服务层（注意注入时指定数据源名）
- `report.controller.ts` - 控制器
- `report.module.ts` - 模块配置

## 注意事项

1. **数据源名称**: 在 `app.module.ts` 中定义的数据源名称必须与注入时使用的名称一致
2. **实体隔离**: 不同数据源的实体不能有外键关系
3. **事务处理**: 跨数据源的事务需要特殊处理
4. **性能考虑**: 多数据库会增加系统复杂度，请根据实际需求使用

## 扩展更多数据库

如需添加更多数据库，在 `app.module.ts` 中添加新的 `TypeOrmModule.forRoot()` 配置：

```typescript
TypeOrmModule.forRoot({
  name: 'your_database_name',
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.YOUR_DB_NAME,
  autoLoadEntities: true,
  synchronize: true,
}),
```

然后在模块中使用：

```typescript
TypeOrmModule.forFeature([YourEntity], 'your_database_name')
``` 