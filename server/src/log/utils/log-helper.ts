import { Injectable } from '@nestjs/common';
import { LogService } from '../log.service';

@Injectable()
export class LogHelper {
  constructor(private readonly logService: LogService) {}

  /**
   * 记录用户操作日志
   */
  async logUserOperation(
    userId: string,
    app: string,
    model: string,
    action: string,
    content: string,
    billId?: number,
    status: 'success' | 'error' = 'success',
    requestData?: any,
    responseData?: any,
    errorMessage?: string,
    executionTime?: number,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.logService.logOperation(
      app,
      model,
      action,
      content,
      userId,
      billId,
      status,
      requestData,
      responseData,
      errorMessage,
      executionTime,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 记录创建操作
   */
  async logCreate(
    userId: string,
    app: string,
    model: string,
    entityName: string,
    entityId: number,
    requestData?: any,
    responseData?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.logService.logOperation(
      app,
      model,
      '创建',
      `创建${entityName}，ID: ${entityId}`,
      userId,
      entityId,
      'success',
      requestData,
      responseData,
      undefined,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 记录更新操作
   */
  async logUpdate(
    userId: string,
    app: string,
    model: string,
    entityName: string,
    entityId: number,
    requestData?: any,
    responseData?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.logService.logOperation(
      app,
      model,
      '更新',
      `更新${entityName}，ID: ${entityId}`,
      userId,
      entityId,
      'success',
      requestData,
      responseData,
      undefined,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 记录删除操作
   */
  async logDelete(
    userId: string,
    app: string,
    model: string,
    entityName: string,
    entityId: number,
    requestData?: any,
    responseData?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.logService.logOperation(
      app,
      model,
      '删除',
      `删除${entityName}，ID: ${entityId}`,
      userId,
      entityId,
      'success',
      requestData,
      responseData,
      undefined,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 记录查询操作
   */
  async logQuery(
    userId: string,
    app: string,
    model: string,
    queryType: '列表' | '详情' | '统计',
    requestData?: any,
    responseData?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.logService.logOperation(
      app,
      model,
      '查询',
      `查询${model}${queryType}`,
      userId,
      undefined,
      'success',
      requestData,
      responseData,
      undefined,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 记录审核操作
   */
  async logAudit(
    userId: string,
    app: string,
    model: string,
    entityName: string,
    entityId: number,
    auditAction: '审核通过' | '审核拒绝',
    requestData?: any,
    responseData?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.logService.logOperation(
      app,
      model,
      '审核',
      `${auditAction}${entityName}，ID: ${entityId}`,
      userId,
      entityId,
      'success',
      requestData,
      responseData,
      undefined,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 记录错误操作
   */
  async logError(
    userId: string,
    app: string,
    model: string,
    action: string,
    content: string,
    errorMessage: string,
    requestData?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.logService.logOperation(
      app,
      model,
      action,
      content,
      userId,
      undefined,
      'error',
      requestData,
      undefined,
      errorMessage,
      undefined,
      ipAddress,
      userAgent,
    );
  }
} 