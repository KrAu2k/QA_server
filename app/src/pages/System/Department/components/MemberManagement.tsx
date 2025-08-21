import { 
  Modal, 
  Table, 
  Button, 
  Space, 
  Input, 
  message, 
  Avatar, 
  Tag, 
  Popconfirm,
  Transfer,
  Tabs,
} from 'antd';
import { useState, useEffect } from 'react';
import { UserOutlined, SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Department, DepartmentMember } from '@/services/system/department';
import {
  getDepartmentMembers,
  addDepartmentMember,
  removeDepartmentMember,
  setDepartmentManager,
} from '@/services/system/department';

interface MemberManagementProps {
  visible: boolean;
  department: Department | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const { Search } = Input;
const { TabPane } = Tabs;

export default function MemberManagement({
  visible,
  department,
  onCancel,
  onSuccess,
}: MemberManagementProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [searchText, setSearchText] = useState('');
  const [transferVisible, setTransferVisible] = useState(false);
  const [transferData, setTransferData] = useState<any[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  // 加载部门成员
  const loadMembers = async () => {
    if (!department) return;
    
    setLoading(true);
    try {
      const response = await getDepartmentMembers(department.id);
      if (response.success) {
        setMembers(response.data || []);
      } else {
        message.error(response.message || '加载成员失败');
      }
    } catch (error) {
      message.error('加载成员失败');
    } finally {
      setLoading(false);
    }
  };

  // 移除成员
  const handleRemoveMember = async (userId: number) => {
    if (!department) return;
    
    try {
      const response = await removeDepartmentMember(department.id, userId);
      if (response.success) {
        message.success('移除成员成功');
        loadMembers();
        onSuccess();
      } else {
        message.error(response.message || '移除成员失败');
      }
    } catch (error) {
      message.error('移除成员失败');
    }
  };

  // 设置负责人
  const handleSetManager = async (userId: number) => {
    if (!department) return;
    
    try {
      const response = await setDepartmentManager(department.id, userId);
      if (response.success) {
        message.success('设置负责人成功');
        loadMembers();
        onSuccess();
      } else {
        message.error(response.message || '设置负责人失败');
      }
    } catch (error) {
      message.error('设置负责人失败');
    }
  };

  // 添加成员
  const handleAddMembers = async (userIds: string[]) => {
    if (!department) return;
    
    try {
      const response = await addDepartmentMember(
        department.id, 
        userIds.map(id => parseInt(id))
      );
      if (response.success) {
        message.success('添加成员成功');
        setTransferVisible(false);
        loadMembers();
        onSuccess();
      } else {
        message.error(response.message || '添加成员失败');
      }
    } catch (error) {
      message.error('添加成员失败');
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: DepartmentMember) => (
        <Space>
          <Avatar 
            size="small" 
            src={record.avatar} 
            icon={<UserOutlined />} 
          />
          <span>{text}</span>
          {record.isManager && <Tag color="gold">负责人</Tag>}
        </Space>
      ),
    },
    {
      title: '工号',
      dataIndex: 'userCode',
      key: 'userCode',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '岗位',
      dataIndex: 'positionName',
      key: 'positionName',
    },
    {
      title: '加入时间',
      dataIndex: 'joinTime',
      key: 'joinTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DepartmentMember) => (
        <Space size="small">
          {!record.isManager && (
            <Button
              type="link"
              size="small"
              onClick={() => handleSetManager(record.userId)}
            >
              设为负责人
            </Button>
          )}
          <Popconfirm
            title="确定要移除此成员吗？"
            onConfirm={() => handleRemoveMember(record.userId)}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              移除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredMembers = members.filter(member =>
    member.userName.toLowerCase().includes(searchText.toLowerCase()) ||
    member.userCode.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    if (visible && department) {
      loadMembers();
    }
  }, [visible, department]);

  return (
    <>
      <Modal
        title={`${department?.name} - 成员管理`}
        open={visible}
        onCancel={onCancel}
        width={800}
        footer={null}
      >
        <Tabs defaultActiveKey="members">
          <TabPane tab="成员列表" key="members">
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Search
                  placeholder="搜索成员"
                  allowClear
                  style={{ width: 200 }}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setTransferVisible(true)}
                >
                  添加成员
                </Button>
              </Space>
            </div>
            
            <Table
              columns={columns}
              dataSource={filteredMembers}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredMembers.length,
                showTotal: (total) => `共 ${total} 条`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </TabPane>
        </Tabs>
      </Modal>

      {/* 添加成员弹窗 */}
      <Modal
        title="添加成员"
        open={transferVisible}
        onCancel={() => setTransferVisible(false)}
        onOk={() => handleAddMembers(targetKeys)}
        width={600}
      >
        <Transfer
          dataSource={transferData}
          titles={['待选择用户', '已选择用户']}
          targetKeys={targetKeys}
          onChange={(targetKeys) => setTargetKeys(targetKeys as string[])}
          render={item => item.title}
          showSearch
          listStyle={{
            width: 250,
            height: 300,
          }}
        />
      </Modal>
    </>
  );
}
