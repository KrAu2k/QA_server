# 临时回滚指南

由于遇到数据库权限问题，如果需要临时回滚到使用 `userid` 字段，请按以下步骤操作：

## 1. 回滚 User 实体类

```typescript
// 在 /server/src/user/entities/user.entity.ts 中
// 将这行：
@Column({ type: 'varchar', length: 255, nullable: false })
employeeNo: string;

// 改回：
@Column({ type: 'varchar', length: 255, nullable: false })
userid: string;
```

## 2. 回滚 UserService

```typescript
// 在 /server/src/user/user.service.ts 中
// 将所有 'employeeNo' 改回 'userid'
// 将 findByEmployeeNo 方法改回 findByUserid
```

## 3. 回滚前端类型定义

```typescript
// 在 /app/src/services/ant-design-pro/typings.d.ts 中
// 将这行：
employeeNo?: string;

// 改回：
userid?: string;
```

## 4. 回滚前端组件

```typescript
// 在 /app/src/pages/Workplace/index.tsx 中
// 将所有 currentUser?.employeeNo 改回 currentUser?.userid
```

## 5. 重启服务

```bash
# 重启后端
cd /Users/StingZZ/CODE/QA/qa/server
npm run start:dev

# 重启前端
cd /Users/StingZZ/CODE/QA/qa/app
npm start
```

## 完整回滚后的等待数据库权限

数据库管理员解决权限问题后，可以重新执行重构。
