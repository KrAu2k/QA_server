import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class BiDatabaseService {
  private connection: mysql.Connection;

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
    } catch (error) {
      console.error('❌ BI数据库连接失败:', error.message);
      return false;
    }
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.connection) {
      await this.connect();
    }
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows as any[];
    } catch (error) {
      console.error('BI数据库查询错误:', error.message);
      throw error;
    }
  }

  async getTables(): Promise<string[]> {
    const tables = await this.query('SHOW TABLES');
    return tables.map(table => Object.values(table)[0] as string);
  }

  async getTableData(tableName: string, limit: number = 100): Promise<any[]> {
    return await this.query(`SELECT * FROM \`${tableName}\` LIMIT ${limit}`);
  }

  // ===================== 四表分页查询方法 =====================
  async getOptionRc003Data(page: number = 1, pageSize: number = 20): Promise<{data: any[], total: number}> {
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

  async getAppUserRc003Data(page: number = 1, pageSize: number = 20): Promise<{data: any[], total: number}> {
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

  async getDwdAppPayRc003Data(page: number = 1, pageSize: number = 20): Promise<{data: any[], total: number}> {
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

  async getDwdAppDailyUserRc003Data(page: number = 1, pageSize: number = 20): Promise<{data: any[], total: number}> {
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

  // 获取汇总统计数据
  async getDashboardData(): Promise<any> {
    try {
      // 并行获取各表的统计数据
      const [
        optionCount,
        appUserCount,
        payDataCount,
        dailyUserCount
      ] = await Promise.all([
        this.query('SELECT COUNT(*) as count FROM `option_rc003`'),
        this.query('SELECT COUNT(*) as count FROM `app_user_rc003`'),
        this.query('SELECT COUNT(*) as count FROM `dwd_app_pay_rc003`'),
        this.query('SELECT COUNT(*) as count FROM `dwd_app_daily_user_rc003`')
      ]);

      // 获取支付数据统计
      const payStats = await this.query(`
        SELECT 
          COUNT(*) as total_transactions,
          SUM(CAST(pay_money AS DECIMAL(10,2))) as total_revenue,
          AVG(CAST(pay_money AS DECIMAL(10,2))) as avg_revenue
        FROM \`dwd_app_pay_rc003\`
        WHERE pay_money IS NOT NULL AND pay_money > 0
      `);

      // 获取日活跃用户趋势（最近30天）
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
    } catch (error) {
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
}
