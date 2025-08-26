import { request } from '@umijs/max';

export interface Project {
  id: string;
  name: string;
  description?: string;
  h5Url: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;

  updateCommand?: string;
  updateDirectory?: string;
  enableUpdate: boolean;

  updateCodeCommand?: string;
  updateCodeDirectory?: string;
  enableUpdateCode: boolean;

  // 新增字段：
  packageCommand?: string;
  packageDirectory?: string;
  enablePackage?: boolean;
  packageDownloadUrl?: string;
  clearCacheCommand?: string;
  clearCacheDirectory?: string;
  enableClearCache?: boolean;
  currentPackageStatus?: 'idle' | 'updating';
  currentPackageLogId?: string;
  currentClearCacheStatus?: 'idle' | 'updating';
  currentClearCacheLogId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest extends Partial<Project> {
  name: string;
  h5Url: string;
}

export interface UpdateProjectRequest extends Partial<Project> {}

export interface QueryProjectRequest {
  current?: string;
  pageSize?: string;
  name?: string;
  isActive?: boolean;
}

export interface ProjectListResponse {
  data: Project[];
  total?: number;
  success: boolean;
  message: string;
}

export interface ProjectResponse {
  data: Project | null;
  success: boolean;
  message: string;
}

export interface BaseResponse {
  success: boolean;
  message: string;
}

// 以下为原有接口，保持不变

export async function getProjects(params?: QueryProjectRequest): Promise<ProjectListResponse> {
  return request('/api/projects', {
    method: 'GET',
    params,
  });
}

export async function getAllProjects(): Promise<ProjectListResponse> {
  return request('/api/projects', {
    method: 'GET',
  });
}

export async function getActiveProjects(): Promise<ProjectListResponse> {
  return request('/api/projects/active', {
    method: 'GET',
  });
}

export async function getProject(id: string): Promise<ProjectResponse> {
  return request(`/api/projects/${id}`, {
    method: 'GET',
  });
}

export async function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
  return request('/api/projects', {
    method: 'POST',
    data,
  });
}

export async function updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectResponse> {
  return request(`/api/projects/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteProject(id: string): Promise<BaseResponse> {
  return request(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function batchToggleProjectStatus(ids: string[], isActive: boolean): Promise<BaseResponse> {
  return request('/api/projects/batch-toggle-status', {
    method: 'PUT',
    data: { ids, isActive },
  });
}

// 更新项目命令接口
export async function executeProjectUpdate(id: string): Promise<{ success: boolean; message: string; output?: string }> {
  return request(`/api/projects/${id}/update`, {
    method: 'POST',
  });
}






// 新增请求方法
export async function getProjectPackageStatus(projectId: string) {
  return request(`/api/projects/${projectId}/package-status`, {
    method: 'GET',
  });
}

export async function getProjectPackageLogs(projectId: string, limit = 10) {
  return request(`/api/projects/${projectId}/package-logs`, {
    method: 'GET',
    params: { limit },
  });
}

export async function getProjectClearCacheStatus(projectId: string) {
  return request(`/api/projects/${projectId}/clear-cache-status`, {
    method: 'GET',
  });
}

export async function getProjectClearCacheLogs(projectId: string, limit = 10) {
  return request(`/api/projects/${projectId}/clear-cache-logs`, {
    method: 'GET',
    params: { limit },
  });
}


// 获取【项目更新】日志（limit 默认 10）
export async function getProjectUpdateLogs(projectId: string, limit: number = 10) {
  return request(`/api/projects/${projectId}/update-logs`, {
    method: 'GET',
    params: { limit },
  });
}

// 获取【项目更新代码】日志（limit 默认 10）
export async function getProjectUpdateCodeLogs(projectId: string, limit: number = 10) {
  return request(`/api/projects/${projectId}/update-code-logs`, {
    method: 'GET',
    params: { limit },
  });
}

export async function executeProjectPackage(id: string) {
   return request(`/api/projects/${id}/package`, { method: 'POST' });
}

export async function executeProjectClearCache(id: string) {
  return request(`/api/projects/${id}/clear-cache`, { method: 'POST' });
}