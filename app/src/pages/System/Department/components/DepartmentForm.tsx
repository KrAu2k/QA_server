import { Modal, Form, Input, Select, Switch, InputNumber, TreeSelect } from 'antd';
import { useEffect } from 'react';
import type { Department, DepartmentFormData } from '@/services/system/department';

interface DepartmentFormProps {
  visible: boolean;
  form: any;
  editingDept: Department | null;
  departmentTree: Department[];
  onCancel: () => void;
  onSubmit: (values: DepartmentFormData) => void;
}

const { TextArea } = Input;

export default function DepartmentForm({
  visible,
  form,
  editingDept,
  departmentTree,
  onCancel,
  onSubmit,
}: DepartmentFormProps) {
  
  // 转换树数据用于TreeSelect
  const convertTreeData = (data: Department[]): any[] => {
    return data.map(item => ({
      title: item.name,
      value: item.id,
      children: item.children ? convertTreeData(item.children) : undefined,
    }));
  };

  // 过滤掉当前编辑的部门及其子部门
  const filterTreeData = (data: Department[], excludeId?: number): Department[] => {
    if (!excludeId) return data;
    
    return data.filter(item => {
      if (item.id === excludeId) return false;
      if (item.children) {
        item.children = filterTreeData(item.children, excludeId);
      }
      return true;
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values: DepartmentFormData) => {
      onSubmit(values);
    });
  };

  const filteredTreeData = editingDept 
    ? filterTreeData(departmentTree, editingDept.id)
    : departmentTree;

  return (
    <Modal
      title={editingDept ? '编辑部门' : '新增部门'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: true,
          sort: 0,
        }}
      >
        <Form.Item
          name="name"
          label="部门名称"
          rules={[
            { required: true, message: '请输入部门名称' },
            { max: 50, message: '部门名称不能超过50个字符' },
          ]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="部门编码"
          rules={[
            { required: true, message: '请输入部门编码' },
            { max: 20, message: '部门编码不能超过20个字符' },
            { pattern: /^[A-Za-z0-9_-]+$/, message: '部门编码只能包含字母、数字、下划线和连字符' },
          ]}
        >
          <Input placeholder="请输入部门编码" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="上级部门"
        >
          <TreeSelect
            placeholder="请选择上级部门"
            allowClear
            treeData={convertTreeData(filteredTreeData)}
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          name="managerId"
          label="部门负责人"
        >
          <Select
            placeholder="请选择部门负责人"
            allowClear
            showSearch
            options={[
              // TODO: 从用户接口获取用户列表
            ]}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="部门描述"
        >
          <TextArea 
            placeholder="请输入部门描述" 
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            style={{ flex: 1 }}
          >
            <Switch 
              checkedChildren="启用" 
              unCheckedChildren="禁用"
            />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            rules={[
              { type: 'number', min: 0, message: '排序值不能小于0' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber 
              placeholder="请输入排序值"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
