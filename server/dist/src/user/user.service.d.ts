import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import { LogHelper } from '../log/utils/log-helper';
export declare class UserService {
    private userRepository;
    private readonly logHelper;
    constructor(userRepository: Repository<User>, logHelper: LogHelper);
    createUser(data: Partial<User>, userId?: string, ipAddress?: string, userAgent?: string): Promise<User>;
    findAll(userId?: string, ipAddress?: string, userAgent?: string): Promise<User[]>;
    findOne(id: number, userId?: string, ipAddress?: string, userAgent?: string): Promise<User>;
    findByUsername(username: string): Promise<User>;
    findByEmployeeNo(employeeNo: string): Promise<User>;
    updateUser(id: number, data: Partial<User>, userId?: string, ipAddress?: string, userAgent?: string): Promise<User>;
    deleteUser(id: number, userId?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    findAllWithPagination(query: QueryUserDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<{
        data: User[];
        total: number;
    }>;
    batchUpdateStatus(ids: number[], isActive: boolean, userId?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    changePassword(userId: number, oldPassword: string, newPassword: string, requestUserId?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    adminResetPassword(userId: number, newPassword: string, adminUserId?: string, ipAddress?: string, userAgent?: string): Promise<void>;
}
