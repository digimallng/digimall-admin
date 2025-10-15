/**
 * Admin Vendor Operations React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminVendorService } from '../services';
import type {
  GetVendorPayoutsParams,
  GetProductReviewsParams,
  GetVendorDisputesParams,
  ProcessPayoutRequest,
  ReviewProductReviewRequest,
  ResolveDisputeRequest,
} from '../types';

export const adminVendorKeys = {
  all: ['admin-vendor'] as const,
  payouts: (params?: GetVendorPayoutsParams) => [...adminVendorKeys.all, 'payouts', params] as const,
  reviews: (params?: GetProductReviewsParams) => [...adminVendorKeys.all, 'reviews', params] as const,
  disputes: (params?: GetVendorDisputesParams) => [...adminVendorKeys.all, 'disputes', params] as const,
  disputeDetail: (id: string) => [...adminVendorKeys.all, 'dispute', id] as const,
};

export function useVendorPayouts(params?: GetVendorPayoutsParams) {
  return useQuery({
    queryKey: adminVendorKeys.payouts(params),
    queryFn: () => adminVendorService.getPayouts(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProductReviews(params?: GetProductReviewsParams) {
  return useQuery({
    queryKey: adminVendorKeys.reviews(params),
    queryFn: () => adminVendorService.getProductReviews(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorDisputes(params?: GetVendorDisputesParams) {
  return useQuery({
    queryKey: adminVendorKeys.disputes(params),
    queryFn: () => adminVendorService.getDisputes(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useVendorDisputeById(id: string, enabled = true) {
  return useQuery({
    queryKey: adminVendorKeys.disputeDetail(id),
    queryFn: () => adminVendorService.getDisputeById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessPayoutRequest }) =>
      adminVendorService.processPayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminVendorKeys.payouts() });
    },
  });
}

export function useReviewProductReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewProductReviewRequest }) =>
      adminVendorService.reviewProductReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminVendorKeys.reviews() });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveDisputeRequest }) =>
      adminVendorService.resolveDispute(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminVendorKeys.disputeDetail(id) });
      queryClient.invalidateQueries({ queryKey: adminVendorKeys.disputes() });
    },
  });
}
