import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Log } from './entities/log.entity';
import { User } from '../user/entities/user.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { QueryLogDto } from './dto/query-log.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  /**
   * 创建日志记录
   */
  async createLog(createLogDto: CreateLogDto): Promise<Log> {
    const log = this.logRepository.create(createLogDto);
    return this.logRepository.save(log);
  }

  /**
   * 记录操作日志
   */
  async logOperation(
    app: string,
    model: string,
    action: string,
    content: string,
    userId?: string,
    billId?: number,
    status: 'success' | 'error' = 'success',
    requestData?: any,
    responseData?: any,
    errorMessage?: string,
    executionTime?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Log> {
    // 如果提供了用户ID，验证用户是否存在
    let validUserId: string | null = null;
    if (userId) {
      try {
        // 直接按主键 id 查找用户（JWT 中的 userId 就是主键 id）
        const user = await this.logRepository.manager.getRepository(User).findOne({ 
          where: { id: parseInt(userId) } 
        });
        
        if (user) {
          validUserId = String(user.id); // 使用用户的主键 id 作为日志中的 userId
        } else {
          console.log(`用户 id=${userId} 不存在，将在日志中设置为 null`);
        }
      } catch (error) {
        console.error('验证用户时发生错误:', error);
      }
    }

    const logData: CreateLogDto = {
      app,
      model,
      action,
      content,
      userId: validUserId,
      billId,
      status,
      requestData,
      responseData,
      errorMessage,
      executionTime,
      ipAddress,
      userAgent,
    };

    return this.createLog(logData);
  }

  /**
   * 记录用户登录日志
   */
  async logLogin(
    userId: string,
    username: string,
    status: 'success' | 'error',
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string,
  ): Promise<Log> {
    const content = status === 'success' 
      ? `用户 ${username} 登录成功`
      : `用户 ${username} 登录失败: ${errorMessage}`;

    return this.logOperation(
      'auth',
      'user',
      'login',
      content,
      userId,
      undefined,
      status,
      undefined,
      undefined,
      errorMessage,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 记录用户登出日志
   */
  async logLogout(
    userId: string,
    username: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Log> {
    return this.logOperation(
      'auth',
      'user',
      'logout',
      `用户 ${username} 登出`,
      userId,
      undefined,
      'success',
      undefined,
      undefined,
      undefined,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 查询日志列表
   */
  async findAll(query: QueryLogDto): Promise<{ data: any[]; total: number }> {
    const {
      current = 1,
      pageSize = 20,
      app,
      model,
      action,
      status,
      userId,
      userName,
      startDate,
      endDate,
      keyword,
    } = query;

    const page = Number(current);
    const size = Number(pageSize);
    
    // 构建查询条件
    const where: any = {};
    
    if (app) {
      where.app = Like(`%${app}%`);
    }
    
    if (model) {
      where.model = Like(`%${model}%`);
    }
    
    if (action) {
      where.action = Like(`%${action}%`);
    }
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }

    // 日期范围查询
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt = Between(new Date(startDate), where.createdAt || new Date());
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt = Between(where.createdAt || new Date(0), endDateTime);
      }
    }

    // 关键词搜索
    let queryBuilder = this.logRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where(where);

    if (keyword) {
      queryBuilder = queryBuilder.andWhere(
        '(log.content LIKE :keyword OR log.action LIKE :keyword OR user.name LIKE :keyword OR user.username LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    // 用户名查询
    if (userName) {
      queryBuilder = queryBuilder.andWhere(
        '(user.name LIKE :userName OR user.username LIKE :userName)',
        { userName: `%${userName}%` }
      );
    }

    const [logs, total] = await queryBuilder
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    // 添加用户信息
    const logsWithUser = logs.map(log => ({
      ...log,
      userName: log.user?.name || '未知用户',
      userEmail: log.user?.email || '',
    }));

    return {
      data: logsWithUser,
      total,
    };
  }

  /**
   * 根据ID查询日志详情
   */
  async findOne(id: number): Promise<any> {
    const log = await this.logRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!log) {
      throw new Error(`日志记录不存在: ${id}`);
    }

    return {
      ...log,
      userName: log.user?.name || '未知用户',
      userEmail: log.user?.email || '',
    };
  }

  /**
   * 删除日志记录
   */
  async deleteLog(id: number): Promise<void> {
    await this.logRepository.delete(id);
  }

  /**
   * 批量删除日志记录
   */
  async batchDeleteLogs(ids: number[]): Promise<void> {
    await this.logRepository.delete(ids);
  }

  /**
   * 清理过期日志
   */
  async cleanExpiredLogs(days: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.logRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * 获取日志统计信息
   */
  async getLogStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayLogs, yesterdayLogs, totalLogs, errorLogs] = await Promise.all([
      this.logRepository.count({ where: { createdAt: Between(today, new Date()) } }),
      this.logRepository.count({ where: { createdAt: Between(yesterday, today) } }),
      this.logRepository.count(),
      this.logRepository.count({ where: { status: 'error' } }),
    ]);

    return {
      todayLogs,
      yesterdayLogs,
      totalLogs,
      errorLogs,
      successRate: totalLogs > 0 ? ((totalLogs - errorLogs) / totalLogs * 100).toFixed(2) : '100.00',
    };
  }

  /**
   * 获取操作用户列表
   */
  async getLogUsers(): Promise<any[]> {
    const users = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .select([
        'DISTINCT user.id as userId',
        'user.name as userName',
        'user.username as userUsername',
        'user.email as userEmail'
      ])
      .where('user.id IS NOT NULL')
      .orderBy('user.name', 'ASC')
      .getRawMany();

    return users.map(user => ({
      userId: user.userId,
      userName: user.userName || user.userUsername || '未知用户',
      userUsername: user.userUsername,
      userEmail: user.userEmail,
    }));
  }

  /**
   * 获取用户登录日志
   */
  async getUserLoginLogs(userId: string, limit: number = 10): Promise<any[]> {
    const logs = await this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.userId = :userId', { userId })
      .andWhere('log.app = :app', { app: 'auth' })
      .andWhere('log.action IN (:...actions)', { actions: ['login', 'logout'] })
      .orderBy('log.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return logs.map(log => ({
      id: log.id,
      action: log.action,
      status: log.status,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      content: log.content,
      createdAt: log.createdAt,
      errorMessage: log.errorMessage,
    }));
  }
}