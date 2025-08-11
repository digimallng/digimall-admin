import { apiClient } from '../client';
import { Category, CategoryFilters, CategoriesPaginatedResponse } from '../types';

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  id?: string;
}

export class CategoryService {
  // List categories with filters and pagination
  async getCategories(filters?: CategoryFilters): Promise<CategoriesPaginatedResponse> {
    const response = await apiClient.get<any>('/categories', filters);
    return {
      categories: response.categories || response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || 1,
    };
  }

  // Get single category by ID
  async getCategory(id: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`);
  }

  // Create new category
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<any>('/categories', data);
    return response.category || response.data || response;
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.put<any>(`/categories/${id}`, data);
    return response.category || response.data || response;
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  }

  // Toggle category status
  async toggleCategoryStatus(id: string): Promise<Category> {
    const response = await apiClient.patch<any>(`/categories/${id}/toggle-status`);
    return response.category || response.data || response;
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree(): Promise<Category[]> {
    const response = await apiClient.get<any>('/categories/tree');
    return response.categories || response.data || [];
  }

  // Get category statistics
  async getCategoryStats(): Promise<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    featuredCategories: number;
    totalProducts: number;
    totalSales: number;
    categoriesGrowth: number;
    productsGrowth: number;
    salesGrowth: number;
  }> {
    const response = await apiClient.get<any>('/categories/statistics');
    
    return {
      totalCategories: response.total || 0,
      activeCategories: response.active || 0,
      inactiveCategories: response.inactive || 0,
      featuredCategories: response.featured || 0,
      totalProducts: response.totalProducts || 0,
      totalSales: response.totalSales || 0,
      categoriesGrowth: response.categoriesGrowth || 0,
      productsGrowth: response.productsGrowth || 0,
      salesGrowth: response.salesGrowth || 0,
    };
  }

  // Search categories
  async searchCategories(query: string, filters?: {
    status?: 'active' | 'inactive';
    featured?: boolean;
    limit?: number;
  }): Promise<Category[]> {
    const response = await apiClient.get<any>('/categories/search', {
      q: query,
      ...filters
    });
    return response.categories || response.data || [];
  }

  // Bulk operations
  async bulkUpdateCategories(data: {
    categoryIds: string[];
    action: 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature';
  }): Promise<{ success: number; failed: number; errors: any[] }> {
    return apiClient.post('/categories/bulk-update', data);
  }

  // Export categories
  async exportCategories(filters?: CategoryFilters & { format: 'csv' | 'excel' }): Promise<Blob> {
    return apiClient.get('/categories/export', filters);
  }

  // Reorder categories
  async reorderCategories(data: { categoryId: string; newSortOrder: number }[]): Promise<void> {
    await apiClient.post('/categories/reorder', { categories: data });
  }

  // Get category performance metrics
  async getCategoryPerformance(categoryId: string, params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }): Promise<{
    sales: number;
    orders: number;
    products: number;
    growth: number;
    topProducts: any[];
    salesTrend: any[];
  }> {
    return apiClient.get(`/categories/${categoryId}/performance`, params);
  }

  // Get subcategories
  async getSubcategories(parentId: string): Promise<Category[]> {
    const response = await apiClient.get<any>(`/categories/${parentId}/subcategories`);
    return response.categories || response.data || [];
  }

  // Move category (change parent)
  async moveCategory(categoryId: string, newParentId?: string): Promise<Category> {
    const response = await apiClient.patch<any>(`/categories/${categoryId}/move`, {
      parentId: newParentId
    });
    return response.category || response.data || response;
  }

  // Duplicate category
  async duplicateCategory(categoryId: string, data?: {
    name?: string;
    slug?: string;
  }): Promise<Category> {
    const response = await apiClient.post<any>(`/categories/${categoryId}/duplicate`, data);
    return response.category || response.data || response;
  }

  // Upload category image
  async uploadCategoryImage(categoryId: string, file: File): Promise<{
    url: string;
    cdnUrl?: string;
    key: string;
  }> {
    const formData = new FormData();
    formData.append('image', file);
    
    // Don't set Content-Type header, let the browser set it with boundary
    return apiClient.post(`/categories/${categoryId}/upload-image`, formData);
  }
}

export const categoryService = new CategoryService();