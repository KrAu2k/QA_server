import { Project } from './project.entity';
export declare enum UpdateCodeStatus {
    UPDATING = "updating",
    COMPLETED = "completed",
    FAILED = "failed",
    TIMEOUT = "timeout"
}
export declare class ProjectUpdateCodeLog {
    id: string;
    projectId: string;
    status: UpdateCodeStatus;
    startedBy?: string;
    startedByName?: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    svnRevision: number;
    exitCode: number;
    signal: string;
    errorMessage: string;
    createdAt: Date;
    updatedAt: Date;
    project: Project;
}
