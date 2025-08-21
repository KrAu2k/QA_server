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
exports.ProjectUpdateLog = exports.UpdateStatus = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
var UpdateStatus;
(function (UpdateStatus) {
    UpdateStatus["UPDATING"] = "updating";
    UpdateStatus["COMPLETED"] = "completed";
    UpdateStatus["FAILED"] = "failed";
    UpdateStatus["TIMEOUT"] = "timeout";
})(UpdateStatus || (exports.UpdateStatus = UpdateStatus = {}));
let ProjectUpdateLog = class ProjectUpdateLog {
};
exports.ProjectUpdateLog = ProjectUpdateLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProjectUpdateLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectUpdateLog.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project),
    (0, typeorm_1.JoinColumn)({ name: 'projectId' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectUpdateLog.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UpdateStatus,
        default: UpdateStatus.UPDATING
    }),
    __metadata("design:type", String)
], ProjectUpdateLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: '发起更新的用户ID' }),
    __metadata("design:type", String)
], ProjectUpdateLog.prototype, "startedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: '发起更新的用户名' }),
    __metadata("design:type", String)
], ProjectUpdateLog.prototype, "startedByName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProjectUpdateLog.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ProjectUpdateLog.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ProjectUpdateLog.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: 'SVN版本号' }),
    __metadata("design:type", Number)
], ProjectUpdateLog.prototype, "svnRevision", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '进程退出码' }),
    __metadata("design:type", Number)
], ProjectUpdateLog.prototype, "exitCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, comment: '进程终止信号' }),
    __metadata("design:type", String)
], ProjectUpdateLog.prototype, "signal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '错误信息' }),
    __metadata("design:type", String)
], ProjectUpdateLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProjectUpdateLog.prototype, "updatedAt", void 0);
exports.ProjectUpdateLog = ProjectUpdateLog = __decorate([
    (0, typeorm_1.Entity)('project_update_logs')
], ProjectUpdateLog);
//# sourceMappingURL=project-update-log.entity.js.map