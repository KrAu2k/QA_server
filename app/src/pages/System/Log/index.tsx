import React, { useState, useEffect } from 'react';
import {
  PageContainer,
  ProTable,
  ProCard,
  Statistic,
} from '@ant-design/pro-components';
import {
  Row,
  Col,
  Button,
  Modal,
  message,
  Popconfirm,
  Tag,
  Space,
  DatePicker,
  Select,
  Input,
  Descriptions,
  Divider,
} from 'antd';
import { 
  DeleteOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  ClearOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { queryLogs, getLogStats, deleteLog, batchDeleteLogs, cleanExpiredLogs, getLogDetail, getLogUsers } from '@/services/system/log';
import type { LogItem, QueryLogParams, LogStats, LogUser } from '@/services/system/log';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const LogManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLog, setDetailLog] = useState<LogItem | null>(null);
  const [cleanModalVisible, setCleanModalVisible] = useState(false);
  const [cleanDays, setCleanDays] = useState(90);
  const [logUsers, setLogUsers] = useState<LogUser[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await getLogStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  // 获取操作用户列表
  const fetchLogUsers = async () => {
    try {
      setUserLoading(true);
      const response = await getLogUsers();
      if (response.success) {
        setLogUsers(response.data);
      }
    } catch (error) {
      console.error('获取操作用户列表失败:', error);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogUsers();
  }, []);

  // 查看日志详情
  const handleViewDetail = async (id: number) => {
    try {
      const response = await getLogDetail(id);
      if (response.success) {
        setDetailLog(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      message.error('获取日志详情失败');
    }
  };

  // 删除日志
  const handleDelete = async (id: number) => {
    try {
      const response = await deleteLog(id);
      if (response.success) {
        message.success('删除成功');
        return true;
      } else {
        message.error(response.message || '删除失败');
        return false;
      }
    } catch (error) {
      message.error('删除失败');
      return false;
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的日志');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条日志吗？`,
      onOk: async () => {
        try {
          const response = await batchDeleteLogs(selectedRowKeys as number[]);
          if (response.success) {
            message.success('批量删除成功');
            setSelectedRowKeys([]);
            return true;
          } else {
            message.error(response.message || '批量删除失败');
            return false;
          }
        } catch (error) {
          message.error('批量删除失败');
          return false;
        }
      },
    });
  };

  // 清理过期日志
  const handleCleanExpired = async () => {
    try {
      const response = await cleanExpiredLogs(cleanDays);
      if (response.success) {
        message.success(`清理成功，删除了 ${response.data.deletedCount} 条过期日志`);
        setCleanModalVisible(false);
        return true;
      } else {
        message.error(response.message || '清理失败');
        return false;
      }
    } catch (error) {
      message.error('清理失败');
      return false;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      search: false,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
      render: (text: any) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作用户',
      dataIndex: 'userName',
      width: 120,
      valueType: 'select' as const,
      fieldProps: {
        showSearch: true,
        allowClear: true,
        loading: userLoading,
        placeholder: '请选择操作用户',
        filterOption: (input: string, option: any) =>
          option?.children?.toLowerCase().includes(input.toLowerCase()),
      },
      valueEnum: logUsers.reduce((acc, user) => {
        acc[user.userName] = user.userName;
        return acc;
      }, {} as Record<string, string>),
      render: (text: any, record: LogItem) => (
        <Space>
          <UserOutlined />
          <span>{text || '未知用户'}</span>
        </Space>
      ),
    },
    {
      title: '应用模块',
      dataIndex: 'app',
      width: 120,
      render: (text: any) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: '模型',
      dataIndex: 'model',
      width: 120,
      render: (text: any) => (
        <Tag color="green">{text}</Tag>
      ),
    },
    {
      title: '操作动作',
      dataIndex: 'action',
      width: 120,
      render: (text: any) => (
        <Tag color="orange">{text}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (text: any) => (
        <Tag 
          color={text === 'success' ? 'success' : 'error'}
          icon={text === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        >
          {text === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      width: 140,
      render: (text: any) => (
        <Space>
          <GlobalOutlined />
          <span>{text || '-'}</span>
        </Space>
      ),
    },
    {
      title: '执行时间',
      dataIndex: 'executionTime',
      width: 120,
      search: false,
      render: (text: any) => text ? `${text}ms` : '-',
    },
    {
      title: '操作内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (text: any) => (
        <div style={{ maxWidth: 300, wordBreak: 'break-all' }}>
          {text}
        </div>
      ),
    },
    {
      title: '操作',
      valueType: 'option' as const,
      width: 120,
      render: (_: any, record: LogItem) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        >
          详情
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这条日志吗？"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  // 搜索表单配置
  const searchConfig = {
    labelWidth: 'auto' as const,
    defaultCollapsed: false,
    collapsed: false,
  };

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <ProCard style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="今日日志"
              value={stats?.todayLogs || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="昨日日志"
              value={stats?.yesterdayLogs || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总日志数"
              value={stats?.totalLogs || 0}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="成功率"
              value={stats?.successRate || '100.00'}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>
      </ProCard>

      {/* 日志表格 */}
      <ProTable<LogItem, QueryLogParams>
        headerTitle="系统日志"
        rowKey="id"
        search={searchConfig}
        toolBarRender={() => [
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchStats();
            }}
          >
            刷新统计
          </Button>,
          <Button
            key="batchDelete"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchDelete}
          >
            批量删除 ({selectedRowKeys.length})
          </Button>,
          <Button
            key="clean"
            icon={<ClearOutlined />}
            onClick={() => setCleanModalVisible(true)}
          >
            清理过期日志
          </Button>,
        ]}
        request={async (params) => {
          setLoading(true);
          try {
            const response = await queryLogs({
              ...params,
              current: params.current || 1,
              pageSize: params.pageSize || 20,
            });
            setLoading(false);
            return {
              data: response.data || [],
              total: response.total || 0,
              success: response.success,
            };
          } catch (error) {
            setLoading(false);
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        loading={loading}
      />

      {/* 日志详情弹窗 */}
      <Modal
        title="日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {detailLog && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="日志ID">{detailLog.id}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(detailLog.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="操作用户">{detailLog.userName || '未知用户'}</Descriptions.Item>
              <Descriptions.Item label="用户邮箱">{detailLog.userEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="应用模块">{detailLog.app}</Descriptions.Item>
              <Descriptions.Item label="模型">{detailLog.model}</Descriptions.Item>
              <Descriptions.Item label="操作动作">{detailLog.action}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={detailLog.status === 'success' ? 'success' : 'error'}>
                  {detailLog.status === 'success' ? '成功' : '失败'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="IP地址">{detailLog.ipAddress || '-'}</Descriptions.Item>
              <Descriptions.Item label="执行时间">
                {detailLog.executionTime ? `${detailLog.executionTime}ms` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="单据ID" span={2}>
                {detailLog.billId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="操作内容" span={2}>
                {detailLog.content}
              </Descriptions.Item>
              {detailLog.errorMessage && (
                <Descriptions.Item label="错误信息" span={2}>
                  <div style={{ color: '#ff4d4f' }}>{detailLog.errorMessage}</div>
                </Descriptions.Item>
              )}
            </Descriptions>

            {detailLog.requestData && (
              <>
                <Divider>请求数据</Divider>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(detailLog.requestData, null, 2)}
                </pre>
              </>
            )}

            {detailLog.responseData && (
              <>
                <Divider>响应数据</Divider>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(detailLog.responseData, null, 2)}
                </pre>
              </>
            )}

            {detailLog.userAgent && (
              <>
                <Divider>用户代理</Divider>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4,
                  wordBreak: 'break-all'
                }}>
                  {detailLog.userAgent}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 清理过期日志弹窗 */}
      <Modal
        title="清理过期日志"
        open={cleanModalVisible}
        onOk={handleCleanExpired}
        onCancel={() => setCleanModalVisible(false)}
        okText="确认清理"
        cancelText="取消"
      >
        <p>确定要清理 {cleanDays} 天前的日志吗？此操作不可恢复。</p>
        <div style={{ marginTop: 16 }}>
          <label>清理天数：</label>
          <Select
            value={cleanDays}
            onChange={setCleanDays}
            style={{ width: 120, marginLeft: 8 }}
            options={[
              { label: '30天', value: 30 },
              { label: '60天', value: 60 },
              { label: '90天', value: 90 },
              { label: '180天', value: 180 },
              { label: '365天', value: 365 },
            ]}
          />
        </div>
      </Modal>
    </PageContainer>
  );
};

export default LogManagement; 