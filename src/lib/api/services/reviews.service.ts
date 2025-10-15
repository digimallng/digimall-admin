/**
 * Reviews Management Service
 *
 * Service layer for all review-related API operations.
 * Implements all 10 review management endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  Review,
  ReviewListResponse,
  ReviewResponse,
  ReviewModerationResponse,
  BulkModerateResponse,
  DeleteReviewResponse,
  ReviewStatisticsResponse,
  VendorAnalyticsResponse,
  ProductAnalyticsResponse,
  GetAllReviewsParams,
  ApproveReviewRequest,
  RejectReviewRequest,
  FlagReviewRequest,
  BulkModerateRequest,
} from '../types/reviews.types';

// ===== REVIEWS SERVICE CLASS =====

class ReviewsService {
  /**
   * 1. Get all reviews with comprehensive filtering
   * GET /admin/reviews
   */
  async getAll(params?: GetAllReviewsParams): Promise<ReviewListResponse> {
    const response = await apiClient.get<ReviewListResponse>(
      API_ENDPOINTS.REVIEWS.GET_ALL,
      { params }
    );
    return response.data!;
  }

  /**
   * 2. Get review by ID
   * GET /admin/reviews/:id
   */
  async getById(id: string): Promise<ReviewResponse> {
    const response = await apiClient.get<ReviewResponse>(
      API_ENDPOINTS.REVIEWS.GET_BY_ID(id)
    );
    return response.data!;
  }

  /**
   * 3. Approve review
   * POST /admin/reviews/:id/approve
   */
  async approve(
    id: string,
    data?: ApproveReviewRequest
  ): Promise<ReviewModerationResponse> {
    const response = await apiClient.post<ReviewModerationResponse>(
      API_ENDPOINTS.REVIEWS.APPROVE(id),
      data || {}
    );
    return response.data!;
  }

  /**
   * 4. Reject review
   * POST /admin/reviews/:id/reject
   */
  async reject(
    id: string,
    data: RejectReviewRequest
  ): Promise<ReviewModerationResponse> {
    const response = await apiClient.post<ReviewModerationResponse>(
      API_ENDPOINTS.REVIEWS.REJECT(id),
      data
    );
    return response.data!;
  }

  /**
   * 5. Flag review for investigation
   * POST /admin/reviews/:id/flag
   */
  async flag(
    id: string,
    data: FlagReviewRequest
  ): Promise<ReviewModerationResponse> {
    const response = await apiClient.post<ReviewModerationResponse>(
      API_ENDPOINTS.REVIEWS.FLAG(id),
      data
    );
    return response.data!;
  }

  /**
   * 6. Delete review permanently
   * DELETE /admin/reviews/:id
   */
  async delete(id: string): Promise<DeleteReviewResponse> {
    const response = await apiClient.delete<DeleteReviewResponse>(
      API_ENDPOINTS.REVIEWS.DELETE(id)
    );
    return response.data!;
  }

  /**
   * 7. Get platform review statistics
   * GET /admin/reviews/stats
   */
  async getStatistics(): Promise<ReviewStatisticsResponse> {
    const response = await apiClient.get<ReviewStatisticsResponse>(
      API_ENDPOINTS.REVIEWS.GET_STATISTICS
    );
    return response.data!;
  }

  /**
   * 8. Bulk moderate reviews
   * POST /admin/reviews/bulk/moderate
   */
  async bulkModerate(data: BulkModerateRequest): Promise<BulkModerateResponse> {
    const response = await apiClient.post<BulkModerateResponse>(
      API_ENDPOINTS.REVIEWS.BULK_MODERATE,
      data
    );
    return response.data!;
  }

  /**
   * 9. Get vendor review analytics
   * GET /admin/reviews/vendor/:vendorId/analytics
   */
  async getVendorAnalytics(vendorId: string): Promise<VendorAnalyticsResponse> {
    const response = await apiClient.get<VendorAnalyticsResponse>(
      API_ENDPOINTS.REVIEWS.VENDOR_ANALYTICS(vendorId)
    );
    return response.data!;
  }

  /**
   * 10. Get product review analytics
   * GET /admin/reviews/product/:productId/analytics
   */
  async getProductAnalytics(productId: string): Promise<ProductAnalyticsResponse> {
    const response = await apiClient.get<ProductAnalyticsResponse>(
      API_ENDPOINTS.REVIEWS.PRODUCT_ANALYTICS(productId)
    );
    return response.data!;
  }
}

// ===== SINGLETON INSTANCE =====

export const reviewsService = new ReviewsService();
export default reviewsService;
