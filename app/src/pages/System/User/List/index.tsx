import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, Avatar, Popconfirm, message, Dropdown, Switch, Empty } from 'antd';
import type { MenuProps } from 'antd';
import { useRef, useState } from 'react';
import { history } from '@umijs/max';
import {
  getUserList,
  deleteUser,
  batchToggleUserStatus,
  toggleUserStatus,
  type SystemUser,
  type UserListParams,
} from '@/services/system/user';

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [switchingUsers, setSwitchingUsers] = useState<Set<number>>(new Set());

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteUser(id);
      if (result.success) {
        message.success('删除成功');
        actionRef.current?.reload();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      setSwitchingUsers(prev => new Set(prev).add(id));
      
      const newStatus = !currentStatus;
      const result = await toggleUserStatus(id, newStatus);
      if (result.success) {
        message.success(newStatus ? '用户已启用' : '用户已禁用');
        actionRef.current?.reload();
      } else {
        message.error('状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    } finally {
      setSwitchingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getActionMenuItems = (record: SystemUser): MenuProps['items'] => [
    {
      key: 'view',
      label: '查看详情',
      icon: <EyeOutlined />,
      onClick: () => history.push(`/system/user/detail/${record.id}`),
    },
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => history.push(`/system/user/edit/${record.id}`),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        if (window.confirm('确定要删除这个用户吗？此操作不可恢复。')) {
          handleDelete(record.id);
        }
      },
    },
  ];

  const handleBatchToggleStatus = async (selectedRows: SystemUser[], targetStatus: boolean) => {
    try {
      const ids = selectedRows.map((row) => row.id);
      const result = await batchToggleUserStatus(ids, targetStatus);
      if (result.success) {
        message.success(`批量${targetStatus ? '启用' : '禁用'}成功`);
        actionRef.current?.reload();
      } else {
        message.error(`批量${targetStatus ? '启用' : '禁用'}失败`);
      }
    } catch (error) {
      message.error(`批量${targetStatus ? '启用' : '禁用'}失败`);
    }
  };

  const columns: ProColumns<SystemUser>[] = [
    {
      title: '用户信息',
      dataIndex: 'userInfo',
      key: 'userInfo',
      width: 200,
      fixed: 'left',
      hideInSearch: true,
      render: (_, record) => (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            padding: '8px',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
          }}
        >
          <Avatar 
            src={record.avatar} 
            size={40}
          >
            {record.name?.charAt(0) || record.username?.charAt(0)}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: 500, 
              marginBottom: 2, 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: '#262626',
            }}>
              {record.name || record.username}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              @{record.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      hideInTable: true,
      order: 4,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      hideInTable: true,
      order: 3,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      hideInTable: true,
      order: 2,
    },
    {
      title: '员工编号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 100,
      ellipsis: true,
      responsive: ['lg'],
      hideInSearch: true,
      render: (text) => (
        <span style={{
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '12px',
          color: '#666',
          backgroundColor: '#f5f5f5',
          padding: '2px 6px',
          borderRadius: '4px',
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      hideInTable: true,
      hideInSearch: false,
      order: 1,
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      hideInTable: true,
      hideInSearch: false,
    },
    {
      title: '职位部门',
      dataIndex: 'jobInfo',
      key: 'jobInfo',
      width: 140,
      hideInSearch: true,
      responsive: ['xl'],
      render: (_, record) => (
        <div style={{ padding: '4px 0' }}>
          {record.position && (
            <div style={{ 
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
              color: '#262626',
            }}>
              {record.position}
            </div>
          )}
          {record.departmentName && (
            <div style={{ 
              fontSize: 12, 
              color: '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {record.departmentName}
            </div>
          )}
          {!record.position && !record.departmentName && (
            <div style={{ 
              fontSize: 12, 
              color: '#ccc',
              fontStyle: 'italic',
            }}>
              未分配
            </div>
          )}
        </div>
      ),
    },
    {
      title: '账户状态',
      dataIndex: 'isActive',
      key: 'isActiveSearch',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        true: { text: '启用', status: 'Success' },
        false: { text: '禁用', status: 'Error' },
      },
      fieldProps: {
        placeholder: '请选择账户状态',
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      hideInSearch: true,
      width: 120,
      responsive: ['lg'],
      render: (_, record) => (
        <div style={{ maxHeight: 60, overflow: 'hidden' }}>
          {record.tags?.slice(0, 2).map((tag, index) => (
            <Tag 
              key={tag} 
              color={index === 0 ? 'blue' : 'green'} 
              style={{ 
                marginBottom: 4,
                fontSize: '11px',
              }}
            >
              {tag}
            </Tag>
          ))}
          {(record.tags?.length ?? 0) > 2 && (
            <Tag 
              color="default" 
              style={{ 
                fontSize: '11px',
                backgroundColor: '#f0f0f0',
              }}
            >
              +{(record.tags?.length ?? 0) - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '权限',
      dataIndex: 'isAdmin',
      hideInSearch: true,
      width: 80,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {record.isAdmin ? (
            <Tag color="red" style={{ fontSize: '11px' }}>
              管理员
            </Tag>
          ) : (
            <Tag color="default" style={{ fontSize: '11px' }}>
              普通用户
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      hideInSearch: true,
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 0',
          }}
          onClick={e => e.stopPropagation()}
        >
          <Switch
            checked={record.isActive}
            loading={switchingUsers.has(record.id)}
            onChange={() => handleToggleStatus(record.id, record.isActive ?? true)}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            size="small"
          />
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      hideInSearch: true,
      width: 120,
      valueType: 'dateTime',
      responsive: ['xl'],
      render: (text) => (
        <span style={{
          fontSize: '12px',
          color: '#666',
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => {
        const menu = [
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => history.push(`/system/user/edit/${record.id}`),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              if (window.confirm('确定要删除这个用户吗？此操作不可恢复。')) {
                handleDelete(record.id);
              }
            },
          },
        ];
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => history.push(`/system/user/detail/${record.id}`)}
            >
              查看
            </Button>
            <Dropdown menu={{ items: menu }} trigger={['click']}>
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<SystemUser, UserListParams>
        headerTitle={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            fontSize: '16px',
            fontWeight: 600,
          }}>
            👥 用户管理
          </div>
        }
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          collapsed: false,
          collapseRender: (collapsed) => (
            <span style={{ 
              color: '#1890ff',
              fontWeight: 500,
            }}>
              {collapsed ? '展开搜索' : '收起搜索'}
            </span>
          ),
          searchText: '搜索',
          resetText: '重置',
          optionRender: ({ searchText, resetText }, { form }) => [
            <Button
              key="search"
              type="primary"
              onClick={() => {
                form?.submit();
              }}
            >
              {searchText}
            </Button>,
            <Button
              key="reset"
              onClick={() => {
                form?.resetFields();
                form?.submit();
              }}
            >
              {resetText}
            </Button>,
          ],
          span: {
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            xl: 6,
            xxl: 4,
          },
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push('/system/user/create')}
          >
            新建用户
          </Button>,
        ]}
        request={async (params, sort, filter) => {
          try {
            const response = await getUserList({
              current: String(params.current || 1),
              pageSize: String(params.pageSize || 10),
              name: params.name,
              username: params.username,
              email: params.email,
              employeeNo: params.employeeNo,
              phone: params.phone,
              group: params.group,
              title: params.title,
              isActive: params.isActive,
            });
            
            return {
              data: response.data || [],
              success: response.success,
              total: response.total || 0,
            };
          } catch (error) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        scroll={{ x: 1200 }}
        style={{
          backgroundColor: '#fff',
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ marginTop: 16 }}>
                  <div style={{ 
                    marginBottom: 8, 
                    color: '#999',
                    fontSize: '14px',
                  }}>
                    暂无用户数据
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#ccc',
                    marginBottom: 16,
                  }}>
                    点击"新建用户"按钮开始创建第一个用户
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => history.push('/system/user/create')}
                  >
                    新建用户
                  </Button>
                </div>
              }
            />
          ),
        }}
        rowSelection={{
          onChange: (_, selectedRows) => {
            // 可以在这里处理选中的行
          },
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => (
            <span style={{ 
              color: '#666',
              fontSize: '13px',
            }}>
              第 <span style={{ fontWeight: 600, color: '#1890ff' }}>{range[0]}-{range[1]}</span> 条
              / 总共 <span style={{ fontWeight: 600, color: '#1890ff' }}>{total}</span> 条
            </span>
          ),
        }}
        tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
          <div style={{
            backgroundColor: '#f0f8ff',
            border: '1px solid #bae7ff',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: 16,
          }}>
            <Space size={24}>
              <span style={{ color: '#1890ff', fontWeight: 500 }}>
                已选择 <a style={{ fontWeight: 600, color: '#1890ff' }}>{selectedRowKeys.length}</a> 项
                <a 
                  style={{ 
                    marginInlineStart: 8,
                    color: '#1890ff',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }} 
                  onClick={onCleanSelected}
                >
                  取消选择
                </a>
              </span>
            </Space>
          </div>
        )}
        tableAlertOptionRender={({ selectedRows, onCleanSelected }) => {
          return (
            <Space size={16}>
              <Popconfirm
                title="确定要批量启用选中的用户吗？"
                onConfirm={() => {
                  handleBatchToggleStatus(selectedRows, true);
                  onCleanSelected();
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  size="small" 
                  type="primary"
                >
                  批量启用
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定要批量禁用选中的用户吗？"
                onConfirm={() => {
                  handleBatchToggleStatus(selectedRows, false);
                  onCleanSelected();
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  size="small" 
                  danger
                >
                  批量禁用
                </Button>
              </Popconfirm>
            </Space>
          );
        }}
      />
    </PageContainer>
  );
};

export default UserList;
