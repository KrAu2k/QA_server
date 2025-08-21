export declare class CreateDepartmentDto {
    name: string;
    code: string;
    parentId?: number;
    managerIds?: string[];
    description?: string;
    sort?: number;
    status?: boolean;
}
