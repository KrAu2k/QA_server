import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { ProForm, ProFormText, ProFormTextArea, ProFormDigit, ProFormSwitch } from '@ant-design/pro-form';
import { Card, message, Spin } from 'antd';
import { history, useParams } from '@umijs/max';
import { getProject, updateProject, UpdateProjectRequest, Project } from '@/services/system/project';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await getProject(id!);
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        message.error(response.message || '获取项目详情失败');
        history.push('/system/project/list');
      }
    } catch (error) {
      message.error('获取项目详情失败');
      history.push('/system/project/list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: UpdateProjectRequest) => {
    try {
      const response = await updateProject(id!, values);
      if (response.success) {
        message.success('更新项目成功');
        history.push('/system/project/list');
      } else {
        message.error(response.message || '更新项目失败');
      }
    } catch (error) {
      message.error('更新项目失败');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <Spin size="large" style={{ display: 'block', textAlign: 'center' }} />
        </Card>
      </PageContainer>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <PageContainer>
      <Card>
        <ProForm
          layout="horizontal"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          onFinish={handleSubmit}
          initialValues={project}
          submitter={{
            render: (props, dom) => {
              return [
                ...dom,
                <button
                  key="cancel"
                  type="button"
                  onClick={() => history.push('/system/project/list')}
                  style={{
                    marginLeft: 8,
                    background: 'none',
                    border: '1px solid #d9d9d9',
                    borderRadius: '2px',
                    padding: '4px 15px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>,
              ];
            },
          }}
        >
          <ProFormText
            name="name"
            label="项目名称"
            placeholder="请输入项目名称"
            rules={[
              {
                required: true,
                message: '请输入项目名称',
              },
              {
                max: 255,
                message: '项目名称不能超过255个字符',
              },
            ]}
          />

          <ProFormTextArea
            name="description"
            label="项目描述"
            placeholder="请输入项目描述"
            fieldProps={{
              rows: 4,
            }}
          />

          <ProFormText
            name="h5Url"
            label="H5地址"
            placeholder="请输入H5地址，如: http://192.168.1.100:8000 或 https://example.com"
            rules={[
              {
                required: true,
                message: '请输入H5地址',
              },
              {
                pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$|^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/,
                message: '请输入有效的URL地址，支持域名和IP地址',
              },
            ]}
          />

          <ProFormText
            name="icon"
            label="项目图标"
            placeholder="请输入项目图标URL，支持域名和IP地址"
            rules={[
              {
                pattern: /^$|^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$|^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/,
                message: '请输入有效的图标URL，支持域名和IP地址',
              },
            ]}
          />

          <ProFormDigit
            name="sortOrder"
            label="排序权重"
            placeholder="请输入排序权重"
            min={0}
            fieldProps={{
              precision: 0,
            }}
            extra="数字越大越靠前，默认为0"
          />

          <ProFormSwitch
            name="isActive"
            label="是否启用"
          />

          <ProFormSwitch
            name="enableUpdate"
            label="启用更新打包功能"
            extra="启用后可以执行项目更新打包命令"
          />

          <ProFormTextArea
            name="updateCommand"
            label="更新打包命令"
            placeholder="请输入更新打包命令，如: svn update && npm run build"
            fieldProps={{
              rows: 3,
            }}
            extra="将在指定目录下执行此命令"
          />

          <ProFormText
            name="updateDirectory"
            label="更新打包目录"
            placeholder="请输入更新打包目录的绝对路径"
            extra="执行更新打包命令的工作目录"
          />

          <ProFormSwitch
            name="enableUpdateCode"
            label="启用更新代码功能"
            extra="启用后可以执行项目更新代码命令"
          />

          <ProFormTextArea
            name="updateCodeCommand"
            label="更新代码命令"
            placeholder="请输入更新代码命令，如: git pull"
            fieldProps={{
              rows: 3,
            }}
            extra="将在指定目录下执行此命令"
          />

          <ProFormText
            name="updateCodeDirectory"
            label="更新代码目录"
            placeholder="请输入更新代码目录的绝对路径"
            extra="执行更新代码命令的工作目录"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default EditProject;
