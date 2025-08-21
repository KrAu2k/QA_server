import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer, ProForm, ProFormText, ProFormTextArea, ProFormSelect, ProFormDatePicker, ProFormTreeSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Button, Card, message } from 'antd';
import { history } from '@umijs/max';
import { useState, useEffect } from 'react';
import { createUser, type CreateUserParams } from '@/services/system/user';
import { getDepartmentTree, type Department } from '@/services/system/department';

const UserCreate: React.FC = () => {
  const [departmentTree, setDepartmentTree] = useState<Department[]>([]);

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
  const handleSubmit = async (values: CreateUserParams) => {
    try {
      // 创建用户时默认启用账户
      const createData = {
        ...values,
        isActive: true, // 新用户默认启用
      };
      const result = await createUser(createData);
      if (result.success) {
        message.success('用户创建成功');
        history.push('/system/user/list');
      } else {
        message.error('用户创建失败');
      }
    } catch (error) {
      message.error('用户创建失败');
    }
  };

  return (
    <PageContainer
      header={{
        title: '创建用户',
        extra: [
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
          >
            返回
          </Button>,
        ],
      }}
    >
      <Card>
        <ProForm<CreateUserParams>
          onFinish={handleSubmit}
          layout="vertical"
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
                  保存
                </Button>,
              ];
            },
          }}
        >
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
            <ProFormText.Password
              name="password"
              label="密码"
              width="md"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
                { max: 20, message: '密码最多20个字符' }
              ]}
              placeholder="请输入密码"
            />
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
          </ProForm.Group>

          <ProForm.Group>
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
            <ProFormText
              name="phone"
              label="手机号"
              width="md"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
              ]}
              placeholder="请输入手机号"
            />
          </ProForm.Group>

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

          <ProForm.Group>
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
              placeholder="请输入地址"
            />
          </ProForm.Group>

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
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default UserCreate;
