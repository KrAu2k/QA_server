export declare class BiDatabaseService {
    private connection;
    connect(): Promise<boolean>;
    query(sql: string, params?: any[]): Promise<any[]>;
    getTables(): Promise<string[]>;
    getTableData(tableName: string, limit?: number): Promise<any[]>;
    getOptionRc003Data(page?: number, pageSize?: number): Promise<{
        data: any[];
        total: number;
    }>;
    getAppUserRc003Data(page?: number, pageSize?: number): Promise<{
        data: any[];
        total: number;
    }>;
    getDwdAppPayRc003Data(page?: number, pageSize?: number): Promise<{
        data: any[];
        total: number;
    }>;
    getDwdAppDailyUserRc003Data(page?: number, pageSize?: number): Promise<{
        data: any[];
        total: number;
    }>;
    getDashboardData(): Promise<any>;
    disconnect(): Promise<void>;
}
