import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findByEmployeeNo(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      if (!user.isActive) {
        throw new UnauthorizedException({
          code: 'USER_DISABLED',
          message: '用户账号已被禁用，请联系管理员',
          timestamp: new Date().toISOString(),
        });
      }

      // 将用户信息添加到请求对象中
      request.user = user;
      return true;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('无效的认证令牌');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('认证令牌已过期');
      }
      throw error;
    }
  }
}
