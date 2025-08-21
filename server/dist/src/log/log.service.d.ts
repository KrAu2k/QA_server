import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { QueryLogDto } from './dto/query-log.dto';
export declare class LogService {
    private logRepository;
    constructor(logRepository: Repository<Log>);
    createLog(createLogDto: CreateLogDto): Promise<Log>;
    logOperation(app: string, model: string, action: string, content: string, userId?: string, billId?: number, status?: 'success' | 'error', requestData?: any, responseData?: any, errorMessage?: string, executionTime?: number, ipAddress?: string, userAgent?: string): Promise<Log>;
    logLogin(userId: string, username: string, status: 'success' | 'error', ipAddress?: string, userAgent?: string, errorMessage?: string): Promise<Log>;
    logLogout(userId: string, username: string, ipAddress?: string, userAgent?: string): Promise<Log>;
    findAll(query: QueryLogDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(id: number): Promise<any>;
    deleteLog(id: number): Promise<void>;
    batchDeleteLogs(ids: number[]): Promise<void>;
    cleanExpiredLogs(days?: number): Promise<number>;
    getLogStats(): Promise<any>;
    getLogUsers(): Promise<any[]>;
    getUserLoginLogs(userId: string, limit?: number): Promise<any[]>;
}
