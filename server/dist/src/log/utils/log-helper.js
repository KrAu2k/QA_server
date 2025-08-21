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
exports.LogHelper = void 0;
const common_1 = require("@nestjs/common");
const log_service_1 = require("../log.service");
let LogHelper = class LogHelper {
    constructor(logService) {
        this.logService = logService;
    }
    async logUserOperation(userId, app, model, action, content, billId, status = 'success', requestData, responseData, errorMessage, executionTime, ipAddress, userAgent) {
        return this.logService.logOperation(app, model, action, content, userId, billId, status, requestData, responseData, errorMessage, executionTime, ipAddress, userAgent);
    }
    async logCreate(userId, app, model, entityName, entityId, requestData, responseData, ipAddress, userAgent) {
        return this.logService.logOperation(app, model, '创建', `创建${entityName}，ID: ${entityId}`, userId, entityId, 'success', requestData, responseData, undefined, undefined, ipAddress, userAgent);
    }
    async logUpdate(userId, app, model, entityName, entityId, requestData, responseData, ipAddress, userAgent) {
        return this.logService.logOperation(app, model, '更新', `更新${entityName}，ID: ${entityId}`, userId, entityId, 'success', requestData, responseData, undefined, undefined, ipAddress, userAgent);
    }
    async logDelete(userId, app, model, entityName, entityId, requestData, responseData, ipAddress, userAgent) {
        return this.logService.logOperation(app, model, '删除', `删除${entityName}，ID: ${entityId}`, userId, entityId, 'success', requestData, responseData, undefined, undefined, ipAddress, userAgent);
    }
    async logQuery(userId, app, model, queryType, requestData, responseData, ipAddress, userAgent) {
        return this.logService.logOperation(app, model, '查询', `查询${model}${queryType}`, userId, undefined, 'success', requestData, responseData, undefined, undefined, ipAddress, userAgent);
    }
    async logAudit(userId, app, model, entityName, entityId, auditAction, requestData, responseData, ipAddress, userAgent) {
        return this.logService.logOperation(app, model, '审核', `${auditAction}${entityName}，ID: ${entityId}`, userId, entityId, 'success', requestData, responseData, undefined, undefined, ipAddress, userAgent);
    }
    async logError(userId, app, model, action, content, errorMessage, requestData, ipAddress, userAgent) {
        return this.logService.logOperation(app, model, action, content, userId, undefined, 'error', requestData, undefined, errorMessage, undefined, ipAddress, userAgent);
    }
};
exports.LogHelper = LogHelper;
exports.LogHelper = LogHelper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogHelper);
//# sourceMappingURL=log-helper.js.map