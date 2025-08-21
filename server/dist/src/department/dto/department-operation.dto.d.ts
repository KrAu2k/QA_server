export declare class MoveDepartmentDto {
    parentId?: number | null;
    sort?: number;
}
export declare class UpdateDepartmentStatusDto {
    status: number;
}
export declare class BatchOperationDto {
    ids: number[];
    operation: 'enable' | 'disable' | 'delete';
}
export declare class AddMemberDto {
    userIds: number[];
}
export declare class SetManagerDto {
    userIds: number[];
}
