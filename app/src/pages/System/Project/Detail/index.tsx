import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, message, Spin, Descriptions, Button, Space, Tag } from 'antd';
import { EditOutlined, ArrowLeftOutlined, LinkOutlined } from '@ant-design/icons';
import { history, useParams } from '@umijs/max';
import { getProject, Project } from '@/services/system/project';

const ProjectDetail: React.FC = () => {
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
    <PageContainer
      header={{
        title: '项目详情',
        onBack: () => history.push('/system/project/list'),
        extra: [
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => history.push(`/system/project/edit/${id}`)}
          >
            编辑项目
          </Button>,
        ],
      }}
    >
      <Card>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="项目名称" span={2}>
            {project.name}
          </Descriptions.Item>
          
          <Descriptions.Item label="项目描述" span={2}>
            {project.description || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="H5地址" span={2}>
            <Space>
              <a href={project.h5Url} target="_blank" rel="noopener noreferrer">
                {project.h5Url}
              </a>
              <Button
                type="link"
                size="small"
                icon={<LinkOutlined />}
                onClick={() => window.open(project.h5Url, '_blank')}
              >
                访问
              </Button>
            </Space>
          </Descriptions.Item>
          
          {project.icon && (
            <Descriptions.Item label="项目图标" span={2}>
              <Space>
                <img 
                  src={project.icon} 
                  alt="项目图标" 
                  style={{ width: 32, height: 32, objectFit: 'cover' }} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <a href={project.icon} target="_blank" rel="noopener noreferrer">
                  {project.icon}
                </a>
              </Space>
            </Descriptions.Item>
          )}
          
          <Descriptions.Item label="排序权重">
            {project.sortOrder}
          </Descriptions.Item>
          
          <Descriptions.Item label="状态">
            <Tag color={project.isActive ? 'green' : 'red'}>
              {project.isActive ? '启用' : '禁用'}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="创建时间">
            {new Date(project.createdAt).toLocaleString()}
          </Descriptions.Item>
          
          <Descriptions.Item label="更新时间">
            {new Date(project.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  );
};

export default ProjectDetail;
