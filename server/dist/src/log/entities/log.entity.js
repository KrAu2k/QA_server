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
exports.Log = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
let Log = class Log {
};
exports.Log = Log;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Log.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '应用模块名称' }),
    __metadata("design:type", String)
], Log.prototype, "app", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '模型名称' }),
    __metadata("design:type", String)
], Log.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, comment: '单据ID' }),
    __metadata("design:type", Number)
], Log.prototype, "billId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, comment: '操作动作' }),
    __metadata("design:type", String)
], Log.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '操作内容' }),
    __metadata("design:type", String)
], Log.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'success', comment: '操作状态：success-成功，error-失败' }),
    __metadata("design:type", String)
], Log.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, comment: 'IP地址' }),
    __metadata("design:type", String)
], Log.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true, comment: '用户代理' }),
    __metadata("design:type", String)
], Log.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, comment: '请求参数' }),
    __metadata("design:type", Object)
], Log.prototype, "requestData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, comment: '响应数据' }),
    __metadata("design:type", Object)
], Log.prototype, "responseData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '错误信息' }),
    __metadata("design:type", String)
], Log.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, comment: '执行时间(毫秒)' }),
    __metadata("design:type", Number)
], Log.prototype, "executionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true, comment: '操作用户ID' }),
    __metadata("design:type", String)
], Log.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Log.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', comment: '创建时间' }),
    __metadata("design:type", Date)
], Log.prototype, "createdAt", void 0);
exports.Log = Log = __decorate([
    (0, typeorm_1.Entity)('logs')
], Log);
//# sourceMappingURL=log.entity.js.map