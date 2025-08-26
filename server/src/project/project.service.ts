import { Injectable, Inject, forwardRef , NotFoundException, BadRequestException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan } from 'typeorm';
import { Project, ProjectUpdateStatus } from './entities/project.entity';
import { ProjectUpdateLog, UpdateStatus } from './entities/project-update-log.entity';
import { ProjectUpdateCodeLog, UpdateCodeStatus } from './entities/project-update-code-log.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { LogHelper } from '../log/utils/log-helper';
import { exec } from 'child_process';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ProjectPackageLog } from './entities/project-package-log.entity';
import { ProjectCacheLog } from './entities/project-cache-log.entity';

const execAsync = promisify(exec);

@Injectable()
export class ProjectService {

  /** 跨平台执行命令：Windows 用 cmd.exe，Mac/Linux 用 /bin/sh（由 Node 自动选择） */
private runCommand(opts: {
  command: string;
  cwd?: string;
  onStdout?: (s: string) => void;
  onStderr?: (s: string) => void;
  onClose?: (code: number | null, signal: NodeJS.Signals | null) => void;
  onError?: (err: Error) => void; // ★ 新增: 允许外部传入 onError 处理 spawn 级别错误
}) {
  const child = spawn(opts.command, {
    cwd: opts.cwd,
    shell: true,
    env: process.env,
  });

  // 统一转成字符串
  child.stdout.on('data', (buf) => opts.onStdout?.(buf.toString()));
  child.stderr.on('data', (buf) => opts.onStderr?.(buf.toString()));

  // ★ 新增: 监听 spawn 失败（命令不存在/权限问题等）
  child.on('error', (err) => opts.onError?.(err));

  // 进程结束
  child.on('close', (code, signal) => opts.onClose?.(code, signal));

  return child;
}

  
  constructor(
  @InjectRepository(Project)
  private projectRepository: Repository<Project>,
  @InjectRepository(ProjectUpdateLog)
  private projectUpdateLogRepository: Repository<ProjectUpdateLog>,
  @InjectRepository(ProjectUpdateCodeLog)
  private projectUpdateCodeLogRepository: Repository<ProjectUpdateCodeLog>,
  @InjectRepository(ProjectPackageLog)
  private projectPackageLogRepository: Repository<ProjectPackageLog>,
  @InjectRepository(ProjectCacheLog)
  private projectCacheLogRepository: Repository<ProjectCacheLog>,
  private readonly logHelper: LogHelper,
  @Inject(forwardRef(() => 'ProjectGateway'))
  private projectGateway: any,
) {}

  // 定时任务：每30秒检查超时的更新任务
  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleUpdateTimeout() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    // 查找超过10分钟的更新打包任务
    const timeoutLogs = await this.projectUpdateLogRepository.find({
      where: {
        status: UpdateStatus.UPDATING,
        startTime: LessThan(tenMinutesAgo)
      },
      relations: ['project']
    });

    for (const log of timeoutLogs) {
      // 更新日志状态为超时
      const updatedLog = await this.projectUpdateLogRepository.save({
        ...log,
        status: UpdateStatus.TIMEOUT,
        endTime: new Date(),
        duration: Math.floor((Date.now() - log.startTime.getTime()) / 1000)
      });

      // 更新项目状态为空闲
      await this.projectRepository.update(log.projectId, {
        currentUpdateStatus: ProjectUpdateStatus.IDLE,
        currentUpdateLogId: null
      });

      // 广播项目状态变化
      this.broadcastProjectStatus(log.projectId, ProjectUpdateStatus.IDLE, updatedLog);
    }

    // 查找超过10分钟的更新代码任务
    const timeoutCodeLogs = await this.projectUpdateCodeLogRepository.find({
      where: {
        status: UpdateCodeStatus.UPDATING,
        startTime: LessThan(tenMinutesAgo)
      },
      relations: ['project']
    });

    for (const log of timeoutCodeLogs) {
      // 更新代码日志状态为超时
      const updatedLog = await this.projectUpdateCodeLogRepository.save({
        ...log,
        status: UpdateCodeStatus.TIMEOUT,
        endTime: new Date(),
        duration: Math.floor((Date.now() - log.startTime.getTime()) / 1000)
      });

      // 更新项目代码状态为空闲
      await this.projectRepository.update(log.projectId, {
        currentUpdateCodeStatus: ProjectUpdateStatus.IDLE,
        currentUpdateCodeLogId: null
      });

      // 广播项目代码状态变化
      this.broadcastProjectStatus(log.projectId, ProjectUpdateStatus.IDLE, null, updatedLog);
    }
  }

  async create(createProjectDto: CreateProjectDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<Project> {
    try {
      const project = this.projectRepository.create(createProjectDto);
      const savedProject = await this.projectRepository.save(project);

      // 记录创建日志
      if (userId) {
        await this.logHelper.logCreate(
          userId,
          'project',
          'project',
          '项目',
          parseInt(savedProject.id),
          createProjectDto,
          { id: savedProject.id, name: savedProject.name },
          ipAddress,
          userAgent,
        );
      }

      return savedProject;
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '创建项目',
          '创建项目失败',
          error.message,
          createProjectDto,
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async findAll(userId?: string, ipAddress?: string, userAgent?: string): Promise<Project[]> {
    try {
      const projects = await this.projectRepository.find({
        order: { sortOrder: 'DESC', createdAt: 'DESC' }
      });

      // 记录查询日志
      if (userId) {
        await this.logHelper.logQuery(
          userId,
          'project',
          'project',
          '列表',
          undefined,
          { count: projects.length },
          ipAddress,
          userAgent,
        );
      }

      return projects;
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '查询项目列表',
          '查询项目列表失败',
          error.message,
          undefined,
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async findAllWithPagination(query: QueryProjectDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<{ data: Project[], total: number }> {
    try {
      const {
        current = 1,
        pageSize = 10,
        name,
        isActive
      } = query;

      const page = Number(current);
      const size = Number(pageSize);
      
      // 构建查询条件
      const where: any = {};
      
      if (name) {
        where.name = Like(`%${name}%`);
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [projects, total] = await this.projectRepository.findAndCount({
        where,
        skip: (page - 1) * size,
        take: size,
        order: { sortOrder: 'DESC', createdAt: 'DESC' }
      });

      const result = {
        data: projects,
        total
      };

      // 记录查询日志
      if (userId) {
        await this.logHelper.logQuery(
          userId,
          'project',
          'project',
          '列表',
          query,
          { count: result.data.length, total: result.total },
          ipAddress,
          userAgent,
        );
      }

      return result;
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '查询项目列表',
          '查询项目列表失败',
          error.message,
          query,
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async findOne(id: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({ where: { id } });
      
      if (!project) {
        throw new Error(`Project with ID ${id} not found`);
      }

      // 记录查询日志
      if (userId) {
        await this.logHelper.logQuery(
          userId,
          'project',
          'project',
          '详情',
          { id },
          { id: project.id, name: project.name },
          ipAddress,
          userAgent,
        );
      }

      return project;
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '查询项目详情',
          '查询项目详情失败',
          error.message,
          { id },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<Project> {
    try {
      await this.projectRepository.update(id, updateProjectDto);
      const updatedProject = await this.findOne(id);

      // 记录更新日志
      if (userId) {
        await this.logHelper.logUpdate(
          userId,
          'project',
          'project',
          '项目',
          parseInt(id),
          updateProjectDto,
          { id: updatedProject.id, name: updatedProject.name },
          ipAddress,
          userAgent,
        );
      }

      return updatedProject;
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '更新项目',
          '更新项目失败',
          error.message,
          { id, ...updateProjectDto },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async remove(id: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // 先获取项目信息用于日志记录
      const project = await this.projectRepository.findOne({ where: { id } });
      
      await this.projectRepository.delete(id);

      // 记录删除日志
      if (userId && project) {
        await this.logHelper.logDelete(
          userId,
          'project',
          'project',
          '项目',
          parseInt(id),
          { id },
          { id: project.id, name: project.name },
          ipAddress,
          userAgent,
        );
      }
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '删除项目',
          '删除项目失败',
          error.message,
          { id },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async batchToggleStatus(ids: string[], isActive: boolean, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No IDs provided for batch update');
      }
      
      for (const id of ids) {
        await this.projectRepository.update(id, { isActive });
      }

      // 记录批量更新日志
      if (userId) {
        try {
          await this.logHelper.logUserOperation(
            userId,
            'project',
            'project',
            '批量更新状态',
            `批量${isActive ? '启用' : '禁用'}项目，共 ${ids.length} 个项目`,
            undefined,
            'success',
            { ids, isActive },
            { updatedCount: ids.length },
            undefined,
            undefined,
            ipAddress,
            userAgent,
          );
        } catch (logError) {
          console.error('创建批量更新日志失败:', logError);
        }
      }
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '批量更新状态',
          '批量更新项目状态失败',
          error.message,
          { ids, isActive },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  // 获取工作台展示的项目（只返回启用的项目）
  async findActiveProjects(userId?: string, ipAddress?: string, userAgent?: string): Promise<Project[]> {
    try {
      const projects = await this.projectRepository.find({
        where: { isActive: true },
        order: { sortOrder: 'DESC', createdAt: 'DESC' }
      });

      // 记录查询日志
      if (userId) {
        await this.logHelper.logQuery(
          userId,
          'project',
          'project',
          '列表',
          undefined,
          { count: projects.length },
          ipAddress,
          userAgent,
        );
      }

      return projects;
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '查询项目列表',
          '查询项目列表失败',
          error.message,
          undefined,
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  // 执行项目更新命令
  async executeUpdate(id: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; message: string; output?: string }> {
    try {
      const project = await this.projectRepository.findOne({ where: { id } });
      
      if (!project) {
        throw new Error(`Project with ID ${id} not found`);
      }

      if (!project.enableUpdate) {
        throw new Error('项目未启用更新功能');
      }

      if (!project.updateCommand) {
        throw new Error('项目未配置更新命令');
      }

      // 记录更新开始日志
      if (userId) {
        try {
          await this.logHelper.logUserOperation(
            userId,
            'project',
            'project',
            '执行更新',
            `开始执行项目更新: ${project.name}`,
            undefined,
            'success',
            { projectId: id, command: project.updateCommand, directory: project.updateDirectory },
            undefined,
            undefined,
            undefined,
            ipAddress,
            userAgent,
          );
        } catch (logError) {
          console.error('创建开始日志失败:', logError);
        }
      }

      // 执行更新命令
      const options: any = {};
      if (project.updateDirectory) {
        options.cwd = project.updateDirectory;
      }

      const { stdout, stderr } = await execAsync(project.updateCommand, options);

      const output = stdout + (stderr ? `\nErrors: ${stderr}` : '');

      // 记录更新完成日志（不再依赖返回码判断成功与否）
      if (userId) {
        try {
          await this.logHelper.logUserOperation(
            userId,
            'project',
            'project',
            '执行更新',
            `项目更新完成: ${project.name}`,
            undefined,
            'success',
            { projectId: id, command: project.updateCommand, directory: project.updateDirectory },
            undefined,
            undefined,
            undefined,
            ipAddress,
            userAgent,
          );
        } catch (logError) {
          console.error('创建成功日志失败:', logError);
        }
      }

      return {
        success: true,
        message: '更新执行完成'
      };
    } catch (error) {
      // 记录更新失败日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '执行更新',
          '项目更新失败',
          error.message,
          { id },
          ipAddress,
          userAgent,
        );
      }
      
      return {
        success: false,
        message: `更新执行失败: ${error.message}`
      };
    }
  }

  // 执行项目更新命令（实时输出版本）
  async executeUpdateWithRealTimeOutput(
    id: string,
    onOutput: (data: string) => void,
    onError: (error: string) => void,
    onComplete: () => void,
    userId?: string,
    username?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const project = await this.projectRepository.findOne({ where: { id } });
      
      if (!project) {
        onError(`Project with ID ${id} not found`);
        return;
      }

      if (!project.enableUpdate) {
        onError('项目未启用更新功能');
        return;
      }

      if (!project.updateCommand) {
        onError('项目未配置更新命令');
        return;
      }

      // 检查项目是否已在更新中
      if (project.currentUpdateStatus === ProjectUpdateStatus.UPDATING) {
        onError('项目正在更新中，请稍后再试');
        return;
      }

      // 创建更新日志时，确保用户ID是有效的
      let validUserId = null;
      let validUsername = null;
      
      if (userId) {
        // 确保用户ID是字符串并且不为空
        validUserId = String(userId).trim();
        if (!validUserId || validUserId === 'undefined' || validUserId === 'null') {
          validUserId = null;
        }
      }
      
      if (username) {
        // 确保用户名是字符串并且不为空
        validUsername = String(username).trim();
        if (!validUsername || validUsername === 'undefined' || validUsername === 'null') {
          validUsername = null;
        }
      }

      // 创建更新日志
      const updateLog = this.projectUpdateLogRepository.create({
        projectId: id,
        status: UpdateStatus.UPDATING,
        startedBy: validUserId, // 确保是有效字符串或null
        startedByName: validUsername, // 确保是有效字符串或null
        startTime: new Date()
      });
      
      console.log('创建更新日志:', {
        projectId: id,
        userId: validUserId || '未提供',
        username: validUsername || '未提供',
        logData: {
          projectId: updateLog.projectId,
          status: updateLog.status,
          startedBy: updateLog.startedBy,
          startedByName: updateLog.startedByName,
          startTime: updateLog.startTime
        }
      });
      
      let savedLog;
      try {
        savedLog = await this.projectUpdateLogRepository.save(updateLog);
        console.log('更新日志保存成功:', savedLog.id);
      } catch (saveError) {
        console.error('保存更新日志失败:', saveError);
        onError(`保存更新日志失败: ${saveError.message}`);
        return;
      }

      // 更新项目状态为更新中
      await this.projectRepository.update(id, {
        currentUpdateStatus: ProjectUpdateStatus.UPDATING,
        currentUpdateLogId: savedLog.id
      });

      // 广播项目状态变化
      this.broadcastProjectStatus(id, ProjectUpdateStatus.UPDATING, savedLog);

      // 记录更新开始日志
      if (userId) {
        try {
          await this.logHelper.logUserOperation(
            userId,
            'project',
            'project',
            '执行更新',
            `开始执行项目更新: ${project.name}`,
            undefined,
            'success',
            { projectId: id, command: project.updateCommand, directory: project.updateDirectory },
            undefined,
            undefined,
            undefined,
            ipAddress,
            userAgent,
          );
        } catch (logError) {
          console.error('创建操作日志失败:', logError);
          // 不中断更新流程，继续执行
        }
      }

      // 执行命令
      const options: any = {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true, // 使用shell执行，支持复杂命令
      };
      if (project.updateDirectory) {
        options.cwd = project.updateDirectory;
      }

      // 添加调试输出
      console.log('开始执行更新命令:', {
        projectId: id,
        projectName: project.name,
        command: project.updateCommand,
        directory: project.updateDirectory || '当前目录',
        options: options
      });

      onOutput(`🚀 开始执行更新命令...\n`);
      onOutput(`📂 项目: ${project.name}\n`);
      onOutput(`📋 命令: ${project.updateCommand}\n`);
      onOutput(`📁 目录: ${project.updateDirectory || '当前目录'}\n`);
      onOutput(`⏰ 超时时间: 10分钟\n`);
      onOutput(`\n--- 命令输出 ---\n`);

      // 使用shell时，需要将命令分解为shell和参数
      //const childProcess = spawn('sh', ['-c', project.updateCommand], options);
      const childProcess = this.runCommand({
  command: project.updateCommand!,       // 或 project.packageCommand / clearCacheCommand
  cwd: project.updateDirectory,          // 对应目录
  onStdout: (s) => { /* 推送WS日志或累积日志 */ },
  onStderr: (s) => { /* 推送WS日志或错误 */ },
  onClose: (code, signal) => { /* 记录状态，更新日志实体等 */ },
});

      let outputBuffer = '';
      let isCompleted = false;
      let svnRevision = null; // 存储 SVN 版本号

      console.log('📊 [步骤14] 初始化输出监听变量:', {
        outputBufferSize: outputBuffer.length,
        processCompleted: isCompleted,
        svnRevision: svnRevision || '未检测到'
      });

      // 设置10分钟超时
      const timeoutTimer = setTimeout(async () => {
        if (!isCompleted) {
          console.log('命令执行超时，强制终止:', {
            projectId: id,
            command: project.updateCommand,
            timeout: '10分钟'
          });

          // 强制终止进程
          childProcess.kill('SIGTERM');
          
          // 如果SIGTERM无效，使用SIGKILL
          setTimeout(() => {
            if (!isCompleted) {
              childProcess.kill('SIGKILL');
            }
          }, 2000);

          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);

          onOutput(`\n⚠️  命令执行超时 (${duration}秒)，已强制终止\n`);

          // 更新失败
          const updatedLog = await this.projectUpdateLogRepository.save({
            ...savedLog,
            status: UpdateStatus.TIMEOUT,
            endTime,
            duration,
            svnRevision: svnRevision // 即使超时也保存已检测到的SVN版本号
          });
          console.log('📝 [超时] 更新日志状态更新为超时:', {
            duration: duration + '秒',
            svnRevision: svnRevision || '未检测到'
          });

          // 更新项目状态为空闲
          await this.projectRepository.update(id, {
            currentUpdateStatus: ProjectUpdateStatus.IDLE,
            currentUpdateLogId: null
          });

          // 广播项目状态变化
          this.broadcastProjectStatus(id, ProjectUpdateStatus.IDLE, updatedLog);

          isCompleted = true;
          onError(`命令执行超时 (${duration}秒)，已强制终止`);
        }
      }, 15 * 60 * 1000); // 15分钟超时

      // 监听标准输出
      console.log('👂 [步骤15] 开始监听进程标准输出...');
      childProcess.stdout.on('data', (data) => {
        if (!isCompleted) {
          const output = data.toString();
          outputBuffer += output;
          
          // 提取 SVN 版本号 - 使用统一检测方法
          const detectedRevision = this.detectSvnRevision(output, svnRevision, 'stdout');
          if (detectedRevision && !svnRevision) {
            svnRevision = detectedRevision;
            onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
          }
          
          console.log('📤 [stdout] 收到标准输出数据:', output.length + ' 字符');
          onOutput(output);
        }
      });

      // 监听错误输出
      childProcess.stderr.on('data', (data) => {
        if (!isCompleted) {
          const error = data.toString();
          outputBuffer += `Error: ${error}`;
          
          // 在错误输出中也检测 SVN 版本号
          const detectedRevision = this.detectSvnRevision(error, svnRevision, 'stderr');
          if (detectedRevision && !svnRevision) {
            svnRevision = detectedRevision;
            onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
          }
          
          onOutput(`Error: ${error}`);
        }
      });

      // 监听进程结束
      childProcess.on('close', async (code) => {
        if (!isCompleted) {
          clearTimeout(timeoutTimer); // 清除超时定时器
          isCompleted = true;

          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);

          console.log('🏁 [完成] 命令执行完成:', {
            projectId: id,
            command: project.updateCommand,
            exitCode: code,
            duration: duration + '秒',
            outputLength: outputBuffer.length,
            svnRevision: svnRevision || '未检测到'
          });

          onOutput(`\n--- 命令执行完成 ---\n`);
          onOutput(`⏱️  执行时间: ${duration}秒\n`);
          onOutput(`📤 退出码: ${code}\n`);
          if (svnRevision) {
            onOutput(`📋 SVN 版本: ${svnRevision}\n`);
          }
          onOutput(`✅ 更新完成！\n`);

          // 不再依赖返回码判断成功与否，命令执行完成即认为成功
          console.log('📝 [步骤16] 更新完成日志状态...');
          const updatedLog = await this.projectUpdateLogRepository.save({
            ...savedLog,
            status: UpdateStatus.COMPLETED,
            endTime,
            duration,
            exitCode: code,
            signal: null,
            svnRevision: svnRevision // 保存 SVN 版本号
          });
          console.log('✅ [步骤16] 完成日志状态更新成功:', {
            logId: updatedLog.id,
            svnRevision: svnRevision || '未检测到'
          });

          // 更新项目状态为空闲
          await this.projectRepository.update(id, {
            currentUpdateStatus: ProjectUpdateStatus.IDLE,
            currentUpdateLogId: null
          });

          // 广播项目状态变化，通知移动端可以重新访问
          this.broadcastProjectStatus(id, ProjectUpdateStatus.IDLE, updatedLog);

          // 记录更新完成日志
          if (userId) {
            try {
              await this.logHelper.logUserOperation(
                userId,
                'project',
                'project',
                '执行更新',
                `项目更新完成: ${project.name} (退出码: ${code}${svnRevision ? `, SVN版本: ${svnRevision}` : ''})`,
                undefined,
                'success',
                { 
                  projectId: id, 
                  command: project.updateCommand, 
                  directory: project.updateDirectory, 
                  exitCode: code,
                  duration: duration,
                  svnRevision: svnRevision
                },
                undefined,
                undefined,
                undefined,
                ipAddress,
                userAgent,
              );
              console.log('✅ [步骤18] 完成操作日志记录成功:', {
                svnRevision: svnRevision || '未检测到'
              });
            } catch (logError) {
              console.error('创建完成日志失败:', logError);
            }
          }
          onComplete();
        }
      });

      // 监听进程错误
      childProcess.on('error', async (error) => {
        if (!isCompleted) {
          clearTimeout(timeoutTimer); // 清除超时定时器
          isCompleted = true;

          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);

          console.error('命令执行进程错误:', {
            projectId: id,
            command: project.updateCommand,
            error: error.message,
            duration: duration
          });

          onOutput(`\n💥 进程执行错误: ${error.message}\n`);

          // 更新失败
          const updatedLog = await this.projectUpdateLogRepository.save({
            ...savedLog,
            status: UpdateStatus.FAILED,
            endTime,
            duration,
            svnRevision: svnRevision, // 保存已检测到的SVN版本号
            errorMessage: error.message
          });
          console.log('📝 [异常] 错误日志状态更新成功:', {
            error: error.message,
            svnRevision: svnRevision || '未检测到'
          });

          // 更新项目状态为空闲
          await this.projectRepository.update(id, {
            currentUpdateStatus: ProjectUpdateStatus.IDLE,
            currentUpdateLogId: null
          });

          // 广播项目状态变化
          this.broadcastProjectStatus(id, ProjectUpdateStatus.IDLE, updatedLog);

          const errorMsg = `进程启动失败: ${error.message}`;
          if (userId) {
            await this.logHelper.logError(
              userId,
              'project',
              'project',
              '执行更新',
              '项目更新失败',
              errorMsg,
              { id },
              ipAddress,
              userAgent,
            );
          }
          onError(errorMsg);
        }
      });

    } catch (error) {
      if (userId) {
        await this.logHelper.logError(
          userId,
          'project',
          'project',
          '执行更新',
          '项目更新失败',
          error.message,
          { id },
          ipAddress,
          userAgent,
        );
      }
      onError(error.message);
    }
  }

  // 执行项目更新代码命令（实时输出版本）
  async executeUpdateCodeWithRealTimeOutput(
    id: string,
    onOutput: (data: string) => void,
    onError: (error: string) => void,
    onComplete: () => void,
    userId?: string,
    username?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const startTimeMs = Date.now();
    console.log('🔧 [代码更新服务] 开始执行代码更新流程:', {
      projectId: id,
      userId: userId || '未提供',
      username: username || '未提供',
      startTime: new Date().toISOString()
    });

    try {
      console.log('📋 [步骤1] 查询项目信息...');
      const project = await this.projectRepository.findOne({ where: { id } });
      
      if (!project) {
        console.error('❌ [错误] 项目不存在:', id);
        onError(`Project with ID ${id} not found`);
        return;
      }
      console.log('✅ [步骤1] 项目信息查询成功:', {
        projectName: project.name,
        enableUpdateCode: project.enableUpdateCode,
        updateCodeCommand: project.updateCodeCommand ? '已配置' : '未配置',
        updateCodeDirectory: project.updateCodeDirectory || '未指定',
        currentUpdateCodeStatus: project.currentUpdateCodeStatus || 'idle'
      });

      console.log('🔐 [步骤2] 检查代码更新权限...');
      if (!project.enableUpdateCode) {
        console.error('❌ [错误] 项目未启用代码更新功能');
        onError('项目未启用更新代码功能');
        return;
      }
      console.log('✅ [步骤2] 代码更新权限检查通过');

      console.log('⚙️ [步骤3] 检查代码更新命令...');
      if (!project.updateCodeCommand) {
        console.error('❌ [错误] 项目未配置代码更新命令');
        onError('项目未配置更新代码命令');
        return;
      }
      console.log('✅ [步骤3] 代码更新命令检查通过:', project.updateCodeCommand);

      console.log('🔄 [步骤4] 检查项目代码更新状态...');
      if (project.currentUpdateCodeStatus === ProjectUpdateStatus.UPDATING) {
        console.error('❌ [错误] 项目正在代码更新中');
        onError('项目正在更新代码中，请稍后再试');
        return;
      }
      console.log('✅ [步骤4] 项目代码更新状态检查通过，可以开始更新');

      // 创建更新代码日志时，确保用户ID是有效的
      console.log('👤 [步骤5] 验证用户信息...');
      let validUserId = null;
      let validUsername = null;
      
      if (userId) {
        validUserId = String(userId).trim();
        if (!validUserId || validUserId === 'undefined' || validUserId === 'null') {
          validUserId = null;
        }
      }
      
      if (username) {
        validUsername = String(username).trim();
        if (!validUsername || validUsername === 'undefined' || validUsername === 'null') {
          validUsername = null;
        }
      }
      console.log('✅ [步骤5] 用户信息验证完成:', {
        userId: validUserId || '未提供',
        username: validUsername || '未提供'
      });

      // 创建更新代码日志
      console.log('📝 [步骤6] 创建代码更新日志记录...');
      const updateCodeLog = this.projectUpdateCodeLogRepository.create({
        projectId: id,
        status: UpdateCodeStatus.UPDATING,
        startedBy: validUserId,
        startedByName: validUsername,
        startTime: new Date()
      });
      
      console.log('📝 [步骤6] 代码更新日志数据准备完成:', {
        projectId: updateCodeLog.projectId,
        status: updateCodeLog.status,
        startedBy: updateCodeLog.startedBy || '未知用户',
        startedByName: updateCodeLog.startedByName || '未知用户',
        startTime: updateCodeLog.startTime.toISOString()
      });
      
      let savedLog;
      try {
        savedLog = await this.projectUpdateCodeLogRepository.save(updateCodeLog);
        console.log('✅ [步骤6] 代码更新日志保存成功，日志ID:', savedLog.id);
      } catch (saveError) {
        console.error('❌ [错误] 保存代码更新日志失败:', {
          error: saveError.message,
          stack: saveError.stack
        });
        onError(`保存更新代码日志失败: ${saveError.message}`);
        return;
      }

      // 更新项目代码状态为更新中
      console.log('🔄 [步骤7] 更新项目代码状态为"更新中"...');
      try {
        await this.projectRepository.update(id, {
          currentUpdateCodeStatus: ProjectUpdateStatus.UPDATING,
          currentUpdateCodeLogId: savedLog.id
        });
        console.log('✅ [步骤7] 项目代码状态更新成功');
      } catch (updateError) {
        console.error('❌ [错误] 更新项目代码状态失败:', updateError.message);
        // 继续执行，不中断流程
      }

      // 广播项目代码状态变化
      console.log('📢 [步骤8] 广播项目代码状态变化...');
      try {
        this.broadcastProjectStatus(id, ProjectUpdateStatus.UPDATING, undefined, savedLog);
        console.log('✅ [步骤8] 代码状态广播完成');
      } catch (broadcastError) {
        console.error('⚠️ [警告] 代码状态广播失败:', broadcastError.message);
        // 继续执行，不中断流程
      }

      // 记录更新代码开始日志
      console.log('📝 [步骤9] 记录代码更新操作日志...');
      if (userId) {
        try {
          await this.logHelper.logUserOperation(
            userId,
            'project',
            'project',
            '执行更新代码',
            `开始执行项目更新代码: ${project.name}`,
            undefined,
            'success',
            { projectId: id, command: project.updateCodeCommand, directory: project.updateCodeDirectory },
            undefined,
            undefined,
            undefined,
            ipAddress,
            userAgent,
          );
          console.log('✅ [步骤9] 代码更新操作日志记录成功');
        } catch (logError) {
          console.error('⚠️ [警告] 创建代码更新操作日志失败:', logError.message);
          // 不中断更新流程，继续执行
        }
      } else {
        console.log('⚠️ [步骤9] 跳过代码更新操作日志记录（未提供用户ID）');
      }

      // 执行命令
      console.log('🛠️ [步骤10] 准备代码更新命令执行环境...');
      const options: any = {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      };
      if (project.updateCodeDirectory) {
        options.cwd = project.updateCodeDirectory;
        console.log('📁 [步骤10] 设置代码更新工作目录:', project.updateCodeDirectory);
      } else {
        console.log('📁 [步骤10] 使用默认工作目录');
      }

      console.log('✅ [步骤10] 代码更新命令执行环境准备完成:', {
        command: project.updateCodeCommand,
        workingDirectory: project.updateCodeDirectory || '默认目录',
        shell: options.shell,
        stdio: options.stdio
      });

      console.log('📤 [步骤11] 向客户端发送代码更新初始信息...');
      const executionStartTime = new Date();
      onOutput(`� 开始执行代码更新命令...\n`);
      onOutput(`📂 项目: ${project.name}\n`);
      onOutput(`📋 命令: ${project.updateCodeCommand}\n`);
      onOutput(`📁 目录: ${project.updateCodeDirectory || '当前目录'}\n`);
      onOutput(`⏰ 超时时间: 10分钟\n`);
      onOutput(`🕐 开始时间: ${executionStartTime.toLocaleString()}\n`);
      onOutput(`\n--- 代码更新命令输出 ---\n`);
      console.log('✅ [步骤11] 代码更新初始信息发送完成');

      console.log('🔧 [步骤12] 启动代码更新子进程执行命令...');
      //const childProcess = spawn('sh', ['-c', project.updateCodeCommand], options);
      const childProcess = this.runCommand({
  command: project.updateCommand!,       // 或 project.packageCommand / clearCacheCommand
  cwd: project.updateDirectory,          // 对应目录
  onStdout: (s) => { /* 推送WS日志或累积日志 */ },
  onStderr: (s) => { /* 推送WS日志或错误 */ },
  onClose: (code, signal) => { /* 记录状态，更新日志实体等 */ },
});

      console.log('✅ [步骤12] 代码更新子进程启动成功，PID:', childProcess.pid);

      let outputBuffer = '';
      let errorBuffer = '';
      let isCompleted = false;
      let timeoutOccurred = false;
      let svnRevision = null; // 存储 SVN 版本号

      console.log('📊 [步骤13] 初始化代码更新输出监听变量:', {
        outputBufferSize: outputBuffer.length,
        errorBufferSize: errorBuffer.length,
        processCompleted: isCompleted,
        timeoutOccurred: timeoutOccurred,
        svnRevision: svnRevision || '未检测到'
      });

      // 设置10分钟超时
      console.log('⏰ [步骤13] 设置代码更新10分钟超时保护...');
      const timeoutTimer = setTimeout(async () => {
        if (!isCompleted) {
          timeoutOccurred = true;
          console.log('⚠️ [超时] 代码更新命令执行超时，开始强制终止流程:', {
            projectId: id,
            command: project.updateCodeCommand,
            timeout: '10分钟',
            pid: childProcess.pid,
            outputLength: outputBuffer.length,
            errorLength: errorBuffer.length
          });

          // 强制终止进程
          console.log('🔪 [超时] 发送SIGTERM信号...');
          childProcess.kill('SIGTERM');
          
          // 如果SIGTERM无效，使用SIGKILL
          setTimeout(() => {
            if (!isCompleted) {
              console.log('💀 [超时] SIGTERM无效，发送SIGKILL信号...');
              childProcess.kill('SIGKILL');
            }
          }, 2000);

          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);

          onOutput(`\n⚠️  代码更新命令执行超时 (${duration}秒)，已强制终止\n`);
          onOutput(`📊 输出缓冲区大小: ${outputBuffer.length} 字符\n`);
          onOutput(`📊 错误缓冲区大小: ${errorBuffer.length} 字符\n`);

          // 更新失败
          try {
            const updatedLog = await this.projectUpdateCodeLogRepository.save({
              ...savedLog,
              status: UpdateCodeStatus.TIMEOUT,
              endTime,
              duration
            });
            console.log('📝 [超时] 代码更新日志状态更新为超时');

            // 更新项目代码状态为空闲
            await this.projectRepository.update(id, {
              currentUpdateCodeStatus: ProjectUpdateStatus.IDLE,
              currentUpdateCodeLogId: null
            });
            console.log('🔄 [超时] 项目代码状态重置为空闲');

            // 广播项目代码状态变化
            this.broadcastProjectStatus(id, ProjectUpdateStatus.IDLE, undefined, updatedLog);
            console.log('📢 [超时] 广播项目代码状态变化');
          } catch (updateError) {
            console.error('❌ [超时] 更新代码状态失败:', updateError.message);
          }

          isCompleted = true;
          onError(`代码更新命令执行超时 (${duration}秒)，已强制终止`);
        }
      }, 10 * 60 * 1000);
      console.log('✅ [步骤13] 代码更新超时保护设置完成');

      // 监听标准输出
      console.log('👂 [步骤14] 开始监听代码更新进程输出...');
      childProcess.stdout.on('data', (data) => {
        if (!isCompleted && !timeoutOccurred) {
          const output = data.toString();
          outputBuffer += output;
          
          // 提取 SVN 版本号 - 使用统一检测方法
          const detectedRevision = this.detectSvnRevision(output, svnRevision, 'stdout-code');
          if (detectedRevision && !svnRevision) {
            svnRevision = detectedRevision;
            onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
          }
          
          console.log('📤 [stdout] 收到代码更新标准输出数据:', output.length + ' 字符');
          onOutput(output);
        }
      });

      // 监听错误输出
      childProcess.stderr.on('data', (data) => {
        if (!isCompleted && !timeoutOccurred) {
          const error = data.toString();
          errorBuffer += error;
          outputBuffer += `Error: ${error}`;
          
          // 在错误输出中也检测 SVN 版本号
          const detectedRevision = this.detectSvnRevision(error, svnRevision, 'stderr-code');
          if (detectedRevision && !svnRevision) {
            svnRevision = detectedRevision;
            onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
          }
          
          console.log('⚠️ [stderr] 收到代码更新错误输出数据:', error.length + ' 字符');
          onOutput(`Error: ${error}`);
        }
      });

      // 监听进程结束
      childProcess.on('close', async (code, signal) => {
        if (!isCompleted && !timeoutOccurred) {
          clearTimeout(timeoutTimer); // 清除超时定时器
          isCompleted = true;

          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);
          const totalExecutionTime = Math.floor((Date.now() - startTimeMs) / 1000);

          console.log('🏁 [完成] 代码更新命令执行完成:', {
            projectId: id,
            command: project.updateCodeCommand,
            exitCode: code,
            signal: signal || '无',
            duration: duration + '秒',
            totalExecutionTime: totalExecutionTime + '秒',
            outputLength: outputBuffer.length,
            errorLength: errorBuffer.length,
            pid: childProcess.pid,
            svnRevision: svnRevision || '未检测到'
          });

          onOutput(`\n--- 代码更新命令执行完成 ---\n`);
          onOutput(`⏱️  执行时间: ${duration}秒\n`);
          onOutput(`🔧 进程ID: ${childProcess.pid}\n`);
          onOutput(`📤 退出码: ${code}\n`);
          if (signal) {
            onOutput(`📶 终止信号: ${signal}\n`);
          }
          if (svnRevision) {
            onOutput(`📋 SVN 版本: ${svnRevision}\n`);
          }
          onOutput(`📊 标准输出: ${outputBuffer.length - errorBuffer.length} 字符\n`);
          onOutput(`📊 错误输出: ${errorBuffer.length} 字符\n`);
          onOutput(`✅ 代码更新完成！\n`);

          // 不再依赖返回码判断成功与否，命令执行完成即认为成功
          console.log('📝 [步骤15] 更新代码更新完成日志状态...');
          try {
            const updatedLog = await this.projectUpdateCodeLogRepository.save({
              ...savedLog,
              status: UpdateCodeStatus.COMPLETED,
              endTime,
              duration,
              exitCode: code,
              signal: signal || null,
              svnRevision: svnRevision // 保存 SVN 版本号
            });
            console.log('✅ [步骤15] 代码更新完成日志状态更新成功:', {
              logId: updatedLog.id,
              svnRevision: svnRevision || '未检测到'
            });

            console.log('🔄 [步骤16] 重置项目代码状态为空闲...');
            await this.projectRepository.update(id, {
              currentUpdateCodeStatus: ProjectUpdateStatus.IDLE,
              currentUpdateCodeLogId: null
            });
            console.log('✅ [步骤16] 项目代码状态重置成功');

            console.log('📢 [步骤17] 广播项目代码状态变化...');
            this.broadcastProjectStatus(id, ProjectUpdateStatus.IDLE, undefined, updatedLog);
            console.log('✅ [步骤17] 代码状态广播完成');

            // 记录更新代码完成日志
            console.log('📝 [步骤18] 记录代码更新完成操作日志...');
            if (userId) {
              try {
                await this.logHelper.logUserOperation(
                  userId,
                  'project',
                  'project',
                  '执行更新代码',
                  `项目更新代码完成: ${project.name} (退出码: ${code}${svnRevision ? `, SVN版本: ${svnRevision}` : ''})`,
                  undefined,
                  'success',
                  { 
                    projectId: id, 
                    command: project.updateCodeCommand, 
                    directory: project.updateCodeDirectory, 
                    exitCode: code,
                    duration: duration,
                    signal: signal || null,
                    svnRevision: svnRevision
                  },
                  undefined,
                  undefined,
                  undefined,
                  ipAddress,
                  userAgent,
                );
                console.log('✅ [步骤18] 代码更新完成操作日志记录成功:', {
                  svnRevision: svnRevision || '未检测到'
                });
              } catch (logError) {
                console.error('⚠️ [警告] 创建代码更新完成日志失败:', logError.message);
              }
            } else {
              console.log('⚠️ [步骤18] 跳过代码更新完成操作日志记录（未提供用户ID）');
            }

            console.log('🎉 [总结] 代码更新流程全部完成:', {
              projectId: id,
              projectName: project.name,
              totalTime: totalExecutionTime + '秒',
              exitCode: code,
              svnRevision: svnRevision || '未检测到',
              success: true
            });

            onComplete();
          } catch (updateError) {
            console.error('❌ [错误] 更新代码更新完成状态失败:', updateError.message);
            onError(`更新代码更新完成状态失败: ${updateError.message}`);
          }
        }
      });

      // 监听进程错误
      childProcess.on('error', async (error) => {
        if (!isCompleted && !timeoutOccurred) {
          clearTimeout(timeoutTimer); // 清除超时定时器
          isCompleted = true;

          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);

          console.error('💥 [异常] 代码更新命令执行进程发生错误:', {
            projectId: id,
            command: project.updateCodeCommand,
            error: error.message,
            errorName: error.name,
            duration: duration + '秒',
            pid: childProcess.pid,
            outputLength: outputBuffer.length,
            errorLength: errorBuffer.length
          });

          onOutput(`\n❌ 代码更新进程执行错误: ${error.message}\n`);
          onOutput(`⏱️  执行时间: ${duration}秒\n`);
          onOutput(`📊 已收集输出: ${outputBuffer.length} 字符\n`);

          // 更新失败状态
          try {
            const updatedLog = await this.projectUpdateCodeLogRepository.save({
              ...savedLog,
              status: UpdateCodeStatus.FAILED,
              endTime,
              duration,
              errorMessage: error.message
            });
            console.log('📝 [异常] 代码更新错误日志状态更新成功');

            // 重置项目代码状态
            await this.projectRepository.update(id, {
              currentUpdateCodeStatus: ProjectUpdateStatus.IDLE,
              currentUpdateCodeLogId: null
            });
            console.log('🔄 [异常] 项目代码状态重置成功');

            // 广播代码状态变化
            this.broadcastProjectStatus(id, ProjectUpdateStatus.IDLE, undefined, updatedLog);
            console.log('📢 [异常] 代码状态广播完成');
          } catch (updateError) {
            console.error('❌ [异常] 更新代码错误状态失败:', updateError.message);
          }

          // 记录错误日志
          if (userId) {
            try {
              await this.logHelper.logError(
                userId,
                'project',
                'project',
                '执行更新代码',
                '项目更新代码进程错误',
                error.message,
                { 
                  projectId: id, 
                  command: project.updateCodeCommand, 
                  directory: project.updateCodeDirectory,
                  duration: duration,
                  outputLength: outputBuffer.length
                },
                ipAddress,
                userAgent,
              );
              console.log('📝 [异常] 代码更新错误操作日志记录成功');
            } catch (logError) {
              console.error('⚠️ [警告] 创建代码更新错误日志失败:', logError.message);
            }
          }

          const errorMsg = `代码更新进程启动失败: ${error.message}`;
          onError(errorMsg);
        }
      });

      console.log('✅ [步骤14] 代码更新进程监听器设置完成，等待命令执行...');

    } catch (error) {
      const totalExecutionTime = Math.floor((Date.now() - startTimeMs) / 1000);
      
      console.error('💥 [异常] 执行代码更新流程发生未捕获异常:', {
        projectId: id,
        error: error.message,
        errorName: error.name,
        stack: error.stack,
        totalTime: totalExecutionTime + '秒'
      });

      // 记录失败日志
      if (userId) {
        try {
          await this.logHelper.logError(
            userId,
            'project',
            'project',
            '执行更新代码',
            '项目更新代码流程异常',
            error.message,
            { 
              projectId: id,
              totalTime: totalExecutionTime,
              step: '流程异常'
            },
            ipAddress,
            userAgent,
          );
          console.log('📝 [异常] 代码更新流程异常日志记录成功');
        } catch (logError) {
          console.error('⚠️ [警告] 创建代码更新流程异常日志失败:', logError.message);
        }
      }

      onError(`代码更新流程异常: ${error.message}`);
    }
  }

  // 获取项目更新日志
  async getProjectUpdateLogs(projectId: string, limit: number = 10): Promise<ProjectUpdateLog[]> {
    return await this.projectUpdateLogRepository.find({
      where: { projectId },
      order: { startTime: 'DESC' },
      take: limit
    });
  }

  // 获取项目当前更新状态
  async getProjectUpdateStatus(projectId: string): Promise<{ 
    status: ProjectUpdateStatus, 
    currentLog?: ProjectUpdateLog 
  }> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new Error('项目不存在');
    }

    let currentLog = null;
    if (project.currentUpdateLogId) {
      currentLog = await this.projectUpdateLogRepository.findOne({
        where: { id: project.currentUpdateLogId }
      });
    }

    return {
      status: project.currentUpdateStatus,
      currentLog
    };
  }

  // 获取项目更新代码日志
  async getProjectUpdateCodeLogs(projectId: string, limit: number = 10): Promise<ProjectUpdateCodeLog[]> {
    return await this.projectUpdateCodeLogRepository.find({
      where: { projectId },
      order: { startTime: 'DESC' },
      take: limit
    });
  }

  // 获取项目当前更新代码状态
  async getProjectUpdateCodeStatus(projectId: string): Promise<{ 
    status: ProjectUpdateStatus, 
    currentLog?: ProjectUpdateCodeLog 
  }> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new Error('项目不存在');
    }

    let currentLog = null;
    if (project.currentUpdateCodeLogId) {
      currentLog = await this.projectUpdateCodeLogRepository.findOne({
        where: { id: project.currentUpdateCodeLogId }
      });
    }

    return {
      status: project.currentUpdateCodeStatus,
      currentLog
    };
  }

  // 获取活跃项目列表（包含更新状态）
  async getActiveProjects(): Promise<Project[]> {
    return await this.projectRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'DESC', createdAt: 'DESC' }
    });
  }

  // 检查是否有项目正在更新（用于判断移动端可用状态）
  async isMobileAvailable(): Promise<{ available: boolean; updatingProjects: string[] }> {
    const updatingProjects = await this.projectRepository.find({
      where: [
        { 
          isActive: true, 
          currentUpdateStatus: ProjectUpdateStatus.UPDATING 
        },
        { 
          isActive: true, 
          currentUpdateCodeStatus: ProjectUpdateStatus.UPDATING 
        }
      ],
      select: ['id', 'name']
    });

    return {
      available: updatingProjects.length === 0,
      updatingProjects: updatingProjects.map(p => p.name)
    };
  }



// 3) 新增方法：获取打包状态
async getProjectPackageStatus(projectId: string): Promise<{
  status: ProjectUpdateStatus;
  downloadUrl: string | null;
  currentLog?: ProjectPackageLog | null;
}> {
  const project = await this.projectRepository.findOne({ where: { id: projectId } });
  if (!project) {
    throw new Error('项目不存在');
  }
  let currentLog: ProjectPackageLog | null = null;
  if (project.currentPackageLogId) {
    currentLog = await this.projectPackageLogRepository.findOne({
      where: { id: project.currentPackageLogId },
    });
  }
  return {
    status: project.currentPackageStatus,
    downloadUrl: project.packageDownloadUrl ?? null,
    currentLog,
  };
}

// 4) 新增方法：获取打包日志（limit为可选，默认10）
async getProjectPackageLogs(projectId: string, limit: number = 10): Promise<ProjectPackageLog[]> {
  return await this.projectPackageLogRepository.find({
    where: { projectId },
    order: { startTime: 'DESC' },
    take: limit,
  });
}

// 5) 新增方法：获取清缓存状态
async getClearCacheStatus(projectId: string): Promise<{
  status: ProjectUpdateStatus;
  currentLog?: ProjectCacheLog | null;
}> {
  const project = await this.projectRepository.findOne({ where: { id: projectId } });
  if (!project) {
    throw new Error('项目不存在');
  }
  let currentLog: ProjectCacheLog | null = null;
  if (project.currentClearCacheLogId) {
    currentLog = await this.projectCacheLogRepository.findOne({
      where: { id: project.currentClearCacheLogId },
    });
  }
  return {
    status: project.currentClearCacheStatus,
    currentLog,
  };
}

// 6) 新增方法：获取清缓存日志
async getClearCacheLogs(projectId: string, limit: number = 10): Promise<ProjectCacheLog[]> {
  return await this.projectCacheLogRepository.find({
    where: { projectId },
    order: { startTime: 'DESC' },
    take: limit,
  });
}


/** 触发「打 APK」，实时打印到控制台，并把 stdout/stderr 全量落库 */
async executePackageWithRealTimeOutput(projectId: string, userId?: string): Promise<{ logId: string }> {
  const project = await this.projectRepository.findOne({ where: { id: projectId } });
  if (!project) throw new NotFoundException('项目不存在');
  if (!project.enablePackage) throw new BadRequestException('该项目未启用打包功能');
  if (!project.packageCommand?.trim()) throw new BadRequestException('未配置打包命令');

  // 1) 新建日志，标记 updating
  const startTime = new Date();
  const log = await this.projectPackageLogRepository.save(
    this.projectPackageLogRepository.create({
      projectId,
      status: ProjectUpdateStatus.UPDATING,
      startedBy: userId ?? 'anonymous',
      startTime,
      stdout: '',
      stderr: '',
    }),
  );

  project.currentPackageStatus = ProjectUpdateStatus.UPDATING;
  project.currentPackageLogId = log.id;
  await this.projectRepository.save(project);

  // 2) 执行命令
  let stdoutBuf = '';
  let stderrBuf = '';
  const cwd = project.packageDirectory || project.updateDirectory || process.cwd();

  // 控制台标记，便于你在服务器里看到
  console.log(`[package] [${project.name}] cwd=${cwd}`);
  console.log(`[package] [${project.name}] command="${project.packageCommand}"`);

  this.runCommand({
    command: project.packageCommand!,
    cwd,
    onStdout: (s) => {
      stdoutBuf += s;
      // 立刻打印到服务器控制台（可看到实时输出）
      for (const line of s.split(/\r?\n/)) {
        if (line.trim()) console.log(`[package][stdout] ${line}`);
      }
    },
    onStderr: (s) => {
      stderrBuf += s;
      for (const line of s.split(/\r?\n/)) {
        if (line.trim()) console.error(`[package][stderr] ${line}`);
      }
    },
    onError: async (err) => {
      // spawn 失败（命令不存在、权限不足等），也要落库并复位
      const endTime = new Date();
      const duration = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 1000));
      const msg = (err?.message || String(err) || 'spawn error');

      stderrBuf += `\n${msg}`;
      console.error(`[package][error] ${msg}`);

      await this.projectPackageLogRepository.update(
        { id: log.id },
        {
          status: ProjectUpdateStatus.IDLE,
          endTime,
          duration,
          exitCode: -1,
          errorMessage: msg,
          stdout: stdoutBuf,
          stderr: stderrBuf,
        },
      );
      project.currentPackageStatus = ProjectUpdateStatus.IDLE;
      await this.projectRepository.save(project);
    },
    onClose: async (code, signal) => {
      const endTime = new Date();
      const duration = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

      await this.projectPackageLogRepository.update(
        { id: log.id },
        {
          status: ProjectUpdateStatus.IDLE, // 结束回到 idle
          endTime,
          duration,
          exitCode: code ?? undefined,
          signal: signal ?? undefined,
          errorMessage: code === 0 ? null : (stderrBuf || '打包失败'),
          stdout: stdoutBuf,
          stderr: stderrBuf,
        },
      );

      project.currentPackageStatus = ProjectUpdateStatus.IDLE;
      await this.projectRepository.save(project);

      console.log(`[package] [${project.name}] done code=${code} signal=${signal}`);
    },
  });

  // 立即返回，不阻塞前端
  return { logId: log.id };
}













  // 广播项目状态变化
  private broadcastProjectStatus(projectId: string, status: ProjectUpdateStatus, updateLog?: ProjectUpdateLog, updateCodeLog?: ProjectUpdateCodeLog) {
    if (this.projectGateway?.server) {
      const room = `project-${projectId}`;
      
      // 判断移动端是否可用：只有在非更新状态时才可用
      const isMobileAvailable = status !== ProjectUpdateStatus.UPDATING;
      
      if (updateLog) {
        // 更新打包状态变化
        this.projectGateway.server.to(room).emit('projectStatusChanged', {
          projectId,
          status,
          updateLog,
          isMobileAvailable,
          timestamp: new Date().toISOString(),
          message: status === ProjectUpdateStatus.UPDATING 
            ? '项目正在更新打包中，手机版和iPad暂时不可用...' 
            : status === ProjectUpdateStatus.IDLE 
              ? '项目更新打包完成，移动端已恢复访问'
              : '项目状态已更新'
        });
      } else if (updateCodeLog) {
        // 更新代码状态变化
        this.projectGateway.server.to(room).emit('projectCodeStatusChanged', {
          projectId,
          status,
          updateCodeLog,
          isMobileAvailable,
          timestamp: new Date().toISOString(),
          message: status === ProjectUpdateStatus.UPDATING 
            ? '项目正在更新代码中，手机版和iPad暂时不可用...' 
            : status === ProjectUpdateStatus.IDLE 
              ? '项目代码更新完成，移动端已恢复访问'
              : '项目代码状态已更新'
        });
      }

      // 同时广播全局状态，让所有客户端都能接收到移动端状态变化
      this.projectGateway.server.emit('globalMobileStatusChanged', {
        projectId,
        isMobileAvailable,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 从输出文本中检测 SVN 版本号
   * @param output 输出文本
   * @param currentRevision 当前已检测到的版本号（避免重复检测）
   * @param source 输出源（用于日志标识）
   * @returns 检测到的版本号或null
   */
  private detectSvnRevision(output: string, currentRevision: number | null, source: string = 'stdout'): number | null {
    // 如果已经检测到版本号，就不再检测
    if (currentRevision) {
      return currentRevision;
    }

    const svnPatterns = [
      { pattern: /At revision (\d+)\./, name: 'At revision' },
      { pattern: /Updated to revision (\d+)\./, name: 'Updated to revision' },
      { pattern: /Revision: (\d+)/, name: 'Revision:' },
      { pattern: /svn update.*?revision (\d+)/i, name: 'svn update with revision' },
      { pattern: /\bSVN:\s*(\d+)/i, name: 'SVN: notation' },
      { pattern: /\brev(?:ision)?[\s:]\s*(\d+)/i, name: 'rev/revision notation' }
    ];

    // 打印完整输出用于调试
    console.log(`🔍 [SVN调试-${source}] 检查输出文本:`, {
      length: output.length,
      firstLine: output.split('\n')[0],
      containsRevision: output.includes('revision'),
      containsUpdated: output.includes('Updated'),
      containsAt: output.includes('At'),
      fullOutput: output
    });

    for (const { pattern, name } of svnPatterns) {
      const match = output.match(pattern);
      if (match) {
        const revision = parseInt(match[1], 10);
        
        // 验证版本号合理性：SVN 版本号通常在 1-100000 范围内
        if (revision > 0 && revision <= 100000) {
          console.log(`🔍 [SVN检测-${source}] 发现有效 SVN 版本号:`, {
            revision,
            matchedText: match[0],
            patternName: name,
            pattern: pattern.toString()
          });
          return revision;
        } else {
          console.log(`⚠️ [SVN检测-${source}] 跳过无效版本号:`, {
            revision,
            matchedText: match[0],
            patternName: name,
            reason: revision <= 0 ? '版本号必须大于0' : '版本号超出合理范围(1-100000)'
          });
        }
      }
    }

    return null;
  }
}
