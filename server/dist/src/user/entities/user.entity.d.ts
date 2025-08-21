import { Department } from '../../department/entities/department.entity';
export declare class User {
    id: number;
    name: string;
    username: string;
    password: string;
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
    department?: Department;
    position?: string;
    joinDate?: Date;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
