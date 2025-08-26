import { IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectUpdateStatus } from '../entities/project.entity';

/**
 * 日志查询 DTO，支持分页和按状态过滤。
 */
export class GetLogsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @IsOptional()
  @IsEnum(ProjectUpdateStatus)
  status?: ProjectUpdateStatus;
}
