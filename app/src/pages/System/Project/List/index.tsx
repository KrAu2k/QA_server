import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space, Switch, Modal, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { 
  getProjects, 
  deleteProject, 
  batchToggleProjectStatus,
  Project,
  QueryProjectRequest 
} from '@/services/system/project';

const ProjectList: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<Project>[] = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '项目名称为必填项',
          },
        ],
      },
    },
    {
      title: '项目描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      search: false,
      hideInTable: window.innerWidth < 1200, // 屏幕宽度小于1200px时隐藏
    },
    {
      title: 'H5地址',
      dataIndex: 'h5Url',
      key: 'h5Url',
      ellipsis: true,
      search: false,
      render: (text) => (
        <a href={text as string} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: '排序权重',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      search: false,
      width: 100,
      hideInTable: window.innerWidth < 1000, // 屏幕宽度小于1000px时隐藏
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: { text: '启用', status: 'Success' },
        false: { text: '禁用', status: 'Default' },
      },
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
        />
      ),
    },
    {
      title: '更新代码配置',
      key: 'updateCodeConfig',
      search: false,
      width: 120,
      hideInTable: window.innerWidth < 1400, // 屏幕宽度小于1400px时隐藏
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.enableUpdateCode ? 'green' : 'default'}>
            {record.enableUpdateCode ? '已启用' : '未启用'}
          </Tag>
          {record.enableUpdateCode && record.updateCodeCommand && (
            <Tag color="purple" style={{ fontSize: '10px' }}>
              有命令
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      search: false,
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此项目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 获取项目列表
  const fetchProjects = async (params: any) => {
    try {
      const response = await getProjects({
        current: String(params.current || 1),
        pageSize: String(params.pageSize || 10),
        name: params.name,
        isActive: params.isActive,
      });
      
      if (response.success) {
        return {
          data: response.data,
          total: response.total,
          success: true,
        };
      } else {
        message.error(response.message || '获取项目列表失败');
        return {
          data: [],
          total: 0,
          success: false,
        };
      }
    } catch (error) {
      message.error('获取项目列表失败');
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  // 查看项目详情
  const handleView = (id: string) => {
    history.push(`/system/project/detail/${id}`);
  };

  // 编辑项目
  const handleEdit = (id: string) => {
    history.push(`/system/project/edit/${id}`);
  };

  // 删除项目
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteProject(id);
      if (response.success) {
        message.success('删除项目成功');
        actionRef.current?.reload();
      } else {
        message.error(response.message || '删除项目失败');
      }
    } catch (error) {
      message.error('删除项目失败');
    }
  };

  // 切换项目状态
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await batchToggleProjectStatus([id], isActive);
      if (response.success) {
        message.success(`项目已${isActive ? '启用' : '禁用'}`);
        actionRef.current?.reload();
      } else {
        message.error(response.message || '状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 批量启用/禁用
  const handleBatchToggle = async (isActive: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的项目');
      return;
    }

    setLoading(true);
    try {
      const response = await batchToggleProjectStatus(selectedRowKeys as string[], isActive);
      if (response.success) {
        message.success(`批量${isActive ? '启用' : '禁用'}成功`);
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      } else {
        message.error(response.message || '批量操作失败');
      }
    } catch (error) {
      message.error('批量操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ProTable<Project>
        columns={columns}
        actionRef={actionRef}
        request={fetchProjects}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        headerTitle="项目列表"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push('/system/project/create')}
          >
            新建项目
          </Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选择 {selectedRowKeys.length} 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space>
            <Button
              size="small"
              loading={loading}
              onClick={() => handleBatchToggle(true)}
            >
              批量启用
            </Button>
            <Button
              size="small"
              loading={loading}
              onClick={() => handleBatchToggle(false)}
            >
              批量禁用
            </Button>
          </Space>
        )}
      />
    </PageContainer>
  );
};

export default ProjectList;
