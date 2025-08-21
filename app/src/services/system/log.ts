import { request } from '@umijs/max';

export interface LogItem {
  id: number;
  app: string;
  model: string;
  billId?: number;
  action: string;
  content: string;
  status: 'success' | 'error';
  ipAddress?: string;
  userAgent?: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  executionTime?: number;
  userId?: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface QueryLogParams {
  current?: number;
  pageSize?: number;
  app?: string;
  model?: string;
  action?: string;
  status?: 'success' | 'error';
  userId?: string;
  userName?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface LogStats {
  todayLogs: number;
  yesterdayLogs: number;
  totalLogs: number;
  errorLogs: number;
  successRate: string;
}

export interface LogUser {
  userId: string;
  userName: string;
  userUsername: string;
  userEmail: string;
}

export interface UserLoginLog {
  id: number;
  action: 'login' | 'logout';
  status: 'success' | 'error';
  ipAddress?: string;
  userAgent?: string;
  content: string;
  createdAt: string;
  errorMessage?: string;
}

/**
 * 查询日志列表
 */
export async function queryLogs(params: QueryLogParams) {
  return request<{
    data: LogItem[];
    total: number;
    success: boolean;
    message: string;
  }>('/api/logs', {
    method: 'GET',
    params,
  });
}

/**
 * 获取日志统计信息
 */
export async function getLogStats() {
  return request<{
    data: LogStats;
    success: boolean;
    message: string;
  }>('/api/logs/stats', {
    method: 'GET',
  });
}

/**
 * 查询日志详情
 */
export async function getLogDetail(id: number) {
  return request<{
    data: LogItem;
    success: boolean;
    message: string;
  }>(`/api/logs/${id}`, {
    method: 'GET',
  });
}

/**
 * 删除日志
 */
export async function deleteLog(id: number) {
  return request<{
    success: boolean;
    message: string;
  }>(`/api/logs/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除日志
 */
export async function batchDeleteLogs(ids: number[]) {
  return request<{
    success: boolean;
    message: string;
  }>('/api/logs/batch-delete', {
    method: 'POST',
    data: { ids },
  });
}

/**
 * 清理过期日志
 */
export async function cleanExpiredLogs(days: number = 90) {
  return request<{
    data: { deletedCount: number };
    success: boolean;
    message: string;
  }>('/api/logs/clean-expired', {
    method: 'POST',
    data: { days },
  });
}

/**
 * 获取操作用户列表
 */
export async function getLogUsers() {
  return request<{
    data: LogUser[];
    success: boolean;
    message: string;
  }>('/api/logs/users', {
    method: 'GET',
  });
}

/**
 * 获取用户登录日志
 */
export async function getUserLoginLogs(userId: string, limit?: number) {
  return request<{
    data: UserLoginLog[];
    success: boolean;
    message: string;
  }>(`/api/logs/user/${userId}/login-logs`, {
    method: 'GET',
    params: { limit },
  });
} 