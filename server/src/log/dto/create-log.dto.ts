import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateLogDto {
  @IsString()
  app: string;

  @IsString()
  model: string;

  @IsString()
  action: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  billId?: number;

  @IsOptional()
  @IsEnum(['success', 'error'])
  status?: 'success' | 'error';

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  requestData?: any;

  @IsOptional()
  responseData?: any;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsNumber()
  executionTime?: number;
} 