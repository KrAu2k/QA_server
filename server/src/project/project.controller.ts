import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  private getClientIp(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress ||
           request.headers['x-forwarded-for']?.split(',')[0] ||
           'unknown';
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      const project = await this.projectService.create(createProjectDto, userId, ipAddress, userAgent);
      return {
        data: project,
        success: true,
        message: '创建项目成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '创建项目失败'
      };
    }
  }

  @Get()
  async findAll(@Query() query: QueryProjectDto, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      if (query.current || query.pageSize) {
        // 分页查询
        const result = await this.projectService.findAllWithPagination(query, userId, ipAddress, userAgent);
        return {
          data: result.data,
          total: result.total,
          success: true,
          message: '获取项目列表成功'
        };
      } else {
        // 获取所有项目
        const projects = await this.projectService.findAll(userId, ipAddress, userAgent);
        return {
          data: projects,
          success: true,
          message: '获取项目列表成功'
        };
      }
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: false,
        message: error.message || '获取项目列表失败'
      };
    }
  }

  @Get('active')
  async findActiveProjects(@Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      const projects = await this.projectService.getActiveProjects();
      return {
        data: projects,
        success: true,
        message: '获取工作台项目成功'
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error.message || '获取工作台项目失败'
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      const project = await this.projectService.findOne(id, userId, ipAddress, userAgent);
      return {
        data: project,
        success: true,
        message: '获取项目详情成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '获取项目详情失败'
      };
    }
  }

  @Put('batch-toggle-status')
  @UseGuards(AdminGuard)
  async batchToggleStatus(@Body() body: { ids: string[], isActive: boolean }, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      await this.projectService.batchToggleStatus(body.ids, body.isActive, userId, ipAddress, userAgent);
      return {
        success: true,
        message: `批量${body.isActive ? '启用' : '禁用'}成功`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '批量状态更新失败'
      };
    }
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      const project = await this.projectService.update(id, updateProjectDto, userId, ipAddress, userAgent);
      return {
        data: project,
        success: true,
        message: '更新项目成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '更新项目失败'
      };
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      await this.projectService.remove(id, userId, ipAddress, userAgent);
      return {
        success: true,
        message: '删除项目成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除项目失败'
      };
    }
  }

  @Post(':id/update')
  async executeUpdate(@Param('id') id: string, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      const result = await this.projectService.executeUpdate(id, userId, ipAddress, userAgent);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || '执行更新失败',
        output: error.message
      };
    }
  }

  @Post(':id/update-code')
  async executeUpdateCode(@Param('id') id: string, @Request() req: any) {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id || req.user?.userId;

      // 这里需要实现WebSocket连接来处理实时输出
      // 暂时返回成功消息，实际实现需要在WebSocket Gateway中处理
      return {
        success: true,
        message: '代码更新命令已启动，请通过WebSocket监听实时输出'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '执行代码更新失败'
      };
    }
  }

  @Get('mobile/availability')
  async getMobileAvailability(@Request() req: any) {
    try {
      const result = await this.projectService.isMobileAvailable();
      return {
        data: result,
        success: true,
        message: result.available ? '移动端可正常访问' : '移动端暂时不可用，有项目正在更新中'
      };
    } catch (error) {
      return {
        data: { available: true, updatingProjects: [] }, // 出错时默认可用
        success: false,
        message: error.message || '获取移动端状态失败'
      };
    }
  }

  @Get(':id/update-status')
  async getProjectUpdateStatus(
    @Param('id') id: string,
    @Request() req: any
  ) {
    try {
      const result = await this.projectService.getProjectUpdateStatus(id);
      return {
        data: result,
        success: true,
        message: '获取项目更新状态成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '获取项目更新状态失败'
      };
    }
  }

  @Get(':id/update-logs')
  async getProjectUpdateLogs(
    @Param('id') id: string,
    @Query('limit') limit: string = '10',
    @Request() req: any
  ) {
    try {
      const logs = await this.projectService.getProjectUpdateLogs(id, parseInt(limit));
      return {
        data: logs,
        success: true,
        message: '获取项目更新日志成功'
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error.message || '获取项目更新日志失败'
      };
    }
  }

  @Get(':id/update-code-status')
  async getProjectUpdateCodeStatus(
    @Param('id') id: string,
    @Request() req: any
  ) {
    try {
      const result = await this.projectService.getProjectUpdateCodeStatus(id);
      return {
        data: result,
        success: true,
        message: '获取项目更新代码状态成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '获取项目更新代码状态失败'
      };
    }
  }

  @Get(':id/update-code-logs')
  async getProjectUpdateCodeLogs(
    @Param('id') id: string,
    @Query('limit') limit: string = '10',
    @Request() req: any
  ) {
    try {
      const logs = await this.projectService.getProjectUpdateCodeLogs(id, parseInt(limit));
      return {
        data: logs,
        success: true,
        message: '获取项目更新代码日志成功'
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error.message || '获取项目更新代码日志失败'
      };
    }
  }


  
  @Get(':id/package-status')
  async getProjectPackageStatus(@Param('id') id: string) {
    try {
      const result = await this.projectService.getProjectPackageStatus(id);
      return {
        data: result,
        success: true,
        message: '获取打包状态成功',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '获取打包状态失败',
      };
    }
  }

  @Get(':id/package-logs')
  async getProjectPackageLogs(@Param('id') id: string, @Query('limit') limit = '10') {
    try {
      const logs = await this.projectService.getProjectPackageLogs(id, parseInt(limit, 10));
      return {
        data: logs,
        success: true,
        message: '获取打包日志成功',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error.message || '获取打包日志失败',
      };
    }
  }

  @Get(':id/clear-cache-status')
  async getClearCacheStatus(@Param('id') id: string) {
    try {
      const result = await this.projectService.getClearCacheStatus(id);
      return {
        data: result,
        success: true,
        message: '获取清缓存状态成功',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '获取清缓存状态失败',
      };
    }
  }

  @Get(':id/clear-cache-logs')
  async getClearCacheLogs(@Param('id') id: string, @Query('limit') limit = '10') {
    try {
      const logs = await this.projectService.getClearCacheLogs(id, parseInt(limit, 10));
      return {
        data: logs,
        success: true,
        message: '获取清缓存日志成功',
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error.message || '获取清缓存日志失败',
      };
    }
  }



  // 触发打 APK（POST）
// URL: /api/projects/:id/package   （若你的全局前缀不是 /api，请把前端 URL 对齐）

  // 打 APK（POST）
  @Post(':id/package')
  async executePackage(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || req.user?.userId || 'anonymous';
    const { logId } = await this.projectService.executePackageWithRealTimeOutput(id, userId);
    return { data: { logId }, success: true, message: '打包任务已触发' };
  }

  // 清缓存（POST）
  @Post(':id/clear-cache')
  async executeClearCache(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id || req.user?.userId || 'anonymous';
    const { logId } = await this.projectService.executeClearCacheWithRealTimeOutput(id, userId);
    return { data: { logId }, success: true, message: '清缓存任务已触发' };
  }

}
