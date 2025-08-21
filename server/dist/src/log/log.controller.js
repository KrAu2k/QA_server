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
exports.LogController = void 0;
const common_1 = require("@nestjs/common");
const log_service_1 = require("./log.service");
const create_log_dto_1 = require("./dto/create-log.dto");
const query_log_dto_1 = require("./dto/query-log.dto");
const passport_1 = require("@nestjs/passport");
let LogController = class LogController {
    constructor(logService) {
        this.logService = logService;
    }
    async create(createLogDto) {
        try {
            const log = await this.logService.createLog(createLogDto);
            return {
                data: log,
                success: true,
                message: '日志记录创建成功',
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '日志记录创建失败',
            };
        }
    }
    async findAll(query) {
        try {
            const result = await this.logService.findAll(query);
            return {
                data: result.data,
                total: result.total,
                success: true,
                message: '查询日志成功',
            };
        }
        catch (error) {
            return {
                data: [],
                total: 0,
                success: false,
                message: error.message || '查询日志失败',
            };
        }
    }
    async getLogUsers() {
        try {
            const users = await this.logService.getLogUsers();
            return {
                data: users,
                success: true,
                message: '获取操作用户列表成功',
            };
        }
        catch (error) {
            return {
                data: [],
                success: false,
                message: error.message || '获取操作用户列表失败',
            };
        }
    }
    async getUserLoginLogs(userId, limit) {
        try {
            const logs = await this.logService.getUserLoginLogs(userId, limit ? parseInt(limit) : 10);
            return {
                data: logs,
                success: true,
                message: '获取用户登录日志成功',
            };
        }
        catch (error) {
            return {
                data: [],
                success: false,
                message: error.message || '获取用户登录日志失败',
            };
        }
    }
    async getStats() {
        try {
            const stats = await this.logService.getLogStats();
            return {
                data: stats,
                success: true,
                message: '获取日志统计成功',
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '获取日志统计失败',
            };
        }
    }
    async findOne(id) {
        try {
            const log = await this.logService.findOne(+id);
            return {
                data: log,
                success: true,
                message: '查询日志详情成功',
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '查询日志详情失败',
            };
        }
    }
    async delete(id) {
        try {
            await this.logService.deleteLog(+id);
            return {
                success: true,
                message: '删除日志成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '删除日志失败',
            };
        }
    }
    async batchDelete(body) {
        try {
            await this.logService.batchDeleteLogs(body.ids);
            return {
                success: true,
                message: '批量删除日志成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '批量删除日志失败',
            };
        }
    }
    async cleanExpired(body) {
        try {
            const deletedCount = await this.logService.cleanExpiredLogs(body.days || 90);
            return {
                data: { deletedCount },
                success: true,
                message: `清理过期日志成功，删除了 ${deletedCount} 条记录`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '清理过期日志失败',
            };
        }
    }
};
exports.LogController = LogController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_log_dto_1.CreateLogDto]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_log_dto_1.QueryLogDto]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getLogUsers", null);
__decorate([
    (0, common_1.Get)('user/:userId/login-logs'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getUserLoginLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('batch-delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "batchDelete", null);
__decorate([
    (0, common_1.Post)('clean-expired'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "cleanExpired", null);
exports.LogController = LogController = __decorate([
    (0, common_1.Controller)('logs'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogController);
//# sourceMappingURL=log.controller.js.map