import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { QueryLogDto } from './dto/query-log.dto';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
    create(createLogDto: CreateLogDto): Promise<{
        data: import("./entities/log.entity").Log;
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    findAll(query: QueryLogDto): Promise<{
        data: any[];
        total: number;
        success: boolean;
        message: string;
    } | {
        data: any[];
        total: number;
        success: boolean;
        message: any;
    }>;
    getLogUsers(): Promise<{
        data: any[];
        success: boolean;
        message: string;
    } | {
        data: any[];
        success: boolean;
        message: any;
    }>;
    getUserLoginLogs(userId: string, limit?: string): Promise<{
        data: any[];
        success: boolean;
        message: string;
    } | {
        data: any[];
        success: boolean;
        message: any;
    }>;
    getStats(): Promise<{
        data: any;
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    findOne(id: string): Promise<{
        data: any;
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: any;
    }>;
    batchDelete(body: {
        ids: number[];
    }): Promise<{
        success: boolean;
        message: any;
    }>;
    cleanExpired(body: {
        days?: number;
    }): Promise<{
        data: {
            deletedCount: number;
        };
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
