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
exports.BiDatabaseController = void 0;
const common_1 = require("@nestjs/common");
const bi_database_service_1 = require("./bi-database.service");
let BiDatabaseController = class BiDatabaseController {
    constructor(biDatabaseService) {
        this.biDatabaseService = biDatabaseService;
    }
    async testConnection() {
        try {
            const isConnected = await this.biDatabaseService.connect();
            if (isConnected) {
                const tables = await this.biDatabaseService.getTables();
                return {
                    success: true,
                    message: 'BI数据库连接成功',
                    tables: tables.filter((table) => table.includes('option_rc003') ||
                        table.includes('app_user_rc003') ||
                        table.includes('dwd_app_pay_rc003') ||
                        table.includes('dwd_app_daily_user_rc003'))
                };
            }
            else {
                return { success: false, message: 'BI数据库连接失败' };
            }
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getDashboard() {
        try {
            const data = await this.biDatabaseService.getDashboardData();
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getOptionRc003(page, pageSize) {
        try {
            const pageNum = parseInt(page) || 1;
            const size = parseInt(pageSize) || 20;
            const data = await this.biDatabaseService.getOptionRc003Data(pageNum, size);
            return { success: true, ...data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getAppUserRc003(page, pageSize) {
        try {
            const pageNum = parseInt(page) || 1;
            const size = parseInt(pageSize) || 20;
            const data = await this.biDatabaseService.getAppUserRc003Data(pageNum, size);
            return { success: true, ...data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getPayDataRc003(page, pageSize) {
        try {
            const pageNum = parseInt(page) || 1;
            const size = parseInt(pageSize) || 20;
            const data = await this.biDatabaseService.getDwdAppPayRc003Data(pageNum, size);
            return { success: true, ...data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getDailyUserRc003(page, pageSize) {
        try {
            const pageNum = parseInt(page) || 1;
            const size = parseInt(pageSize) || 20;
            const data = await this.biDatabaseService.getDwdAppDailyUserRc003Data(pageNum, size);
            return { success: true, ...data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
};
exports.BiDatabaseController = BiDatabaseController;
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BiDatabaseController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BiDatabaseController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('option-rc003'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BiDatabaseController.prototype, "getOptionRc003", null);
__decorate([
    (0, common_1.Get)('app-user-rc003'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BiDatabaseController.prototype, "getAppUserRc003", null);
__decorate([
    (0, common_1.Get)('pay-data-rc003'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BiDatabaseController.prototype, "getPayDataRc003", null);
__decorate([
    (0, common_1.Get)('daily-user-rc003'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BiDatabaseController.prototype, "getDailyUserRc003", null);
exports.BiDatabaseController = BiDatabaseController = __decorate([
    (0, common_1.Controller)('bi'),
    __metadata("design:paramtypes", [bi_database_service_1.BiDatabaseService])
], BiDatabaseController);
//# sourceMappingURL=bi-database.controller.js.map