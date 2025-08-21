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
exports.ProjectUpdateCodeLog = exports.UpdateCodeStatus = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
var UpdateCodeStatus;
(function (UpdateCodeStatus) {
    UpdateCodeStatus["UPDATING"] = "updating";
    UpdateCodeStatus["COMPLETED"] = "completed";
    UpdateCodeStatus["FAILED"] = "failed";
    UpdateCodeStatus["TIMEOUT"] = "timeout";
})(UpdateCodeStatus || (exports.UpdateCodeStatus = UpdateCodeStatus = {}));
let ProjectUpdateCodeLog = class ProjectUpdateCodeLog {
};
exports.ProjectUpdateCodeLog = ProjectUpdateCodeLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectUpdateCodeLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false, comment: '项目ID' }),
    __metadata("design:type", String)
], ProjectUpdateCodeLog.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UpdateCodeStatus,
        default: UpdateCodeStatus.UPDATING,
        comment: '更新代码状态'
    }),
    __metadata("design:type", String)
], ProjectUpdateCodeLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: '启动用户ID' }),
    __metadata("design:type", String)
], ProjectUpdateCodeLog.prototype, "startedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: '启动用户名' }),
    __metadata("design:type", String)
], ProjectUpdateCodeLog.prototype, "startedByName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false, comment: '开始时间' }),
    __metadata("design:type", Date)
], ProjectUpdateCodeLog.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, comment: '结束时间' }),
    __metadata("design:type", Date)
], ProjectUpdateCodeLog.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, comment: '执行时长(秒)' }),
    __metadata("design:type", Number)
], ProjectUpdateCodeLog.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: 'SVN版本号' }),
    __metadata("design:type", Number)
], ProjectUpdateCodeLog.prototype, "svnRevision", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '进程退出码' }),
    __metadata("design:type", Number)
], ProjectUpdateCodeLog.prototype, "exitCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '进程终止信号' }),
    __metadata("design:type", String)
], ProjectUpdateCodeLog.prototype, "signal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '错误信息' }),
    __metadata("design:type", String)
], ProjectUpdateCodeLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], ProjectUpdateCodeLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", Date)
], ProjectUpdateCodeLog.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'projectId' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectUpdateCodeLog.prototype, "project", void 0);
exports.ProjectUpdateCodeLog = ProjectUpdateCodeLog = __decorate([
    (0, typeorm_1.Entity)()
], ProjectUpdateCodeLog);
//# sourceMappingURL=project-update-code-log.entity.js.map