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
exports.LogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const log_service_1 = require("../log.service");
let LogInterceptor = class LogInterceptor {
    constructor(logService) {
        this.logService = logService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user, headers } = request;
        const startTime = Date.now();
        const userId = user?.id;
        const username = user?.username || user?.name || '未知用户';
        const ipAddress = this.getClientIp(request);
        const userAgent = headers['user-agent'];
        const operationInfo = this.parseOperationInfo(method, url);
        return next.handle().pipe((0, operators_1.tap)((response) => {
            const executionTime = Date.now() - startTime;
            this.logService.logOperation(operationInfo.app, operationInfo.model, operationInfo.action, operationInfo.content, userId, operationInfo.billId, 'success', this.sanitizeRequestData(body), this.sanitizeResponseData(response), undefined, executionTime, ipAddress, userAgent);
        }), (0, operators_1.catchError)((error) => {
            const executionTime = Date.now() - startTime;
            this.logService.logOperation(operationInfo.app, operationInfo.model, operationInfo.action, operationInfo.content, userId, operationInfo.billId, 'error', this.sanitizeRequestData(body), undefined, error.message || '操作失败', executionTime, ipAddress, userAgent);
            throw error;
        }));
    }
    getClientIp(request) {
        return (request.headers['x-forwarded-for'] ||
            request.headers['x-real-ip'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            'unknown');
    }
    parseOperationInfo(method, url) {
        const urlParts = url.split('/').filter(Boolean);
        let app = 'system';
        let model = 'unknown';
        let action = 'unknown';
        let content = `${method} ${url}`;
        let billId;
        if (urlParts.length >= 2) {
            app = urlParts[0];
            if (urlParts.length >= 3) {
                model = urlParts[1];
                if (method === 'GET') {
                    if (urlParts.length === 2) {
                        action = '查询列表';
                        content = `查询${model}列表`;
                    }
                    else if (urlParts[2] === 'stats') {
                        action = '查询统计';
                        content = `查询${model}统计信息`;
                    }
                    else {
                        action = '查询详情';
                        content = `查询${model}详情，ID: ${urlParts[2]}`;
                        billId = parseInt(urlParts[2]);
                    }
                }
                else if (method === 'POST') {
                    if (urlParts[2] === 'batch-delete') {
                        action = '批量删除';
                        content = `批量删除${model}`;
                    }
                    else if (urlParts[2] === 'clean-expired') {
                        action = '清理过期';
                        content = `清理过期${model}`;
                    }
                    else if (urlParts[2] === 'login') {
                        action = '用户登录';
                        content = '用户登录';
                        app = 'auth';
                        model = 'user';
                    }
                    else if (urlParts[2] === 'logout') {
                        action = '用户登出';
                        content = '用户登出';
                        app = 'auth';
                        model = 'user';
                    }
                    else {
                        action = '创建';
                        content = `创建${model}`;
                    }
                }
                else if (method === 'PUT') {
                    if (urlParts[2] === 'toggle-status') {
                        action = '切换状态';
                        content = `切换${model}状态`;
                    }
                    else {
                        action = '更新';
                        content = `更新${model}，ID: ${urlParts[2]}`;
                        billId = parseInt(urlParts[2]);
                    }
                }
                else if (method === 'DELETE') {
                    action = '删除';
                    content = `删除${model}，ID: ${urlParts[2]}`;
                    billId = parseInt(urlParts[2]);
                }
            }
        }
        return { app, model, action, content, billId };
    }
    sanitizeRequestData(data) {
        if (!data)
            return data;
        const sanitized = { ...data };
        if (sanitized.password) {
            sanitized.password = '***';
        }
        if (sanitized.token) {
            sanitized.token = '***';
        }
        return sanitized;
    }
    sanitizeResponseData(data) {
        if (!data)
            return data;
        if (typeof data === 'object') {
            const sanitized = {};
            if (data.success !== undefined)
                sanitized.success = data.success;
            if (data.message)
                sanitized.message = data.message;
            if (data.total !== undefined)
                sanitized.total = data.total;
            if (Array.isArray(data.data)) {
                sanitized.dataCount = data.data.length;
            }
            else if (data.data && typeof data.data === 'object') {
                if (data.data.id)
                    sanitized.dataId = data.data.id;
                if (data.data.name)
                    sanitized.dataName = data.data.name;
            }
            return sanitized;
        }
        return data;
    }
};
exports.LogInterceptor = LogInterceptor;
exports.LogInterceptor = LogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogInterceptor);
//# sourceMappingURL=log.interceptor.js.map