import { SetMetadata } from '@nestjs/common';

export interface LogOptions {
  app: string;
  model: string;
  action: string;
  content?: string;
  billIdField?: string; // 单据ID字段名，用于从请求参数中获取
}

export const LOG_KEY = 'log';
export const Log = (options: LogOptions) => SetMetadata(LOG_KEY, options); 