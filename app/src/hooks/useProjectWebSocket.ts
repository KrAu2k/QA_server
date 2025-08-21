import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UseProjectWebSocketOptions {
  onOutput?: (data: string) => void;
  onError?: (message: string) => void;
  onComplete?: () => void;
  onProjectStatusChanged?: (data: { projectId: string; status: string; updateLog?: any; timestamp: string }) => void;
  // Code update handlers
  onCodeUpdateOutput?: (data: string) => void;
  onCodeUpdateError?: (message: string) => void;
  onCodeUpdateComplete?: () => void;
  onProjectCodeStatusChanged?: (data: { projectId: string; status: string; updateCodeLog?: any; timestamp: string }) => void;
}

export const useProjectWebSocket = (options: UseProjectWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExecutingCodeUpdate, setIsExecutingCodeUpdate] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 创建WebSocket连接
    // 开发环境直接连接后端服务器，生产环境使用当前域名
    const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    const socketUrl = isDev
      ? 'http://127.0.0.1:3000/project-updates'
      : `${window.location.origin}/project-updates`;
    
    console.log('WebSocket connecting to:', socketUrl, 'isDev:', isDev);
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket连接已建立', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setIsExecuting(false);
      setIsExecutingCodeUpdate(false);
      console.log('WebSocket连接已断开');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error);
    });

    // 监听更新输出
    socket.on('updateOutput', (data: { data: string }) => {
      options.onOutput?.(data.data);
    });

    // 监听更新错误
    socket.on('updateError', (data: { message: string }) => {
      setIsExecuting(false);
      options.onError?.(data.message);
    });

    // 监听更新完成
    socket.on('updateComplete', (data: { message: string }) => {
      setIsExecuting(false);
      options.onComplete?.();
    });

    // 监听项目状态变化
    socket.on('projectStatusChanged', (data: { projectId: string; status: string; updateLog?: any; timestamp: string }) => {
      options.onProjectStatusChanged?.(data);
    });

    // 监听项目代码状态变化
    socket.on('projectCodeStatusChanged', (data: { projectId: string; status: string; updateCodeLog?: any; timestamp: string }) => {
      options.onProjectCodeStatusChanged?.(data);
    });

    // 监听代码更新输出
    socket.on('updateCodeOutput', (data: { data: string }) => {
      options.onCodeUpdateOutput?.(data.data);
    });

    // 监听代码更新错误
    socket.on('updateCodeError', (data: { message: string }) => {
      setIsExecutingCodeUpdate(false);
      options.onCodeUpdateError?.(data.message);
    });

    // 监听代码更新完成
    socket.on('updateCodeComplete', (data: { message: string }) => {
      setIsExecutingCodeUpdate(false);
      options.onCodeUpdateComplete?.();
    });

    // 清理连接
    return () => {
      socket.disconnect();
    };
  }, []);

  // 执行更新命令
  const executeUpdate = (projectId: string, userId?: string, username?: string) => {
    if (!socketRef.current || !isConnected) {
      options.onError?.('WebSocket连接未建立');
      return;
    }

    setIsExecuting(true);
    socketRef.current.emit('executeUpdate', { 
      projectId, 
      userId, 
      username 
    });
  };

  // 执行代码更新命令
  const executeUpdateCode = (projectId: string, userId?: string, username?: string) => {
    if (!socketRef.current || !isConnected) {
      options.onCodeUpdateError?.('WebSocket连接未建立');
      return;
    }

    console.log('执行代码更新');
    
    setIsExecutingCodeUpdate(true);
    socketRef.current.emit('executeUpdateCode', { 
      projectId, 
      userId, 
      username 
    });
  };

  // 加入项目房间
  const joinProjectRoom = (projectId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('joinRoom', { projectId });
    }
  };

  // 离开项目房间
  const leaveProjectRoom = (projectId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leaveRoom', { projectId });
    }
  };

  return {
    isConnected,
    isExecuting,
    isExecutingCodeUpdate,
    executeUpdate,
    executeUpdateCode,
    joinProjectRoom,
    leaveProjectRoom,
  };
};
