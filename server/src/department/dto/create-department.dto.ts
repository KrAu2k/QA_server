import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength, Min, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @IsString()
  @MaxLength(100, { message: '部门名称不能超过100个字符' })
  name: string;

  @IsString()
  @MaxLength(50, { message: '部门编码不能超过50个字符' })
  code: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  managerIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '部门描述不能超过500个字符' })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: '排序号不能小于0' })
  sort?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 1 || value === '1')
  @IsBoolean()
  status?: boolean;
}
