import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { QueryLogDto } from './dto/query-log.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('logs')
@UseGuards(AuthGuard('jwt'))
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  async create(@Body() createLogDto: CreateLogDto) {
    try {
      const log = await this.logService.createLog(createLogDto);
      return {
        data: log,
        success: true,
        message: '日志记录创建成功',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '日志记录创建失败',
      };
    }
  }

  @Get()
  async findAll(@Query() query: QueryLogDto) {
    try {
      const result = await this.logService.findAll(query);
      return {
        data: result.data,
        total: result.total,
        success: true,
        message: '查询日志成功',
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: false,
        message: error.message || '查询日志失败',
      };
    }
  }

  @Get('users')
  async getLogUsers() {
    try {
      const users = await this.logService.getLogUsers();
      return {
        data: users,
        success: true,
        message: '获取操作用户列表成功',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error.message || '获取操作用户列表失败',
      };
    }
  }

  @Get('user/:userId/login-logs')
  async getUserLoginLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const logs = await this.logService.getUserLoginLogs(userId, limit ? parseInt(limit) : 10);
      return {
        data: logs,
        success: true,
        message: '获取用户登录日志成功',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error.message || '获取用户登录日志失败',
      };
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.logService.getLogStats();
      return {
        data: stats,
        success: true,
        message: '获取日志统计成功',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '获取日志统计失败',
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const log = await this.logService.findOne(+id);
      return {
        data: log,
        success: true,
        message: '查询日志详情成功',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '查询日志详情失败',
      };
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.logService.deleteLog(+id);
      return {
        success: true,
        message: '删除日志成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除日志失败',
      };
    }
  }

  @Post('batch-delete')
  async batchDelete(@Body() body: { ids: number[] }) {
    try {
      await this.logService.batchDeleteLogs(body.ids);
      return {
        success: true,
        message: '批量删除日志成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '批量删除日志失败',
      };
    }
  }

  @Post('clean-expired')
  async cleanExpired(@Body() body: { days?: number }) {
    try {
      const deletedCount = await this.logService.cleanExpiredLogs(body.days || 90);
      return {
        data: { deletedCount },
        success: true,
        message: `清理过期日志成功，删除了 ${deletedCount} 条记录`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '清理过期日志失败',
      };
    }
  }
} 