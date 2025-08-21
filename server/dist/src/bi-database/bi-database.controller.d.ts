import { BiDatabaseService } from './bi-database.service';
export declare class BiDatabaseController {
    private readonly biDatabaseService;
    constructor(biDatabaseService: BiDatabaseService);
    testConnection(): Promise<{
        success: boolean;
        message: string;
        tables: string[];
    } | {
        success: boolean;
        message: any;
        tables?: undefined;
    }>;
    getDashboard(): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    getOptionRc003(page?: string, pageSize?: string): Promise<{
        data: any[];
        total: number;
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    getAppUserRc003(page?: string, pageSize?: string): Promise<{
        data: any[];
        total: number;
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    getPayDataRc003(page?: string, pageSize?: string): Promise<{
        data: any[];
        total: number;
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
    getDailyUserRc003(page?: string, pageSize?: string): Promise<{
        data: any[];
        total: number;
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
    }>;
}
