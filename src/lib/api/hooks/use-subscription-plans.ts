/**
 * Subscription Plans React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlansService } from '../services';
import type {
  GetAllPlansParams,
  GetVendorSubscriptionsParams,
  GetSubscriptionStatisticsParams,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '../types';

export const subscriptionPlansKeys = {
  all: ['subscription-plans'] as const,
  plans: (params?: GetAllPlansParams) => [...subscriptionPlansKeys.all, 'plans', params] as const,
  planDetail: (id: string) => [...subscriptionPlansKeys.all, 'plan', id] as const,
  vendorSubscriptions: (params?: GetVendorSubscriptionsParams) =>
    [...subscriptionPlansKeys.all, 'vendor-subscriptions', params] as const,
  vendorSubscriptionDetail: (id: string) =>
    [...subscriptionPlansKeys.all, 'vendor-subscription', id] as const,
  statistics: (params?: GetSubscriptionStatisticsParams) =>
    [...subscriptionPlansKeys.all, 'statistics', params] as const,
};

export function useSubscriptionPlans(params?: GetAllPlansParams) {
  return useQuery({
    queryKey: subscriptionPlansKeys.plans(params),
    queryFn: () => subscriptionPlansService.getAllPlans(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscriptionPlanById(id: string, enabled = true) {
  return useQuery({
    queryKey: subscriptionPlansKeys.planDetail(id),
    queryFn: () => subscriptionPlansService.getPlanById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorSubscriptions(params?: GetVendorSubscriptionsParams) {
  return useQuery({
    queryKey: subscriptionPlansKeys.vendorSubscriptions(params),
    queryFn: () => subscriptionPlansService.getVendorSubscriptions(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorSubscriptionById(id: string, enabled = true) {
  return useQuery({
    queryKey: subscriptionPlansKeys.vendorSubscriptionDetail(id),
    queryFn: () => subscriptionPlansService.getVendorSubscriptionById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubscriptionStatistics(params?: GetSubscriptionStatisticsParams) {
  return useQuery({
    queryKey: subscriptionPlansKeys.statistics(params),
    queryFn: () => subscriptionPlansService.getStatistics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanRequest) =>
      subscriptionPlansService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.plans() });
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.statistics() });
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionPlanRequest }) =>
      subscriptionPlansService.updatePlan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.planDetail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.plans() });
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionPlansService.deletePlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.plans() });
      queryClient.removeQueries({ queryKey: subscriptionPlansKeys.planDetail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.statistics() });
    },
  });
}

export function useCancelVendorSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionPlansService.cancelVendorSubscription(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionPlansKeys.vendorSubscriptionDetail(id),
      });
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.vendorSubscriptions() });
      queryClient.invalidateQueries({ queryKey: subscriptionPlansKeys.statistics() });
    },
  });
}
