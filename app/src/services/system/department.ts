import { request } from '@umijs/max';

// 部门数据类型
export interface Department {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  parentName?: string;
  level: number;
  path: string;
  status: number; // 0-禁用, 1-正常
  managerIds?: string[]; // 多个负责人ID
  managerNames?: string[]; // 多个负责人姓名
  description?: string;
  sort: number;
  memberCount?: number;
  childCount?: number;
  totalMemberCount?: number;
  children?: Department[];
  createTime: string;
  updateTime: string;
}

// 部门表单数据类型
export interface DepartmentFormData {
  name: string;
  code: string;
  parentId?: number | null;
  managerIds?: string[]; // 多个负责人ID
  description?: string;
  status: boolean;
  sort: number;
}

// 部门成员类型
export interface DepartmentMember {
  id: number;
  userId: number;
  userName: string;
  userCode: string;
  avatar?: string;
  email?: string;
  phone?: string;
  departmentId: number;
  departmentName: string;
  positionId?: number;
  positionName?: string;
  isManager: boolean;
  joinTime: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

export type DepartmentTreeResponse = ApiResponse<Department[]>
export type DepartmentDetailResponse = ApiResponse<Department>
export type DepartmentMemberResponse = ApiResponse<DepartmentMember[]>

// 获取部门树
export async function getDepartmentTree() {
  return request<DepartmentTreeResponse>('/api/departments/tree', {
    method: 'GET',
  });
}

// 获取部门详情
export async function getDepartmentDetail(id: number) {
  return request<DepartmentDetailResponse>(`/api/departments/${id}`, {
    method: 'GET',
  });
}

// 创建部门
export async function createDepartment(data: DepartmentFormData) {
  return request<DepartmentDetailResponse>('/api/departments', {
    method: 'POST',
    data: {
      ...data,
      status: data.status ? 1 : 0,
    },
  });
}

// 更新部门
export async function updateDepartment(id: number, data: DepartmentFormData) {
  return request<DepartmentDetailResponse>(`/api/departments/${id}`, {
    method: 'PUT',
    data: {
      ...data,
      status: data.status ? 1 : 0,
    },
  });
}

// 删除部门
export async function deleteDepartment(id: number) {
  return request<ApiResponse>(`/api/departments/${id}`, {
    method: 'DELETE',
  });
}

// 切换部门状态
export async function updateDepartmentStatus(id: number, status: number) {
  return request<ApiResponse>(`/api/departments/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

// 移动部门
export async function moveDepartment(id: number, parentId: number | null, sort: number) {
  return request<ApiResponse>(`/api/departments/${id}/move`, {
    method: 'PATCH',
    data: { parentId, sort },
  });
}

// 获取部门成员
export async function getDepartmentMembers(id: number) {
  return request<DepartmentMemberResponse>(`/api/departments/${id}/members`, {
    method: 'GET',
  });
}

// 添加部门成员
export async function addDepartmentMember(departmentId: number, userIds: number[]) {
  return request<ApiResponse>(`/api/departments/${departmentId}/members`, {
    method: 'POST',
    data: { userIds },
  });
}

// 移除部门成员
export async function removeDepartmentMember(departmentId: number, userId: number) {
  return request<ApiResponse>(`/api/departments/${departmentId}/members/${userId}`, {
    method: 'DELETE',
  });
}

// 设置部门负责人
export async function setDepartmentManager(departmentId: number, userId: number) {
  return request<ApiResponse>(`/api/departments/${departmentId}/manager`, {
    method: 'PUT',
    data: { userId },
  });
}
