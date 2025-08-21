export declare class QueryLogDto {
    current?: string;
    pageSize?: string;
    app?: string;
    model?: string;
    action?: string;
    status?: 'success' | 'error';
    userId?: string;
    userName?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
}
