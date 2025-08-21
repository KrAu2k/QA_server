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
var DepartmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("./entities/department.entity");
const user_entity_1 = require("../user/entities/user.entity");
let DepartmentService = DepartmentService_1 = class DepartmentService {
    constructor(departmentRepository, userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(DepartmentService_1.name);
    }
    async findTree() {
        const allDepartments = await this.departmentRepository.find({
            relations: ['parent'],
            order: { sort: 'ASC', id: 'ASC' },
        });
        const tree = this.buildDepartmentTree(allDepartments);
        return await this.transformDepartmentTree(tree);
    }
    async findOne(id) {
        const department = await this.departmentRepository.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
        }
        const stats = await this.getDepartmentStats(id);
        let managerNames = [];
        if (department.managerIds && department.managerIds.length > 0) {
            const managers = await this.userRepository.findBy({ id: (0, typeorm_2.In)(department.managerIds) });
            managerNames = managers.map(u => u.name);
        }
        const result = this.transformDepartment(department, stats);
        result.managerNames = managerNames;
        return result;
    }
    async create(createDepartmentDto) {
        const { parentId, managerIds, status, ...rest } = createDepartmentDto;
        this.logger.log(`【测试日志】创建部门，参数: ${JSON.stringify(createDepartmentDto)}`);
        const existingDept = await this.departmentRepository.findOne({
            where: { code: rest.code },
        });
        if (existingDept) {
            throw new common_1.BadRequestException('部门编码已存在');
        }
        const department = this.departmentRepository.create({
            ...rest,
            status: status ? 1 : 0,
            sort: rest.sort || 0,
        });
        if (parentId) {
            const parent = await this.departmentRepository.findOne({
                where: { id: parentId },
            });
            if (!parent) {
                throw new common_1.NotFoundException(`上级部门不存在`);
            }
            department.parent = parent;
            department.level = parent.level + 1;
        }
        else {
            department.level = 1;
        }
        department.managerIds = Array.isArray(managerIds) ? managerIds : [];
        const savedDepartment = await this.departmentRepository.save(department);
        await this.updateDepartmentPath(savedDepartment);
        return this.findOne(savedDepartment.id);
    }
    async update(id, updateDepartmentDto) {
        this.logger.log(`【测试日志】更新部门，ID: ${id}，参数: ${JSON.stringify(updateDepartmentDto)}`);
        const department = await this.departmentRepository.findOne({
            where: { id },
            relations: ['parent'],
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
        }
        const { parentId, managerIds, status, ...rest } = updateDepartmentDto;
        if (rest.code && rest.code !== department.code) {
            const existingDept = await this.departmentRepository.findOne({
                where: { code: rest.code },
            });
            if (existingDept && existingDept.id !== id) {
                throw new common_1.BadRequestException('部门编码已存在');
            }
        }
        Object.assign(department, rest);
        if (status !== undefined) {
            department.status = status ? 1 : 0;
        }
        if (parentId !== undefined) {
            if (parentId === null) {
                department.parent = null;
                department.level = 1;
            }
            else {
                if (await this.wouldCreateCircularReference(id, parentId)) {
                    throw new common_1.BadRequestException('不能将部门移动到自己的子部门下');
                }
                const parent = await this.departmentRepository.findOne({
                    where: { id: parentId },
                });
                if (!parent) {
                    throw new common_1.NotFoundException(`上级部门不存在`);
                }
                department.parent = parent;
                department.level = parent.level + 1;
            }
        }
        if (managerIds !== undefined) {
            department.managerIds = Array.isArray(managerIds) ? managerIds : [];
        }
        await this.departmentRepository.save(department);
        if (parentId !== undefined) {
            await this.updateDepartmentPath(department);
            await this.updateChildrenLevels(department);
        }
        return this.findOne(id);
    }
    async remove(id) {
        this.logger.log(`【测试日志】删除部门，ID: ${id}`);
        const department = await this.departmentRepository.findOne({
            where: { id },
            relations: ['children'],
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
        }
        if (department.children && department.children.length > 0) {
            throw new common_1.BadRequestException('该部门下还有子部门，无法删除');
        }
        const memberCount = await this.userRepository.count({
            where: { departmentId: id },
        });
        if (memberCount > 0) {
            throw new common_1.BadRequestException('该部门下还有成员，无法删除');
        }
        await this.departmentRepository.remove(department);
    }
    async updateStatus(id, status) {
        const department = await this.departmentRepository.findOne({
            where: { id },
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
        }
        department.status = status;
        await this.departmentRepository.save(department);
        return this.findOne(id);
    }
    async moveDepartment(id, moveDepartmentDto) {
        this.logger.log(`【测试日志】移动部门，部门ID: ${id}，目标上级ID: ${moveDepartmentDto.parentId}，排序: ${moveDepartmentDto.sort}`);
        const { parentId, sort } = moveDepartmentDto;
        const department = await this.departmentRepository.findOne({
            where: { id },
            relations: ['parent'],
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
        }
        if (parentId !== undefined) {
            if (parentId === null) {
                department.parent = null;
                department.level = 1;
            }
            else {
                if (await this.wouldCreateCircularReference(id, parentId)) {
                    throw new common_1.BadRequestException('不能将部门移动到自己的子部门下');
                }
                const parent = await this.departmentRepository.findOne({
                    where: { id: parentId },
                });
                if (!parent) {
                    throw new common_1.NotFoundException(`目标上级部门不存在`);
                }
                department.parent = parent;
                department.level = parent.level + 1;
            }
        }
        if (sort !== undefined) {
            department.sort = sort;
        }
        await this.departmentRepository.save(department);
        await this.updateDepartmentPath(department);
        await this.updateChildrenLevels(department);
        return this.findOne(id);
    }
    async getAvailableUsers(departmentId) {
        const users = await this.userRepository.find({
            where: [
                { departmentId: null, isActive: true },
                { departmentId: (0, typeorm_2.Not)(departmentId), isActive: true }
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
    async getDepartmentMembers(id) {
        const department = await this.departmentRepository.findOne({
            where: { id },
            relations: ['members'],
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
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
    async addMembers(id, addMemberDto) {
        this.logger.log('【测试日志】addMembers方法被调用');
        console.log('addMembers called');
        const department = await this.departmentRepository.findOne({
            where: { id },
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
        }
        this.logger.log(`为部门[ID=${id}, 名称=${department.name}]添加成员: ${addMemberDto.userIds.join(',')}`);
        this.logger.log(`【测试日志】为部门[ID=${id}]添加成员: ${addMemberDto.userIds.join(',')}`);
        for (const userId of addMemberDto.userIds) {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`ID为 ${userId} 的用户不存在`);
            }
            user.departmentId = id;
            user.department = department;
            await this.userRepository.save(user);
        }
    }
    async removeMember(departmentId, userId) {
        this.logger.log(`【测试日志】移除部门成员，部门ID: ${departmentId}，用户ID: ${userId}`);
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`ID为 ${userId} 的用户不存在`);
        }
        if (user.departmentId !== departmentId) {
            throw new common_1.BadRequestException('该用户不属于指定部门');
        }
        user.departmentId = null;
        user.department = null;
        await this.userRepository.save(user);
    }
    async setManager(id, setManagerDto) {
        this.logger.log(`【测试日志】设置部门负责人，部门ID: ${id}，负责人ID: ${setManagerDto.userIds?.join(',')}`);
        const department = await this.departmentRepository.findOne({
            where: { id },
        });
        if (!department) {
            throw new common_1.NotFoundException(`ID为 ${id} 的部门不存在`);
        }
        if (setManagerDto.userIds && setManagerDto.userIds.length > 0) {
            const userIdStrings = setManagerDto.userIds.map(String);
            const managers = await this.userRepository.findBy({ id: (0, typeorm_2.In)(userIdStrings) });
            if (managers.length !== setManagerDto.userIds.length) {
                throw new common_1.NotFoundException(`部分指定的负责人不存在`);
            }
            department.managerIds = userIdStrings;
        }
        else {
            department.managerIds = [];
        }
        await this.departmentRepository.save(department);
        return this.findOne(id);
    }
    async transformDepartmentTree(tree) {
        return Promise.all(tree.map(dept => this.transformDepartmentWithManager(dept)));
    }
    async transformDepartmentWithManager(department) {
        const transformed = this.transformDepartment(department);
        if (department.managerIds && department.managerIds.length > 0) {
            const managerIdList = department.managerIds.map(id => typeof id === 'string' ? Number(id) : id);
            const managers = await this.userRepository.findBy({ id: (0, typeorm_2.In)(managerIdList) });
            transformed.managerNames = managers.map(u => u.name);
        }
        else {
            transformed.managerNames = [];
        }
        if (department.children && department.children.length > 0) {
            transformed.children = await Promise.all(department.children.map(child => this.transformDepartmentWithManager(child)));
        }
        return transformed;
    }
    transformDepartment(department, stats) {
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
            transformed.children = department.children.map(child => this.transformDepartment(child));
        }
        return transformed;
    }
    async getDepartmentStats(id) {
        const memberCount = await this.userRepository.count({
            where: { departmentId: id, isActive: true },
        });
        const department = await this.departmentRepository.findOne({
            where: { id },
        });
        if (!department) {
            return { memberCount: 0, totalMemberCount: 0 };
        }
        const descendants = await this.departmentRepository.findDescendants(department);
        const departmentIds = descendants.map(dept => dept.id);
        const totalMemberCount = await this.userRepository.count({
            where: {
                departmentId: departmentIds.length > 0 ? (0, typeorm_2.In)(departmentIds) : id,
                isActive: true
            },
        });
        return {
            memberCount,
            totalMemberCount,
        };
    }
    async wouldCreateCircularReference(departmentId, newParentId) {
        if (departmentId === newParentId) {
            return true;
        }
        const descendants = await this.departmentRepository.findDescendants(await this.departmentRepository.findOne({ where: { id: departmentId } }));
        return descendants.some(desc => desc.id === newParentId);
    }
    async updateDepartmentPath(department) {
        const ancestors = await this.departmentRepository.findAncestors(department);
        const path = ancestors.map(ancestor => ancestor.id).join('/');
        department.path = `/${path}`;
        await this.departmentRepository.save(department);
    }
    async updateChildrenLevels(department) {
        const descendants = await this.departmentRepository.findDescendants(department);
        for (const descendant of descendants) {
            if (descendant.id !== department.id) {
                const ancestors = await this.departmentRepository.findAncestors(descendant);
                descendant.level = ancestors.length;
                await this.departmentRepository.save(descendant);
            }
        }
    }
    buildDepartmentTree(departments, parentId = null) {
        return departments
            .filter(dept => {
            if (parentId === null) {
                return !dept.parent;
            }
            else {
                return dept.parent && dept.parent.id === parentId;
            }
        })
            .map(dept => {
            const children = this.buildDepartmentTree(departments, dept.id);
            return {
                ...dept,
                children: children.length > 0 ? children : undefined,
            };
        })
            .sort((a, b) => a.sort - b.sort || a.id - b.id);
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = DepartmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.TreeRepository,
        typeorm_2.Repository])
], DepartmentService);
//# sourceMappingURL=department.service.js.map