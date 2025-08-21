import { Controller, Get, Query } from '@nestjs/common';
import { BiDatabaseService } from './bi-database.service';

@Controller('bi')
export class BiDatabaseController {
  constructor(
    private readonly biDatabaseService: BiDatabaseService
  ) {}

  @Get('test')
  async testConnection() {
    try {
      const isConnected = await this.biDatabaseService.connect();
      if (isConnected) {
        const tables = await this.biDatabaseService.getTables();
        return {
          success: true,
          message: 'BI数据库连接成功',
          tables: tables.filter((table) =>
            table.includes('option_rc003') ||
            table.includes('app_user_rc003') ||
            table.includes('dwd_app_pay_rc003') ||
            table.includes('dwd_app_daily_user_rc003')
          )
        };
      } else {
        return { success: false, message: 'BI数据库连接失败' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('dashboard')
  async getDashboard() {
    try {
      const data = await this.biDatabaseService.getDashboardData();
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('option-rc003')
  async getOptionRc003(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    try {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 20;
      const data = await this.biDatabaseService.getOptionRc003Data(pageNum, size);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('app-user-rc003')
  async getAppUserRc003(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    try {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 20;
      const data = await this.biDatabaseService.getAppUserRc003Data(pageNum, size);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('pay-data-rc003')
  async getPayDataRc003(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    try {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 20;
      const data = await this.biDatabaseService.getDwdAppPayRc003Data(pageNum, size);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('daily-user-rc003')
  async getDailyUserRc003(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    try {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 20;
      const data = await this.biDatabaseService.getDwdAppDailyUserRc003Data(pageNum, size);
      return { success: true, ...data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
