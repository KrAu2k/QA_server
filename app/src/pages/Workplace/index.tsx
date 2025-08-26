import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Radar } from '@ant-design/plots';
import { PageContainer } from '@ant-design/pro-components';
import { Link, useRequest, useModel } from '@umijs/max';
import { Avatar, Button, Card, Col, Empty, List, Modal, Row, Skeleton, Tabs, Timeline, Tooltip, message, Statistic } from 'antd';
import { AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, CodeOutlined, ExclamationCircleOutlined, LinkOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { FC } from 'react';
import EditableLinkGroup from './components/EditableLinkGroup';
import type { ActivitiesType } from './data'; 
import { getActiveProjects, executeProjectUpdate, Project, getProjectUpdateLogs, getProjectUpdateCodeLogs, ProjectUpdateLog } from '@/services/system/project';
import { useProjectWebSocket } from '@/hooks/useProjectWebSocket';
import { DeleteOutlined, MobileOutlined} from '@ant-design/icons';
import { executeProjectClearCache } from '@/services/system/project';
import useStyles from './style.style';
dayjs.extend(relativeTime);

import { AndroidOutlined } from '@ant-design/icons';
import { executeProjectPackage } from '@/services/system/project';
 
const MAX_LOG_LENGTH = 20000; // 日志最大长度，防止浏览器卡顿

/**
 * 转换时间戳为易于阅读的格式
 * @param timestamp 时间戳
 * @returns 格式化后的时间字符串
 */
const formatTimestamp = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

const PageHeaderContent: FC<{
  currentUser: Partial<API.CurrentUser>;
}> = ({ currentUser }) => {
  const { styles } = useStyles();
  const loading = currentUser && Object.keys(currentUser).length;
  if (!loading) {
    return (
      <Skeleton
        avatar
        paragraph={{
          rows: 1,
        }}
        active
      />
    );
  }
  return (
    <div className={styles.pageHeaderContent}>
      <div className={styles.avatar}>
        <Avatar size="large" src={currentUser.avatar} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentTitle}>
          早安，
          {currentUser.name}
          ，祝你开心每一天！
        </div>
        <div>
          {currentUser.position} | {currentUser.department?.name || '暂无部门'}
        </div>
      </div>
    </div>
  );
};
const ExtraContent: FC<{ projectCount: number }> = ({ projectCount }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.extraContent}>
      <div className={styles.statItem}>
        <Statistic title="项目数" value={projectCount} />
      </div>
      {/* <div className={styles.statItem}>
        <Statistic title="团队内排名" value={8} suffix="/ 24" />
      </div>
      <div className={styles.statItem}>
        <Statistic title="项目访问" value={2223} />
      </div> */}
    </div>
  );
};
const Workplace: FC = () => {
  const { styles } = useStyles();
  const { initialState } = useModel('@@initialState');
  console.log('initialState', initialState);
  const { currentUser } = initialState || {}; // 获取当前用户信息
  
  // 获取工作台项目列表
  const { data: projectsData, loading: projectsLoading, refresh: refreshProjects } = useRequest(getActiveProjects, {
    formatResult: (res) => res.data || [],
  });

  const projects = projectsData || [];

  // 项目更新日志状态
  const [projectLogs, setProjectLogs] = useState<Record<string, ProjectUpdateLog[]>>({});
  const [projectStatuses, setProjectStatuses] = useState<Record<string, string>>({});
  
  // 项目更新代码日志状态
  const [projectCodeLogs, setProjectCodeLogs] = useState<Record<string, any[]>>({});
  const [projectCodeStatuses, setProjectCodeStatuses] = useState<Record<string, string>>({});

  // 项目打包状态_new
  const [projectPackageStatuses, setProjectPackageStatuses] = useState<Record<string, 'idle'|'updating'>>({});
  const [isExecutingPackage, setIsExecutingPackage] = useState(false);


  // 获取项目更新日志
  const fetchProjectLogs = useCallback(async (projectId: string) => {
    try {
      const response = await getProjectUpdateLogs(projectId, 3); // 获取最近3条记录
      if (response.success) {
        setProjectLogs(prev => ({
          ...prev,
          [projectId]: response.data
        }));
      }
    } catch (error) {
      console.error('获取项目更新日志失败:', error);
    }
  }, []);

  // 获取项目更新代码日志
  const fetchProjectCodeLogs = useCallback(async (projectId: string) => {
    try {
      const response = await getProjectUpdateCodeLogs(projectId, 3); // 获取最近3条记录
      if (response.success) {
        setProjectCodeLogs(prev => ({
          ...prev,
          [projectId]: response.data
        }));
      }
    } catch (error) {
      console.error('获取项目更新代码日志失败:', error);
    }
  }, []);

  // 更新结果弹窗状态
  const [updateModal, setUpdateModal] = useState({
    visible: false,
    title: '',
    content: '',
    isSuccess: false,
    isExecuting: false,
  });

  // 更新代码结果弹窗状态
  const [updateCodeModal, setUpdateCodeModal] = useState({
    visible: false,
    title: '',
    content: '',
    isSuccess: false,
    isExecuting: false,
  });

  // 创建滚动容器的引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const codeScrollContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部的函数
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // 代码更新弹窗滚动到底部
  const scrollCodeToBottom = () => {
    if (codeScrollContainerRef.current) {
      codeScrollContainerRef.current.scrollTop = codeScrollContainerRef.current.scrollHeight;
    }
  };

  // 当内容更新时自动滚动到底部
  useEffect(() => {
    if (updateModal.visible && updateModal.content) {
      setTimeout(scrollToBottom, 10); // 延迟一点确保DOM已更新
    }
  }, [updateModal.content, updateModal.visible]);

  // 当代码更新弹窗内容更新时自动滚动到底部
  useEffect(() => {
    if (updateCodeModal.visible && updateCodeModal.content) {
      setTimeout(scrollCodeToBottom, 10);
    }
  }, [updateCodeModal.content, updateCodeModal.visible]);

  // WebSocket连接用于实时更新
  const { isConnected, isExecuting, isExecutingCodeUpdate, executeUpdate, executeUpdateCode, joinProjectRoom, leaveProjectRoom } = useProjectWebSocket({
    onOutput: (data: string) => {
      // 实时追加输出到弹窗内容
      setUpdateModal(prev => {
        let newContent = prev.content + data;
        if (newContent.length > MAX_LOG_LENGTH) {
          newContent = `...(为了避免浏览器卡顿，已省略早期的日志)...\n\n` + newContent.substring(newContent.length - MAX_LOG_LENGTH);
        }
        return {
          ...prev,
          content: newContent,
        };
      });
      // 在下一个渲染周期后滚动到底部
      setTimeout(scrollToBottom, 10);
    },
    onError: (message: string) => {
      // 更新失败
      setUpdateModal(prev => ({
        ...prev,
        title: '更新打包失败',
        isSuccess: false,
        isExecuting: false,
      }));
    },
    onComplete: () => {
      // 更新完成
      setUpdateModal(prev => ({
        ...prev,
        title: '更新打包成功',
        isSuccess: true,
        isExecuting: false,
      }));
    },
    onCodeUpdateOutput: (data: string) => {
      // 实时追加代码更新输出到弹窗内容
      setUpdateCodeModal(prev => {
        let newContent = prev.content + data;
        if (newContent.length > MAX_LOG_LENGTH) {
          newContent = `...(为了避免浏览器卡顿，已省略早期的日志)...\n\n` + newContent.substring(newContent.length - MAX_LOG_LENGTH);
        }
        return {
          ...prev,
          content: newContent,
        };
      });
      // 在下一个渲染周期后滚动到底部
      setTimeout(scrollCodeToBottom, 10);
    },
    onCodeUpdateError: (message: string) => {
      // 代码更新失败
      setUpdateCodeModal(prev => ({
        ...prev,
        title: '更新代码失败',
        isSuccess: false,
        isExecuting: false,
      }));
    },
    onCodeUpdateComplete: () => {
      // 代码更新完成
      setUpdateCodeModal(prev => ({
        ...prev,
        title: '更新代码成功',
        isSuccess: true,
        isExecuting: false,
      }));
    },
    onProjectStatusChanged: (data) => {
      // 实时更新项目状态
      setProjectStatuses(prev => ({
        ...prev,
        [data.projectId]: data.status,
      }));
      
      // 如果有新的更新日志，刷新该项目的日志
      if (data.updateLog) {
        // 使用 setTimeout 避免过于频繁的请求
        setTimeout(() => {
          fetchProjectLogs(data.projectId);
        }, 100);
      }
    },
    onProjectCodeStatusChanged: (data) => {
      // 实时更新项目代码状态
      setProjectCodeStatuses(prev => ({
        ...prev,
        [data.projectId]: data.status,
      }));
      
      // 如果有新的代码更新日志，刷新该项目的代码更新日志
      if (data.updateCodeLog) {
        // 使用 setTimeout 避免过于频繁的请求
        setTimeout(() => {
          fetchProjectCodeLogs(data.projectId);
        }, 100);
      }
    },
  });

  // 加载所有项目的更新日志 - 只在项目列表变化时执行
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        if (project.enableUpdate) {
          fetchProjectLogs(project.id);
          // 初始化项目状态
          setProjectStatuses(prev => ({
            ...prev,
            [project.id]: project.currentUpdateStatus || 'idle',
          }));
        }
        
        if (project.enableUpdateCode) {
          fetchProjectCodeLogs(project.id);
          // 初始化项目代码状态
          setProjectCodeStatuses(prev => ({
            ...prev,
            [project.id]: project.currentUpdateCodeStatus || 'idle',
          }));
        }
      });
    }
  }, [projects, fetchProjectLogs, fetchProjectCodeLogs]);

  // 处理 WebSocket 连接和房间加入 - 分离为独立的 effect
  useEffect(() => {
    if (isConnected && projects.length > 0) {
      projects.forEach(project => {
        if (project.enableUpdate || project.enableUpdateCode) {
          joinProjectRoom(project.id);
        }
      });
    }
  }, [isConnected, projects.length]); // 只依赖连接状态和项目数量

  // 当组件卸载时离开所有房间
  useEffect(() => {
    return () => {
      if (projects.length > 0) {
        projects.forEach(project => {
          if (project.enableUpdate || project.enableUpdateCode) {
            leaveProjectRoom(project.id);
          }
        });
      }
    };
  }, []); // 空依赖数组，只在组件卸载时执行

  // 添加调试信息
  console.log('WebSocket连接状态:', isConnected);
  console.log('当前执行状态:', isExecuting);

  // 访问链接弹窗状态
  const [accessModal, setAccessModal] = useState({
    visible: false,
    url: '',
    title: '',
    deviceType: 'mobile', // mobile 或 ipad
  });

  // 添加调试信息
  console.log('Current updateModal state:', updateModal);
  console.log('WebSocket连接状态:', isConnected);
  console.log('是否正在执行:', isExecuting);

  // 处理访问链接
  const handleAccessProject = (project: Project, e: React.MouseEvent, deviceType: 'mobile' | 'ipad' = 'mobile') => {
    e.stopPropagation(); // 阻止事件冒泡
    
    setAccessModal({
      visible: true,
      url: project.h5Url,
      title: `${project.name} (${deviceType === 'mobile' ? '手机版 9:16' : 'iPad版 3:4'})`,
      deviceType,
    });
  };

  // 执行项目更新
  const handleProjectUpdate = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    const currentStatus = projectStatuses[project.id] || project.currentUpdateStatus;
    
    // 检查项目是否已在更新中
    if (currentStatus === 'updating') {
      setUpdateModal({
        visible: true,
        title: '项目更新中',
        content: '该项目正在更新中，请稍后再试',
        isSuccess: false,
        isExecuting: false,
      });
      return;
    }
    
    if (!isConnected) {
      setUpdateModal({
        visible: true,
        title: '连接失败',
        content: 'WebSocket连接未建立，无法执行实时更新',
        isSuccess: false,
        isExecuting: false,
      });
      return;
    }

    // 显示实时更新弹窗
    setUpdateModal({
      visible: true,
      title: '正在更新',
      content: '开始执行更新命令...\n',
      isSuccess: false,
      isExecuting: true,
    });
    
    // 通过WebSocket执行更新
    executeUpdate(project.id, currentUser?.employeeNo, currentUser?.name);
  };
  
  // 执行项目更新代码
  const handleProjectUpdateCode = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    const currentCodeStatus = projectCodeStatuses[project.id] || project.currentUpdateCodeStatus;
    
    // 检查项目是否已在更新代码中
    if (currentCodeStatus === 'updating') {
      setUpdateCodeModal({
        visible: true,
        title: '代码更新中',
        content: '该项目正在更新代码中，请稍后再试',
        isSuccess: false,
        isExecuting: false,
      });
      return;
    }
    
    if (!isConnected) {
      setUpdateCodeModal({
        visible: true,
        title: '连接失败',
        content: 'WebSocket连接未建立，无法执行实时更新',
        isSuccess: false,
        isExecuting: false,
      });
      return;
    }

    // 显示实时更新弹窗
    setUpdateCodeModal({
      visible: true,
      title: '正在更新代码',
      content: '开始执行更新代码命令...\n',
      isSuccess: false,
      isExecuting: true,
    });
    
    // 通过WebSocket执行代码更新
    executeUpdateCode(project.id, currentUser?.employeeNo, currentUser?.name);
  };
  



  //new 处理项目打包
  const handleProjectPackage = async (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    const status = projectPackageStatuses[project.id] || project.currentPackageStatus;
    if (status === 'updating' || isExecutingPackage) return;
    setIsExecutingPackage(true);
    setProjectPackageStatuses(prev => ({ ...prev, [project.id]: 'updating' }));
    try {
      await executeProjectPackage(project.id);
      // 日志 & 状态通过现有 WS 事件推过来（和“更新”一致），前端原有订阅会显示
    } catch (err:any) {
      message.error(`触发打 APK 失败：${err?.message || '未知错误'}`);
      setProjectPackageStatuses(prev => ({ ...prev, [project.id]: 'idle' }));
    } finally {
      setIsExecutingPackage(false);
    }
  };

const [projectClearStatuses, setProjectClearStatuses] = useState<Record<string, 'idle'|'updating'>>({});
const [isExecutingClear, setIsExecutingClear] = useState(false);
//new 处理项目清缓存
const handleProjectClear = async (project: Project, e?: React.MouseEvent) => {
  e?.stopPropagation?.();
  const status = projectClearStatuses[project.id] || project.currentClearCacheStatus;
  if (status === 'updating' || isExecutingClear) return;
  setIsExecutingClear(true);
  setProjectClearStatuses(prev => ({ ...prev, [project.id]: 'updating' }));
  try {
    await executeProjectClearCache(project.id);
  } catch (err:any) {
    message.error(`触发清缓存失败：${err?.message || '未知错误'}`);
    setProjectClearStatuses(prev => ({ ...prev, [project.id]: 'idle' }));
  } finally {
    setIsExecutingClear(false);
  }
};




  const renderActivities = (item: ActivitiesType) => {
    const events = item.template.split(/@\{([^{}]*)\}/gi).map((key) => {
      if (item[key as keyof ActivitiesType]) {
        const value = item[key as 'user'];
        return (
          <a href={value?.link} key={value?.name}>
            {value.name}
          </a>
        );
      }
      return key;
    });
    return (
      <List.Item key={item.id}>
        <List.Item.Meta
          avatar={<Avatar src={item.user.avatar} />}
          title={
            <span>
              <a className={styles.username}>{item.user.name}</a>
              &nbsp;
              <span className={styles.event}>{events}</span>
            </span>
          }
          description={
            <span className={styles.datetime} title={item.updatedAt}>
              {dayjs(item.updatedAt).fromNow()}
            </span>
          }
        />
      </List.Item>
    );
  };

  // 渲染更新记录状态图标
  const renderUpdateStatusIcon = (status: string) => {
    switch (status) {
      case 'updating':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'timeout':
        return <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // 渲染更新记录
  const renderUpdateLogs = (projectId: string) => {
    const logs = projectLogs[projectId] || [];
    
    if (logs.length === 0) {
      return (
        <div style={{ 
          padding: '20px 0', 
          color: '#999', 
          fontSize: '13px',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          暂无更新记录
        </div>
      );
    }

    // 只显示最近的3条记录
    const recentLogs = logs.slice(0, 3);

    return (
      <Timeline
          items={recentLogs.map(log => ({
            dot: renderUpdateStatusIcon(log.status),
            children: (
              <div style={{ marginBottom: '2px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#333',
                  marginBottom: '1px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <span>
                    {log.status === 'updating' ? '🔄 正在更新' : 
                     log.status === 'completed' ? '✅ 更新成功' :
                     log.status === 'failed' ? '❌ 更新失败' :
                     log.status === 'timeout' ? '⏰ 更新超时' : '❔ 未知状态'}
                  </span>
                  {log.startedByName && (
                    <span style={{ 
                      color: '#1890ff', 
                      fontWeight: '600',
                      fontSize: '10px',
                      background: '#e6f7ff',
                      padding: '1px 4px',
                      borderRadius: '6px',
                      border: '1px solid #b3e0ff',
                    }}>
                      {log.startedByName}
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '9px', 
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span>{dayjs(log.startTime).format('MM-DD HH:mm')}</span>
                  {log.duration && (
                    <span style={{ 
                      background: '#f0f0f0',
                      padding: '1px 3px',
                      borderRadius: '2px',
                      fontSize: '8px',
                    }}>
                      {log.duration}秒
                    </span>
                  )}
                  {log.svnRevision && (
                    <span style={{ 
                      background: '#e6fffb',
                      color: '#006d75',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontSize: '8px',
                      border: '1px solid #87e8de',
                      fontWeight: '500',
                    }}>
                      📋 SVN: {log.svnRevision}
                    </span>
                  )}
                </div>
              </div>
            )
          }))}
        />
    );
  };

  // 渲染更新代码记录
  const renderUpdateCodeLogs = (projectId: string) => {
    const logs = projectCodeLogs[projectId] || [];
    
    if (logs.length === 0) {
      return (
        <div style={{ 
          padding: '20px 0', 
          color: '#999', 
          fontSize: '13px',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          暂无代码更新记录
        </div>
      );
    }

    // 只显示最近的3条记录
    const recentLogs = logs.slice(0, 3);

    return (
      <Timeline
        items={recentLogs.map(log => ({
          dot: renderUpdateStatusIcon(log.status),
          children: (
            <div style={{ marginBottom: '2px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#333',
                marginBottom: '1px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>
                  {log.status === 'updating' ? '🔄 正在更新代码' : 
                   log.status === 'completed' ? '✅ 代码更新成功' :
                   log.status === 'failed' ? '❌ 代码更新失败' :
                   log.status === 'timeout' ? '⏰ 代码更新超时' : '❔ 未知状态'}
                </span>
                {log.startedByName && (
                  <span style={{ 
                    color: '#1890ff', 
                    fontWeight: '600',
                    fontSize: '10px',
                    background: '#e6f7ff',
                    padding: '1px 4px',
                    borderRadius: '6px',
                    border: '1px solid #b3e0ff',
                  }}>
                    {log.startedByName}
                  </span>
                )}
              </div>
              <div style={{ 
                fontSize: '9px', 
                color: '#999',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>{dayjs(log.startTime).format('MM-DD HH:mm')}</span>
                {log.duration && (
                  <span style={{ 
                    background: '#f0f0f0',
                    padding: '1px 3px',
                    borderRadius: '2px',
                    fontSize: '8px',
                  }}>
                    {log.duration}秒
                  </span>
                )}
                {log.svnRevision && (
                  <span style={{ 
                    background: '#e6fffb',
                    color: '#006d75',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    fontSize: '8px',
                    border: '1px solid #87e8de',
                    fontWeight: '500',
                  }}>
                    📋 SVN: {log.svnRevision}
                  </span>
                )}
              </div>
            </div>
          )
        }))}
      />
    );
  };

  return (
    <PageContainer
      content={<PageHeaderContent currentUser={currentUser || {}} />}
      extraContent={<ExtraContent projectCount={projects.length} />}
    >
      <Row gutter={[24, 24]}>
      
        
        {projectsLoading ? (
          // 加载状态 - 100%宽度的卡片
          Array.from({ length: 3 }).map((_, index) => (
            <Col xs={24} sm={24} md={24} lg={24} key={index}>
              <Card
                style={{ 
                  borderRadius: '16px',
                  height: '350px', // 与其他卡片保持一致
                  marginBottom: '24px',
                }}
                styles={{
                  body: {
                    padding: '32px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }
                }}
              >
                <Skeleton active />
              </Card>
            </Col>
          ))
        ) : projects.length === 0 ? (
          <Col span={24}>
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 0',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <Empty 
                description="暂无项目" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          </Col>
        ) : (
          projects.map((project: Project) => (
            <Col xs={24} sm={24} md={24} lg={24} key={project.id}>
              <Card
                style={{ 
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                  height: '350px', // 设置卡片高度为350px
                  position: 'relative',
                  marginBottom: '24px',
                }}
                styles={{
                  body: {
                    padding: '28px', // 增加内边距以适应更大的高度
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row', // 改为水平布局
                    alignItems: 'stretch',
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* 左侧：项目信息和操作 */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  paddingRight: '28px', // 增加右边距
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px', // 增加底边距
                  }}>
                    {/* 项目图标 */}
                    <div style={{ 
                      marginRight: '20px', // 增加右边距
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}>
                      {project.icon ? (
                        <img 
                          src={project.icon} 
                          alt={project.name}
                          style={{ 
                            width: '70px', // 适当增加图标尺寸
                            height: '70px',
                            objectFit: 'contain',
                            borderRadius: '14px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '70px', // 适当增加图标尺寸
                          height: '70px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '17px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                        }}>
                          <AppstoreOutlined style={{ 
                            fontSize: '32px', // 适当增加图标字体
                            color: 'white' 
                          }} />
                        </div>
                      )}
                    </div>

                    {/* 项目信息 */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '26px', // 适当增加标题字体
                        fontWeight: '800',
                        margin: '0 0 8px 0',
                        color: '#1a1a1a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.5px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p style={{ 
                          fontSize: '15px', // 适当增加描述字体
                          color: '#666',
                          margin: 0,
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: '400',
                        }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 - 只保留访问入口 */}
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}>
                    {/* 访问入口 */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                    }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#666',
                        minWidth: '64px',
                      }}>
                        访问入口：
                      </span>
                      <Button
                        type="primary"
                        icon={<LinkOutlined style={{ fontSize: '16px' }} />}
                        onClick={(e) => handleAccessProject(project, e, 'mobile')}
                        style={{
                          borderRadius: '10px',
                          fontWeight: '600',
                          fontSize: '14px',
                          padding: '10px 18px',
                          height: '40px',
                          boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)',
                        }}
                      >
                        手机版
                      </Button>
                      <Button
                        type="default"
                        icon={<LinkOutlined style={{ fontSize: '16px' }} />}
                        onClick={(e) => handleAccessProject(project, e, 'ipad')}
                        style={{
                          borderRadius: '10px',
                          fontWeight: '600',
                          fontSize: '14px',
                          padding: '10px 18px',
                          height: '40px',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        iPad版
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 右侧：最近更新记录 */}
                {(project.enableUpdate || project.enableUpdateCode) && (
                  <div style={{
                    width: '520px', // 进一步增加右侧区域宽度
                    borderLeft: '1px solid #e8e8e8',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fafafa',
                    margin: '-28px -28px -28px 0', // 调整边距
                    padding: '20px', // 增加内边距
                    borderTopRightRadius: '16px',
                    borderBottomRightRadius: '16px',
                    overflow: 'hidden', // 防止溢出
                  }}>
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e8e8e8',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      flex: 1,
                      minHeight: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}>
                      {/* 更新操作按钮区域 - 在Tab上方 */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '16px',
                        padding: '12px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #e9ecef',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}>
                          <span style={{ 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            color: '#666',
                            marginRight: '4px',
                          }}>
                            更新操作：
                          </span>
                          {project.enableUpdate && (
                            <Button 
                              size="small"
                              icon={<SyncOutlined 
                                spin={(projectStatuses[project.id] || project.currentUpdateStatus) === 'updating' || isExecuting}
                                style={{ fontSize: '14px' }}
                              />} 
                              onClick={(e) => handleProjectUpdate(project, e)}
                              disabled={(projectStatuses[project.id] || project.currentUpdateStatus) === 'updating' || isExecuting}
                              loading={(projectStatuses[project.id] || project.currentUpdateStatus) === 'updating' || isExecuting}
                              style={{
                                borderRadius: '6px',
                                fontWeight: '500',
                                fontSize: '12px',
                                height: '32px',
                                backgroundColor: (projectStatuses[project.id] || project.currentUpdateStatus) === 'updating' ? '#faad14' : '#52c41a',
                                borderColor: (projectStatuses[project.id] || project.currentUpdateStatus) === 'updating' ? '#faad14' : '#52c41a',
                                color: 'white',
                                boxShadow: (projectStatuses[project.id] || project.currentUpdateStatus) === 'updating' 
                                  ? '0 2px 4px rgba(250, 173, 20, 0.2)' 
                                  : '0 2px 4px rgba(82, 196, 26, 0.2)',
                              }}
                            >
                              {(projectStatuses[project.id] || project.currentUpdateStatus) === 'updating' ? '更新打包中' : '更新打包'}
                            </Button>
                          )}
                          {project.enableUpdateCode && (
                            <Button 
                              size="small"
                              icon={<CodeOutlined 
                                spin={(projectCodeStatuses[project.id] || project.currentUpdateCodeStatus) === 'updating' || isExecutingCodeUpdate}
                                style={{ fontSize: '14px' }}
                              />} 
                              onClick={(e) => handleProjectUpdateCode(project, e)}
                              disabled={(projectCodeStatuses[project.id] || project.currentUpdateCodeStatus) === 'updating' || isExecutingCodeUpdate}
                              loading={(projectCodeStatuses[project.id] || project.currentUpdateCodeStatus) === 'updating' || isExecutingCodeUpdate}
                              style={{
                                borderRadius: '6px',
                                fontWeight: '500',
                                fontSize: '12px',
                                height: '32px',
                                backgroundColor: (projectCodeStatuses[project.id] || project.currentUpdateCodeStatus) === 'updating' ? '#faad14' : '#1890ff',
                                borderColor: (projectCodeStatuses[project.id] || project.currentUpdateCodeStatus) === 'updating' ? '#faad14' : '#1890ff',
                                color: 'white',
                                boxShadow: (projectCodeStatuses[project.id] || project.currentUpdateCodeStatus) === 'updating' 
                                  ? '0 2px 4px rgba(250, 173, 20, 0.2)' 
                                  : '0 2px 4px rgba(24, 144, 255, 0.2)',
                              }}
                            >
                              {(projectCodeStatuses[project.id] || project.currentUpdateCodeStatus) === 'updating' ? '更新代码中' : '更新代码'}
                            </Button>
                            
                          )}

                          
{project.enablePackage && (
  <Button
    size="small"
    icon={<MobileOutlined
      spin={(projectPackageStatuses[project.id] || project.currentPackageStatus) === 'updating' || isExecutingPackage}
      style={{ fontSize: '14px' }}
    />}
    onClick={(e) => handleProjectPackage(project, e)}
    disabled={(projectPackageStatuses[project.id] || project.currentPackageStatus) === 'updating' || isExecutingPackage}
    loading={(projectPackageStatuses[project.id] || project.currentPackageStatus) === 'updating' || isExecutingPackage}
    style={{
      borderRadius: '6px',
      fontWeight: '500',
      fontSize: '12px',
      height: '32px',
      backgroundColor: (projectPackageStatuses[project.id] || project.currentPackageStatus) === 'updating' ? '#faad14' : '#722ed1',
      borderColor:    (projectPackageStatuses[project.id] || project.currentPackageStatus) === 'updating' ? '#faad14' : '#722ed1',
      color: 'white',
      boxShadow: (projectPackageStatuses[project.id] || project.currentPackageStatus) === 'updating'
        ? '0 2px 4px rgba(250, 173, 20, 0.2)'
        : '0 2px 4px rgba(114, 46, 209, 0.2)',
    }}
  >
    {(projectPackageStatuses[project.id] || project.currentPackageStatus) === 'updating' ? '打 APK 中' : '打 APK'}
  </Button>
)}


{project.enableClearCache && (
  <Button
    size="small"
    icon={<DeleteOutlined
      spin={(projectClearStatuses[project.id] || project.currentClearCacheStatus) === 'updating' || isExecutingClear}
      style={{ fontSize: '14px' }}
    />}
    onClick={(e) => handleProjectClear(project, e)}
    disabled={(projectClearStatuses[project.id] || project.currentClearCacheStatus) === 'updating' || isExecutingClear}
    loading={(projectClearStatuses[project.id] || project.currentClearCacheStatus) === 'updating' || isExecutingClear}
    style={{
      borderRadius: '6px',
      fontWeight: '500',
      fontSize: '12px',
      height: '32px',
      backgroundColor: (projectClearStatuses[project.id] || project.currentClearCacheStatus) === 'updating' ? '#faad14' : '#eb2f96',
      borderColor:    (projectClearStatuses[project.id] || project.currentClearCacheStatus) === 'updating' ? '#faad14' : '#eb2f96',
      color: 'white',
      boxShadow: (projectClearStatuses[project.id] || project.currentClearCacheStatus) === 'updating'
        ? '0 2px 4px rgba(250, 173, 20, 0.2)'
        : '0 2px 4px rgba(235, 47, 150, 0.2)',
    }}
  >
    {(projectClearStatuses[project.id] || project.currentClearCacheStatus) === 'updating' ? '清缓存中' : '清缓存'}
  </Button>
)}


                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999',
                          fontStyle: 'italic',
                        }}>
                          实时日志
                        </div>
                      </div>

                      {/* 日志Tab区域 */}
                      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                        <Tabs
                          defaultActiveKey={project.enableUpdate ? "update" : "code"}
                          size="small"
                          items={[
                            ...(project.enableUpdate ? [{
                              key: 'update',
                              label: (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                  <SyncOutlined style={{ color: '#52c41a' }} />
                                  更新打包
                                </span>
                              ),
                              children: renderUpdateLogs(project.id),
                            }] : []),
                            ...(project.enableUpdateCode ? [{
                              key: 'code',
                              label: (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                  <CodeOutlined style={{ color: '#1890ff' }} />
                                  更新代码
                                </span>
                              ),
                              children: renderUpdateCodeLogs(project.id),
                            }] : []),
                          ]}
                          tabBarStyle={{
                            marginBottom: '16px',
                            borderBottom: '1px solid #e8e8e8',
                            fontSize: '12px',
                          }}
                          tabBarExtraContent={
                            <div style={{ fontSize: '11px', color: '#999' }}>
                              最近3条记录
                            </div>
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}


              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* 更新结果弹窗 - 命令行窗口样式 */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <span style={{ color: updateModal.isSuccess ? '#52c41a' : updateModal.isExecuting ? '#1890ff' : '#ff4d4f' }}>
              {updateModal.isExecuting ? '🔄' : updateModal.isSuccess ? '✅' : '❌'}
            </span>
            <span>
              {updateModal.title}
            </span>
          </div>
        }
        open={updateModal.visible}
        onCancel={updateModal.isExecuting ? undefined : () => {
          setUpdateModal(prev => ({ ...prev, visible: false }));
        }}
        maskClosable={!updateModal.isExecuting} // 执行时禁用点击遮罩层关闭
        keyboard={!updateModal.isExecuting} // 执行时禁用ESC键关闭
        destroyOnHidden // 关闭时销毁弹窗内容
        footer={[
          <Button
            key="close"
            type="primary"
            disabled={updateModal.isExecuting}
            onClick={() => {
              setUpdateModal(prev => ({ ...prev, visible: false }));
            }}
            style={{
              backgroundColor: updateModal.isExecuting ? '#d9d9d9' : (updateModal.isSuccess ? '#52c41a' : '#1890ff'),
              borderColor: updateModal.isExecuting ? '#d9d9d9' : (updateModal.isSuccess ? '#52c41a' : '#1890ff'),
              color: updateModal.isExecuting ? '#999' : 'white',
              fontWeight: '500',
              height: '36px',
              paddingLeft: '20px',
              paddingRight: '20px',
              borderRadius: '6px'
            }}
          >
            {updateModal.isExecuting ? '⏳ 执行中...' : updateModal.isSuccess ? '✅ 完成' : '关闭'}
          </Button>
        ]}
        width="min(95vw, 1400px)" // 更大的宽度，接近全屏
        centered
        styles={{
          header: {
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #d9d9d9'
          },
          body: {
            padding: 0,
            backgroundColor: '#1a202c'
          },
          footer: {
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid #d9d9d9',
            padding: '16px 20px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px'
          }
        }}
      >
        <div 
          ref={scrollContainerRef}
          style={{ 
            height: '700px', // 更大的高度，给更多的显示空间
            overflow: 'auto',
            backgroundColor: '#1a202c',
            padding: '20px',
            scrollBehavior: 'smooth',
            position: 'relative'
          }}
        >
          <pre style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0',
            padding: '0',
            fontSize: '15px', // 稍大的字体，便于阅读
            lineHeight: '1.6', // 更好的行间距
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            fontFamily: '"Fira Code", "SF Mono", Monaco, Consolas, "Roboto Mono", "Courier New", monospace',
            minHeight: '100%',
            fontWeight: '400'
          }}>
            {updateModal.content || (
              <div>
                <span style={{ color: '#68d391' }}>user@system</span>
                <span style={{ color: '#a0aec0' }}>:</span>
                <span style={{ color: '#63b3ed' }}>~/projects</span>
                <span style={{ color: '#a0aec0' }}>$ </span>
                <span style={{ color: '#e2e8f0' }}>准备开始执行...</span>
                <span style={{ 
                  animation: 'blink 1s infinite',
                  color: '#e2e8f0',
                  marginLeft: '4px'
                }}>█</span>
              </div>
            )}
          </pre>
          
          {/* 添加光标闪烁动画的样式 */}
          <style>
            {`
              @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
              }
            `}
          </style>
        </div>
      </Modal>

      {/* 更新代码弹窗 - 命令行窗口样式 */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <span style={{ color: updateCodeModal.isSuccess ? '#52c41a' : updateCodeModal.isExecuting ? '#1890ff' : '#ff4d4f' }}>
              {updateCodeModal.isExecuting ? '🔄' : updateCodeModal.isSuccess ? '✅' : '❌'}
            </span>
            <span>
              {updateCodeModal.title}
            </span>
          </div>
        }
        open={updateCodeModal.visible}
        onCancel={updateCodeModal.isExecuting ? undefined : () => {
          setUpdateCodeModal(prev => ({ ...prev, visible: false }));
        }}
        maskClosable={!updateCodeModal.isExecuting}
        keyboard={!updateCodeModal.isExecuting}
        destroyOnHidden
        footer={[
          <Button
            key="close"
            type="primary"
            disabled={updateCodeModal.isExecuting}
            onClick={() => {
              setUpdateCodeModal(prev => ({ ...prev, visible: false }));
            }}
            style={{
              backgroundColor: updateCodeModal.isExecuting ? '#d9d9d9' : (updateCodeModal.isSuccess ? '#52c41a' : '#1890ff'),
              borderColor: updateCodeModal.isExecuting ? '#d9d9d9' : (updateCodeModal.isSuccess ? '#52c41a' : '#1890ff'),
              color: updateCodeModal.isExecuting ? '#999' : 'white',
              fontWeight: '500',
              height: '36px',
              paddingLeft: '20px',
              paddingRight: '20px',
              borderRadius: '6px'
            }}
          >
            {updateCodeModal.isExecuting ? '⏳ 执行中...' : updateCodeModal.isSuccess ? '✅ 完成' : '关闭'}
          </Button>
        ]}
        width="min(95vw, 1400px)"
        centered
        styles={{
          header: {
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #d9d9d9'
          },
          body: {
            padding: 0,
            backgroundColor: '#1a202c'
          },
          footer: {
            backgroundColor: '#f5f5f5',
            borderTop: '1px solid #d9d9d9',
            padding: '16px 20px',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px'
          }
        }}
      >
        <div 
          ref={codeScrollContainerRef}
          style={{ 
            height: '700px',
            overflow: 'auto',
            backgroundColor: '#1a202c',
            padding: '20px',
            scrollBehavior: 'smooth',
            position: 'relative'
          }}
        >
          <pre style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0',
            padding: '0',
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            fontFamily: '"Fira Code", "SF Mono", Monaco, Consolas, "Roboto Mono", "Courier New", monospace',
            minHeight: '100%',
            fontWeight: '400'
          }}>
            {updateCodeModal.content || (
              <div>
                <span style={{ color: '#68d391' }}>user@system</span>
                <span style={{ color: '#a0aec0' }}>:</span>
                <span style={{ color: '#63b3ed' }}>~/projects</span>
                <span style={{ color: '#a0aec0' }}>$ </span>
                <span style={{ color: '#e2e8f0' }}>准备开始执行代码更新...</span>
                <span style={{ 
                  animation: 'blink 1s infinite',
                  color: '#e2e8f0',
                  marginLeft: '4px'
                }}>█</span>
              </div>
            )}
          </pre>
        </div>
      </Modal>

      {/* 访问链接弹窗 - 根据设备类型调整比例 */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px'
          }}>
            <LinkOutlined style={{ color: '#1890ff' }} />
            {accessModal.title}
          </div>
        }
        open={accessModal.visible}
        onCancel={() => setAccessModal(prev => ({ ...prev, visible: false }))}
        maskClosable={false} // 禁用点击遮罩层关闭
        keyboard={false} // 禁用ESC键关闭
        footer={[
          <Button
            key="newTab"
            type="primary"
            icon={<LinkOutlined />}
            onClick={() => {
              window.open(accessModal.url, '_blank');
              setAccessModal(prev => ({ ...prev, visible: false }));
            }}
          >
            在新窗口打开
          </Button>,
          <Button
            key="close"
            onClick={() => setAccessModal(prev => ({ ...prev, visible: false }))}
          >
            关闭
          </Button>
        ]}
        width={accessModal.deviceType === 'mobile' ? "min(72vw, 480px)" : "min(72vw, 640px)"}
        centered
        destroyOnHidden // 关闭时销毁弹窗内容
        styles={{
          body: {
            padding: 0,
            height: accessModal.deviceType === 'mobile' 
              ? 'calc((min(72vw, 480px)) * 16 / 9)' // 手机版 9:16 比例
              : 'calc((min(72vw, 640px)) * 4 / 3)', // iPad版 3:4 比例（宽:高 = 3:4）
            maxHeight: '90vh', // 限制最大高度
            overflow: 'hidden',
            margin: 0,
          }
        }}
      >
        <div style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <iframe
            src={accessModal.url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '6px',
              display: 'block',
              overflow: 'hidden',
            }}
            title={accessModal.title}
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            scrolling="no"
          />
        </div>
      </Modal>
    </PageContainer>
  );
};
export default Workplace;
