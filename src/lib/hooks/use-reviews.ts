/**
 * Reviews Management React Query Hooks
 *
 * Custom hooks for managing reviews with React Query.
 * Provides data fetching, caching, and mutations for all review operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../api/services/reviews.service';
import type {
  GetAllReviewsParams,
  ApproveReviewRequest,
  RejectReviewRequest,
  FlagReviewRequest,
  BulkModerateRequest,
  ReviewListResponse,
  ReviewResponse,
  ReviewStatisticsResponse,
  VendorAnalyticsResponse,
  ProductAnalyticsResponse,
} from '../api/types/reviews.types';

// ===== QUERY KEYS =====

export const reviewsQueryKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewsQueryKeys.all, 'list'] as const,
  list: (params?: GetAllReviewsParams) => [...reviewsQueryKeys.lists(), params] as const,
  details: () => [...reviewsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewsQueryKeys.details(), id] as const,
  statistics: () => [...reviewsQueryKeys.all, 'statistics'] as const,
  vendorAnalytics: (vendorId: string) =>
    [...reviewsQueryKeys.all, 'vendor-analytics', vendorId] as const,
  productAnalytics: (productId: string) =>
    [...reviewsQueryKeys.all, 'product-analytics', productId] as const,
};

// ===== QUERIES =====

/**
 * Get all reviews with optional filtering
 */
export function useReviews(params?: GetAllReviewsParams) {
  return useQuery({
    queryKey: reviewsQueryKeys.list(params),
    queryFn: () => reviewsService.getAll(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

/**
 * Get review by ID
 */
export function useReview(id: string) {
  return useQuery({
    queryKey: reviewsQueryKeys.detail(id),
    queryFn: () => reviewsService.getById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get platform review statistics
 */
export function useReviewStatistics() {
  return useQuery({
    queryKey: reviewsQueryKeys.statistics(),
    queryFn: () => reviewsService.getStatistics(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Get vendor review analytics
 */
export function useVendorReviewAnalytics(vendorId: string) {
  return useQuery({
    queryKey: reviewsQueryKeys.vendorAnalytics(vendorId),
    queryFn: () => reviewsService.getVendorAnalytics(vendorId),
    enabled: !!vendorId,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Get product review analytics
 */
export function useProductReviewAnalytics(productId: string) {
  return useQuery({
    queryKey: reviewsQueryKeys.productAnalytics(productId),
    queryFn: () => reviewsService.getProductAnalytics(productId),
    enabled: !!productId,
    staleTime: 300000, // 5 minutes
  });
}

// ===== MUTATIONS =====

/**
 * Approve review mutation
 */
export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveReviewRequest }) =>
      reviewsService.approve(id, data),
    onSuccess: () => {
      // Invalidate all review-related queries
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
    },
  });
}

/**
 * Reject review mutation
 */
export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectReviewRequest }) =>
      reviewsService.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
    },
  });
}

/**
 * Flag review mutation
 */
export function useFlagReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FlagReviewRequest }) =>
      reviewsService.flag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
    },
  });
}

/**
 * Delete review mutation
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
    },
  });
}

/**
 * Bulk moderate reviews mutation
 */
export function useBulkModerateReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkModerateRequest) =>
      reviewsService.bulkModerate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
    },
  });
}
