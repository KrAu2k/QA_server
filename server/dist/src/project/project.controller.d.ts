import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
export declare class ProjectController {
    private readonly projectService;
    constructor(projectService: ProjectService);
    private getClientIp;
    create(createProjectDto: CreateProjectDto, req: any): Promise<{
        data: import("./entities/project.entity").Project;
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    findAll(query: QueryProjectDto, req: any): Promise<{
        data: import("./entities/project.entity").Project[];
        total: number;
        success: boolean;
        message: string;
    } | {
        data: import("./entities/project.entity").Project[];
        success: boolean;
        message: string;
        total?: undefined;
    } | {
        data: any[];
        total: number;
        success: boolean;
        message: any;
    }>;
    findActiveProjects(req: any): Promise<{
        data: import("./entities/project.entity").Project[];
        success: boolean;
        message: string;
    } | {
        data: any[];
        success: boolean;
        message: any;
    }>;
    findOne(id: string, req: any): Promise<{
        data: import("./entities/project.entity").Project;
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    batchToggleStatus(body: {
        ids: string[];
        isActive: boolean;
    }, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    update(id: string, updateProjectDto: UpdateProjectDto, req: any): Promise<{
        data: import("./entities/project.entity").Project;
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    executeUpdate(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        output?: string;
    } | {
        success: boolean;
        message: any;
        output: any;
    }>;
    executeUpdateCode(id: string, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    getMobileAvailability(req: any): Promise<{
        data: {
            available: boolean;
            updatingProjects: string[];
        };
        success: boolean;
        message: string;
    } | {
        data: {
            available: boolean;
            updatingProjects: any[];
        };
        success: boolean;
        message: any;
    }>;
    getProjectUpdateStatus(id: string, req: any): Promise<{
        data: {
            status: import("./entities/project.entity").ProjectUpdateStatus;
            currentLog?: import("./entities/project-update-log.entity").ProjectUpdateLog;
        };
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    getProjectUpdateLogs(id: string, limit: string, req: any): Promise<{
        data: import("./entities/project-update-log.entity").ProjectUpdateLog[];
        success: boolean;
        message: string;
    } | {
        data: any[];
        success: boolean;
        message: any;
    }>;
    getProjectUpdateCodeStatus(id: string, req: any): Promise<{
        data: {
            status: import("./entities/project.entity").ProjectUpdateStatus;
            currentLog?: import("./entities/project-update-code-log.entity").ProjectUpdateCodeLog;
        };
        success: boolean;
        message: string;
    } | {
        data: any;
        success: boolean;
        message: any;
    }>;
    getProjectUpdateCodeLogs(id: string, limit: string, req: any): Promise<{
        data: import("./entities/project-update-code-log.entity").ProjectUpdateCodeLog[];
        success: boolean;
        message: string;
    } | {
        data: any[];
        success: boolean;
        message: any;
    }>;
}
