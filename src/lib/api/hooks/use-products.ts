/**
 * Products React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../services';
import type {
  GetAllProductsParams,
  GetPendingApprovalsParams,
  GetProductStatisticsParams,
  ProductApprovalRequest,
  UpdateProductInventoryRequest,
  BulkProductActionRequest,
} from '../types';

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (params?: GetAllProductsParams) => [...productsKeys.lists(), params] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  pendingApprovals: (params?: GetPendingApprovalsParams) => [...productsKeys.all, 'pending', params] as const,
  statistics: (params?: GetProductStatisticsParams) => [...productsKeys.all, 'statistics', params] as const,
};

export function useProducts(params?: GetAllProductsParams) {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: () => productsService.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProductById(id: string, enabled = true) {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePendingApprovals(params?: GetPendingApprovalsParams) {
  return useQuery({
    queryKey: productsKeys.pendingApprovals(params),
    queryFn: () => productsService.getPendingApprovals(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useProductStatistics(params?: GetProductStatisticsParams) {
  return useQuery({
    queryKey: productsKeys.statistics(params),
    queryFn: () => productsService.getStatistics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useApproveRejectProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductApprovalRequest }) =>
      productsService.approveReject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: productsKeys.statistics() });
    },
  });
}

export function useUpdateProductInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInventoryRequest }) =>
      productsService.updateInventory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productsKeys.statistics() });
    },
  });
}

export function useBulkProductAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkProductActionRequest) => productsService.bulkAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsKeys.statistics() });
    },
  });
}
