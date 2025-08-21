import { User } from '../../user/entities/user.entity';
export declare class Department {
    id: number;
    name: string;
    code: string;
    sort: number;
    status: number;
    description?: string;
    path?: string;
    level: number;
    managerIds?: string[];
    managerNames?: string[];
    parent?: Department;
    children?: Department[];
    members?: User[];
    createdAt: Date;
    updatedAt: Date;
    parentId?: number;
    parentName?: string;
    memberCount?: number;
    childCount?: number;
    totalMemberCount?: number;
    createTime?: string;
    updateTime?: string;
}
