import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { MoveDepartmentDto, UpdateDepartmentStatusDto, AddMemberDto, SetManagerDto } from './dto/department-operation.dto';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
    findTree(): Promise<{
        success: boolean;
        data: import("./entities/department.entity").Department[];
        message: string;
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("./entities/department.entity").Department;
        message: string;
    }>;
    create(createDepartmentDto: CreateDepartmentDto): Promise<{
        success: boolean;
        data: import("./entities/department.entity").Department;
        message: string;
    }>;
    update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<{
        success: boolean;
        data: import("./entities/department.entity").Department;
        message: string;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    updateStatus(id: number, updateStatusDto: UpdateDepartmentStatusDto): Promise<{
        success: boolean;
        data: import("./entities/department.entity").Department;
        message: string;
    }>;
    moveDepartment(id: number, moveDepartmentDto: MoveDepartmentDto): Promise<{
        success: boolean;
        data: import("./entities/department.entity").Department;
        message: string;
    }>;
    getAvailableUsers(id: number): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    getDepartmentMembers(id: number): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    addMembers(id: number, addMemberDto: AddMemberDto): Promise<{
        success: boolean;
        message: string;
    }>;
    removeMember(id: number, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    setManager(id: number, setManagerDto: SetManagerDto): Promise<{
        success: boolean;
        data: import("./entities/department.entity").Department;
        message: string;
    }>;
}
