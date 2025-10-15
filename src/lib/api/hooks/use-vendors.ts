/**
 * Vendors React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorsService } from '../services';
import type {
  GetAllVendorsParams,
  GetVendorStatisticsParams,
  VendorApprovalRequest,
  UpdateVendorTierRequest,
  VendorSuspensionRequest,
} from '../types';

export const vendorsKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorsKeys.all, 'list'] as const,
  list: (params?: GetAllVendorsParams) => [...vendorsKeys.lists(), params] as const,
  details: () => [...vendorsKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorsKeys.details(), id] as const,
  statistics: (params?: GetVendorStatisticsParams) => [...vendorsKeys.all, 'statistics', params] as const,
};

export function useVendors(params?: GetAllVendorsParams) {
  return useQuery({
    queryKey: vendorsKeys.list(params),
    queryFn: () => vendorsService.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorById(id: string, enabled = true) {
  return useQuery({
    queryKey: vendorsKeys.detail(id),
    queryFn: () => vendorsService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorStatistics(params?: GetVendorStatisticsParams) {
  return useQuery({
    queryKey: vendorsKeys.statistics(params),
    queryFn: () => vendorsService.getStatistics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useApproveRejectVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorApprovalRequest }) =>
      vendorsService.approveReject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorsKeys.statistics() });
    },
  });
}

export function useUpdateVendorTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorTierRequest }) =>
      vendorsService.updateTier(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: vendorsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vendorsKeys.lists() });
    },
  });
}

export function useSuspendUnsuspendVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VendorSuspensionRequest }) =>
      vendorsService.suspendUnsuspend(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: vendorsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vendorsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorsKeys.statistics() });
    },
  });
}

export function useVendorPerformance(id: string, enabled = true) {
  return useQuery({
    queryKey: [...vendorsKeys.detail(id), 'performance'],
    queryFn: () => vendorsService.getPerformance(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBulkTierUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      vendorIds: string[];
      tier: 'basic' | 'silver' | 'gold' | 'platinum';
      commission: number;
      reason: string;
    }) => vendorsService.bulkTierUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorsKeys.statistics() });
    },
  });
}
