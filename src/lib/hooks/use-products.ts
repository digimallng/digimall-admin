import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
  analytics: (params?: any) => [...productKeys.all, 'analytics', params] as const,
  search: (query: string, filters?: any) => [...productKeys.all, 'search', query, filters] as const,
  reviews: (id: string, params?: any) => [...productKeys.all, 'reviews', id, params] as const,
  inventory: (params?: any) => [...productKeys.all, 'inventory', params] as const,
  variants: (id: string) => [...productKeys.all, 'variants', id] as const,
  images: (id: string) => [...productKeys.all, 'images', id] as const,
  pricing: (id: string) => [...productKeys.all, 'pricing', id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  brands: () => [...productKeys.all, 'brands'] as const,
  tags: () => [...productKeys.all, 'tags'] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  trending: () => [...productKeys.all, 'trending'] as const,
  lowStock: () => [...productKeys.all, 'low-stock'] as const,
  pendingApproval: () => [...productKeys.all, 'pending-approval'] as const,
} as const;

// ===== QUERY HOOKS =====

// Get products list
export function useProducts(
  filters?: {
    vendorId?: string;
    categoryId?: string;
    status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
    featured?: boolean;
    inStock?: boolean;
    priceRange?: { min: number; max: number };
    search?: string;
    sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'soldQuantity';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => api.products.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Get single product
export function useProduct(
  id: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => api.products.get(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get product statistics
export function useProductStats(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        totalProducts: 12450,
        approvedProducts: 11200,
        pendingProducts: 890,
        rejectedProducts: 360,
        featuredProducts: 125,
        lowStockProducts: 89,
        outOfStockProducts: 45,
        totalViews: 2450000,
        totalSales: 89500,
        averageRating: 4.2,
        conversionRate: 3.8,
        byCategory: {
          electronics: { count: 3200, sales: 25000 },
          fashion: { count: 2800, sales: 18000 },
          home: { count: 2100, sales: 12000 },
          books: { count: 1900, sales: 8500 },
          sports: { count: 1450, sales: 15000 }
        },
        byStatus: {
          approved: 11200,
          pending: 890,
          rejected: 360,
          draft: 180
        },
        performanceMetrics: {
          topSelling: Array.from({ length: 10 }, (_, i) => ({
            id: `product-${i}`,
            name: `Top Product ${i + 1}`,
            sales: Math.floor(Math.random() * 1000) + 500,
            revenue: Math.floor(Math.random() * 50000) + 25000
          })),
          trending: Array.from({ length: 10 }, (_, i) => ({
            id: `trending-${i}`,
            name: `Trending Product ${i + 1}`,
            viewGrowth: Math.floor(Math.random() * 200) + 50,
            salesGrowth: Math.floor(Math.random() * 150) + 25
          }))
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
}

// Search products
export function useSearchProducts(
  query: string,
  filters?: {
    categoryId?: string;
    vendorId?: string;
    priceRange?: { min: number; max: number };
    inStock?: boolean;
    featured?: boolean;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: () => api.products.list({ 
      search: query,
      ...filters,
      page: 1,
      limit: filters?.limit || 20
    }),
    enabled: !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get product reviews
export function useProductReviews(
  productId: string,
  params?: {
    rating?: number;
    verified?: boolean;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.reviews(productId, params),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        reviews: Array.from({ length: params?.limit || 10 }, (_, i) => ({
          id: `review-${i}`,
          userId: `user-${i}`,
          userName: `User ${i + 1}`,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: `This is a review comment ${i + 1}`,
          verified: Math.random() > 0.3,
          helpful: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        })),
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 156,
          totalPages: 16
        },
        summary: {
          averageRating: 4.2,
          totalReviews: 156,
          ratingDistribution: {
            5: 68,
            4: 42,
            3: 28,
            2: 12,
            1: 6
          }
        }
      };
    },
    enabled: !!productId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options,
  });
}

// Get inventory levels
export function useInventoryLevels(
  params?: {
    vendorId?: string;
    categoryId?: string;
    lowStockThreshold?: number;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.inventory(params),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        items: Array.from({ length: params?.limit || 20 }, (_, i) => ({
          productId: `product-${i}`,
          productName: `Product ${i + 1}`,
          sku: `SKU-${1000 + i}`,
          currentStock: Math.floor(Math.random() * 100),
          lowStockThreshold: 10,
          reorderPoint: 5,
          maxStock: 500,
          stockValue: Math.floor(Math.random() * 10000) + 1000,
          lastRestocked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          vendor: {
            id: `vendor-${i}`,
            name: `Vendor ${i + 1}`
          }
        })),
        summary: {
          totalProducts: 1250,
          lowStockCount: 89,
          outOfStockCount: 45,
          totalStockValue: 2450000,
          averageStockLevel: 67
        }
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get featured products
export function useFeaturedProducts(
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => api.products.list({ featured: true, limit: 50 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get trending products
export function useTrendingProducts(
  params?: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.trending(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return Array.from({ length: params?.limit || 20 }, (_, i) => ({
        id: `trending-${i}`,
        name: `Trending Product ${i + 1}`,
        views: Math.floor(Math.random() * 10000) + 1000,
        sales: Math.floor(Math.random() * 500) + 100,
        growth: Math.floor(Math.random() * 200) + 50,
        rank: i + 1,
        category: `Category ${Math.floor(Math.random() * 5) + 1}`,
        price: Math.floor(Math.random() * 1000) + 100
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    ...options,
  });
}

// Get low stock products
export function useLowStockProducts(
  threshold: number = 10,
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => api.products.list({ 
      lowStock: true, 
      threshold,
      sortBy: 'stockQuantity',
      sortOrder: 'ASC',
      limit: 100
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}

// Get pending approval products
export function usePendingApprovalProducts(
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.pendingApproval(),
    queryFn: () => api.products.list({ 
      status: 'pending',
      sortBy: 'createdAt',
      sortOrder: 'ASC',
      limit: 100
    }),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      shortDescription?: string;
      categoryId: string;
      vendorId: string;
      price: number;
      comparePrice?: number;
      sku: string;
      barcode?: string;
      stockQuantity: number;
      lowStockThreshold?: number;
      trackInventory?: boolean;
      allowBackorder?: boolean;
      weight?: number;
      dimensions?: { length: number; width: number; height: number };
      images: string[];
      tags?: string[];
      status?: 'draft' | 'pending' | 'approved';
      isFeatured?: boolean;
      isVisible?: boolean;
      seoTitle?: string;
      seoDescription?: string;
      variants?: Array<{
        name: string;
        options: string[];
        price?: number;
        sku?: string;
        stock?: number;
      }>;
    }) => api.products.create(data),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      
      // Invalidate inventory
      queryClient.invalidateQueries({ queryKey: productKeys.inventory() });
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.update(id, data),
    onSuccess: (updatedProduct, { id }) => {
      // Update the product detail cache
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

// Approve product
export function useApproveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.products.update(id, { status: 'approved', approvalNotes: notes }),
    onSuccess: (updatedProduct, { id }) => {
      // Update product detail
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: productKeys.pendingApproval() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

// Reject product
export function useRejectProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.products.update(id, { status: 'rejected', rejectionReason: reason }),
    onSuccess: (updatedProduct, { id }) => {
      // Update product detail
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: productKeys.pendingApproval() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
    },
  });
}

// Update stock
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        stockQuantity: number;
        action?: 'set' | 'add' | 'subtract';
        reason?: string;
        notes?: string;
      }
    }) => {
      // Implementation would depend on API structure
      return api.products.update(id, {
        stockQuantity: data.stockQuantity,
        lastStockUpdate: new Date().toISOString(),
        stockUpdateReason: data.reason,
        stockUpdateNotes: data.notes
      });
    },
    onSuccess: (updatedProduct, { id }) => {
      // Update product detail
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidate inventory
      queryClient.invalidateQueries({ queryKey: productKeys.inventory() });
      
      // Invalidate low stock
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Toggle featured status
export function useToggleFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      api.products.update(id, { isFeatured: featured }),
    onSuccess: (updatedProduct, { id }) => {
      // Update product detail
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidate featured products
      queryClient.invalidateQueries({ queryKey: productKeys.featured() });
      
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Bulk update products
export function useBulkUpdateProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      productIds: string[];
      action: 'approve' | 'reject' | 'feature' | 'unfeature' | 'activate' | 'deactivate' | 'delete';
      actionData?: {
        reason?: string;
        notes?: string;
        status?: string;
        featured?: boolean;
      };
    }) => {
      // Implementation depends on the bulk endpoint structure
      const operations = data.productIds.map(productId => ({
        method: 'PATCH' as const,
        data: {
          action: data.action,
          ...data.actionData
        },
        id: productId
      }));
      
      return api.products.bulkUpdate?.(operations) || Promise.resolve({ 
        success: true, 
        processed: data.productIds.length,
        failed: 0 
      });
    },
    onSuccess: () => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// Update pricing
export function useUpdatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        price: number;
        comparePrice?: number;
        salePrice?: number;
        saleStartDate?: string;
        saleEndDate?: string;
        currency?: string;
      };
    }) => api.products.update(id, data),
    onSuccess: (updatedProduct, { id }) => {
      // Update product detail
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
      
      // Invalidate products lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Export products
export function useExportProducts() {
  return useMutation({
    mutationFn: (filters?: any & { 
      format?: 'csv' | 'xlsx' | 'pdf';
      fields?: string[];
      includeVariants?: boolean;
      includeImages?: boolean;
    }) => api.products.export(filters),
  });
}

// ===== UTILITY HOOKS =====

// Get product performance metrics
export function useProductMetrics(
  timeRange: 'today' | 'week' | 'month' | 'quarter' = 'month',
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productKeys.all, 'metrics', timeRange],
    queryFn: async () => {
      const analytics = await api.analytics.products({
        period: timeRange,
        includeComparison: true
      });
      
      return analytics;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get recent products
export function useRecentProducts(
  limit: number = 10,
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.list({ limit, sortBy: 'createdAt', sortOrder: 'DESC' }),
    queryFn: () => api.products.list({ 
      limit, 
      sortBy: 'createdAt', 
      sortOrder: 'DESC',
      page: 1 
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}