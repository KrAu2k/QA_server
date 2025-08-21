import { request } from '@umijs/max';

export interface Goods {
  id: number;
  sn: string;
  name: string;
  categoryId?: number;
  category?: GoodsCategory;
  unit: string;
  retailPrice: number;
  costPrice: number;
  purchasePrice?: number;
  wholesalePrice?: number;
  memberedPrice?: number;
  deputyPrice?: number;
  inventoryAlert?: number;
  barcode?: string;
  volume?: number;
  grossWeight?: number;
  netWeight?: number;
  carrier?: number;
  pcs?: string;
  description?: string;
  specification?: string;
  brand?: string;
  model?: string;
  origin?: string;
  isActive: boolean;
  isStar: boolean;
  isConfirm: boolean;
  isTrash: boolean;
  creatorId: number;
  created: string;
}

export interface GoodsCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  sort: number;
  created: string;
  updated: string;
}

export interface QueryGoodsParams {
  page?: number;
  limit?: number;
  name?: string;
  sn?: string;
  barcode?: string;
  categoryId?: number;
  isActive?: boolean;
  isConfirm?: boolean;
  isStar?: boolean;
  isTrash?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateGoodsData {
  sn?: string;
  name: string;
  categoryId?: number;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  barcode?: string;
  image?: string;
  description?: string;
  specification?: string;
  brand?: string;
  model?: string;
  origin?: string;
  isActive?: boolean;
  isStar?: boolean;
}

export type UpdateGoodsData = Partial<CreateGoodsData>

export interface CreateGoodsCategoryData {
  name: string;
  description?: string;
  parentId?: number;
  sort?: number;
}

export type UpdateGoodsCategoryData = Partial<CreateGoodsCategoryData>

// 商品相关接口
export async function queryGoods(params?: QueryGoodsParams) {
  return request('/api/goods', {
    method: 'GET',
    params,
  });
}

export async function getGoods(id: number) {
  return request(`/api/goods/${id}`, {
    method: 'GET',
  });
}

export async function createGoods(data: CreateGoodsData) {
  return request('/api/goods', {
    method: 'POST',
    data,
  });
}

export async function updateGoods(id: number, data: UpdateGoodsData) {
  return request(`/api/goods/${id}`, {
    method: 'PATCH',
    data,
  });
}

export async function deleteGoods(id: number) {
  return request(`/api/goods/${id}`, {
    method: 'DELETE',
  });
}

export async function batchDeleteGoods(ids: number[]) {
  return request('/api/goods/batch-delete', {
    method: 'POST',
    data: { ids },
  });
}

export async function restoreGoods(id: number) {
  return request(`/api/goods/${id}/restore`, {
    method: 'POST',
  });
}

export async function batchConfirmGoods(ids: number[]) {
  return request('/api/goods/batch-confirm', {
    method: 'POST',
    data: { ids },
  });
}

export async function batchUnconfirmGoods(ids: number[]) {
  return request('/api/goods/batch-unconfirm', {
    method: 'POST',
    data: { ids },
  });
}

export async function searchGoods(keyword?: string, limit?: number) {
  return request('/api/goods/search', {
    method: 'GET',
    params: { keyword, limit },
  });
}

export async function getGoodsByBarcode(barcode: string) {
  return request(`/api/goods/barcode/${barcode}`, {
    method: 'GET',
  });
}

// 商品分类相关接口
export async function queryGoodsCategories() {
  return request('/api/goods/categories', {
    method: 'GET',
  });
}

export async function getGoodsCategory(id: number) {
  return request(`/api/goods/categories/${id}`, {
    method: 'GET',
  });
}

export async function createGoodsCategory(data: CreateGoodsCategoryData) {
  return request('/api/goods/categories', {
    method: 'POST',
    data,
  });
}

export async function updateGoodsCategory(id: number, data: UpdateGoodsCategoryData) {
  return request(`/api/goods/categories/${id}`, {
    method: 'PATCH',
    data,
  });
}

export async function deleteGoodsCategory(id: number) {
  return request(`/api/goods/categories/${id}`, {
    method: 'DELETE',
  });
}
