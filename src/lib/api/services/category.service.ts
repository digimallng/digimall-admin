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
  // Helper to normalize category from backend
  private normalizeCategory(category: any): Category {
    if (!category) return category;

    return {
      ...category,
      // Ensure new required properties are set
      isEnabled: category.isEnabled ?? (category.status === 'active'),
      isFeatured: category.isFeatured ?? category.featured ?? false,
      sortOrder: category.sortOrder ?? category.displayOrder ?? 0,
      // Normalize image to string if it's an object
      image: typeof category.image === 'object' ? category.image?.url : category.image,
      bannerImage: typeof category.bannerImage === 'object' ? category.bannerImage?.url : category.bannerImage,
      // Backward compatibility aliases
      status: category.status ?? (category.isEnabled ? 'active' : 'inactive'),
      featured: category.featured ?? category.isFeatured,
      displayOrder: category.displayOrder ?? category.sortOrder,
      productCount: category.productCount ?? category.statistics?.productCount ?? 0,
    };
  }

  // Helper to normalize paginated response
  private normalizePaginatedResponse(response: any): PaginatedResponse<Category> {
    // Handle {categories: [], total: 0, page: 1} structure
    if (response.categories && Array.isArray(response.categories)) {
      return {
        data: response.categories.map((c: any) => this.normalizeCategory(c)),
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || 20)),
      };
    }

    // Handle {data: [], meta: {}} structure
    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data.map((c: any) => this.normalizeCategory(c)),
        page: response.meta?.page || response.page || 1,
        limit: response.meta?.limit || response.limit || 20,
        total: response.meta?.total || response.total || 0,
        totalPages: response.meta?.totalPages || response.totalPages || 0,
      };
    }

    // Fallback: assume it's already normalized
    return {
      data: Array.isArray(response) ? response.map((c: any) => this.normalizeCategory(c)) : [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
  }

  // List categories with filters and pagination
  async getCategories(filters?: CategoryFilters): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<any>('/categories', filters);
    return this.normalizePaginatedResponse(response);
  }

  // Get single category by ID
  async getCategory(id: string): Promise<Category> {
    const response = await apiClient.get<any>(`/categories/${id}`);
    return this.normalizeCategory(response.category || response.data || response);
  }

  // Create new category
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<any>('/categories', data);
    return this.normalizeCategory(response.category || response.data || response);
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.put<any>(`/categories/${id}`, data);
    return this.normalizeCategory(response.category || response.data || response);
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  }

  // Toggle category status
  async toggleCategoryStatus(id: string): Promise<Category> {
    const response = await apiClient.patch<any>(`/categories/${id}/toggle-status`);
    return this.normalizeCategory(response.category || response.data || response);
  }

  // Get category tree (hierarchical structure)
  async getCategoryTree(includeInactive = false): Promise<CategoryTree> {
    const response = await apiClient.get<any>('/categories/tree', { includeInactive });
    const categories = response.data || response.categories || response;
    return Array.isArray(categories)
      ? categories.map((c: any) => this.normalizeCategory(c))
      : [];
  }

  // Get category statistics
  async getCategoryStatistics(): Promise<CategoryStatistics> {
    const response = await apiClient.get<any>('/categories/statistics');
    return response.data || response;
  }

  // Search categories
  async searchCategories(query: string, filters?: Partial<CategoryFilters>): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<any>('/categories/search', {
      q: query,
      ...filters,
    });
    return this.normalizePaginatedResponse(response);
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
    const response = await apiClient.get<any>(`/categories/${parentId}/subcategories`, filters);
    return this.normalizePaginatedResponse(response);
  }

  // Move category (change parent)
  async moveCategory(id: string, data: CategoryMoveDto): Promise<Category> {
    const response = await apiClient.post<any>(`/categories/${id}/move`, data);
    return this.normalizeCategory(response.category || response.data || response);
  }

  // Duplicate category
  async duplicateCategory(id: string, newName?: string): Promise<Category> {
    const response = await apiClient.post<any>(`/categories/${id}/duplicate`, {
      name: newName,
    });
    return this.normalizeCategory(response.category || response.data || response);
  }

  // Upload image and get CloudFront URL (for category creation)
  async uploadImage(file: File): Promise<{ url: string; cloudFrontUrl: string; key?: string }> {
    const formData = new FormData();
    formData.append('file', file); // Field name is 'file' according to API docs

    // apiClient automatically handles FormData and sets 'Content-Type: multipart/form-data'
    const response = await apiClient.post<any>('/categories/upload-image', formData);

    // Backend returns the CloudFront URL in response.data
    // Response structure: { success: true, message: "...", data: { url, cloudFrontUrl, key, bucket, size, contentType } }
    const data = response.data || response;

    return {
      url: data.url || response.url, // S3 URL
      cloudFrontUrl: data.cloudFrontUrl || response.cloudFrontUrl, // CloudFront CDN URL
      key: data.key || response.key,
    };
  }

  // Upload category image (legacy - for existing categories)
  async uploadCategoryImage(id: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    // apiClient automatically handles FormData and sets 'Content-Type: multipart/form-data'
    const response = await apiClient.post<UploadResponse>(
      `/categories/${id}/upload-image`,
      formData
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
    const response = await apiClient.get<any>('/categories/public', filters);
    return this.normalizePaginatedResponse(response);
  }
}

export const categoryService = new CategoryService();