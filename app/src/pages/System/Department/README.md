# 部门管理 - 组织架构图功能

## 功能概述

部门管理页面现在集成了一个可视化的组织架构图，位于页面顶部，提供以下功能：

### 主要特性

1. **可视化展示**
   - 使用@ant-design/graphs的OrganizationChart组件展示部门层级结构
   - 支持DAG布局，自动调整节点位置
   - 不同颜色区分正常部门和禁用部门

2. **交互功能**
   - 点击图表节点可选中对应部门
   - 支持展开/收起节点操作
   - 支持缩放和拖拽操作

3. **实时更新**
   - 当部门数据发生变化时，图表会自动刷新
   - 选中状态实时同步显示

4. **响应式设计**
   - 适配不同屏幕尺寸
   - 移动端友好的交互体验

### 技术实现

- **图表库**: @ant-design/graphs
- **数据转换**: 将树形部门数据转换为图表数据格式
- **状态管理**: 与部门树和详情面板状态同步
- **样式优化**: 自定义CSS样式，美观的视觉效果

### 组件结构

```
OrganizationChart/
├── index.tsx          # 主组件
└── styles.less        # 样式文件
```

### 使用方法

```tsx
import OrganizationChartComponent from './components/OrganizationChart';

<OrganizationChartComponent
  data={departmentTreeData}
  loading={isLoading}
  onNodeClick={handleDepartmentSelect}
  selectedDeptId={selectedDepartmentId}
/>
```

### 数据格式

组件接收标准的部门树形数据：

```typescript
interface Department {
  id: number;
  name: string;
  code: string;
  status: number; // 0-禁用, 1-正常
  memberCount?: number;
  children?: Department[];
  // ... 其他字段
}
```

### 样式定制

组织架构图支持以下样式定制：

- 节点颜色：正常部门蓝色，禁用部门红色
- 选中状态：绿色边框高亮
- 连接线：灰色曲线连接
- 标签显示：部门名称和编码信息

### 性能优化

- 使用React.memo优化渲染性能
- 按需加载图表组件
- 内存泄漏防护

### 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### 注意事项

1. 确保@ant-design/graphs库已正确安装
2. 大数据量时建议启用虚拟滚动
3. 移动端建议调整图表高度
4. 定期清理图表实例避免内存泄漏

### 更新日志

- **v2.0**: 从ECharts迁移到@ant-design/graphs，提供更好的组织架构图展示
- **v1.0**: 初始版本，使用ECharts实现 