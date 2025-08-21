import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { QueryUserDto } from './dto/query-user.dto';
import { AdminGuard } from '../auth/admin.guard';
import { ChangePasswordDto, AdminChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() data: Partial<User>, @Request() req: any) {
    try {
      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      const newUser = await this.userService.createUser(data, userId, ipAddress, userAgent);
      const userWithDefaultAvatar = {
        ...newUser,
        avatar: newUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
      };
      return {
        data: userWithDefaultAvatar,
        success: true,
        message: '创建用户成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '创建用户失败'
      };
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query() query: QueryUserDto, @Request() req: any) {
    console.log('token 验证成功, query params:', query);
    
    try {
      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      const result = await this.userService.findAllWithPagination(query, userId, ipAddress, userAgent);
      
      // 为 avatar 字段添加默认值
      const usersWithDefaultAvatar = result.data.map(user => ({
        ...user,
        avatar: user.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
      }));
      
      return {
        data: usersWithDefaultAvatar,
        total: result.total,
        success: true,
        message: '获取用户列表成功'
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        success: false,
        message: error.message || '获取用户列表失败'
      };
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Request() req: any) {
    console.log('findOne id:', id);
    try {
      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      const user = await this.userService.findOne(parseInt(id), userId, ipAddress, userAgent);
      // 为 avatar 字段添加默认值
      const userWithDefaultAvatar = {
        ...user,
        avatar: user.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
      };
      return {
        data: userWithDefaultAvatar,
        success: true,
        message: '获取用户详情成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '获取用户详情失败'
      };
    }
  }

  @Put('batch-toggle-status')
  @UseGuards(AdminGuard)
  async batchToggleStatus(@Body() body: { ids: number[], isActive: boolean }, @Request() req: any) {
    try {
      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      await this.userService.batchUpdateStatus(body.ids, body.isActive, userId, ipAddress, userAgent);
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

  @Put(':id/toggle-status')
  @UseGuards(AdminGuard)
  async toggleUserStatus(@Param('id') id: string, @Body() body: { isActive: boolean }, @Request() req: any) {
    try {
      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      const updatedUser = await this.userService.updateUser(parseInt(id), { isActive: body.isActive }, userId, ipAddress, userAgent);
      const userWithDefaultAvatar = {
        ...updatedUser,
        avatar: updatedUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
      };
      return {
        data: userWithDefaultAvatar,
        success: true,
        message: `用户${body.isActive ? '启用' : '禁用'}成功`
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '状态更新失败'
      };
    }
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() data: Partial<User>, @Request() req: any) {
    try {
      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      const updatedUser = await this.userService.updateUser(parseInt(id), data, userId, ipAddress, userAgent);
      const userWithDefaultAvatar = {
        ...updatedUser,
        avatar: updatedUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
      };
      return {
        data: userWithDefaultAvatar,
        success: true,
        message: '更新用户成功'
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message || '更新用户失败'
      };
    }
  }

  @Delete(':id') 
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string, @Request() req: any) {
    console.log('delete id:', id)
    try {
      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      await this.userService.deleteUser(parseInt(id), userId, ipAddress, userAgent);
      
      return {
        success: true,
        message: 'delete success'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除用户失败'
      };
    }
  }

  // 修改密码（用户自己修改）
  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req: any) {
    try {
      const { oldPassword, newPassword, confirmPassword } = changePasswordDto;
      
      // 验证新密码和确认密码是否一致
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: '新密码和确认密码不一致'
        };
      }

      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const userId = req.user?.id;

      await this.userService.changePassword(userId, oldPassword, newPassword, userId, ipAddress, userAgent);
      
      return {
        success: true,
        message: '密码修改成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '密码修改失败'
      };
    }
  }

  // 管理员重置密码
  @Put(':id/reset-password')
  @UseGuards(AdminGuard)
  async adminResetPassword(@Param('id') id: string, @Body() adminChangePasswordDto: AdminChangePasswordDto, @Request() req: any) {
    try {
      const { newPassword, confirmPassword } = adminChangePasswordDto;
      
      // 验证新密码和确认密码是否一致
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: '新密码和确认密码不一致'
        };
      }

      // 获取客户端信息
      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const adminUserId = req.user?.id;

      await this.userService.adminResetPassword(parseInt(id), newPassword, adminUserId, ipAddress, userAgent);
      
      return {
        success: true,
        message: '密码重置成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '密码重置失败'
      };
    }
  }

  private getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}