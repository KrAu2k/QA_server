export declare class CreateLogDto {
    app: string;
    model: string;
    action: string;
    content: string;
    userId?: string;
    billId?: number;
    status?: 'success' | 'error';
    ipAddress?: string;
    userAgent?: string;
    requestData?: any;
    responseData?: any;
    errorMessage?: string;
    executionTime?: number;
}
