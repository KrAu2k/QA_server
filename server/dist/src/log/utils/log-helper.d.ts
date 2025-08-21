import { LogService } from '../log.service';
export declare class LogHelper {
    private readonly logService;
    constructor(logService: LogService);
    logUserOperation(userId: string, app: string, model: string, action: string, content: string, billId?: number, status?: 'success' | 'error', requestData?: any, responseData?: any, errorMessage?: string, executionTime?: number, ipAddress?: string, userAgent?: string): Promise<import("../entities/log.entity").Log>;
    logCreate(userId: string, app: string, model: string, entityName: string, entityId: number, requestData?: any, responseData?: any, ipAddress?: string, userAgent?: string): Promise<import("../entities/log.entity").Log>;
    logUpdate(userId: string, app: string, model: string, entityName: string, entityId: number, requestData?: any, responseData?: any, ipAddress?: string, userAgent?: string): Promise<import("../entities/log.entity").Log>;
    logDelete(userId: string, app: string, model: string, entityName: string, entityId: number, requestData?: any, responseData?: any, ipAddress?: string, userAgent?: string): Promise<import("../entities/log.entity").Log>;
    logQuery(userId: string, app: string, model: string, queryType: '列表' | '详情' | '统计', requestData?: any, responseData?: any, ipAddress?: string, userAgent?: string): Promise<import("../entities/log.entity").Log>;
    logAudit(userId: string, app: string, model: string, entityName: string, entityId: number, auditAction: '审核通过' | '审核拒绝', requestData?: any, responseData?: any, ipAddress?: string, userAgent?: string): Promise<import("../entities/log.entity").Log>;
    logError(userId: string, app: string, model: string, action: string, content: string, errorMessage: string, requestData?: any, ipAddress?: string, userAgent?: string): Promise<import("../entities/log.entity").Log>;
}
