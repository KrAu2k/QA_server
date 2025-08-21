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
exports.DepartmentController = void 0;
const common_1 = require("@nestjs/common");
const department_service_1 = require("./department.service");
const create_department_dto_1 = require("./dto/create-department.dto");
const update_department_dto_1 = require("./dto/update-department.dto");
const department_operation_dto_1 = require("./dto/department-operation.dto");
const passport_1 = require("@nestjs/passport");
const admin_guard_1 = require("../auth/admin.guard");
let DepartmentController = class DepartmentController {
    constructor(departmentService) {
        this.departmentService = departmentService;
    }
    async findTree() {
        const data = await this.departmentService.findTree();
        return {
            success: true,
            data,
            message: '获取部门树成功',
        };
    }
    async findOne(id) {
        const data = await this.departmentService.findOne(id);
        return {
            success: true,
            data,
            message: '获取部门详情成功',
        };
    }
    async create(createDepartmentDto) {
        const data = await this.departmentService.create(createDepartmentDto);
        return {
            success: true,
            data,
            message: '创建部门成功',
        };
    }
    async update(id, updateDepartmentDto) {
        const data = await this.departmentService.update(id, updateDepartmentDto);
        return {
            success: true,
            data,
            message: '更新部门成功',
        };
    }
    async remove(id) {
        await this.departmentService.remove(id);
        return {
            success: true,
            message: '删除部门成功',
        };
    }
    async updateStatus(id, updateStatusDto) {
        const data = await this.departmentService.updateStatus(id, updateStatusDto.status);
        return {
            success: true,
            data,
            message: '更新部门状态成功',
        };
    }
    async moveDepartment(id, moveDepartmentDto) {
        const data = await this.departmentService.moveDepartment(id, moveDepartmentDto);
        return {
            success: true,
            data,
            message: '移动部门成功',
        };
    }
    async getAvailableUsers(id) {
        const data = await this.departmentService.getAvailableUsers(id);
        return {
            success: true,
            data,
            message: '获取可分配用户列表成功',
        };
    }
    async getDepartmentMembers(id) {
        const data = await this.departmentService.getDepartmentMembers(id);
        return {
            success: true,
            data,
            message: '获取部门成员成功',
        };
    }
    async addMembers(id, addMemberDto) {
        await this.departmentService.addMembers(id, addMemberDto);
        return {
            success: true,
            message: '添加部门成员成功',
        };
    }
    async removeMember(id, userId) {
        await this.departmentService.removeMember(id, Number(userId));
        return {
            success: true,
            message: '移除部门成员成功',
        };
    }
    async setManager(id, setManagerDto) {
        const data = await this.departmentService.setManager(id, setManagerDto);
        return {
            success: true,
            data,
            message: '设置部门负责人成功',
        };
    }
};
exports.DepartmentController = DepartmentController;
__decorate([
    (0, common_1.Get)('tree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "findTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_department_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, department_operation_dto_1.UpdateDepartmentStatusDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/move'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, department_operation_dto_1.MoveDepartmentDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "moveDepartment", null);
__decorate([
    (0, common_1.Get)(':id/available-users'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "getAvailableUsers", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "getDepartmentMembers", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, department_operation_dto_1.AddMemberDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "addMembers", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Put)(':id/manager'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, department_operation_dto_1.SetManagerDto]),
    __metadata("design:returntype", Promise)
], DepartmentController.prototype, "setManager", null);
exports.DepartmentController = DepartmentController = __decorate([
    (0, common_1.Controller)('departments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [department_service_1.DepartmentService])
], DepartmentController);
//# sourceMappingURL=department.controller.js.map