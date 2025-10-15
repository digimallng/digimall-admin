/**
 * Categories Management Service
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  Category,
  CategoryListResponse,
  CategoryTreeResponse,
  CategoryStatisticsResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
  ReorderCategoriesRequest,
  ReorderCategoriesResponse,
  GetAllCategoriesParams,
} from '../types';

class CategoriesService {
  async getAll(params?: GetAllCategoriesParams): Promise<CategoryListResponse> {
    const response = await apiClient.get<CategoryListResponse>(
      API_ENDPOINTS.CATEGORIES.GET_ALL,
      { params }
    );
    return response.data!;
  }

  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(
      API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)
    );
    return response.data!;
  }

  async getTree(): Promise<CategoryTreeResponse> {
    const response = await apiClient.get<CategoryTreeResponse>(
      API_ENDPOINTS.CATEGORIES.GET_TREE
    );
    return response.data!;
  }

  async create(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const response = await apiClient.post<CreateCategoryResponse>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data
    );
    return response.data!;
  }

  async update(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<UpdateCategoryResponse> {
    const response = await apiClient.patch<UpdateCategoryResponse>(
      API_ENDPOINTS.CATEGORIES.UPDATE(id),
      data
    );
    return response.data!;
  }

  async delete(id: string): Promise<DeleteCategoryResponse> {
    const response = await apiClient.delete<DeleteCategoryResponse>(
      API_ENDPOINTS.CATEGORIES.DELETE(id)
    );
    return response.data!;
  }

  async reorder(data: ReorderCategoriesRequest): Promise<ReorderCategoriesResponse> {
    const response = await apiClient.post<ReorderCategoriesResponse>(
      API_ENDPOINTS.CATEGORIES.REORDER,
      data
    );
    return response.data!;
  }

  async getStatistics(): Promise<CategoryStatisticsResponse> {
    const response = await apiClient.get<CategoryStatisticsResponse>(
      API_ENDPOINTS.CATEGORIES.GET_STATISTICS
    );
    return response.data!;
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
