import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  MoveDepartmentDto,
  UpdateDepartmentStatusDto,
  AddMemberDto,
  SetManagerDto,
} from './dto/department-operation.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('departments')
@UseGuards(AuthGuard('jwt'))
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  /**
   * 获取部门树
   */
  @Get('tree')
  async findTree() {
    const data = await this.departmentService.findTree();
    return {
      success: true,
      data,
      message: '获取部门树成功',
    };
  }

  /**
   * 获取部门详情
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.departmentService.findOne(id);
    return {
      success: true,
      data,
      message: '获取部门详情成功',
    };
  }

  /**
   * 创建部门
   */
  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const data = await this.departmentService.create(createDepartmentDto);
    return {
      success: true,
      data,
      message: '创建部门成功',
    };
  }

  /**
   * 更新部门
   */
  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const data = await this.departmentService.update(id, updateDepartmentDto);
    return {
      success: true,
      data,
      message: '更新部门成功',
    };
  }

  /**
   * 删除部门
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.departmentService.remove(id);
    return {
      success: true,
      message: '删除部门成功',
    };
  }

  /**
   * 更新部门状态
   */
  @Patch(':id/status')
  @UseGuards(AdminGuard)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateDepartmentStatusDto,
  ) {
    const data = await this.departmentService.updateStatus(id, updateStatusDto.status);
    return {
      success: true,
      data,
      message: '更新部门状态成功',
    };
  }

  /**
   * 移动部门
   */
  @Patch(':id/move')
  async moveDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveDepartmentDto: MoveDepartmentDto,
  ) {
    const data = await this.departmentService.moveDepartment(id, moveDepartmentDto);
    return {
      success: true,
      data,
      message: '移动部门成功',
    };
  }

  /**
   * 获取可分配给部门的用户列表
   */
  @Get(':id/available-users')
  async getAvailableUsers(@Param('id', ParseIntPipe) id: number) {
    const data = await this.departmentService.getAvailableUsers(id);
    return {
      success: true,
      data,
      message: '获取可分配用户列表成功',
    };
  }

  /**
   * 获取部门成员
   */
  @Get(':id/members')
  async getDepartmentMembers(@Param('id', ParseIntPipe) id: number) {
    const data = await this.departmentService.getDepartmentMembers(id);
    return {
      success: true,
      data,
      message: '获取部门成员成功',
    };
  }

  /**
   * 添加部门成员
   */
  @Post(':id/members')
  @UseGuards(AdminGuard)
  async addMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMemberDto: AddMemberDto,
  ) {
    await this.departmentService.addMembers(id, addMemberDto);
    return {
      success: true,
      message: '添加部门成员成功',
    };
  }

  /**
   * 移除部门成员
   */
  @Delete(':id/members/:userId')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId') userId: string,
  ) {
    await this.departmentService.removeMember(id, Number(userId));
    return {
      success: true,
      message: '移除部门成员成功',
    };
  }

  /**
   * 设置部门负责人
   */
  @Put(':id/manager')
  @UseGuards(AdminGuard)
  async setManager(
    @Param('id', ParseIntPipe) id: number,
    @Body() setManagerDto: SetManagerDto,
  ) {
    const data = await this.departmentService.setManager(id, setManagerDto);
    return {
      success: true,
      data,
      message: '设置部门负责人成功',
    };
  }
}
