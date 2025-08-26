import { IsString, IsNotEmpty } from 'class-validator';

/**
 * 通用 ID 参数 DTO。
 */
export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
