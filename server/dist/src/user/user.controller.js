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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const passport_1 = require("@nestjs/passport");
const query_user_dto_1 = require("./dto/query-user.dto");
const admin_guard_1 = require("../auth/admin.guard");
const change_password_dto_1 = require("./dto/change-password.dto");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async create(data, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            const newUser = await this.userService.createUser(data, userId, ipAddress, userAgent);
            const userWithDefaultAvatar = {
                ...newUser,
                avatar: newUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
            };
            return {
                data: userWithDefaultAvatar,
                success: true,
                message: '创建用户成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '创建用户失败'
            };
        }
    }
    async findAll(query, req) {
        console.log('token 验证成功, query params:', query);
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            const result = await this.userService.findAllWithPagination(query, userId, ipAddress, userAgent);
            const usersWithDefaultAvatar = result.data.map(user => ({
                ...user,
                avatar: user.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
            }));
            return {
                data: usersWithDefaultAvatar,
                total: result.total,
                success: true,
                message: '获取用户列表成功'
            };
        }
        catch (error) {
            return {
                data: [],
                total: 0,
                success: false,
                message: error.message || '获取用户列表失败'
            };
        }
    }
    async findOne(id, req) {
        console.log('findOne id:', id);
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            const user = await this.userService.findOne(parseInt(id), userId, ipAddress, userAgent);
            const userWithDefaultAvatar = {
                ...user,
                avatar: user.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
            };
            return {
                data: userWithDefaultAvatar,
                success: true,
                message: '获取用户详情成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '获取用户详情失败'
            };
        }
    }
    async batchToggleStatus(body, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            await this.userService.batchUpdateStatus(body.ids, body.isActive, userId, ipAddress, userAgent);
            return {
                success: true,
                message: `批量${body.isActive ? '启用' : '禁用'}成功`
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '批量状态更新失败'
            };
        }
    }
    async toggleUserStatus(id, body, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            const updatedUser = await this.userService.updateUser(parseInt(id), { isActive: body.isActive }, userId, ipAddress, userAgent);
            const userWithDefaultAvatar = {
                ...updatedUser,
                avatar: updatedUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
            };
            return {
                data: userWithDefaultAvatar,
                success: true,
                message: `用户${body.isActive ? '启用' : '禁用'}成功`
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '状态更新失败'
            };
        }
    }
    async update(id, data, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            const updatedUser = await this.userService.updateUser(parseInt(id), data, userId, ipAddress, userAgent);
            const userWithDefaultAvatar = {
                ...updatedUser,
                avatar: updatedUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
            };
            return {
                data: userWithDefaultAvatar,
                success: true,
                message: '更新用户成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '更新用户失败'
            };
        }
    }
    async delete(id, req) {
        console.log('delete id:', id);
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            await this.userService.deleteUser(parseInt(id), userId, ipAddress, userAgent);
            return {
                success: true,
                message: 'delete success'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '删除用户失败'
            };
        }
    }
    async changePassword(changePasswordDto, req) {
        try {
            const { oldPassword, newPassword, confirmPassword } = changePasswordDto;
            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    message: '新密码和确认密码不一致'
                };
            }
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id;
            await this.userService.changePassword(userId, oldPassword, newPassword, userId, ipAddress, userAgent);
            return {
                success: true,
                message: '密码修改成功'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '密码修改失败'
            };
        }
    }
    async adminResetPassword(id, adminChangePasswordDto, req) {
        try {
            const { newPassword, confirmPassword } = adminChangePasswordDto;
            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    message: '新密码和确认密码不一致'
                };
            }
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const adminUserId = req.user?.id;
            await this.userService.adminResetPassword(parseInt(id), newPassword, adminUserId, ipAddress, userAgent);
            return {
                success: true,
                message: '密码重置成功'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '密码重置失败'
            };
        }
    }
    getClientIp(req) {
        return (req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            'unknown');
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_user_dto_1.QueryUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('batch-toggle-status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "batchToggleStatus", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)('change-password'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Put)(':id/reset-password'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_password_dto_1.AdminChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "adminResetPassword", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map