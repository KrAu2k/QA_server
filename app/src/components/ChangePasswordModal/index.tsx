import { Modal, Form, Input, message } from 'antd';
import { changePassword, adminResetPassword, type ChangePasswordParams, type AdminChangePasswordParams } from '@/services/system/user';
import { useModel } from '@umijs/max';

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  userId?: string; // 如果提供userId，则是管理员重置密码，否则是用户自己修改密码
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  userId
}) => {
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const isAdminReset = !!userId; // 是否是管理员重置密码

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (isAdminReset) {
        // 管理员重置密码
        const params: AdminChangePasswordParams = {
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        };
        const result = await adminResetPassword(userId!, params);
        if (result.success) {
          message.success('密码重置成功');
          form.resetFields();
          onSuccess?.();
          onCancel();
        } else {
          message.error(result.message || '密码重置失败');
        }
      } else {
        // 用户自己修改密码
        const params: ChangePasswordParams = {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        };
        const result = await changePassword(params);
        if (result.success) {
          message.success('密码修改成功');
          form.resetFields();
          onSuccess?.();
          onCancel();
        } else {
          message.error(result.message || '密码修改失败');
        }
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <Modal
      title={isAdminReset ? '重置密码' : '修改密码'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="确认"
      cancelText="取消"
      destroyOnClose
    >
      <Form 
        form={form}
        layout="vertical"
        autoComplete="off"
        data-lpignore="true"
      >
        {!isAdminReset && (
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[
              { required: true, message: '请输入原密码' },
            ]}
          >
            <Input.Password 
              placeholder="请输入原密码" 
              autoComplete="current-password"
              data-lpignore="true"
              data-form-type="other"
            />
          </Form.Item>
        )}
        
        <Form.Item
          label="新密码" 
          name="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码长度至少6位' },
          ]}
        >
          <Input.Password 
            placeholder="请输入新密码" 
            autoComplete="off"
            data-lpignore="true"
            data-form-type="other"
          />
        </Form.Item>
        
        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password 
            placeholder="请再次输入新密码" 
            autoComplete="off"
            data-lpignore="true"
            data-form-type="other"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
