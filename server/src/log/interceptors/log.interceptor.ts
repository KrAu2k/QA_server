import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LogService } from '../log.service';
import { Request } from 'express';

// 扩展 Request 类型以包含用户信息
interface RequestWithUser extends Request {
  user?: {
    id: string;
    username?: string;
    name?: string;
  };
}

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url, body, user, headers } = request;
    const startTime = Date.now();

    // 获取用户信息
    const userId = user?.id;
    const username = user?.username || user?.name || '未知用户';

    // 获取客户端信息
    const ipAddress = this.getClientIp(request);
    const userAgent = headers['user-agent'];

    // 解析操作信息
    const operationInfo = this.parseOperationInfo(method, url);

    return next.handle().pipe(
      tap((response) => {
        // 记录成功操作
        const executionTime = Date.now() - startTime;
        this.logService.logOperation(
          operationInfo.app,
          operationInfo.model,
          operationInfo.action,
          operationInfo.content,
          userId,
          operationInfo.billId,
          'success',
          this.sanitizeRequestData(body),
          this.sanitizeResponseData(response),
          undefined,
          executionTime,
          ipAddress,
          userAgent,
        );
      }),
      catchError((error) => {
        // 记录失败操作
        const executionTime = Date.now() - startTime;
        this.logService.logOperation(
          operationInfo.app,
          operationInfo.model,
          operationInfo.action,
          operationInfo.content,
          userId,
          operationInfo.billId,
          'error',
          this.sanitizeRequestData(body),
          undefined,
          error.message || '操作失败',
          executionTime,
          ipAddress,
          userAgent,
        );
        throw error;
      }),
    );
  }

  private getClientIp(request: RequestWithUser): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    ) as string;
  }

  private parseOperationInfo(method: string, url: string) {
    const urlParts = url.split('/').filter(Boolean);
    
    // 默认值
    let app = 'system';
    let model = 'unknown';
    let action = 'unknown';
    let content = `${method} ${url}`;
    let billId: number | undefined;

    // 解析 URL 路径
    if (urlParts.length >= 2) {
      app = urlParts[0]; // 第一个部分通常是应用模块
      
      if (urlParts.length >= 3) {
        model = urlParts[1]; // 第二个部分通常是模型
        
        // 解析操作类型
        if (method === 'GET') {
          if (urlParts.length === 2) {
            action = '查询列表';
            content = `查询${model}列表`;
          } else if (urlParts[2] === 'stats') {
            action = '查询统计';
            content = `查询${model}统计信息`;
          } else {
            action = '查询详情';
            content = `查询${model}详情，ID: ${urlParts[2]}`;
            billId = parseInt(urlParts[2]);
          }
        } else if (method === 'POST') {
          if (urlParts[2] === 'batch-delete') {
            action = '批量删除';
            content = `批量删除${model}`;
          } else if (urlParts[2] === 'clean-expired') {
            action = '清理过期';
            content = `清理过期${model}`;
          } else if (urlParts[2] === 'login') {
            action = '用户登录';
            content = '用户登录';
            app = 'auth';
            model = 'user';
          } else if (urlParts[2] === 'logout') {
            action = '用户登出';
            content = '用户登出';
            app = 'auth';
            model = 'user';
          } else {
            action = '创建';
            content = `创建${model}`;
          }
        } else if (method === 'PUT') {
          if (urlParts[2] === 'toggle-status') {
            action = '切换状态';
            content = `切换${model}状态`;
          } else {
            action = '更新';
            content = `更新${model}，ID: ${urlParts[2]}`;
            billId = parseInt(urlParts[2]);
          }
        } else if (method === 'DELETE') {
          action = '删除';
          content = `删除${model}，ID: ${urlParts[2]}`;
          billId = parseInt(urlParts[2]);
        }
      }
    }

    return { app, model, action, content, billId };
  }

  private sanitizeRequestData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // 移除敏感信息
    if (sanitized.password) {
      sanitized.password = '***';
    }
    
    if (sanitized.token) {
      sanitized.token = '***';
    }
    
    return sanitized;
  }

  private sanitizeResponseData(data: any): any {
    if (!data) return data;
    
    // 只保留关键信息，避免日志过大
    if (typeof data === 'object') {
      const sanitized: any = {};
      
      if (data.success !== undefined) sanitized.success = data.success;
      if (data.message) sanitized.message = data.message;
      if (data.total !== undefined) sanitized.total = data.total;
      
      // 如果是数据列表，只保留数量信息
      if (Array.isArray(data.data)) {
        sanitized.dataCount = data.data.length;
      } else if (data.data && typeof data.data === 'object') {
        // 如果是单个对象，保留 ID 等关键信息
        if (data.data.id) sanitized.dataId = data.data.id;
        if (data.data.name) sanitized.dataName = data.data.name;
      }
      
      return sanitized;
    }
    
    return data;
  }
} 