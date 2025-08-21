import { Injectable, UnauthorizedException } from '@nestjs/common'; // 从 @nestjs/common 导入 Injectable 和 UnauthorizedException
import { JwtService } from '@nestjs/jwt'; // 从 @nestjs/jwt 导入 JwtService
import { UserService } from '../user/user.service'; // 从本地路径导入 UserService
import { LogService } from '../log/log.service'; // 导入日志服务
// 导入 bcryptjs 用于密码加密和验证
import * as bcrypt from 'bcryptjs'; // 导入 bcryptjs 库用于密码加密和验证


@Injectable() // 标记这个类可以被注入
export class AuthService {
  constructor(
    private readonly userService: UserService, // 注入 UserService
    private readonly jwtService: JwtService, // 注入 JwtService
    private readonly logService: LogService, // 注入日志服务
  ) {}

  async validateUser(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<any> {
    try {
      const user = await this.userService.findByUsername(username); // 根据用户名查找用户
      console.log('bcrypt', await bcrypt.hash(password, 10)); // 打印加密后的密码
      
      if (user && (await bcrypt.compare(password, user.password))) { // 比较密码是否匹配
        // 检查用户是否被激活
        if (!user.isActive) {
          // 记录登录失败日志
          await this.logService.logLogin(
            String(user.id),
            username,
            'error',
            ipAddress,
            userAgent,
            '账户已被禁用'
          );
          throw new UnauthorizedException('账户已被禁用，请联系管理员');
        }
        
        // 记录登录成功日志
        await this.logService.logLogin(
          String(user.id),
          username,
          'success',
          ipAddress,
          userAgent
        );
        
        const { password, ...result } = user; // 去除密码字段
        return result; // 返回用户信息
      }
      
      // 记录登录失败日志
      await this.logService.logLogin(
        'unknown',
        username,
        'error',
        ipAddress,
        userAgent,
        '用户名或密码错误'
      );
      
      throw new UnauthorizedException('Invalid username or password'); // 抛出未授权异常
    } catch (error) {
      // 如果是 UnauthorizedException，直接抛出
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // 记录其他错误
      await this.logService.logLogin(
        'unknown',
        username,
        'error',
        ipAddress,
        userAgent,
        error.message || '登录过程中发生错误'
      );
      
      throw new UnauthorizedException('登录失败，请稍后重试');
    }
  }

  async login(user: any, ipAddress?: string, userAgent?: string) {
    const payload = { username: user.username, sub: user.id }; // 创建 JWT 负载，使用主键 id 而不是 userid

    return {
      status: 'ok',
      token: this.jwtService.sign(payload, { expiresIn: '150m' }), // 签发 15 分钟过期的访问令牌
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }), // 签发 7 天过期的刷新令牌
    };
  }

  async logout(userId: string, username: string, ipAddress?: string, userAgent?: string) {
    // 记录登出日志
    await this.logService.logLogout(userId, username, ipAddress, userAgent);
    
    return {
      success: true,
      message: '登出成功'
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken); // 验证刷新令牌
      const user = await this.userService.findByUsername(payload.username); // 根据用户名查找用户

      if (!user) throw new UnauthorizedException('User not found'); // 如果用户不存在，抛出未授权异常
      
      const newPayload = { username: user.username, sub: user.id }; // 创建新的 JWT 负载，使用主键 id

      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '1d' }), // 签发 1 天过期的访问令牌
        refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }), // 签发 7 天过期的刷新令牌
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token'); // 抛出未授权异常
    }
  }

  //currentUser
  async currentUser(token: string) {
    try {
      console.log('token', token);
      const payload = this.jwtService.verify(token); // 验证访问令牌
      console.log('payload', payload);
      const user = await this.userService.findByUsername(payload.username); // 根据用户名查找用户
      if (!user) throw new UnauthorizedException('User not found'); // 如果用户不存在，抛出未授权异常
      
      // 从用户对象中移除密码等敏感信息，但保留isAdmin字段
      const { password, ...safeUserData } = user;
      
      return { 
        success: true,
        data: {
          ...safeUserData,
          isAdmin: user.isAdmin // 确保isAdmin字段被包含
        }
      }; // 返回安全的用户信息（不包含密码）
    } catch (err) {
      console.log('err', err);
      throw new UnauthorizedException('Invalid token'); // 抛出未授权异常
    }
  }
}
