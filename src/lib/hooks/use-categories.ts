import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  categoryService, 
  CreateCategoryDto, 
  UpdateCategoryDto 
} from '@/lib/api/services/category.service';
import { Category, CategoryFilters } from '@/lib/api/types';

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  stats: () => [...categoryKeys.all, 'stats'] as const,
  search: (query: string) => [...categoryKeys.all, 'search', query] as const,
  performance: (id: string) => [...categoryKeys.all, 'performance', id] as const,
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

export function useCategoryTree(options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: () => categoryService.getCategoryTree(),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    ...options,
  });
}

export function useCategoryStats(options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.stats(),
    queryFn: () => categoryService.getCategoryStats(),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    ...options,
  });
}

export function useSearchCategories(query: string, filters?: any, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.search(query),
    queryFn: () => categoryService.searchCategories(query, filters),
    enabled: !!session?.accessToken && !!query && (options?.enabled !== false),
    ...options,
  });
}

export function useCategoryPerformance(id: string, params?: any, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: categoryKeys.performance(id),
    queryFn: () => categoryService.getCategoryPerformance(id, params),
    enabled: !!session?.accessToken && !!id && (options?.enabled !== false),
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
      
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
      
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
      
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
      
      const status = updatedCategory.isVisible ? 'activated' : 'deactivated';
      toast.success(`Category ${status} successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to toggle category status';
      toast.error(message);
    },
  });
}

export function useBulkUpdateCategories() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { categoryIds: string[]; action: "delete" | "activate" | "deactivate" | "feature" | "unfeature" }) => 
      categoryService.bulkUpdateCategories(data),
    onSuccess: (result) => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      
      const { success, failed } = result;
      if (success > 0) {
        toast.success(`${success} categories updated successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} categories failed to update`);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Bulk update failed';
      toast.error(message);
    },
  });
}

export function useExportCategories() {
  return useMutation({
    mutationFn: (filters: any) => categoryService.exportCategories(filters),
    onSuccess: () => {
      toast.success('Categories exported successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Export failed';
      toast.error(message);
    },
  });
}

export function useUploadCategoryImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, file }: { categoryId: string; file: File }) => 
      categoryService.uploadCategoryImage(categoryId, file),
    onSuccess: (data, variables) => {
      toast.success('Image uploaded successfully');
      // Invalidate both the specific category and the list
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.categoryId) });
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
    mutationFn: (data: { categoryId: string; newSortOrder: number }[]) => 
      categoryService.reorderCategories(data),
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
    mutationFn: ({ categoryId, newParentId }: { categoryId: string; newParentId?: string }) => 
      categoryService.moveCategory(categoryId, newParentId),
    onSuccess: (updatedCategory, { categoryId }) => {
      // Update specific category in cache
      queryClient.setQueryData(categoryKeys.detail(categoryId), updatedCategory);
      
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
    mutationFn: ({ categoryId, data }: { categoryId: string; data?: any }) => 
      categoryService.duplicateCategory(categoryId, data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
      
      toast.success('Category duplicated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to duplicate category';
      toast.error(message);
    },
  });
}