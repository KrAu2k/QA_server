import { 
  Modal, 
  Tree, 
  Button, 
  Space, 
  Tabs, 
  message,
  Checkbox,
  Input,
  Form,
} from 'antd';
import { useState, useEffect } from 'react';
import { 
  ExportOutlined, 
  ImportOutlined, 
  DeleteOutlined, 
  EditOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { Department } from '@/services/system/department';

interface BatchOperationProps {
  visible: boolean;
  departmentTree: Department[];
  onCancel: () => void;
  onSuccess: () => void;
}

const { TabPane } = Tabs;
const { TextArea } = Input;

export default function BatchOperation({
  visible,
  departmentTree,
  onCancel,
  onSuccess,
}: BatchOperationProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  // 转换树数据
  const convertTreeData = (data: Department[]): any[] => {
    return data.map(item => ({
      key: item.id.toString(),
      title: item.name,
      children: item.children ? convertTreeData(item.children) : undefined,
    }));
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (checkedKeys.length === 0) {
      message.warning('请选择要删除的部门');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${checkedKeys.length} 个部门吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          // TODO: 实现批量删除接口
          message.success('批量删除成功');
          onSuccess();
          onCancel();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 批量状态切换
  const handleBatchStatus = async (status: number) => {
    if (checkedKeys.length === 0) {
      message.warning('请选择要操作的部门');
      return;
    }

    try {
      // TODO: 实现批量状态切换接口
      message.success(`批量${status === 1 ? '启用' : '禁用'}成功`);
      onSuccess();
    } catch (error) {
      message.error('批量操作失败');
    }
  };

  // 导出部门数据
  const handleExport = () => {
    const selectedDepartments = checkedKeys.length > 0 ? '选中部门' : '全部部门';
    
    Modal.confirm({
      title: '导出确认',
      content: `确定要导出${selectedDepartments}数据吗？`,
      onOk: () => {
        // TODO: 实现导出功能
        message.success('导出任务已提交，请稍后查看');
      },
    });
  };

  // 导入部门数据
  const handleImport = () => {
    // TODO: 实现导入功能
    message.info('导入功能开发中...');
  };

  // 复制部门结构
  const handleCopyStructure = async () => {
    if (selectedKeys.length !== 1) {
      message.warning('请选择一个部门作为复制源');
      return;
    }

    form.validateFields().then(async (values) => {
      try {
        // TODO: 实现复制结构接口
        message.success('复制结构成功');
        onSuccess();
      } catch (error) {
        message.error('复制结构失败');
      }
    });
  };

  useEffect(() => {
    if (visible) {
      // 默认展开第一层
      const firstLevelKeys = departmentTree.map(item => item.id.toString());
      setExpandedKeys(firstLevelKeys);
    }
  }, [visible, departmentTree]);

  return (
    <Modal
      title="批量操作"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Tabs defaultActiveKey="batch">
        <TabPane tab="批量操作" key="batch">
          <div style={{ display: 'flex', gap: 16 }}>
            {/* 左侧树 */}
            <div style={{ flex: 1, border: '1px solid #d9d9d9', padding: 8 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                选择部门 (已选: {checkedKeys.length})
              </div>
              <Tree
                checkable
                treeData={convertTreeData(departmentTree)}
                checkedKeys={checkedKeys}
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                onCheck={(keys) => setCheckedKeys(keys as string[])}
                onSelect={(keys) => setSelectedKeys(keys as string[])}
                onExpand={(keys) => setExpandedKeys(keys as string[])}
                style={{ minHeight: 300 }}
              />
            </div>

            {/* 右侧操作 */}
            <div style={{ width: 280, padding: 16, border: '1px solid #d9d9d9' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    批量操作
                  </div>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      block
                      onClick={() => handleBatchStatus(1)}
                      disabled={checkedKeys.length === 0}
                    >
                      批量启用
                    </Button>
                    <Button
                      block
                      onClick={() => handleBatchStatus(0)}
                      disabled={checkedKeys.length === 0}
                    >
                      批量禁用
                    </Button>
                    <Button
                      danger
                      block
                      icon={<DeleteOutlined />}
                      onClick={handleBatchDelete}
                      disabled={checkedKeys.length === 0}
                    >
                      批量删除
                    </Button>
                  </Space>
                </div>

                <div>
                  <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    数据操作
                  </div>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      block
                      icon={<ExportOutlined />}
                      onClick={handleExport}
                    >
                      导出数据
                    </Button>
                    <Button
                      block
                      icon={<ImportOutlined />}
                      onClick={handleImport}
                    >
                      导入数据
                    </Button>
                  </Space>
                </div>
              </Space>
            </div>
          </div>
        </TabPane>

        <TabPane tab="复制结构" key="copy">
          <Form form={form} layout="vertical">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                选择源部门
              </div>
              <Tree
                treeData={convertTreeData(departmentTree)}
                selectedKeys={selectedKeys}
                expandedKeys={expandedKeys}
                onSelect={(keys) => setSelectedKeys(keys as string[])}
                onExpand={(keys) => setExpandedKeys(keys as string[])}
                style={{ minHeight: 200, border: '1px solid #d9d9d9', padding: 8 }}
              />
            </div>

            <Form.Item
              name="targetName"
              label="目标部门名称"
              rules={[{ required: true, message: '请输入目标部门名称' }]}
            >
              <Input placeholder="请输入目标部门名称" />
            </Form.Item>

            <Form.Item
              name="targetCode"
              label="目标部门编码"
              rules={[{ required: true, message: '请输入目标部门编码' }]}
            >
              <Input placeholder="请输入目标部门编码" />
            </Form.Item>

            <Form.Item name="copyMembers" valuePropName="checked">
              <Checkbox>同时复制成员信息</Checkbox>
            </Form.Item>

            <Form.Item name="copyRoles" valuePropName="checked">
              <Checkbox>同时复制角色权限</Checkbox>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={handleCopyStructure}
                  disabled={selectedKeys.length !== 1}
                >
                  开始复制
                </Button>
                <Button onClick={onCancel}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
}
