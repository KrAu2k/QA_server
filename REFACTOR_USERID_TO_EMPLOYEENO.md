# 用户字段重构：userid → employeeNo

## 概述
本次重构将 `user` 表中的 `userid` 字段重命名为 `employeeNo`，以更好地反映其实际含义（员工编号）。

## 变更内容

### 1. 数据库层面
- **字段重命名**: `user.userid` → `user.employeeNo`
- **迁移文件**: `1731234567890-RenameUseridToEmployeeNo.ts`

### 2. 实体类更新
- **文件**: `src/user/entities/user.entity.ts`
- **变更**: 将 `userid` 字段重命名为 `employeeNo`

### 3. 后端服务更新
- **文件**: `src/user/user.service.ts`
- **变更**: 
  - 新增 `findByEmployeeNo()` 方法
  - 保留 `findByUserid()` 方法作为向后兼容
  - 更新所有 select 查询中的字段名

### 4. 前端类型定义更新
- **文件**: `src/services/ant-design-pro/typings.d.ts`
- **文件**: `src/pages/Workplace/data.d.ts`
- **变更**: 将 `userid` 字段重命名为 `employeeNo`

### 5. 前端页面更新
- **文件**: `src/pages/Workplace/index.tsx`
- **变更**: 将 `currentUser?.userid` 改为 `currentUser?.employeeNo`

## 部署步骤

### 1. 运行数据库迁移
```bash
cd server
npm run migration:run
```

### 2. 重新构建并启动后端
```bash
cd server
npm run build
npm run start:prod
```

### 3. 重新构建并启动前端
```bash
cd app
npm run build
npm run start
```

## 向后兼容性

为了确保平滑过渡，我们保留了以下向后兼容的方法：

1. **UserService.findByUserid()**: 内部调用 `findByEmployeeNo()` 方法
2. **JWT 验证**: 仍然支持使用旧的 token 格式

## 验证步骤

1. **登录验证**: 确保用户能够正常登录
2. **JWT 验证**: 确保 JWT token 验证正常工作
3. **用户查找**: 确保按员工编号查找用户功能正常
4. **前端显示**: 确保前端能够正确显示用户信息

## 回滚方案

如果需要回滚，可以运行以下命令：

```bash
cd server
npm run migration:revert
```

这将把 `employeeNo` 字段重命名回 `userid`。

## 注意事项

1. **缓存清理**: 部署后可能需要清理相关缓存
2. **日志监控**: 部署后注意监控日志，确保没有字段不存在的错误
3. **API 兼容性**: 如果有外部系统调用，需要确保 API 响应格式的兼容性

## 测试清单

- [ ] 用户登录功能正常
- [ ] JWT token 验证正常
- [ ] 用户信息显示正确
- [ ] 项目更新功能正常（使用 employeeNo）
- [ ] 项目代码更新功能正常（使用 employeeNo）
- [ ] 系统日志记录正常
- [ ] 前端页面无类型错误
- [ ] API 响应格式正确
