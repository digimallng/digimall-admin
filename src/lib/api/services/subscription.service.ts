/**
 * Subscription Plans & Vendor Subscriptions Service
 * All 10 endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import type {
  GetSubscriptionPlansResponse,
  GetSubscriptionPlanResponse,
  CreateSubscriptionPlanRequest,
  CreateSubscriptionPlanResponse,
  UpdateSubscriptionPlanRequest,
  UpdateSubscriptionPlanResponse,
  SyncPaystackResponse,
  GetVendorSubscriptionsParams,
  GetVendorSubscriptionsResponse,
  VendorSubscription,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  SubscriptionPlanStatistics,
} from '../types/subscription.types';

class SubscriptionService {
  // ===== SUBSCRIPTION PLANS =====

  // 1. GET /admin/subscription-plans - Get all subscription plans
  async getAllPlans(): Promise<GetSubscriptionPlansResponse> {
    const response = await apiClient.get<GetSubscriptionPlansResponse>(
      '/admin/subscription-plans'
    );
    return response;
  }

  // 2. GET /admin/subscription-plans/:id - Get subscription plan by ID
  async getPlanById(id: string): Promise<GetSubscriptionPlanResponse> {
    const response = await apiClient.get<GetSubscriptionPlanResponse>(
      `/admin/subscription-plans/${id}`
    );
    return response;
  }

  // 3. POST /admin/subscription-plans - Create subscription plan
  async createPlan(data: CreateSubscriptionPlanRequest): Promise<CreateSubscriptionPlanResponse> {
    const response = await apiClient.post<CreateSubscriptionPlanResponse>(
      '/admin/subscription-plans',
      data
    );
    return response;
  }

  // 4. PUT /admin/subscription-plans/:id - Update subscription plan
  async updatePlan(
    id: string,
    data: UpdateSubscriptionPlanRequest
  ): Promise<UpdateSubscriptionPlanResponse> {
    const response = await apiClient.put<UpdateSubscriptionPlanResponse>(
      `/admin/subscription-plans/${id}`,
      data
    );
    return response;
  }

  // 5. DELETE /admin/subscription-plans/:id - Archive subscription plan
  async archivePlan(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/subscription-plans/${id}`
    );
    return response;
  }

  // 6. POST /admin/subscription-plans/:id/sync-paystack - Sync plan with Paystack
  async syncPlanWithPaystack(id: string): Promise<SyncPaystackResponse> {
    const response = await apiClient.post<SyncPaystackResponse>(
      `/admin/subscription-plans/${id}/sync-paystack`
    );
    return response;
  }

  // 10. GET /admin/subscription-plans/statistics - Get subscription plan statistics
  async getPlanStatistics(): Promise<SubscriptionPlanStatistics> {
    const response = await apiClient.get<SubscriptionPlanStatistics>(
      '/admin/subscription-plans/statistics'
    );
    return response;
  }

  // ===== VENDOR SUBSCRIPTIONS =====

  // 7. GET /admin/vendor-subscriptions - Get all vendor subscriptions
  async getVendorSubscriptions(
    params?: GetVendorSubscriptionsParams
  ): Promise<GetVendorSubscriptionsResponse> {
    const response = await apiClient.get<GetVendorSubscriptionsResponse>(
      '/admin/vendor-subscriptions',
      params
    );
    return response;
  }

  // 8. GET /admin/vendor-subscriptions/:id - Get vendor subscription details
  async getVendorSubscriptionById(id: string): Promise<VendorSubscription> {
    const response = await apiClient.get<VendorSubscription>(
      `/admin/vendor-subscriptions/${id}`
    );
    return response;
  }

  // 9. POST /admin/vendor-subscriptions/:id/cancel - Cancel vendor subscription
  async cancelVendorSubscription(
    id: string,
    data: CancelSubscriptionRequest
  ): Promise<CancelSubscriptionResponse> {
    const response = await apiClient.post<CancelSubscriptionResponse>(
      `/admin/vendor-subscriptions/${id}/cancel`,
      data
    );
    return response;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
