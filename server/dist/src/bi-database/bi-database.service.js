"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiDatabaseService = void 0;
const common_1 = require("@nestjs/common");
const mysql = require("mysql2/promise");
let BiDatabaseService = class BiDatabaseService {
    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: process.env.BI_DB_HOST,
                port: parseInt(process.env.BI_DB_PORT),
                user: process.env.BI_DB_USERNAME,
                password: process.env.BI_DB_PASSWORD,
                database: process.env.BI_DB_NAME,
                authPlugins: {
                    mysql_clear_password: () => require('mysql2/lib/auth_plugins/mysql_clear_password')
                }
            });
            console.log('✅ BI数据库连接成功');
            return true;
        }
        catch (error) {
            console.error('❌ BI数据库连接失败:', error.message);
            return false;
        }
    }
    async query(sql, params) {
        if (!this.connection) {
            await this.connect();
        }
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        }
        catch (error) {
            console.error('BI数据库查询错误:', error.message);
            throw error;
        }
    }
    async getTables() {
        const tables = await this.query('SHOW TABLES');
        return tables.map(table => Object.values(table)[0]);
    }
    async getTableData(tableName, limit = 100) {
        return await this.query(`SELECT * FROM \`${tableName}\` LIMIT ${limit}`);
    }
    async getOptionRc003Data(page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        const [data, countResult] = await Promise.all([
            this.query(`SELECT * FROM option_rc003 ORDER BY id DESC LIMIT ${pageSize} OFFSET ${offset}`),
            this.query(`SELECT COUNT(*) as total FROM option_rc003`)
        ]);
        return {
            data,
            total: countResult[0].total
        };
    }
    async getAppUserRc003Data(page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        const [data, countResult] = await Promise.all([
            this.query(`SELECT * FROM app_user_rc003 ORDER BY login_at DESC LIMIT ${pageSize} OFFSET ${offset}`),
            this.query(`SELECT COUNT(*) as total FROM app_user_rc003`)
        ]);
        return {
            data,
            total: countResult[0].total
        };
    }
    async getDwdAppPayRc003Data(page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        const [data, countResult] = await Promise.all([
            this.query(`SELECT * FROM dwd_app_pay_rc003 ORDER BY ods_at DESC LIMIT ${pageSize} OFFSET ${offset}`),
            this.query(`SELECT COUNT(*) as total FROM dwd_app_pay_rc003`)
        ]);
        return {
            data,
            total: countResult[0].total
        };
    }
    async getDwdAppDailyUserRc003Data(page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        const [data, countResult] = await Promise.all([
            this.query(`SELECT * FROM dwd_app_daily_user_rc003 ORDER BY event_date DESC, login_at DESC LIMIT ${pageSize} OFFSET ${offset}`),
            this.query(`SELECT COUNT(*) as total FROM dwd_app_daily_user_rc003`)
        ]);
        return {
            data,
            total: countResult[0].total
        };
    }
    async getDashboardData() {
        try {
            const [optionCount, appUserCount, payDataCount, dailyUserCount] = await Promise.all([
                this.query('SELECT COUNT(*) as count FROM `option_rc003`'),
                this.query('SELECT COUNT(*) as count FROM `app_user_rc003`'),
                this.query('SELECT COUNT(*) as count FROM `dwd_app_pay_rc003`'),
                this.query('SELECT COUNT(*) as count FROM `dwd_app_daily_user_rc003`')
            ]);
            const payStats = await this.query(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CAST(pay_money AS DECIMAL(10,2))) as total_revenue,
          AVG(CAST(pay_money AS DECIMAL(10,2))) as avg_revenue
        FROM \`dwd_app_pay_rc003\`
        WHERE pay_money IS NOT NULL AND pay_money > 0
      `);
            const dailyUserTrend = await this.query(`
        SELECT 
          event_date as date,
          COUNT(DISTINCT app_uid) as daily_active_users
        FROM \`dwd_app_daily_user_rc003\`
        WHERE event_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY event_date
        ORDER BY event_date DESC
        LIMIT 30
      `);
            return {
                summary: {
                    optionCount: optionCount[0]?.count || 0,
                    appUserCount: appUserCount[0]?.count || 0,
                    payDataCount: payDataCount[0]?.count || 0,
                    dailyUserCount: dailyUserCount[0]?.count || 0
                },
                paymentStats: payStats[0] || {},
                dailyUserTrend: dailyUserTrend || []
            };
        }
        catch (error) {
            console.error('获取仪表板数据失败:', error.message);
            throw error;
        }
    }
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 BI数据库连接已关闭');
        }
    }
};
exports.BiDatabaseService = BiDatabaseService;
exports.BiDatabaseService = BiDatabaseService = __decorate([
    (0, common_1.Injectable)()
], BiDatabaseService);
//# sourceMappingURL=bi-database.service.js.map