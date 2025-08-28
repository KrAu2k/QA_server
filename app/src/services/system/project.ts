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
  currentUpdateStatus: 'idle' | 'updating';
  currentUpdateLogId?: string;
  currentUpdateCodeStatus: 'idle' | 'updating';
  currentUpdateCodeLogId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  h5Url: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  updateCommand?: string;
  updateDirectory?: string;
  enableUpdate?: boolean;
  updateCodeCommand?: string;
  updateCodeDirectory?: string;
  enableUpdateCode?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  h5Url?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  updateCommand?: string;
  updateDirectory?: string;
  enableUpdate?: boolean;
  updateCodeCommand?: string;
  updateCodeDirectory?: string;
  enableUpdateCode?: boolean;
}

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

export interface ProjectUpdateLog {
  id: string;
  projectId: string;
  status: 'updating' | 'completed' | 'failed' | 'timeout';
  output?: string;
  startedBy?: string;
  startedByName?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  svnRevision?: number; // SVN版本号
  exitCode?: number; // 进程退出码
  signal?: string; // 进程终止信号
  errorMessage?: string; // 错误信息
  updatedAt: string;
}

export interface ProjectUpdateStatus {
  status: 'idle' | 'updating';
  currentLog?: ProjectUpdateLog;
}

// 获取项目列表（分页）
export async function getProjects(params?: QueryProjectRequest): Promise<ProjectListResponse> {
  return request('/api/projects', {
    method: 'GET',
    params,
  });
}

// 获取所有项目（不分页）
export async function getAllProjects(): Promise<ProjectListResponse> {
  return request('/api/projects', {
    method: 'GET',
  });
}

// 获取工作台项目（只返回启用的项目）
export async function getActiveProjects(): Promise<ProjectListResponse> {
  return request('/api/projects/active', {
    method: 'GET',
  });
}

// 获取项目详情
export async function getProject(id: string): Promise<ProjectResponse> {
  return request(`/api/projects/${id}`, {
    method: 'GET',
  });
}

// 创建项目
export async function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
  return request('/api/projects', {
    method: 'POST',
    data,
  });
}

// 更新项目
export async function updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectResponse> {
  return request(`/api/projects/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除项目
export async function deleteProject(id: string): Promise<BaseResponse> {
  return request(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

// 批量更新项目状态
export async function batchToggleProjectStatus(ids: string[], isActive: boolean): Promise<BaseResponse> {
  return request('/api/projects/batch-toggle-status', {
    method: 'PUT',
    data: { ids, isActive },
  });
}

// 执行项目更新
export async function executeProjectUpdate(id: string): Promise<{
  success: boolean;
  message: string;
  output?: string;
}> {
  return request(`/api/projects/${id}/update`, {
    method: 'POST',
  });
}

// 获取项目更新状态
export async function getProjectUpdateStatus(projectId: string): Promise<{ data: ProjectUpdateStatus; success: boolean; message: string }> {
  return request(`/api/projects/${projectId}/update-status`, {
    method: 'GET',
  });
}

// 获取项目更新日志
export async function getProjectUpdateLogs(projectId: string, limit: number = 10): Promise<{ data: ProjectUpdateLog[]; success: boolean; message: string }> {
  return request(`/api/projects/${projectId}/update-logs`, {
    method: 'GET',
    params: { limit },
  });
}

// 执行项目代码更新
export async function executeProjectUpdateCode(id: string): Promise<{
  success: boolean;
  message: string;
  output?: string;
}> {
  return request(`/api/projects/${id}/update-code`, {
    method: 'POST',
  });
}

// 获取项目代码更新状态
export async function getProjectUpdateCodeStatus(projectId: string): Promise<{ data: ProjectUpdateStatus; success: boolean; message: string }> {
  return request(`/api/projects/${projectId}/update-code-status`, {
    method: 'GET',
  });
}

// 获取项目代码更新日志
export async function getProjectUpdateCodeLogs(projectId: string, limit: number = 10): Promise<{ data: ProjectUpdateLog[]; success: boolean; message: string }> {
  return request(`/api/projects/${projectId}/update-code-logs`, {
    method: 'GET',
    params: { limit },
  });
}
