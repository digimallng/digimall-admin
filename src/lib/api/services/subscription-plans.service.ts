/**
 * Subscription Plans Management Service
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  SubscriptionPlan,
  VendorSubscription,
  SubscriptionPlansListResponse,
  VendorSubscriptionsListResponse,
  CreateSubscriptionPlanRequest,
  CreateSubscriptionPlanResponse,
  UpdateSubscriptionPlanRequest,
  UpdateSubscriptionPlanResponse,
  DeleteSubscriptionPlanResponse,
  CancelVendorSubscriptionRequest,
  CancelVendorSubscriptionResponse,
  SubscriptionStatisticsResponse,
  GetAllSubscriptionPlansParams,
  GetVendorSubscriptionsParams,
} from '../types';

class SubscriptionPlansService {
  async getAllPlans(
    params?: GetAllSubscriptionPlansParams
  ): Promise<SubscriptionPlansListResponse> {
    const response = await apiClient.get<SubscriptionPlansListResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL_PLANS,
      { params }
    );
    return response.data!;
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const response = await apiClient.get<SubscriptionPlan>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_PLAN_BY_ID(id)
    );
    return response.data!;
  }

  async createPlan(
    data: CreateSubscriptionPlanRequest
  ): Promise<CreateSubscriptionPlanResponse> {
    const response = await apiClient.post<CreateSubscriptionPlanResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PLAN,
      data
    );
    return response.data!;
  }

  async updatePlan(
    id: string,
    data: UpdateSubscriptionPlanRequest
  ): Promise<UpdateSubscriptionPlanResponse> {
    const response = await apiClient.patch<UpdateSubscriptionPlanResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.UPDATE_PLAN(id),
      data
    );
    return response.data!;
  }

  async deletePlan(id: string): Promise<DeleteSubscriptionPlanResponse> {
    const response = await apiClient.delete<DeleteSubscriptionPlanResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.DELETE_PLAN(id)
    );
    return response.data!;
  }

  async getVendorSubscriptions(
    params?: GetVendorSubscriptionsParams
  ): Promise<VendorSubscriptionsListResponse> {
    const response = await apiClient.get<VendorSubscriptionsListResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_VENDOR_SUBSCRIPTIONS,
      { params }
    );
    return response.data!;
  }

  async getVendorSubscriptionById(id: string): Promise<VendorSubscription> {
    const response = await apiClient.get<VendorSubscription>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_VENDOR_SUBSCRIPTION_BY_ID(id)
    );
    return response.data!;
  }

  async cancelVendorSubscription(
    id: string,
    data: CancelVendorSubscriptionRequest
  ): Promise<CancelVendorSubscriptionResponse> {
    const response = await apiClient.post<CancelVendorSubscriptionResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.CANCEL_VENDOR_SUBSCRIPTION(id),
      data
    );
    return response.data!;
  }

  async getStatistics(): Promise<SubscriptionStatisticsResponse> {
    const response = await apiClient.get<SubscriptionStatisticsResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_STATISTICS
    );
    return response.data!;
  }
}

export const subscriptionPlansService = new SubscriptionPlansService();
export default subscriptionPlansService;
