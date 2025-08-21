export declare enum ProjectUpdateStatus {
    IDLE = "idle",
    UPDATING = "updating"
}
export declare class Project {
    id: string;
    name: string;
    description?: string;
    h5Url: string;
    icon?: string;
    sortOrder: number;
    isActive: boolean;
    updateCommand?: string;
    updateDirectory?: string;
    enableUpdate: boolean;
    updateCodeCommand?: string;
    updateCodeDirectory?: string;
    enableUpdateCode: boolean;
    currentUpdateStatus: ProjectUpdateStatus;
    currentUpdateLogId?: string;
    currentUpdateCodeStatus: ProjectUpdateStatus;
    currentUpdateCodeLogId?: string;
    createdAt: Date;
    updatedAt: Date;
}
