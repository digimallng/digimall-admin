/**
 * Admin Vendor Operations Service
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  VendorPayout,
  ProductReview,
  VendorDispute,
  VendorPayoutsListResponse,
  ProcessPayoutRequest,
  ProcessPayoutResponse,
  ProductReviewsListResponse,
  ReviewProductReviewRequest,
  ReviewProductReviewResponse,
  VendorDisputesListResponse,
  ResolveDisputeRequest,
  ResolveDisputeResponse,
  AddDisputeMessageRequest,
} from '../types';

class AdminVendorService {
  async getPayouts(params?: any): Promise<VendorPayoutsListResponse> {
    const response = await apiClient.get<VendorPayoutsListResponse>(
      API_ENDPOINTS.ADMIN_VENDOR.GET_PAYOUTS,
      { params }
    );
    return response.data!;
  }

  async processPayout(
    id: string,
    data: ProcessPayoutRequest
  ): Promise<ProcessPayoutResponse> {
    const response = await apiClient.post<ProcessPayoutResponse>(
      API_ENDPOINTS.ADMIN_VENDOR.PROCESS_PAYOUT(id),
      data
    );
    return response.data!;
  }

  async getProductReviews(params?: any): Promise<ProductReviewsListResponse> {
    const response = await apiClient.get<ProductReviewsListResponse>(
      API_ENDPOINTS.ADMIN_VENDOR.GET_PRODUCT_REVIEWS,
      { params }
    );
    return response.data!;
  }

  async reviewProductReview(
    id: string,
    data: ReviewProductReviewRequest
  ): Promise<ReviewProductReviewResponse> {
    const response = await apiClient.post<ReviewProductReviewResponse>(
      API_ENDPOINTS.ADMIN_VENDOR.REVIEW_PRODUCT_REVIEW(id),
      data
    );
    return response.data!;
  }

  async getDisputes(params?: any): Promise<VendorDisputesListResponse> {
    const response = await apiClient.get<VendorDisputesListResponse>(
      API_ENDPOINTS.ADMIN_VENDOR.GET_DISPUTES,
      { params }
    );
    return response.data!;
  }

  async getDisputeById(id: string): Promise<VendorDispute> {
    const response = await apiClient.get<VendorDispute>(
      API_ENDPOINTS.ADMIN_VENDOR.GET_DISPUTE_BY_ID(id)
    );
    return response.data!;
  }

  async resolveDispute(
    id: string,
    data: ResolveDisputeRequest
  ): Promise<ResolveDisputeResponse> {
    const response = await apiClient.post<ResolveDisputeResponse>(
      API_ENDPOINTS.ADMIN_VENDOR.RESOLVE_DISPUTE(id),
      data
    );
    return response.data!;
  }
}

export const adminVendorService = new AdminVendorService();
export default adminVendorService;
