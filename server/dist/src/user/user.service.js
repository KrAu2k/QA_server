"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const log_helper_1 = require("../log/utils/log-helper");
const bcrypt = require("bcryptjs");
let UserService = class UserService {
    constructor(userRepository, logHelper) {
        this.userRepository = userRepository;
        this.logHelper = logHelper;
    }
    async createUser(data, userId, ipAddress, userAgent) {
        try {
            if (data.password) {
                data.password = await bcrypt.hash(data.password, 10);
            }
            const user = this.userRepository.create(data);
            const savedUser = await this.userRepository.save(user);
            if (userId) {
                await this.logHelper.logCreate(userId, 'user', 'user', '用户', savedUser.id, { ...data, password: '***' }, { id: savedUser.id, username: savedUser.username, name: savedUser.name }, ipAddress, userAgent);
            }
            return savedUser;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'user', 'user', '创建用户', '创建用户失败', error.message, { ...data, password: '***' }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findAll(userId, ipAddress, userAgent) {
        try {
            const users = await this.userRepository.find({
                select: [
                    'id', 'name', 'username', 'avatar', 'employeeNo', 'email',
                    'signature', 'title', 'group', 'tags', 'notifyCount',
                    'unreadCount', 'country', 'access', 'geographic',
                    'address', 'phone', 'isActive', 'createdAt',
                    'departmentId', 'position', 'joinDate', 'isAdmin'
                ],
                relations: ['department']
            });
            const result = users.map(user => ({
                ...user,
                departmentName: user.department?.name || null
            }));
            if (userId) {
                await this.logHelper.logQuery(userId, 'user', 'user', '列表', undefined, { count: result.length }, ipAddress, userAgent);
            }
            return result;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'user', 'user', '查询用户列表', '查询用户列表失败', error.message, undefined, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findOne(id, userId, ipAddress, userAgent) {
        try {
            if (!id) {
                throw new Error('ID is required');
            }
            const user = await this.userRepository.findOne({
                where: { id },
                select: [
                    'id', 'name', 'username', 'avatar', 'employeeNo', 'email',
                    'signature', 'title', 'group', 'tags', 'notifyCount',
                    'unreadCount', 'country', 'access', 'geographic',
                    'address', 'phone', 'isActive', 'createdAt', 'updatedAt',
                    'departmentId', 'position', 'joinDate', 'isAdmin'
                ],
                relations: ['department']
            });
            if (!user) {
                throw new Error(`User with ID ${id} not found`);
            }
            const result = {
                ...user,
                departmentName: user.department?.name || null
            };
            if (userId) {
                await this.logHelper.logQuery(userId, 'user', 'user', '详情', { id }, { id: result.id, username: result.username, name: result.name }, ipAddress, userAgent);
            }
            return result;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'user', 'user', '查询用户详情', '查询用户详情失败', error.message, { id }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findByUsername(username) {
        return this.userRepository.findOne({
            where: { username },
            select: [
                'id', 'name', 'username', 'password', 'avatar', 'employeeNo', 'email',
                'signature', 'title', 'group', 'tags', 'notifyCount',
                'unreadCount', 'country', 'access', 'geographic',
                'address', 'phone', 'isActive', 'createdAt', 'updatedAt',
                'departmentId', 'position', 'joinDate', 'isAdmin'
            ],
            relations: ['department']
        });
    }
    async findByEmployeeNo(employeeNo) {
        return this.userRepository.findOne({
            where: { employeeNo },
            select: [
                'id', 'name', 'username', 'password', 'avatar', 'employeeNo', 'email',
                'signature', 'title', 'group', 'tags', 'notifyCount',
                'unreadCount', 'country', 'access', 'geographic',
                'address', 'phone', 'isActive', 'createdAt', 'updatedAt',
                'departmentId', 'position', 'joinDate', 'isAdmin'
            ],
            relations: ['department']
        });
    }
    async updateUser(id, data, userId, ipAddress, userAgent) {
        try {
            if (data.password) {
                data.password = await bcrypt.hash(data.password, 10);
            }
            await this.userRepository.update(id, data);
            const result = await this.findOne(id);
            if (userId) {
                await this.logHelper.logUpdate(userId, 'user', 'user', '用户', id, { ...data, password: data.password ? '***' : undefined }, { id: result.id, username: result.username, name: result.name }, ipAddress, userAgent);
            }
            return result;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'user', 'user', '更新用户', '更新用户失败', error.message, { id, ...data, password: data.password ? '***' : undefined }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async deleteUser(id, userId, ipAddress, userAgent) {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                select: ['id', 'name', 'username', 'isAdmin']
            });
            if (!user) {
                throw new Error(`User with ID ${id} not found`);
            }
            await this.userRepository.delete(id);
            if (userId) {
                await this.logHelper.logDelete(userId, 'user', 'user', '用户', 0, { id }, { id: user.id, username: user.username, name: user.name }, ipAddress, userAgent);
            }
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'user', 'user', '删除用户', '删除用户失败', error.message, { id }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findAllWithPagination(query, userId, ipAddress, userAgent) {
        try {
            const { current = 1, pageSize = 10, name, username, email, employeeNo, phone, group, title, isActive } = query;
            const page = Number(current);
            const size = Number(pageSize);
            const where = {};
            if (name) {
                where.name = (0, typeorm_2.Like)(`%${name}%`);
            }
            if (username) {
                where.username = (0, typeorm_2.Like)(`%${username}%`);
            }
            if (email) {
                where.email = (0, typeorm_2.Like)(`%${email}%`);
            }
            if (employeeNo) {
                where.employeeNo = (0, typeorm_2.Like)(`%${employeeNo}%`);
            }
            if (phone) {
                where.phone = (0, typeorm_2.Like)(`%${phone}%`);
            }
            if (group) {
                where.group = (0, typeorm_2.Like)(`%${group}%`);
            }
            if (title) {
                where.title = (0, typeorm_2.Like)(`%${title}%`);
            }
            if (isActive !== undefined) {
                where.isActive = isActive;
            }
            const [users, total] = await this.userRepository.findAndCount({
                where,
                select: [
                    'id', 'name', 'username', 'avatar', 'employeeNo', 'email',
                    'signature', 'title', 'group', 'tags', 'notifyCount',
                    'unreadCount', 'country', 'access', 'geographic',
                    'address', 'phone', 'isActive', 'createdAt',
                    'departmentId', 'position', 'joinDate', 'isAdmin'
                ],
                relations: ['department'],
                skip: (page - 1) * size,
                take: size,
                order: { createdAt: 'DESC' }
            });
            const usersWithDepartment = users.map(user => ({
                ...user,
                departmentName: user.department?.name || null
            }));
            const result = {
                data: usersWithDepartment,
                total
            };
            if (userId) {
                await this.logHelper.logQuery(userId, 'user', 'user', '列表', query, { count: result.data.length, total: result.total }, ipAddress, userAgent);
            }
            return result;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'user', 'user', '查询用户列表', '查询用户列表失败', error.message, query, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async batchUpdateStatus(ids, isActive, userId, ipAddress, userAgent) {
        try {
            if (!ids || ids.length === 0) {
                throw new Error('No IDs provided for batch update');
            }
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                await this.userRepository.update(id, { isActive: isActive });
            }
            if (userId) {
                await this.logHelper.logUserOperation(userId, 'user', 'user', '批量更新状态', `批量${isActive ? '启用' : '禁用'}用户，共 ${ids.length} 个用户`, undefined, 'success', { ids, isActive }, { updatedCount: ids.length }, undefined, undefined, ipAddress, userAgent);
            }
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'user', 'user', '批量更新状态', '批量更新用户状态失败', error.message, { ids, isActive }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async changePassword(userId, oldPassword, newPassword, requestUserId, ipAddress, userAgent) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: ['id', 'username', 'password', 'name']
            });
            if (!user) {
                throw new Error('用户不存在');
            }
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                throw new Error('原密码错误');
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.update(userId, { password: hashedNewPassword });
            if (requestUserId) {
                await this.logHelper.logUpdate(requestUserId, 'user', 'user', '用户密码', userId, { action: '密码修改' }, { id: user.id, username: user.username, name: user.name }, ipAddress, userAgent);
            }
        }
        catch (error) {
            if (requestUserId) {
                await this.logHelper.logError(requestUserId, 'user', 'user', '修改密码', '密码修改失败', error.message, { userId }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async adminResetPassword(userId, newPassword, adminUserId, ipAddress, userAgent) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                select: ['id', 'username', 'name', 'employeeNo']
            });
            if (!user) {
                throw new Error('用户不存在');
            }
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.update(userId, { password: hashedNewPassword });
            if (adminUserId) {
                await this.logHelper.logUpdate(adminUserId, 'user', 'user', '用户密码', user.id, { action: '管理员重置密码' }, { id: user.id, username: user.username, name: user.name }, ipAddress, userAgent);
            }
        }
        catch (error) {
            if (adminUserId) {
                await this.logHelper.logError(adminUserId, 'user', 'user', '重置密码', '重置密码失败', error.message, { userId }, ipAddress, userAgent);
            }
            throw error;
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        log_helper_1.LogHelper])
], UserService);
//# sourceMappingURL=user.service.js.map