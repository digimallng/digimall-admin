/**
 * Subscription Plans & Vendor Subscriptions React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscription.service';
import type {
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  GetVendorSubscriptionsParams,
  CancelSubscriptionRequest,
} from '../types/subscription.types';

// ===== SUBSCRIPTION PLANS HOOKS =====

/**
 * Get all subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionService.getAllPlans(),
  });
}

/**
 * Get subscription plan by ID
 */
export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: ['subscription-plan', id],
    queryFn: () => subscriptionService.getPlanById(id),
    enabled: !!id,
  });
}

/**
 * Get subscription plan statistics
 */
export function useSubscriptionPlanStatistics() {
  return useQuery({
    queryKey: ['subscription-plan-statistics'],
    queryFn: () => subscriptionService.getPlanStatistics(),
  });
}

/**
 * Create subscription plan mutation
 */
export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanRequest) =>
      subscriptionService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plan-statistics'] });
    },
  });
}

/**
 * Update subscription plan mutation
 */
export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionPlanRequest }) =>
      subscriptionService.updatePlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plan', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plan-statistics'] });
    },
  });
}

/**
 * Archive subscription plan mutation
 */
export function useArchiveSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.archivePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plan-statistics'] });
    },
  });
}

/**
 * Sync plan with Paystack mutation
 */
export function useSyncPlanWithPaystack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.syncPlanWithPaystack(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plan', id] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
  });
}

// ===== VENDOR SUBSCRIPTIONS HOOKS =====

/**
 * Get all vendor subscriptions
 */
export function useVendorSubscriptions(params?: GetVendorSubscriptionsParams) {
  return useQuery({
    queryKey: ['vendor-subscriptions', params],
    queryFn: () => subscriptionService.getVendorSubscriptions(params),
  });
}

/**
 * Get vendor subscription by ID
 */
export function useVendorSubscription(id: string) {
  return useQuery({
    queryKey: ['vendor-subscription', id],
    queryFn: () => subscriptionService.getVendorSubscriptionById(id),
    enabled: !!id,
  });
}

/**
 * Cancel vendor subscription mutation
 */
export function useCancelVendorSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelSubscriptionRequest }) =>
      subscriptionService.cancelVendorSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-subscription', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plan-statistics'] });
    },
  });
}
