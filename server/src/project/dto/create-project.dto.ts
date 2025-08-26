import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Matches(
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$|^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/,
    { message: 'H5地址必须是有效的URL格式，支持域名和IP地址' },
  )
  h5Url: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^$|^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$|^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?(\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)?$/,
    { message: '项目图标必须是有效的URL格式，支持域名和IP地址' },
  )
  icon?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // 更新相关
  @IsOptional()
  @IsString()
  updateCommand?: string;

  @IsOptional()
  @IsString()
  updateDirectory?: string;

  @IsOptional()
  @IsBoolean()
  enableUpdate?: boolean;

  // 更新代码相关
  @IsOptional()
  @IsString()
  updateCodeCommand?: string;

  @IsOptional()
  @IsString()
  updateCodeDirectory?: string;

  @IsOptional()
  @IsBoolean()
  enableUpdateCode?: boolean;

  // 打包相关
  @IsOptional()
  @IsString()
  packageCommand?: string;

  @IsOptional()
  @IsString()
  packageDirectory?: string;

  @IsOptional()
  @IsBoolean()
  enablePackage?: boolean;

  @IsOptional()
  @IsString()
  packageDownloadUrl?: string;

  // 清缓存相关
  @IsOptional()
  @IsString()
  clearCacheCommand?: string;

  @IsOptional()
  @IsString()
  clearCacheDirectory?: string;

  @IsOptional()
  @IsBoolean()
  enableClearCache?: boolean;
}
