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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.ProjectUpdateStatus = void 0;
const typeorm_1 = require("typeorm");
var ProjectUpdateStatus;
(function (ProjectUpdateStatus) {
    ProjectUpdateStatus["IDLE"] = "idle";
    ProjectUpdateStatus["UPDATING"] = "updating";
})(ProjectUpdateStatus || (exports.ProjectUpdateStatus = ProjectUpdateStatus = {}));
let Project = class Project {
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false, comment: '项目名称' }),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '项目描述' }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: false, comment: 'H5地址' }),
    __metadata("design:type", String)
], Project.prototype, "h5Url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, comment: '项目图标' }),
    __metadata("design:type", String)
], Project.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, comment: '排序权重，数字越大越靠前' }),
    __metadata("design:type", Number)
], Project.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, comment: '是否启用' }),
    __metadata("design:type", Boolean)
], Project.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '更新命令' }),
    __metadata("design:type", String)
], Project.prototype, "updateCommand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, comment: '更新目录路径' }),
    __metadata("design:type", String)
], Project.prototype, "updateDirectory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, comment: '是否启用更新功能' }),
    __metadata("design:type", Boolean)
], Project.prototype, "enableUpdate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '更新代码命令' }),
    __metadata("design:type", String)
], Project.prototype, "updateCodeCommand", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, comment: '更新代码目录路径' }),
    __metadata("design:type", String)
], Project.prototype, "updateCodeDirectory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, comment: '是否启用更新代码功能' }),
    __metadata("design:type", Boolean)
], Project.prototype, "enableUpdateCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProjectUpdateStatus,
        default: ProjectUpdateStatus.IDLE,
        comment: '当前更新状态'
    }),
    __metadata("design:type", String)
], Project.prototype, "currentUpdateStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '当前更新日志ID' }),
    __metadata("design:type", String)
], Project.prototype, "currentUpdateLogId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProjectUpdateStatus,
        default: ProjectUpdateStatus.IDLE,
        comment: '当前更新代码状态'
    }),
    __metadata("design:type", String)
], Project.prototype, "currentUpdateCodeStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '当前更新代码日志ID' }),
    __metadata("design:type", String)
], Project.prototype, "currentUpdateCodeLogId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)()
], Project);
//# sourceMappingURL=project.entity.js.map