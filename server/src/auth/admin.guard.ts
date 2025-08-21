import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RequestWithUser extends Request {
  user: {
    userId?: string;
    id?: string;
    isAdmin: boolean;
    [key: string]: any;
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    if (!user.isAdmin) {
      throw new ForbiddenException('需要管理员权限');
    }

    return true;
  }
}
