import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { categoryService } from '@/lib/api/services/category.service';
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
  PaginatedResponse,
} from '@/lib/api/types';

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  statistics: () => [...categoryKeys.all, 'statistics'] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  performance: (id: string) => [...categoryKeys.all, 'performance', id] as const,
  search: (query: string, filters?: Partial<CategoryFilters>) => 
    [...categoryKeys.all, 'search', query, filters] as const,
  subcategories: (parentId: string, filters?: Partial<CategoryFilters>) => 
    [...categoryKeys.all, 'subcategories', parentId, filters] as const,
  public: (filters?: Partial<CategoryFilters>) => 
    [...categoryKeys.all, 'public', filters] as const,
};

// Queries
export function useCategories(filters?: CategoryFilters, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.list(filters || {}),
    queryFn: () => categoryService.getCategories(filters),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    ...options,
  });
}

export function useCategory(id: string, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategory(id),
    enabled: !!session?.accessToken && !!id && (options?.enabled !== false),
    ...options,
  });
}

export function useCategoryTree(includeInactive = false, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: [...categoryKeys.tree(), includeInactive],
    queryFn: () => categoryService.getCategoryTree(includeInactive),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

export function useCategoryStatistics(options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.statistics(),
    queryFn: () => categoryService.getCategoryStatistics(),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useSearchCategories(query: string, filters?: Partial<CategoryFilters>, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.search(query, filters),
    queryFn: () => categoryService.searchCategories(query, filters),
    enabled: !!session?.accessToken && query.length > 0 && (options?.enabled !== false),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

export function useCategoryPerformance(id: string, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.performance(id),
    queryFn: () => categoryService.getCategoryPerformance(id),
    enabled: !!session?.accessToken && !!id && (options?.enabled !== false),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// New hooks for subcategories and public categories
export function useSubcategories(parentId: string, filters?: Partial<CategoryFilters>, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.subcategories(parentId, filters),
    queryFn: () => categoryService.getSubcategories(parentId, filters),
    enabled: !!session?.accessToken && !!parentId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePublicCategories(filters?: Partial<CategoryFilters>, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.public(filters),
    queryFn: () => categoryService.getPublicCategories(filters),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// Mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.createCategory(data),
    onSuccess: (newCategory) => {
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.statistics() });
      
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create category';
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => 
      categoryService.updateCategory(id, data),
    onSuccess: (updatedCategory, { id }) => {
      // Update specific category in cache
      queryClient.setQueryData(categoryKeys.detail(id), updatedCategory);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.statistics() });
      
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update category';
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.statistics() });
      
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete category';
      toast.error(message);
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoryService.toggleCategoryStatus(id),
    onSuccess: (updatedCategory, id) => {
      // Update specific category in cache
      queryClient.setQueryData(categoryKeys.detail(id), updatedCategory);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.statistics() });
      
      const status = updatedCategory.isVisible ? 'activated' : 'deactivated';
      toast.success(`Category ${status} successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to toggle category status';
      toast.error(message);
    },
  });
}

export function useCategoryBulkAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CategoryBulkActionDto) => categoryService.bulkAction(data),
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success('Bulk action completed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Bulk action failed';
      toast.error(message);
    },
  });
}

export function useExportCategories() {
  return useMutation({
    mutationFn: (format: 'csv' | 'excel' = 'csv') => categoryService.exportCategories(format),
    onSuccess: (blob, format) => {
      // Automatically download the exported file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `categories.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Categories exported successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Export failed';
      toast.error(message);
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => categoryService.uploadImage(file),
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to upload image';
      toast.error(message);
    },
  });
}

export function useUploadCategoryImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      categoryService.uploadCategoryImage(id, file),
    onSuccess: (data, variables) => {
      toast.success('Image uploaded successfully');
      // Invalidate both the specific category and the list
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to upload image';
      toast.error(message);
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reorderData: CategoryReorderDto[]) => 
      categoryService.reorderCategories(reorderData),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      
      toast.success('Categories reordered successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to reorder categories';
      toast.error(message);
    },
  });
}

export function useMoveCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryMoveDto }) => 
      categoryService.moveCategory(id, data),
    onSuccess: (updatedCategory, { id }) => {
      // Update specific category in cache
      queryClient.setQueryData(categoryKeys.detail(id), updatedCategory);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      
      toast.success('Category moved successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to move category';
      toast.error(message);
    },
  });
}

export function useDuplicateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) => 
      categoryService.duplicateCategory(id, newName),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.statistics() });
      
      toast.success('Category duplicated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to duplicate category';
      toast.error(message);
    },
  });
}

// Utility hooks
export function useValidateSlug() {
  return useMutation({
    mutationFn: ({ slug, excludeId }: { slug: string; excludeId?: string }) =>
      categoryService.validateSlug(slug, excludeId),
  });
}

export function useGenerateSlug() {
  return useMutation({
    mutationFn: (name: string) => categoryService.generateSlug(name),
  });
}

// Dashboard hook that combines multiple category queries
export function useCategoryDashboardData() {
  const {
    data: statistics,
    isLoading: statisticsLoading,
    error: statisticsError,
  } = useCategoryStatistics();

  const {
    data: recentCategories,
    isLoading: recentLoading,
    error: recentError,
  } = useCategories({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const {
    data: tree,
    isLoading: treeLoading,
    error: treeError,
  } = useCategoryTree();

  const refetch = () => {
    return Promise.all([
      // Add refetch logic here if needed
    ]);
  };

  return {
    statistics,
    recentCategories: recentCategories?.data || recentCategories?.categories || [],
    tree: tree || [],
    isLoading: statisticsLoading || recentLoading || treeLoading,
    error: statisticsError || recentError || treeError,
    refetch,
  };
}