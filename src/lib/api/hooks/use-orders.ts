/**
 * Orders React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../services';
import type {
  GetAllOrdersParams,
  GetOrderStatisticsParams,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  RefundOrderRequest,
} from '../types';

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (params?: GetAllOrdersParams) => [...ordersKeys.lists(), params] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
  statistics: (params?: GetOrderStatisticsParams) => [...ordersKeys.all, 'statistics', params] as const,
};

export function useOrders(params?: GetAllOrdersParams) {
  return useQuery({
    queryKey: ordersKeys.list(params),
    queryFn: () => ordersService.getAll(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useOrderById(id: string, enabled = true) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => ordersService.getById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useOrderStatistics(params?: GetOrderStatisticsParams) {
  return useQuery({
    queryKey: ordersKeys.statistics(params),
    queryFn: () => ordersService.getStatistics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusRequest }) =>
      ordersService.updateStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.statistics() });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelOrderRequest }) =>
      ordersService.cancel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.statistics() });
    },
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundOrderRequest }) =>
      ordersService.refund(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.statistics() });
    },
  });
}
