import { Repository } from 'typeorm';
import { Project, ProjectUpdateStatus } from './entities/project.entity';
import { ProjectUpdateLog } from './entities/project-update-log.entity';
import { ProjectUpdateCodeLog } from './entities/project-update-code-log.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { LogHelper } from '../log/utils/log-helper';
export declare class ProjectService {
    private projectRepository;
    private projectUpdateLogRepository;
    private projectUpdateCodeLogRepository;
    private readonly logHelper;
    private projectGateway;
    constructor(projectRepository: Repository<Project>, projectUpdateLogRepository: Repository<ProjectUpdateLog>, projectUpdateCodeLogRepository: Repository<ProjectUpdateCodeLog>, logHelper: LogHelper, projectGateway: any);
    handleUpdateTimeout(): Promise<void>;
    create(createProjectDto: CreateProjectDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<Project>;
    findAll(userId?: string, ipAddress?: string, userAgent?: string): Promise<Project[]>;
    findAllWithPagination(query: QueryProjectDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<{
        data: Project[];
        total: number;
    }>;
    findOne(id: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<Project>;
    update(id: string, updateProjectDto: UpdateProjectDto, userId?: string, ipAddress?: string, userAgent?: string): Promise<Project>;
    remove(id: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    batchToggleStatus(ids: string[], isActive: boolean, userId?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    findActiveProjects(userId?: string, ipAddress?: string, userAgent?: string): Promise<Project[]>;
    executeUpdate(id: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
        output?: string;
    }>;
    executeUpdateWithRealTimeOutput(id: string, onOutput: (data: string) => void, onError: (error: string) => void, onComplete: () => void, userId?: string, username?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    executeUpdateCodeWithRealTimeOutput(id: string, onOutput: (data: string) => void, onError: (error: string) => void, onComplete: () => void, userId?: string, username?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    getProjectUpdateLogs(projectId: string, limit?: number): Promise<ProjectUpdateLog[]>;
    getProjectUpdateStatus(projectId: string): Promise<{
        status: ProjectUpdateStatus;
        currentLog?: ProjectUpdateLog;
    }>;
    getProjectUpdateCodeLogs(projectId: string, limit?: number): Promise<ProjectUpdateCodeLog[]>;
    getProjectUpdateCodeStatus(projectId: string): Promise<{
        status: ProjectUpdateStatus;
        currentLog?: ProjectUpdateCodeLog;
    }>;
    getActiveProjects(): Promise<Project[]>;
    isMobileAvailable(): Promise<{
        available: boolean;
        updatingProjects: string[];
    }>;
    private broadcastProjectStatus;
    private detectSvnRevision;
}
