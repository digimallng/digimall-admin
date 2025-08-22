import { apiClient } from '../client';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryFilters,
  CategoryBulkActionDto,
  CategoryReorderDto,
  CategoryMoveDto,
  CategoryStatistics,
  CategoryPerformance,
  CategoryTree,
  UploadResponse,
  PaginatedResponse,
} from '../types';

export class CategoryService {
  // List categories with filters and pagination
  async getCategories(filters?: CategoryFilters): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories', filters);
    return response;
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
  async getCategoryTree(includeInactive = false): Promise<CategoryTree[]> {
    const response = await apiClient.get<CategoryTree[]>('/categories/tree', { includeInactive });
    return response;
  }

  // Get category statistics
  async getCategoryStatistics(): Promise<CategoryStatistics> {
    const response = await apiClient.get<CategoryStatistics>('/categories/statistics');
    return response;
  }

  // Search categories
  async searchCategories(query: string, filters?: Partial<CategoryFilters>): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/search', {
      q: query,
      ...filters,
    });
    return response;
  }

  // Bulk operations
  async bulkAction(data: CategoryBulkActionDto): Promise<void> {
    await apiClient.post('/categories/bulk-action', data);
  }

  // Export categories
  async exportCategories(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/categories/export?format=${format}`, {}, {
      responseType: 'blob',
    });
    return response;
  }

  // Reorder categories
  async reorderCategories(reorderData: CategoryReorderDto[]): Promise<void> {
    await apiClient.post('/categories/reorder', reorderData);
  }

  // Get category performance metrics
  async getCategoryPerformance(id: string): Promise<CategoryPerformance> {
    const response = await apiClient.get<CategoryPerformance>(`/categories/${id}/performance`);
    return response;
  }

  // Get subcategories
  async getSubcategories(parentId: string, filters?: Partial<CategoryFilters>): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>(`/categories/${parentId}/subcategories`, filters);
    return response;
  }

  // Move category (change parent)
  async moveCategory(id: string, data: CategoryMoveDto): Promise<Category> {
    const response = await apiClient.post<Category>(`/categories/${id}/move`, data);
    return response;
  }

  // Duplicate category
  async duplicateCategory(id: string, newName?: string): Promise<Category> {
    const response = await apiClient.post<Category>(`/categories/${id}/duplicate`, {
      name: newName,
    });
    return response;
  }

  // Upload image and get CloudFront URL (for category creation)
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ url: string }>(
      '/categories/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  // Upload category image (legacy - for existing categories)
  async uploadCategoryImage(id: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<UploadResponse>(
      `/categories/${id}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  // Utility methods
  async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    try {
      await apiClient.get('/categories/validate-slug', {
        slug,
        excludeId,
      });
      return true;
    } catch {
      return false;
    }
  }

  async generateSlug(name: string): Promise<string> {
    const response = await apiClient.post<{ slug: string }>('/categories/generate-slug', {
      name,
    });
    return response.slug;
  }

  // Get public categories for external services
  async getPublicCategories(filters?: Partial<CategoryFilters>): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories/public', filters);
    return response;
  }
}

export const categoryService = new CategoryService();