import { Project } from './project.entity';
export declare enum UpdateStatus {
    UPDATING = "updating",
    COMPLETED = "completed",
    FAILED = "failed",
    TIMEOUT = "timeout"
}
export declare class ProjectUpdateLog {
    id: string;
    projectId: string;
    project: Project;
    status: UpdateStatus;
    startedBy: string;
    startedByName: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    svnRevision: number;
    exitCode: number;
    signal: string;
    errorMessage: string;
    updatedAt: Date;
}
