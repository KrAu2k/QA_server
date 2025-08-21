import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: {
        username: string;
        password: string;
    }, req: any): Promise<{
        status: string;
        token: string;
        refresh_token: string;
    }>;
    refresh(refreshDto: {
        refresh_token: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    currentUser(authHeader: string): Promise<{
        success: boolean;
        data: {
            isAdmin: boolean;
            id: number;
            name: string;
            username: string;
            avatar?: string;
            employeeNo: string;
            email: string;
            signature?: string;
            title?: string;
            group?: string;
            tags?: string[];
            notifyCount?: number;
            unreadCount?: number;
            country?: string;
            access?: string;
            geographic?: {
                province: Record<string, any>;
                city: Record<string, any>;
            };
            address?: string;
            phone?: string;
            departmentId?: number;
            department?: import("../department/entities/department.entity").Department;
            position?: string;
            joinDate?: Date;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    outLogin(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    private getClientIp;
}
