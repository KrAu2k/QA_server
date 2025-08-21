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
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const query_project_dto_1 = require("./dto/query-project.dto");
const passport_1 = require("@nestjs/passport");
const admin_guard_1 = require("../auth/admin.guard");
let ProjectController = class ProjectController {
    constructor(projectService) {
        this.projectService = projectService;
    }
    getClientIp(request) {
        return request.ip ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            request.headers['x-forwarded-for']?.split(',')[0] ||
            'unknown';
    }
    async create(createProjectDto, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            const project = await this.projectService.create(createProjectDto, userId, ipAddress, userAgent);
            return {
                data: project,
                success: true,
                message: '创建项目成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '创建项目失败'
            };
        }
    }
    async findAll(query, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            if (query.current || query.pageSize) {
                const result = await this.projectService.findAllWithPagination(query, userId, ipAddress, userAgent);
                return {
                    data: result.data,
                    total: result.total,
                    success: true,
                    message: '获取项目列表成功'
                };
            }
            else {
                const projects = await this.projectService.findAll(userId, ipAddress, userAgent);
                return {
                    data: projects,
                    success: true,
                    message: '获取项目列表成功'
                };
            }
        }
        catch (error) {
            return {
                data: [],
                total: 0,
                success: false,
                message: error.message || '获取项目列表失败'
            };
        }
    }
    async findActiveProjects(req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            const projects = await this.projectService.getActiveProjects();
            return {
                data: projects,
                success: true,
                message: '获取工作台项目成功'
            };
        }
        catch (error) {
            return {
                data: [],
                success: false,
                message: error.message || '获取工作台项目失败'
            };
        }
    }
    async findOne(id, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            const project = await this.projectService.findOne(id, userId, ipAddress, userAgent);
            return {
                data: project,
                success: true,
                message: '获取项目详情成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '获取项目详情失败'
            };
        }
    }
    async batchToggleStatus(body, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            await this.projectService.batchToggleStatus(body.ids, body.isActive, userId, ipAddress, userAgent);
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
    async update(id, updateProjectDto, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            const project = await this.projectService.update(id, updateProjectDto, userId, ipAddress, userAgent);
            return {
                data: project,
                success: true,
                message: '更新项目成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '更新项目失败'
            };
        }
    }
    async remove(id, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            await this.projectService.remove(id, userId, ipAddress, userAgent);
            return {
                success: true,
                message: '删除项目成功'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '删除项目失败'
            };
        }
    }
    async executeUpdate(id, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            const result = await this.projectService.executeUpdate(id, userId, ipAddress, userAgent);
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '执行更新失败',
                output: error.message
            };
        }
    }
    async executeUpdateCode(id, req) {
        try {
            const ipAddress = this.getClientIp(req);
            const userAgent = req.headers['user-agent'];
            const userId = req.user?.id || req.user?.userId;
            return {
                success: true,
                message: '代码更新命令已启动，请通过WebSocket监听实时输出'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '执行代码更新失败'
            };
        }
    }
    async getMobileAvailability(req) {
        try {
            const result = await this.projectService.isMobileAvailable();
            return {
                data: result,
                success: true,
                message: result.available ? '移动端可正常访问' : '移动端暂时不可用，有项目正在更新中'
            };
        }
        catch (error) {
            return {
                data: { available: true, updatingProjects: [] },
                success: false,
                message: error.message || '获取移动端状态失败'
            };
        }
    }
    async getProjectUpdateStatus(id, req) {
        try {
            const result = await this.projectService.getProjectUpdateStatus(id);
            return {
                data: result,
                success: true,
                message: '获取项目更新状态成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '获取项目更新状态失败'
            };
        }
    }
    async getProjectUpdateLogs(id, limit = '10', req) {
        try {
            const logs = await this.projectService.getProjectUpdateLogs(id, parseInt(limit));
            return {
                data: logs,
                success: true,
                message: '获取项目更新日志成功'
            };
        }
        catch (error) {
            return {
                data: [],
                success: false,
                message: error.message || '获取项目更新日志失败'
            };
        }
    }
    async getProjectUpdateCodeStatus(id, req) {
        try {
            const result = await this.projectService.getProjectUpdateCodeStatus(id);
            return {
                data: result,
                success: true,
                message: '获取项目更新代码状态成功'
            };
        }
        catch (error) {
            return {
                data: null,
                success: false,
                message: error.message || '获取项目更新代码状态失败'
            };
        }
    }
    async getProjectUpdateCodeLogs(id, limit = '10', req) {
        try {
            const logs = await this.projectService.getProjectUpdateCodeLogs(id, parseInt(limit));
            return {
                data: logs,
                success: true,
                message: '获取项目更新代码日志成功'
            };
        }
        catch (error) {
            return {
                data: [],
                success: false,
                message: error.message || '获取项目更新代码日志失败'
            };
        }
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_project_dto_1.QueryProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findActiveProjects", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('batch-toggle-status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "batchToggleStatus", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "executeUpdate", null);
__decorate([
    (0, common_1.Post)(':id/update-code'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "executeUpdateCode", null);
__decorate([
    (0, common_1.Get)('mobile/availability'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getMobileAvailability", null);
__decorate([
    (0, common_1.Get)(':id/update-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getProjectUpdateStatus", null);
__decorate([
    (0, common_1.Get)(':id/update-logs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getProjectUpdateLogs", null);
__decorate([
    (0, common_1.Get)(':id/update-code-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getProjectUpdateCodeStatus", null);
__decorate([
    (0, common_1.Get)(':id/update-code-logs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getProjectUpdateCodeLogs", null);
exports.ProjectController = ProjectController = __decorate([
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map