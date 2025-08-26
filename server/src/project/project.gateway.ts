import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable ,Inject ,forwardRef} from '@nestjs/common';
import { ProjectService } from './project.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8000', 'http://localhost:8001', 'http://127.0.0.1:8000', 'http://127.0.0.1:8001'],
    credentials: true,
  },
  namespace: '/project-updates',
})
export class ProjectGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ProjectService))
    private readonly projectService: ProjectService,
  ) {}

  @SubscribeMessage('executeUpdate')
  async handleUpdateCommand(
    @MessageBody() data: { projectId: string; userId?: string; username?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId, userId, username } = data;
    
    console.log('🚀 [WebSocket] 收到更新命令请求:', {
      projectId,
      userId: userId || '未提供',
      username: username || '未提供',
      clientId: client.id,
      timestamp: new Date().toISOString()
    });
    
    try {
      // 步骤1: 获取项目信息
      console.log('📋 [步骤1] 获取项目信息...');
      const project = await this.projectService.findOne(projectId);
      if (!project) {
        console.error('❌ [错误] 项目不存在:', projectId);
        client.emit('updateError', { message: '项目不存在' });
        return;
      }
      console.log('✅ [步骤1] 项目信息获取成功:', {
        projectName: project.name,
        enableUpdate: project.enableUpdate,
        updateCommand: project.updateCommand,
        updateDirectory: project.updateDirectory
      });

      // 步骤2: 检查更新权限
      console.log('🔐 [步骤2] 检查更新权限...');
      if (!project.enableUpdate) {
        console.error('❌ [错误] 项目未启用更新功能:', projectId);
        client.emit('updateError', { message: '项目未启用更新功能' });
        return;
      }
      console.log('✅ [步骤2] 更新权限检查通过');

      // 步骤3: 检查更新命令
      console.log('⚙️ [步骤3] 检查更新命令配置...');
      if (!project.updateCommand) {
        console.error('❌ [错误] 项目未配置更新命令:', projectId);
        client.emit('updateError', { message: '项目未配置更新命令' });
        return;
      }
      console.log('✅ [步骤3] 更新命令配置检查通过:', project.updateCommand);

      // 步骤4: 开始执行命令
      console.log('🎯 [步骤4] 开始执行更新命令...');
      await this.projectService.executeUpdateWithRealTimeOutput(
        projectId,
        (data: string) => {
          // 实时发送命令输出
          console.log('📤 [输出] 发送实时输出数据:', data.length + ' 字符');
          client.emit('updateOutput', { data });
        },
        (error: string) => {
          // 发送错误信息
          console.error('❌ [错误] 更新执行错误:', error);
          client.emit('updateError', { message: error });
        },
        () => {
          // 命令执行完成
          console.log('✅ [完成] 更新执行完成:', projectId);
          client.emit('updateComplete', { message: '更新完成' });
        },
        userId, // 传递用户ID
        username, // 传递用户名
        undefined, // ipAddress
        undefined  // userAgent
      );
    } catch (error) {
      console.error('💥 [异常] WebSocket执行更新时发生异常:', {
        projectId,
        error: error.message,
        stack: error.stack,
        clientId: client.id
      });
      client.emit('updateError', { 
        message: error.message || '执行更新时发生错误' 
      });
    }
  }

  @SubscribeMessage('executeUpdateCode')
  async handleUpdateCodeCommand(
    @MessageBody() data: { projectId: string; userId?: string; username?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId, userId, username } = data;
    
    console.log('🔄 [WebSocket] 收到更新代码命令请求:', {
      projectId,
      userId: userId || '未提供',
      username: username || '未提供',
      clientId: client.id,
      timestamp: new Date().toISOString()
    });
    
    try {
      // 步骤1: 获取项目信息
      console.log('📋 [步骤1] 获取项目信息...');
      const project = await this.projectService.findOne(projectId);
      if (!project) {
        console.error('❌ [错误] 项目不存在:', projectId);
        client.emit('updateCodeError', { message: '项目不存在' });
        return;
      }
      console.log('✅ [步骤1] 项目信息获取成功:', {
        projectName: project.name,
        enableUpdateCode: project.enableUpdateCode,
        updateCodeCommand: project.updateCodeCommand,
        updateCodeDirectory: project.updateCodeDirectory
      });

      // 步骤2: 检查更新代码权限
      console.log('🔐 [步骤2] 检查更新代码权限...');
      if (!project.enableUpdateCode) {
        console.error('❌ [错误] 项目未启用更新代码功能:', projectId);
        client.emit('updateCodeError', { message: '项目未启用更新代码功能' });
        return;
      }
      console.log('✅ [步骤2] 更新代码权限检查通过');

      // 步骤3: 检查更新代码命令
      console.log('⚙️ [步骤3] 检查更新代码命令配置...');
      if (!project.updateCodeCommand) {
        console.error('❌ [错误] 项目未配置更新代码命令:', projectId);
        client.emit('updateCodeError', { message: '项目未配置更新代码命令' });
        return;
      }
      console.log('✅ [步骤3] 更新代码命令配置检查通过:', project.updateCodeCommand);

      // 步骤4: 开始执行代码更新命令
      console.log('🎯 [步骤4] 开始执行更新代码命令...');
      await this.projectService.executeUpdateCodeWithRealTimeOutput(
        projectId,
        (data: string) => {
          // 实时发送命令输出
          console.log('📤 [输出] 发送实时输出数据:', data.length + ' 字符');
          client.emit('updateCodeOutput', { data });
        },
        (error: string) => {
          // 发送错误信息
          console.error('❌ [错误] 更新代码执行错误:', error);
          client.emit('updateCodeError', { message: error });
        },
        () => {
          // 命令执行完成
          console.log('✅ [完成] 更新代码执行完成:', projectId);
          client.emit('updateCodeComplete', { message: '更新代码完成' });
        },
        userId, // 传递用户ID
        username, // 传递用户名
        undefined, // ipAddress
        undefined  // userAgent
      );
    } catch (error) {
      console.error('💥 [异常] WebSocket执行更新代码时发生异常:', {
        projectId,
        error: error.message,
        stack: error.stack,
        clientId: client.id
      });
      client.emit('updateCodeError', { 
        message: error.message || '执行更新代码时发生错误' 
      });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `project-${data.projectId}`;
    client.join(room);
    client.emit('joinedRoom', { room });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `project-${data.projectId}`;
    client.leave(room);
    client.emit('leftRoom', { room });
  }

  




  @SubscribeMessage('executePackage')
  async handlePackageCommand(
    @MessageBody() data: { projectId: string; userId?: string; username?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId, userId, username } = data;
    console.log('📦 [WebSocket] 收到打 APK 命令:', { projectId, userId: userId || '未提供', username: username || '未提供', clientId: client.id });

    try {
      const project = await this.projectService.findOne(projectId);
      if (!project) {
        client.emit('updateError', { message: '项目不存在' }); // 复用错误事件名
        return;
      }
      if (!project.enablePackage) {
        client.emit('updateError', { message: '项目未启用打 APK 功能' });
        return;
      }
      if (!project.packageCommand) {
        client.emit('updateError', { message: '项目未配置打 APK 命令' });
        return;
      }

      // ★ 复用“更新”的输出事件名，前端无需改订阅
      await this.projectService.executePackageWithRealTimeOutput(
        projectId,
        (data: string) => client.emit('updateOutput', { data }),
        (error: string) => client.emit('updateError', { message: error }),
        () => client.emit('updateComplete', { message: '打 APK 完成' }),
        userId,
        username,
      );

    } catch (error: any) {
      console.error('💥 [异常] 打 APK 发生异常:', { projectId, error: error?.message, clientId: client.id });
      client.emit('updateError', { message: error?.message || '打 APK 时发生错误' });
    }
  }

  @SubscribeMessage('executeClearCache')
  async handleClearCacheCommand(
    @MessageBody() data: { projectId: string; userId?: string; username?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { projectId, userId, username } = data;
    console.log('🧹 [WebSocket] 收到清缓存命令:', { projectId, userId: userId || '未提供', username: username || '未提供', clientId: client.id });

    try {
      const project = await this.projectService.findOne(projectId);
      if (!project) {
        client.emit('updateError', { message: '项目不存在' });
        return;
      }
      if (!project.enableClearCache) {
        client.emit('updateError', { message: '项目未启用清缓存功能' });
        return;
      }
      if (!project.clearCacheCommand) {
        client.emit('updateError', { message: '项目未配置清缓存命令' });
        return;
      }

      await this.projectService.executeClearCacheWithRealTimeOutput(
        projectId,
        (data: string) => client.emit('updateOutput', { data }),      // 同事件名
        (error: string) => client.emit('updateError', { message: error }),
        () => client.emit('updateComplete', { message: '清缓存完成' }),
        userId,
        username,
      );

    } catch (error: any) {
      console.error('💥 [异常] 清缓存发生异常:', { projectId, error: error?.message, clientId: client.id });
      client.emit('updateError', { message: error?.message || '清缓存时发生错误' });
    }
  }



}
