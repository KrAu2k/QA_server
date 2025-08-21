import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { LogHelper } from '../log/utils/log-helper';
// 导入 bcryptjs 库用于密码加密和验证
import * as bcrypt from 'bcryptjs'; // 导入 bcryptjs 库用于密码加密和验证

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly logHelper: LogHelper,
  ) {}

  async createUser(data: Partial<User>, userId?: string, ipAddress?: string, userAgent?: string): Promise<User> {
    try {
      // 对密码进行哈希处理
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      const user = this.userRepository.create(data);
      const savedUser = await this.userRepository.save(user);

      // 记录创建日志
      if (userId) {
        await this.logHelper.logCreate(
          userId,
          'user',
          'user',
          '用户',
          savedUser.id,
          { ...data, password: '***' }, // 隐藏密码
          { id: savedUser.id, username: savedUser.username, name: savedUser.name },
          ipAddress,
          userAgent,
        );
      }

      return savedUser;
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'user',
          'user',
          '创建用户',
          '创建用户失败',
          error.message,
          { ...data, password: '***' },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async findAll(userId?: string, ipAddress?: string, userAgent?: string): Promise<User[]> { 
    try {
      const users = await this.userRepository.find({
        select: [
          'id', 'name', 'username', 'avatar', 'employeeNo', 'email', 
          'signature', 'title', 'group', 'tags', 'notifyCount', 
          'unreadCount', 'country', 'access', 'geographic', 
          'address', 'phone', 'isActive', 'createdAt',
          'departmentId', 'position', 'joinDate', 'isAdmin'
        ],
        relations: ['department']
      });
      
      // 添加部门名称
      const result = users.map(user => ({
        ...user,
        departmentName: user.department?.name || null
      })) as any[];

      // 记录查询日志
      if (userId) {
        await this.logHelper.logQuery(
          userId,
          'user',
          'user',
          '列表',
          undefined,
          { count: result.length },
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
          'user',
          'user',
          '查询用户列表',
          '查询用户列表失败',
          error.message,
          undefined,
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async findOne(id: number, userId?: string, ipAddress?: string, userAgent?: string): Promise<User> {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
    
      const user = await this.userRepository.findOne({ 
        where: { id },
        select: [
          'id', 'name', 'username', 'avatar', 'employeeNo', 'email', 
          'signature', 'title', 'group', 'tags', 'notifyCount', 
          'unreadCount', 'country', 'access', 'geographic', 
          'address', 'phone', 'isActive', 'createdAt', 'updatedAt',
          'departmentId', 'position', 'joinDate', 'isAdmin'
        ],
        relations: ['department']
      });
      
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      // 添加部门名称
      const result = {
        ...user,
        departmentName: user.department?.name || null
      } as any;

      // 记录查询日志
      if (userId) {
        await this.logHelper.logQuery(
          userId,
          'user',
          'user',
          '详情',
          { id },
          { id: result.id, username: result.username, name: result.name },
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
          'user',
          'user',
          '查询用户详情',
          '查询用户详情失败',
          error.message,
          { id },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: { username },
      select: [
        'id', 'name', 'username', 'password', 'avatar', 'employeeNo', 'email', 
        'signature', 'title', 'group', 'tags', 'notifyCount', 
        'unreadCount', 'country', 'access', 'geographic', 
        'address', 'phone', 'isActive', 'createdAt', 'updatedAt',
        'departmentId', 'position', 'joinDate', 'isAdmin'
      ],
      relations: ['department']
    });
  }

  async findByEmployeeNo(employeeNo: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: { employeeNo },
      select: [
        'id', 'name', 'username', 'password', 'avatar', 'employeeNo', 'email', 
        'signature', 'title', 'group', 'tags', 'notifyCount', 
        'unreadCount', 'country', 'access', 'geographic', 
        'address', 'phone', 'isActive', 'createdAt', 'updatedAt',
        'departmentId', 'position', 'joinDate', 'isAdmin'
      ],
      relations: ['department']
    });
  }



  async updateUser(id: number, data: Partial<User>, userId?: string, ipAddress?: string, userAgent?: string): Promise<User> {
    try {
      // 如果更新密码，对密码进行哈希处理
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      
      // 更新用户数据
      await this.userRepository.update(id, data);
      
      // 返回更新后的用户信息（包含部门信息）
      const result = await this.findOne(id);

      // 记录更新日志
      if (userId) {
        await this.logHelper.logUpdate(
          userId,
          'user',
          'user',
          '用户',
          id,
          { ...data, password: data.password ? '***' : undefined },
          { id: result.id, username: result.username, name: result.name },
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
          'user',
          'user',
          '更新用户',
          '更新用户失败',
          error.message,
          { id, ...data, password: data.password ? '***' : undefined },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async deleteUser(id: number, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // 先获取用户信息用于日志记录
      const user = await this.userRepository.findOne({ 
        where: { id },
        select: ['id', 'name', 'username', 'isAdmin']
      });
      
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      await this.userRepository.delete(id);

      // 记录删除日志
      if (userId) {
        await this.logHelper.logDelete(
          userId,
          'user',
          'user',
          '用户',
          0, // UUID类型的ID无法转换为数字，使用0作为占位符
          { id },
          { id: user.id, username: user.username, name: user.name },
          ipAddress,
          userAgent,
        );
      }
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'user',
          'user',
          '删除用户',
          '删除用户失败',
          error.message,
          { id },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async findAllWithPagination(query: QueryUserDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<{ data: User[], total: number }> {
    try {
      const {
        current = 1,
        pageSize = 10,
        name,
        username,
        email,
        employeeNo,
        phone,
        group,
        title,
        isActive
      } = query;

      const page = Number(current);
      const size = Number(pageSize);
      
      // 构建查询条件
      const where: any = {};
      
      if (name) {
        where.name = Like(`%${name}%`);
      }
      
      if (username) {
        where.username = Like(`%${username}%`);
      }
      
      if (email) {
        where.email = Like(`%${email}%`);
      }
      
      if (employeeNo) {
        where.employeeNo = Like(`%${employeeNo}%`);
      }
      
      if (phone) {
        where.phone = Like(`%${phone}%`);
      }
      
      if (group) {
        where.group = Like(`%${group}%`);
      }
      
      if (title) {
        where.title = Like(`%${title}%`);
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [users, total] = await this.userRepository.findAndCount({
        where,
        select: [
          'id', 'name', 'username', 'avatar', 'employeeNo', 'email', 
          'signature', 'title', 'group', 'tags', 'notifyCount', 
          'unreadCount', 'country', 'access', 'geographic', 
          'address', 'phone', 'isActive', 'createdAt',
          'departmentId', 'position', 'joinDate', 'isAdmin'
        ],
        relations: ['department'],
        skip: (page - 1) * size,
        take: size,
        order: { createdAt: 'DESC' }
      });

      // 添加部门名称
      const usersWithDepartment = users.map(user => ({
        ...user,
        departmentName: user.department?.name || null
      }));

      const result = {
        data: usersWithDepartment as any[],
        total
      };

      // 记录查询日志
      if (userId) {
        await this.logHelper.logQuery(
          userId,
          'user',
          'user',
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
          'user',
          'user',
          '查询用户列表',
          '查询用户列表失败',
          error.message,
          query,
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  async batchUpdateStatus(ids: number[], isActive: boolean, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No IDs provided for batch update');
      }
      
      // 使用简单的for循环来确保每个更新都能正确执行
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        await this.userRepository.update(id, { isActive: isActive });
      }

      // 记录批量更新日志
      if (userId) {
        await this.logHelper.logUserOperation(
          userId,
          'user',
          'user',
          '批量更新状态',
          `批量${isActive ? '启用' : '禁用'}用户，共 ${ids.length} 个用户`,
          undefined,
          'success',
          { ids, isActive },
          { updatedCount: ids.length },
          undefined,
          undefined,
          ipAddress,
          userAgent,
        );
      }
    } catch (error) {
      // 记录错误日志
      if (userId) {
        await this.logHelper.logError(
          userId,
          'user',
          'user',
          '批量更新状态',
          '批量更新用户状态失败',
          error.message,
          { ids, isActive },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  // 修改密码（用户自己修改）
  async changePassword(userId: number, oldPassword: string, newPassword: string, requestUserId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // 查找用户
      const user = await this.userRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'username', 'password', 'name']
      });
      
      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证旧密码
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new Error('原密码错误');
      }

      // 加密新密码
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await this.userRepository.update(userId, { password: hashedNewPassword });

      // 记录密码修改日志
      if (requestUserId) {
        await this.logHelper.logUpdate(
          requestUserId,
          'user',
          'user',
          '用户密码',
          userId,
          { action: '密码修改' },
          { id: user.id, username: user.username, name: user.name },
          ipAddress,
          userAgent,
        );
      }
    } catch (error) {
      // 记录错误日志
      if (requestUserId) {
        await this.logHelper.logError(
          requestUserId,
          'user',
          'user',
          '修改密码',
          '密码修改失败',
          error.message,
          { userId },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }

  // 管理员重置密码
  async adminResetPassword(userId: number, newPassword: string, adminUserId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // 查找用户
      const user = await this.userRepository.findOne({ 
        where: { id: userId },
        select: ['id', 'username', 'name', 'employeeNo']
      });
      
      if (!user) {
        throw new Error('用户不存在');
      }

      // 加密新密码
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await this.userRepository.update(userId, { password: hashedNewPassword });

      // 记录密码重置日志
      if (adminUserId) {
        await this.logHelper.logUpdate(
          adminUserId,
          'user',
          'user',
          '用户密码',
          user.id,
          { action: '管理员重置密码' },
          { id: user.id, username: user.username, name: user.name },
          ipAddress,
          userAgent,
        );
      }
    } catch (error) {
      // 记录错误日志
      if (adminUserId) {
        await this.logHelper.logError(
          adminUserId,
          'user',
          'user',
          '重置密码',
          '重置密码失败',
          error.message,
          { userId },
          ipAddress,
          userAgent,
        );
      }
      throw error;
    }
  }
}
