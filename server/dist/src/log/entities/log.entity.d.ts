import { User } from '../../user/entities/user.entity';
export declare class Log {
    id: number;
    app: string;
    model: string;
    billId?: number;
    action: string;
    content: string;
    status: string;
    ipAddress?: string;
    userAgent?: string;
    requestData?: any;
    responseData?: any;
    errorMessage?: string;
    executionTime?: number;
    userId?: string;
    user?: User;
    createdAt: Date;
    userName?: string;
    userEmail?: string;
}
