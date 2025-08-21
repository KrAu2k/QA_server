import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { ChangePasswordDto, AdminChangePasswordDto } from './dto/change-password.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(data: Partial<User>, req: any): Promise<{
        data: {
            avatar: string;
            id: number;
            name: string;
            username: string;
            password: string;
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
            isAdmin: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    findAll(query: QueryUserDto, req: any): Promise<{
        data: {
            avatar: string;
            id: number;
            name: string;
            username: string;
            password: string;
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
            isAdmin: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        success: boolean;
        message: string;
    } | {
        data: any[];
        total: number;
        success: boolean;
        message: any;
    }>;
    findOne(id: string, req: any): Promise<{
        data: {
            avatar: string;
            id: number;
            name: string;
            username: string;
            password: string;
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
            isAdmin: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    batchToggleStatus(body: {
        ids: number[];
        isActive: boolean;
    }, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    toggleUserStatus(id: string, body: {
        isActive: boolean;
    }, req: any): Promise<{
        data: {
            avatar: string;
            id: number;
            name: string;
            username: string;
            password: string;
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
            isAdmin: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    update(id: string, data: Partial<User>, req: any): Promise<{
        data: {
            avatar: string;
            id: number;
            name: string;
            username: string;
            password: string;
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
            isAdmin: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    adminResetPassword(id: string, adminChangePasswordDto: AdminChangePasswordDto, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    private getClientIp;
}
