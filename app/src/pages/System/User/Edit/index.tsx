import { ArrowLeftOutlined, SaveOutlined, UserOutlined, EditOutlined, PhoneOutlined, TeamOutlined, LockOutlined } from '@ant-design/icons';
import { PageContainer, ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDatePicker, ProFormTreeSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Button, Card, message, Spin, Row, Col, Avatar, Typography, Switch, Space, Tag } from 'antd';
import { useParams, history } from '@umijs/max';
import { useRequest } from '@umijs/max';
import { useState, useEffect } from 'react';
import { getUserDetail, updateUser, toggleUserStatus, type UpdateUserParams } from '@/services/system/user';
import { getDepartmentTree, type Department } from '@/services/system/department';
import ChangePasswordModal from '@/components/ChangePasswordModal';

const { Title, Text } = Typography;

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [departmentTree, setDepartmentTree] = useState<Department[]>([]);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // 加载部门树数据
  useEffect(() => {
    const loadDepartmentTree = async () => {
      try {
        const response = await getDepartmentTree();
        if (response.success && response.data) {
          setDepartmentTree(response.data);
        }
      } catch (error) {
        console.error('加载部门树失败:', error);
      }
    };
    loadDepartmentTree();
  }, []);

  // 转换部门树数据用于TreeSelect
  const convertTreeData = (data: Department[]): any[] => {
    return data.map(item => ({
      title: item.name,
      value: item.id,
      children: item.children ? convertTreeData(item.children) : undefined,
    }));
  };

  const { data, loading, refresh } = useRequest(
    () => getUserDetail(parseInt(id!)),
    {
      ready: !!id,
      onError: () => {
        message.error('获取用户信息失败');
      },
    }
  );

  const handleSubmit = async (values: UpdateUserParams) => {
    try {
      // 从提交的值中排除 isActive 字段
      const { isActive, ...updateValues } = values;
      const result = await updateUser({ ...updateValues, id: parseInt(id!) });
      if (result.success) {
        message.success('用户更新成功');
        history.push('/system/user/list');
      } else {
        message.error('用户更新失败');
      }
    } catch (error) {
      message.error('用户更新失败');
    }
  };

  const handleStatusToggle = async (checked: boolean) => {
    try {
      const result = await toggleUserStatus(parseInt(id!), checked);
      if (result.success) {
        message.success(checked ? '用户已启用' : '用户已禁用');
        refresh(); // 刷新用户数据
      } else {
        message.error('状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  if (loading) {
    return (
      <PageContainer>
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

  // 处理不同的数据格式
  let userInfo: any;
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

  if (!userInfo) {
    return (
      <PageContainer>
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
      header={{
        title: (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            fontSize: '16px',
            fontWeight: 600,
          }}>
            <EditOutlined style={{ color: '#1890ff' }} />
            编辑用户 - {userInfo.name}
          </div>
        ),
        extra: [
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
          >
            返回列表
          </Button>,
        ],
      }}
    >
      {/* 用户信息概览卡片 */}
      <Card 
        style={{ marginBottom: 24 }}
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            fontSize: '14px',
            fontWeight: 600,
          }}>
            <UserOutlined />
            用户信息
          </div>
        }
      >
        <Row gutter={24} align="middle">
          <Col>
            <Avatar 
              src={userInfo.avatar} 
              size={64}
            >
              {userInfo.name?.charAt(0) || userInfo.username?.charAt(0)}
            </Avatar>
          </Col>
          <Col flex="1">
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                {userInfo.name || userInfo.username}
              </Title>
              <div style={{ 
                fontSize: '14px', 
                color: '#666',
                marginBottom: 4,
              }}>
                @{userInfo.username}
              </div>
              {userInfo.position && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#666',
                  marginBottom: 8,
                }}>
                  {userInfo.position}
                </div>
              )}
            </div>
            <Space size={16}>
              {userInfo.departmentName && (
                <Tag color="blue">
                  {userInfo.departmentName}
                </Tag>
              )}
              <Tag color={userInfo.isActive ? 'green' : 'red'}>
                {userInfo.isActive ? '正常' : '禁用'}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="center">
              <div style={{ fontSize: '14px' }}>账户状态</div>
              <Switch
                checked={userInfo.isActive}
                onChange={handleStatusToggle}
                checkedChildren="启用"
                unCheckedChildren="禁用"
              />
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="center">
              <div style={{ fontSize: '14px' }}>密码管理</div>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
              >
                重置密码
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 编辑表单卡片 */}
      <Card 
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            fontSize: '14px',
            fontWeight: 600,
          }}>
            <EditOutlined style={{ color: '#1890ff' }} />
            编辑用户信息
          </div>
        }
      >
        <ProForm<UpdateUserParams>
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            ...userInfo,
            // 不包含密码字段，密码需要单独修改
          }}
          submitter={{
            render: (props, doms) => {
              return [
                <Button
                  key="cancel"
                  onClick={() => history.back()}
                >
                  取消
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => props.form?.submit?.()}
                >
                  保存更改
                </Button>,
              ];
            },
          }}
        >
          {/* 基本信息分组 */}
          <div style={{ 
            marginBottom: 24,
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
          }}>
            <div style={{ 
              marginBottom: 16,
              fontSize: '14px',
              fontWeight: 600,
              color: '#1890ff',
            }}>
              基本信息
            </div>
            <ProForm.Group>
              <ProFormText
                name="username"
                label="用户名"
                width="md"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 20, message: '用户名最多20个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
                ]}
                placeholder="请输入用户名"
              />
              <ProFormText
                name="name"
                label="姓名"
                width="md"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { max: 50, message: '姓名最多50个字符' }
                ]}
                placeholder="请输入姓名"
              />
            </ProForm.Group>

            <ProForm.Group>
              <ProFormText
                name="employeeNo"
                label="员工编号"
                width="md"
                rules={[
                  { required: true, message: '请输入员工编号' },
                  { pattern: /^\d+$/, message: '员工编号只能是数字' }
                ]}
                placeholder="请输入员工编号"
              />
              <ProFormText
                name="email"
                label="邮箱"
                width="md"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
                placeholder="请输入邮箱"
              />
            </ProForm.Group>
          </div>

          {/* 联系信息分组 */}
          <div style={{ 
            marginBottom: 24,
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
          }}>
            <div style={{ 
              marginBottom: 16,
              fontSize: '14px',
              fontWeight: 600,
              color: '#1890ff',
            }}>
              联系信息
            </div>
            <ProForm.Group>
              <ProFormText
                name="phone"
                label="手机号"
                width="md"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                ]}
                placeholder="请输入手机号"
              />
              <ProFormText
                name="country"
                label="国家/地区"
                width="md"
                placeholder="请输入国家/地区"
              />
            </ProForm.Group>

            <ProForm.Group>
              <ProFormText
                name="address"
                label="地址"
                width="xl"
                placeholder="请输入详细地址"
              />
            </ProForm.Group>
          </div>

          {/* 工作信息分组 */}
          <div style={{ 
            marginBottom: 24,
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
          }}>
            <div style={{ 
              marginBottom: 16,
              fontSize: '14px',
              fontWeight: 600,
              color: '#1890ff',
            }}>
              工作信息
            </div>
            <ProForm.Group>
              <ProFormTreeSelect
                name="departmentId"
                label="所属部门"
                width="md"
                placeholder="请选择部门"
                allowClear
                fieldProps={{
                  treeData: convertTreeData(departmentTree),
                  showSearch: true,
                  treeDefaultExpandAll: false,
                  treeNodeFilterProp: 'title',
                  placeholder: '请选择所属部门',
                }}
              />
              <ProFormText
                name="position"
                label="职位"
                width="md"
                placeholder="请输入职位"
              />
            </ProForm.Group>

            <ProForm.Group>
              <ProFormDatePicker
                name="joinDate"
                label="入职时间"
                width="md"
                placeholder="请选择入职时间"
              />
              <ProFormSwitch
                name="isAdmin"
                label="管理员权限"
                tooltip="开启后用户将拥有系统管理权限"
                fieldProps={{
                  checkedChildren: '是',
                  unCheckedChildren: '否',
                }}
              />
            </ProForm.Group>
          </div>

          {/* 个人资料分组 */}
          <div style={{ 
            marginBottom: 24,
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
          }}>
            <div style={{ 
              marginBottom: 16,
              fontSize: '14px',
              fontWeight: 600,
              color: '#1890ff',
            }}>
              个人资料
            </div>
            <ProForm.Group>
              <ProFormText
                name="avatar"
                label="头像URL"
                width="xl"
                placeholder="请输入头像URL"
              />
            </ProForm.Group>

            <ProForm.Group>
              <ProFormTextArea
                name="signature"
                label="个人签名"
                width="xl"
                placeholder="请输入个人签名"
                fieldProps={{
                  rows: 4,
                }}
              />
            </ProForm.Group>

            <ProForm.Group>
              <ProFormSelect
                name="tags"
                label="标签"
                width="xl"
                mode="tags"
                placeholder="请输入标签（按回车添加）"
                fieldProps={{
                  tokenSeparators: [','],
                }}
              />
            </ProForm.Group>
          </div>

          {/* 密码修改分组 */}        </ProForm>
      </Card>

      {/* 密码修改弹窗 */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        userId={userInfo.id}
        onSuccess={() => {
          message.success('密码重置成功');
          setPasswordModalVisible(false);
        }}
      />
    </PageContainer>
  );
};

export default UserEdit;
