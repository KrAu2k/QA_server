import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LogService } from '../log/log.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly logService;
    constructor(userService: UserService, jwtService: JwtService, logService: LogService);
    validateUser(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<any>;
    login(user: any, ipAddress?: string, userAgent?: string): Promise<{
        status: string;
        token: string;
        refresh_token: string;
    }>;
    logout(userId: string, username: string, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    currentUser(token: string): Promise<{
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
}
