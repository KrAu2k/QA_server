import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class UserStatusInterceptor implements NestInterceptor {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 跳过登录和公开接口
    const isAuthEndpoint = request.url.includes('/auth/login');
    if (isAuthEndpoint || !authHeader) {
      return next.handle();
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findByEmployeeNo(payload.sub);
      
      if (user && !user.isActive) {
        throw new UnauthorizedException({
          code: 'USER_DISABLED',
          message: '用户账号已被禁用，无法访问系统',
          success: false,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      if (error.message?.includes('USER_DISABLED') || error.code === 'USER_DISABLED') {
        throw error;
      }
      // 其他JWT错误不在这里处理，让原有的认证流程处理
    }

    return next.handle();
  }
}
