import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MoveDepartmentDto {
  @IsOptional()
  @IsNumber()
  parentId?: number | null;

  @IsOptional()
  @IsNumber()
  sort?: number;
}

export class UpdateDepartmentStatusDto {
  @IsNumber()
  status: number;
}

export class BatchOperationDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsString()
  operation: 'enable' | 'disable' | 'delete';
}

export class AddMemberDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @Transform(({ value }) => value ?? [])
  userIds: number[];
}

export class SetManagerDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @Transform(({ value }) => value ?? [])
  userIds: number[];
}
