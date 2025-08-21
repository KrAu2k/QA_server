import { request } from '@umijs/max';

export interface SystemUser {
  id: number;
  name: string;
  username: string;
  email: string;
  employeeNo: string;
  avatar?: string;
  signature?: string;
  title?: string;
  group?: string;
  tags?: string[];
  notifyCount?: number;
  unreadCount?: number;
  country?: string;
  access?: string;
  geographic?: any;
  address?: string;
  phone?: string;
  isActive?: boolean;
  isAdmin?: boolean; // 管理员权限
  createdAt?: string;
  updatedAt?: string;
  // 部门相关字段
  departmentId?: number;
  departmentName?: string;
  position?: string;
  joinDate?: string;
}

export interface CreateUserParams {
  name: string;
  username: string;
  password: string;
  email: string;
  employeeNo: string;
  avatar?: string;
  signature?: string;
  title?: string;
  group?: string;
  tags?: string[];
  country?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  isAdmin?: boolean; // 管理员权限
  // 部门相关字段
  departmentId?: number;
  position?: string;
  joinDate?: string;
}

export interface UpdateUserParams extends Partial<CreateUserParams> {
  id: number;
}

export interface UserListParams {
  current?: string;
  pageSize?: string;
  name?: string;
  username?: string;
  email?: string;
  employeeNo?: string;
  phone?: string;
  group?: string;
  title?: string;
  isActive?: boolean | string;
}

export interface UserListResponse {
  data: SystemUser[];
  total: number;
  success: boolean;
}

// 获取用户列表
export async function getUserList(params?: UserListParams) {
  return request<UserListResponse>('/api/users', {
    method: 'GET',
    params,
  });
}

// 获取用户详情
export async function getUserDetail(id: number) {
  return request<{ data: SystemUser; success: boolean }>(`/api/users/${id}`, {
    method: 'GET',
  });
}

// 创建用户
export async function createUser(data: CreateUserParams) {
  return request<{ data: SystemUser; success: boolean }>('/api/users', {
    method: 'POST',
    data,
  });
}

// 更新用户
export async function updateUser(data: UpdateUserParams) {
  return request<{ data: SystemUser; success: boolean }>(`/api/users/${data.id}`, {
    method: 'PUT',
    data,
  });
}

// 删除用户
export async function deleteUser(id: number) {
  return request<{ success: boolean }>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

// 启用/禁用用户
export async function toggleUserStatus(id: number, isActive: boolean) {
  return request<{ data: SystemUser; success: boolean }>(`/api/users/${id}/toggle-status`, {
    method: 'PUT',
    data: { isActive },
  });
}

// 批量删除用户
export async function batchDeleteUsers(ids: number[]) {
  return request<{ success: boolean }>('/api/users/batch-delete', {
    method: 'POST',
    data: { ids },
  });
}

// 批量修改用户状态
export async function batchToggleUserStatus(ids: number[], isActive: boolean) {
  return request<{ success: boolean }>('/api/users/batch-toggle-status', {
    method: 'PUT',
    data: { ids, isActive },
  });
}

// 修改密码接口类型定义
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminChangePasswordParams {
  newPassword: string;
  confirmPassword: string;
}

// 修改密码（用户自己修改）
export async function changePassword(data: ChangePasswordParams) {
  return request<{ success: boolean; message: string }>('/api/users/change-password', {
    method: 'PUT',
    data,
  });
}

// 管理员重置密码
export async function adminResetPassword(id: number, data: AdminChangePasswordParams) {
  return request<{ success: boolean; message: string }>(`/api/users/${id}/reset-password`, {
    method: 'PUT',
    data,
  });
}
