import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, IsNull, Not, In } from 'typeorm';
import { Department } from './entities/department.entity';
import { User } from '../user/entities/user.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { MoveDepartmentDto, UpdateDepartmentStatusDto, AddMemberDto, SetManagerDto } from './dto/department-operation.dto';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);
  constructor(
    @InjectRepository(Department)
    private departmentRepository: TreeRepository<Department>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}  /**
   * 获取部门树
   */
  async findTree(): Promise<Department[]> {
    // 获取所有部门数据，包含parent关系，按sort排序
    const allDepartments = await this.departmentRepository.find({
      relations: ['parent'],
      order: { sort: 'ASC', id: 'ASC' },
    });
    
    // 手动构建树形结构
    const tree = this.buildDepartmentTree(allDepartments);
    
    // 转换数据格式，添加前端需要的字段
    return await this.transformDepartmentTree(tree);
  }

  /**
   * 获取部门详情
   */
  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    // 获取部门统计信息
    const stats = await this.getDepartmentStats(id);
    
    // 查负责人姓名
    let managerNames: string[] = [];
    if (department.managerIds && department.managerIds.length > 0) {
      const managers = await this.userRepository.findBy({ id: In(department.managerIds) });
      managerNames = managers.map(u => u.name);
    }
    
    const result = this.transformDepartment(department, stats);
    result.managerNames = managerNames;
    return result;
  }

  /**
   * 创建部门
   */
  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const { parentId, managerIds, status, ...rest } = createDepartmentDto;
    // 测试日志
    this.logger.log(`【测试日志】创建部门，参数: ${JSON.stringify(createDepartmentDto)}`);
    
    // 检查部门编码是否已存在
    const existingDept = await this.departmentRepository.findOne({
      where: { code: rest.code },
    });
    if (existingDept) {
      throw new BadRequestException('部门编码已存在');
    }

    // 创建部门实例
    const department = this.departmentRepository.create({
      ...rest,
      status: status ? 1 : 0,
      sort: rest.sort || 0,
    });

    // 设置上级部门
    if (parentId) {
      const parent = await this.departmentRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException(`上级部门不存在`);
      }
      department.parent = parent;
      department.level = parent.level + 1;
    } else {
      department.level = 1;
    }

    // 设置部门负责人
    department.managerIds = Array.isArray(managerIds) ? managerIds : [];

    const savedDepartment = await this.departmentRepository.save(department);
    
    // 更新部门路径
    await this.updateDepartmentPath(savedDepartment);
    
    return this.findOne(savedDepartment.id);
  }

  /**
   * 更新部门
   */
  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    // 测试日志
    this.logger.log(`【测试日志】更新部门，ID: ${id}，参数: ${JSON.stringify(updateDepartmentDto)}`);
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    const { parentId, managerIds, status, ...rest } = updateDepartmentDto;
    
    // 检查部门编码是否已被其他部门使用
    if (rest.code && rest.code !== department.code) {
      const existingDept = await this.departmentRepository.findOne({
        where: { code: rest.code },
      });
      if (existingDept && existingDept.id !== id) {
        throw new BadRequestException('部门编码已存在');
      }
    }

    // 更新基本信息
    Object.assign(department, rest);
    if (status !== undefined) {
      department.status = status ? 1 : 0;
    }

    // 更新上级部门
    if (parentId !== undefined) {
      if (parentId === null) {
        department.parent = null;
        department.level = 1;
      } else {
        // 检查是否会形成循环引用
        if (await this.wouldCreateCircularReference(id, parentId)) {
          throw new BadRequestException('不能将部门移动到自己的子部门下');
        }
        
        const parent = await this.departmentRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) {
          throw new NotFoundException(`上级部门不存在`);
        }
        department.parent = parent;
        department.level = parent.level + 1;
      }
    }

    // 更新部门负责人
    if (managerIds !== undefined) {
      department.managerIds = Array.isArray(managerIds) ? managerIds : [];
    }

    await this.departmentRepository.save(department);
    
    // 如果改变了上级部门，需要更新路径和层级
    if (parentId !== undefined) {
      await this.updateDepartmentPath(department);
      await this.updateChildrenLevels(department);
    }
    
    return this.findOne(id);
  }

  /**
   * 删除部门
   */
  async remove(id: number): Promise<void> {
    // 测试日志
    this.logger.log(`【测试日志】删除部门，ID: ${id}`);
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    // 检查是否有子部门
    if (department.children && department.children.length > 0) {
      throw new BadRequestException('该部门下还有子部门，无法删除');
    }

    // 检查是否有成员
    const memberCount = await this.userRepository.count({
      where: { departmentId: id },
    });
    if (memberCount > 0) {
      throw new BadRequestException('该部门下还有成员，无法删除');
    }

    await this.departmentRepository.remove(department);
  }

  /**
   * 更新部门状态
   */
  async updateStatus(id: number, status: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    department.status = status;
    await this.departmentRepository.save(department);
    
    return this.findOne(id);
  }

  /**
   * 移动部门
   */
  async moveDepartment(id: number, moveDepartmentDto: MoveDepartmentDto): Promise<Department> {
    // 测试日志
    this.logger.log(`【测试日志】移动部门，部门ID: ${id}，目标上级ID: ${moveDepartmentDto.parentId}，排序: ${moveDepartmentDto.sort}`);
    const { parentId, sort } = moveDepartmentDto;
    
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    // 更新上级部门
    if (parentId !== undefined) {
      if (parentId === null) {
        department.parent = null;
        department.level = 1;
      } else {
        // 检查是否会形成循环引用
        if (await this.wouldCreateCircularReference(id, parentId)) {
          throw new BadRequestException('不能将部门移动到自己的子部门下');
        }
        
        const parent = await this.departmentRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) {
          throw new NotFoundException(`目标上级部门不存在`);
        }
        department.parent = parent;
        department.level = parent.level + 1;
      }
    }

    // 更新排序
    if (sort !== undefined) {
      department.sort = sort;
    }

    await this.departmentRepository.save(department);
    
    // 更新路径和子部门层级
    await this.updateDepartmentPath(department);
    await this.updateChildrenLevels(department);
    
    return this.findOne(id);
  }

  /**
   * 获取可分配给部门的用户列表
   */
  async getAvailableUsers(departmentId: number): Promise<any[]> {
    // 获取没有分配部门的用户或不属于当前部门的用户
    const users = await this.userRepository.find({
      where: [
        { departmentId: null, isActive: true },
        { departmentId: Not(departmentId), isActive: true }
      ],
      select: ['id', 'name', 'username', 'email', 'phone', 'avatar', 'position'],
    });

    return users.map(user => ({
      key: user.id,
      label: `${user.name} (${user.username})`,
      value: user.id,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        position: user.position,
      }
    }));
  }

  /**
   * 获取部门成员
   */
  async getDepartmentMembers(id: number): Promise<any[]> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['members'],
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    return department.members?.map(member => ({
      id: member.id,
      userId: member.id,
      userName: member.name,
      userCode: member.username,
      avatar: member.avatar,
      email: member.email,
      phone: member.phone,
      departmentId: id,
      departmentName: department.name,
      position: member.position,
      isManager: department.managerIds?.includes(String(member.id)) || false,
      joinTime: member.joinDate instanceof Date
        ? member.joinDate.toISOString()
        : (typeof member.joinDate === 'string' ? member.joinDate : (member.createdAt?.toISOString() || null)),
      isActive: member.isActive,
    })) || [];
  }

  /**
   * 添加部门成员
   */
  async addMembers(id: number, addMemberDto: AddMemberDto): Promise<void> {
    this.logger.log('【测试日志】addMembers方法被调用');
    console.log('addMembers called');
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    // 记录日志
    this.logger.log(`为部门[ID=${id}, 名称=${department.name}]添加成员: ${addMemberDto.userIds.join(',')}`);
    // 测试日志
    this.logger.log(`【测试日志】为部门[ID=${id}]添加成员: ${addMemberDto.userIds.join(',')}`);

    // 批量更新用户的部门信息
    for (const userId of addMemberDto.userIds) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`ID为 ${userId} 的用户不存在`);
      }

      user.departmentId = id;
      user.department = department;
      await this.userRepository.save(user);
    }
  }

  /**
   * 移除部门成员
   */
  async removeMember(departmentId: number, userId: number): Promise<void> {
    // 测试日志
    this.logger.log(`【测试日志】移除部门成员，部门ID: ${departmentId}，用户ID: ${userId}`);
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`ID为 ${userId} 的用户不存在`);
    }

    if (user.departmentId !== departmentId) {
      throw new BadRequestException('该用户不属于指定部门');
    }

    // 移除用户的部门关联
    user.departmentId = null;
    user.department = null;
    await this.userRepository.save(user);
  }

  /**
   * 设置部门负责人
   */
  async setManager(id: number, setManagerDto: SetManagerDto): Promise<Department> {
    // 测试日志
    this.logger.log(`【测试日志】设置部门负责人，部门ID: ${id}，负责人ID: ${setManagerDto.userIds?.join(',')}`);
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`ID为 ${id} 的部门不存在`);
    }

    // 验证所有用户是否存在
    if (setManagerDto.userIds && setManagerDto.userIds.length > 0) {
      const userIdStrings = setManagerDto.userIds.map(String);
      const managers = await this.userRepository.findBy({ id: In(userIdStrings) });
      if (managers.length !== setManagerDto.userIds.length) {
        throw new NotFoundException(`部分指定的负责人不存在`);
      }
      department.managerIds = userIdStrings;
    } else {
      department.managerIds = [];
    }
    
    await this.departmentRepository.save(department);
    
    return this.findOne(id);
  }

  /**
   * 转换部门树数据格式
   */
  private async transformDepartmentTree(tree: Department[]): Promise<Department[]> {
    return Promise.all(tree.map(dept => this.transformDepartmentWithManager(dept)));
  }

  // 新增：递归转换部门并查负责人
  private async transformDepartmentWithManager(department: Department): Promise<any> {
    const transformed = this.transformDepartment(department);
    // 查询负责人姓名
    if (department.managerIds && department.managerIds.length > 0) {
      const managerIdList = department.managerIds.map(id => typeof id === 'string' ? Number(id) : id);
      const managers = await this.userRepository.findBy({ id: In(managerIdList) });
      transformed.managerNames = managers.map(u => u.name);
    } else {
      transformed.managerNames = [];
    }
    // 递归处理子部门
    if (department.children && department.children.length > 0) {
      transformed.children = await Promise.all(
        department.children.map(child => this.transformDepartmentWithManager(child))
      );
    }
    return transformed;
  }

  /**
   * 转换部门数据格式
   */
  private transformDepartment(department: Department, stats?: any): Department {
    const transformed = {
      ...department,
      parentId: department.parent?.id || null,
      parentName: department.parent?.name || null,
      managerIds: department.managerIds || [],
      managerNames: [],
      createTime: department.createdAt?.toISOString() || null,
      updateTime: department.updatedAt?.toISOString() || null,
      memberCount: stats?.memberCount || 0,
      childCount: department.children?.length || 0,
      totalMemberCount: stats?.totalMemberCount || 0,
    };

    if (department.children) {
      transformed.children = department.children.map(child => 
        this.transformDepartment(child)
      );
    }

    return transformed;
  }

  /**
   * 获取部门统计信息
   */
  private async getDepartmentStats(id: number): Promise<any> {
    // 获取直接成员数量
    const memberCount = await this.userRepository.count({
      where: { departmentId: id, isActive: true },
    });

    // 获取所有子部门（包括间接子部门）
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      return { memberCount: 0, totalMemberCount: 0 };
    }

    const descendants = await this.departmentRepository.findDescendants(department);
    const departmentIds = descendants.map(dept => dept.id);

    // 获取总成员数量（包括子部门）
    const totalMemberCount = await this.userRepository.count({
      where: { 
        departmentId: departmentIds.length > 0 ? In(departmentIds) : id,
        isActive: true 
      },
    });

    return {
      memberCount,
      totalMemberCount,
    };
  }

  /**
   * 检查是否会形成循环引用
   */
  private async wouldCreateCircularReference(departmentId: number, newParentId: number): Promise<boolean> {
    if (departmentId === newParentId) {
      return true;
    }

    const descendants = await this.departmentRepository.findDescendants(
      await this.departmentRepository.findOne({ where: { id: departmentId } })
    );

    return descendants.some(desc => desc.id === newParentId);
  }

  /**
   * 更新部门路径
   */
  private async updateDepartmentPath(department: Department): Promise<void> {
    const ancestors = await this.departmentRepository.findAncestors(department);
    const path = ancestors.map(ancestor => ancestor.id).join('/');
    
    department.path = `/${path}`;
    await this.departmentRepository.save(department);
  }

  /**
   * 更新子部门层级
   */
  private async updateChildrenLevels(department: Department): Promise<void> {
    const descendants = await this.departmentRepository.findDescendants(department);
    
    for (const descendant of descendants) {
      if (descendant.id !== department.id) {
        const ancestors = await this.departmentRepository.findAncestors(descendant);
        descendant.level = ancestors.length;
        await this.departmentRepository.save(descendant);
      }
    }
  }  /**
   * 手动构建部门树形结构
   */
  private buildDepartmentTree(departments: Department[], parentId: number | null = null): Department[] {
    return departments
      .filter(dept => {
        // 根据parent关系过滤
        if (parentId === null) {
          return !dept.parent; // 顶级部门没有父部门
        } else {
          return dept.parent && dept.parent.id === parentId;
        }
      })
      .map(dept => {
        // 递归构建子部门
        const children = this.buildDepartmentTree(departments, dept.id);
        return {
          ...dept,
          children: children.length > 0 ? children : undefined,
        };
      })
      .sort((a, b) => a.sort - b.sort || a.id - b.id);
  }
}
