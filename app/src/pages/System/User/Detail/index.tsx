import { ArrowLeftOutlined, EditOutlined, UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, CalendarOutlined, TagOutlined, BellOutlined, EyeOutlined, ClockCircleOutlined, LoginOutlined, LogoutOutlined, GlobalOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Space, Tag, Avatar, Spin, message, Row, Col, Statistic, Timeline, Table, Tooltip, Divider, Tabs, Progress } from 'antd';
import { useParams, history } from '@umijs/max';
import { useRequest } from '@umijs/max';
import { getUserDetail, type SystemUser } from '@/services/system/user';
import { getUserLoginLogs, type UserLoginLog } from '@/services/system/log';
import dayjs from 'dayjs';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useRequest(
    () => getUserDetail(id!),
    {
      ready: !!id,
      onError: (err) => {
        console.error('用户详情请求错误:', err);
        message.error('获取用户详情失败');
      },
    }
  );

  // 获取用户登录日志
  const { data: loginLogsData, loading: loginLogsLoading } = useRequest(
    () => getUserLoginLogs(id!, 20),
    {
      ready: !!id,
      onError: (err) => {
        console.error('获取用户登录日志失败:', err);
      },
    }
  );

  // 处理不同的数据格式
  let userInfo: SystemUser | undefined;
  if (data) {
    // 如果数据有 data 字段（包装格式）
    if ((data as any)?.data) {
      userInfo = (data as any).data;
    } 
    // 如果数据直接就是用户对象
    else if ((data as any)?.id) {
      userInfo = data as any;
    }
  }

  // 处理登录日志数据
  const loginLogs: UserLoginLog[] = (() => {
    if (!loginLogsData) return [];
    
    console.log('登录日志原始数据:', loginLogsData);
    
    // 如果数据有 data 字段（包装格式）
    if ((loginLogsData as any)?.data) {
      console.log('使用包装格式数据:', (loginLogsData as any).data);
      return (loginLogsData as any).data;
    } 
    // 如果数据直接就是数组
    else if (Array.isArray(loginLogsData)) {
      console.log('使用直接数组数据:', loginLogsData);
      return loginLogsData;
    }
    
    console.log('未找到有效数据格式');
    return [];
  })();

  console.log('处理后的登录日志:', loginLogs);

  if (loading) {
    return (
      <PageContainer
        header={{
          extra: (
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => history.back()}
              style={{ marginRight: 8 }}
            >
              返回
            </Button>
          ),
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          padding: '50px 20px',
        }}>
          <Spin size="large" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: '14px', color: '#666' }}>正在加载用户信息...</div>
        </div>
      </PageContainer>
    );
  }

  if (error || !userInfo) {
    return (
      <PageContainer
        header={{
          extra: (
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => history.back()}
              style={{ marginRight: 8 }}
            >
              返回
            </Button>
          ),
        }}
      >
        <Card>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
          }}>
            <div style={{ fontSize: '16px', marginBottom: 8 }}>用户信息加载失败</div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: 24 }}>请检查网络连接或稍后重试</div>
            <Button 
              type="primary" 
              onClick={() => history.back()}
            >
              返回列表
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer 
      ghost
      header={{
        extra: (
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => history.back()}
            >
              返回
            </Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => history.push(`/system/user/edit/${id}`)}
            >
              编辑用户
            </Button>
          </Space>
        ),
      }}
    >
      {/* 顶部横幅+主信息区 */}
      <div style={{
        width: '100%',
        minHeight: 180,
        background: 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)',
        borderRadius: 12,
        marginBottom: 32,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 32px 0',
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: 0.08,
          // background: 'url(https://gw.alipayobjects.com/zos/rmsportal/ODTLcjxAfvqbxHnVXCYX.png) center/cover no-repeat',
        }} />
        <div style={{ zIndex: 2, textAlign: 'center' }}>
          <Avatar src={userInfo.avatar} size={96} style={{ border: '4px solid #fff', marginBottom: 12 }}>
            {userInfo.name?.charAt(0) || userInfo.username?.charAt(0)}
          </Avatar>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {userInfo.name || userInfo.username}
            {userInfo.isActive && <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />}
          </div>
          <div style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>
            @{userInfo.username} &nbsp;|
            <span style={{ marginLeft: 8 }}><EnvironmentOutlined /> {userInfo.address || '未知地址'}</span>
            {userInfo.createdAt && <span style={{ marginLeft: 8 }}><CalendarOutlined /> 加入 {dayjs(userInfo.createdAt).format('YYYY年MM月DD日')}</span>}
          </div>
        </div>
      </div>
      {/* Tab导航，可扩展 */}
      <Tabs defaultActiveKey="profile" style={{ marginBottom: 24 }} items={[
        { key: 'profile', label: '个人信息' },
        // { key: 'teams', label: 'Teams' },
        // { key: 'projects', label: 'Projects' },
        // { key: 'connections', label: 'Connections' },
      ]} />
      {/* 主内容区：左右两栏 */}
      <Row gutter={32}>
        {/* 左侧Profile卡片分组 */}
        <Col xs={24} md={14} lg={14}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>ABOUT</div> 
            <div style={{ marginBottom: 8 }}>{userInfo.name}</div>
            <div style={{ marginBottom: 8 }}>{userInfo.departmentName || 'No department'}</div>
            <div style={{ marginBottom: 8 }}>{userInfo.position || ''}</div>
            <div style={{ color: '#888', fontSize: 13, margin: '16px 0 8px 0' }}>CONTACTS</div>
            <div style={{ marginBottom: 8 }}>{userInfo.email || '—'}</div>
            <div style={{ marginBottom: 8 }}>{userInfo.phone || '—'}</div>
            <div style={{ color: '#888', fontSize: 13, margin: '16px 0 8px 0' }}>TEAMS</div>
            <div style={{ marginBottom: 8 }}>成员于 {userInfo.group || '—'}</div>
            <div style={{ marginBottom: 8 }}>参与 {userInfo.tags?.length || 0} 个标签</div>
            
            <div style={{ color: '#888', fontSize: 13, margin: '16px 0 8px 0' }}>状态</div>
            <Tag color={userInfo.isActive ? 'green' : 'red'}>{userInfo.isActive ? '正常' : '禁用'}</Tag>
          </Card>
        </Col>
        <Col xs={24} md={10}>
              <Card title={<span><BellOutlined style={{ color: '#1890ff' }} /> 统计与动态</span>} bordered={false} style={{ marginBottom: 24 }}>
             
                <Row gutter={16} style={{ marginTop: 12 }}>
                  <Col span={12}><Statistic title="登录次数" value={loginLogs.filter(log => log.action === 'login' && log.status === 'success').length} valueStyle={{ color: '#52c41a' }} prefix={<LoginOutlined />} /></Col>
                  <Col span={12}><Statistic title="登录失败" value={loginLogs.filter(log => log.action === 'login' && log.status === 'error').length} valueStyle={{ color: '#ff4d4f' }} prefix={<ExclamationCircleOutlined />} /></Col>
                </Row>
                {loginLogs.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>最近登录时间</div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{dayjs(loginLogs[0]?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                  </div>
                )}
                <Divider style={{ margin: '12px 0' }}>时间线</Divider>
                <Timeline
                  items={[
                    {
                      color: 'green',
                      children: (
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>账户创建</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{typeof userInfo.createdAt === 'string' ? new Date(userInfo.createdAt).toLocaleString() : '未知'}</div>
                        </div>
                      ),
                    },
                    ...(userInfo.updatedAt && userInfo.updatedAt !== userInfo.createdAt && typeof userInfo.updatedAt === 'string' ? [{
                      color: 'blue',
                      children: (
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>最后更新</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{new Date(userInfo.updatedAt).toLocaleString()}</div>
                        </div>
                      ),
                    }] : []),
                    ...(userInfo.joinDate && typeof userInfo.joinDate === 'string' ? [{
                      color: 'orange',
                      children: (
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>入职时间</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{new Date(userInfo.joinDate).toLocaleDateString()}</div>
                        </div>
                      ),
                    }] : []),
                  ]}
                />
              </Card>
            </Col>
        {/* 右侧主内容区 */}
        <Col xs={24} md={24} lg={24}>
          {/* 动态流/统计/日志等可分块 */}
          <Row gutter={24}>
            
           
            <Col xs={24} md={24}>
              <Card title={<span> 登录记录 <Tag color="blue" style={{ marginLeft: 8 }}>{loginLogs.length} 条记录</Tag></span>} bordered={false} style={{ marginBottom: 24 }} loading={loginLogsLoading}>
                {loginLogs.length > 0 ? (
                  <Table<UserLoginLog>
                    dataSource={loginLogs}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: '操作',
                        dataIndex: 'action',
                        width: 80,
                        render: (action: string) => (
                          <Space>
                            
                            <Tag color={action === 'login' ? 'green' : 'orange'}>{action === 'login' ? '登录' : '登出'}</Tag>
                          </Space>
                        ),
                      },
                      {
                        title: '状态',
                        dataIndex: 'status',
                        width: 80,
                        render: (status: string) => (
                          <Tag color={status === 'success' ? 'success' : 'error'} icon={status === 'success' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>{status === 'success' ? '成功' : '失败'}</Tag>
                        ),
                      },
                      {
                        title: 'IP地址',
                        dataIndex: 'ipAddress',
                        width: 120,
                        render: (ip: string) => (
                          <Space><GlobalOutlined /><span style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: '12px' }}>{ip || '-'}</span></Space>
                        ),
                      },
                      {
                        title: '时间',
                        dataIndex: 'createdAt',
                        width: 160,
                        render: (time: string) => (
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 500 }}>{dayjs(time).format('MM-DD HH:mm')}</div>
                            <div style={{ fontSize: '11px', color: '#666' }}>{dayjs(time).format('YYYY-MM-DD')}</div>
                          </div>
                        ),
                      },
                      {
                        title: '详情',
                        dataIndex: 'content',
                        render: (content: string, record: UserLoginLog) => (
                          <div>
                            <div style={{ fontSize: '12px', marginBottom: 4 }}>{content}</div>
                            {record.errorMessage && (<div style={{ fontSize: '11px', color: '#ff4d4f' }}>错误: {record.errorMessage}</div>)}
                            {record.userAgent && (
                              <Tooltip title={record.userAgent}>
                                <div style={{ fontSize: '11px', color: '#666', cursor: 'pointer' }}>{record.userAgent.length > 50 ? `${record.userAgent.substring(0, 50)}...` : record.userAgent}</div>
                              </Tooltip>
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                    <LoginOutlined style={{ fontSize: '24px', marginBottom: 8 }} />
                    <div>暂无登录记录</div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default UserDetail;
