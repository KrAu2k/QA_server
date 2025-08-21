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
exports.LogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const log_entity_1 = require("./entities/log.entity");
const user_entity_1 = require("../user/entities/user.entity");
let LogService = class LogService {
    constructor(logRepository) {
        this.logRepository = logRepository;
    }
    async createLog(createLogDto) {
        const log = this.logRepository.create(createLogDto);
        return this.logRepository.save(log);
    }
    async logOperation(app, model, action, content, userId, billId, status = 'success', requestData, responseData, errorMessage, executionTime, ipAddress, userAgent) {
        let validUserId = null;
        if (userId) {
            try {
                const user = await this.logRepository.manager.getRepository(user_entity_1.User).findOne({
                    where: { id: parseInt(userId) }
                });
                if (user) {
                    validUserId = String(user.id);
                }
                else {
                    console.log(`用户 id=${userId} 不存在，将在日志中设置为 null`);
                }
            }
            catch (error) {
                console.error('验证用户时发生错误:', error);
            }
        }
        const logData = {
            app,
            model,
            action,
            content,
            userId: validUserId,
            billId,
            status,
            requestData,
            responseData,
            errorMessage,
            executionTime,
            ipAddress,
            userAgent,
        };
        return this.createLog(logData);
    }
    async logLogin(userId, username, status, ipAddress, userAgent, errorMessage) {
        const content = status === 'success'
            ? `用户 ${username} 登录成功`
            : `用户 ${username} 登录失败: ${errorMessage}`;
        return this.logOperation('auth', 'user', 'login', content, userId, undefined, status, undefined, undefined, errorMessage, undefined, ipAddress, userAgent);
    }
    async logLogout(userId, username, ipAddress, userAgent) {
        return this.logOperation('auth', 'user', 'logout', `用户 ${username} 登出`, userId, undefined, 'success', undefined, undefined, undefined, undefined, ipAddress, userAgent);
    }
    async findAll(query) {
        const { current = 1, pageSize = 20, app, model, action, status, userId, userName, startDate, endDate, keyword, } = query;
        const page = Number(current);
        const size = Number(pageSize);
        const where = {};
        if (app) {
            where.app = (0, typeorm_2.Like)(`%${app}%`);
        }
        if (model) {
            where.model = (0, typeorm_2.Like)(`%${model}%`);
        }
        if (action) {
            where.action = (0, typeorm_2.Like)(`%${action}%`);
        }
        if (status) {
            where.status = status;
        }
        if (userId) {
            where.userId = userId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt = (0, typeorm_2.Between)(new Date(startDate), where.createdAt || new Date());
            }
            if (endDate) {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                where.createdAt = (0, typeorm_2.Between)(where.createdAt || new Date(0), endDateTime);
            }
        }
        let queryBuilder = this.logRepository.createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .where(where);
        if (keyword) {
            queryBuilder = queryBuilder.andWhere('(log.content LIKE :keyword OR log.action LIKE :keyword OR user.name LIKE :keyword OR user.username LIKE :keyword)', { keyword: `%${keyword}%` });
        }
        if (userName) {
            queryBuilder = queryBuilder.andWhere('(user.name LIKE :userName OR user.username LIKE :userName)', { userName: `%${userName}%` });
        }
        const [logs, total] = await queryBuilder
            .orderBy('log.createdAt', 'DESC')
            .skip((page - 1) * size)
            .take(size)
            .getManyAndCount();
        const logsWithUser = logs.map(log => ({
            ...log,
            userName: log.user?.name || '未知用户',
            userEmail: log.user?.email || '',
        }));
        return {
            data: logsWithUser,
            total,
        };
    }
    async findOne(id) {
        const log = await this.logRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!log) {
            throw new Error(`日志记录不存在: ${id}`);
        }
        return {
            ...log,
            userName: log.user?.name || '未知用户',
            userEmail: log.user?.email || '',
        };
    }
    async deleteLog(id) {
        await this.logRepository.delete(id);
    }
    async batchDeleteLogs(ids) {
        await this.logRepository.delete(ids);
    }
    async cleanExpiredLogs(days = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const result = await this.logRepository
            .createQueryBuilder()
            .delete()
            .where('createdAt < :cutoffDate', { cutoffDate })
            .execute();
        return result.affected || 0;
    }
    async getLogStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const [todayLogs, yesterdayLogs, totalLogs, errorLogs] = await Promise.all([
            this.logRepository.count({ where: { createdAt: (0, typeorm_2.Between)(today, new Date()) } }),
            this.logRepository.count({ where: { createdAt: (0, typeorm_2.Between)(yesterday, today) } }),
            this.logRepository.count(),
            this.logRepository.count({ where: { status: 'error' } }),
        ]);
        return {
            todayLogs,
            yesterdayLogs,
            totalLogs,
            errorLogs,
            successRate: totalLogs > 0 ? ((totalLogs - errorLogs) / totalLogs * 100).toFixed(2) : '100.00',
        };
    }
    async getLogUsers() {
        const users = await this.logRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .select([
            'DISTINCT user.id as userId',
            'user.name as userName',
            'user.username as userUsername',
            'user.email as userEmail'
        ])
            .where('user.id IS NOT NULL')
            .orderBy('user.name', 'ASC')
            .getRawMany();
        return users.map(user => ({
            userId: user.userId,
            userName: user.userName || user.userUsername || '未知用户',
            userUsername: user.userUsername,
            userEmail: user.userEmail,
        }));
    }
    async getUserLoginLogs(userId, limit = 10) {
        const logs = await this.logRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .where('log.userId = :userId', { userId })
            .andWhere('log.app = :app', { app: 'auth' })
            .andWhere('log.action IN (:...actions)', { actions: ['login', 'logout'] })
            .orderBy('log.createdAt', 'DESC')
            .limit(limit)
            .getMany();
        return logs.map(log => ({
            id: log.id,
            action: log.action,
            status: log.status,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            content: log.content,
            createdAt: log.createdAt,
            errorMessage: log.errorMessage,
        }));
    }
};
exports.LogService = LogService;
exports.LogService = LogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(log_entity_1.Log)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LogService);
//# sourceMappingURL=log.service.js.map