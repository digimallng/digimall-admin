/**
 * Reviews Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 10 review management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md - Reviews Management section
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams, PaginatedResponse } from './shared.types';

// ===== ENUMS =====

/**
 * Review types
 */
export const ReviewTypeSchema = z.enum(['PRODUCT', 'VENDOR']);
export type ReviewType = z.infer<typeof ReviewTypeSchema>;

/**
 * Review status
 */
export const ReviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

/**
 * Bulk moderation actions
 */
export const BulkModerationActionSchema = z.enum(['approve', 'reject', 'flag', 'delete']);
export type BulkModerationAction = z.infer<typeof BulkModerationActionSchema>;

// ===== NESTED ENTITIES =====

/**
 * Customer info in review
 */
export interface ReviewCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export const ReviewCustomerSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

/**
 * Product info in review
 */
export interface ReviewProduct {
  _id: string;
  title: string;
  description?: string;
  basePrice?: number;
  images?: string[];
}

export const ReviewProductSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  basePrice: z.number().optional(),
  images: z.array(z.string().url()).optional(),
});

/**
 * Vendor info in review
 */
export interface ReviewVendor {
  _id: string;
  businessName: string;
  email?: string;
  rating?: number;
}

export const ReviewVendorSchema = z.object({
  _id: z.string(),
  businessName: z.string(),
  email: z.string().email().optional(),
  rating: z.number().min(0).max(5).optional(),
});

/**
 * Vendor response to review
 */
export interface VendorResponse {
  message: string;
  respondedAt: string;
  respondedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export const VendorResponseSchema = z.object({
  message: z.string(),
  respondedAt: z.string().datetime(),
  respondedBy: z.object({
    _id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

/**
 * Moderator info
 */
export interface Moderator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const ModeratorSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

// ===== REVIEW ENTITY =====

/**
 * Review entity
 */
export interface Review {
  _id: string;
  type: ReviewType;
  productId?: ReviewProduct;
  vendorId: ReviewVendor;
  customerId: ReviewCustomer;
  orderId?: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  status: ReviewStatus;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  isFlagged: boolean;
  flagReason?: string;
  rejectionReason?: string;
  vendorResponse?: VendorResponse;
  moderatedBy?: Moderator;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const ReviewSchema = z.object({
  _id: z.string(),
  type: ReviewTypeSchema,
  productId: ReviewProductSchema.optional(),
  vendorId: ReviewVendorSchema,
  customerId: ReviewCustomerSchema,
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string(),
  content: z.string(),
  images: z.array(z.string().url()).optional(),
  status: ReviewStatusSchema,
  verifiedPurchase: z.boolean(),
  helpfulVotes: z.number().int().nonnegative(),
  isFlagged: z.boolean(),
  flagReason: z.string().optional(),
  rejectionReason: z.string().optional(),
  vendorResponse: VendorResponseSchema.optional(),
  moderatedBy: ModeratorSchema.optional(),
  approvedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all reviews query parameters
 */
export interface GetAllReviewsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  type?: ReviewType;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  productId?: string;
  vendorId?: string;
  customerId?: string;
  isFlagged?: boolean;
  needsModeration?: boolean;
  sortBy?: 'createdAt' | 'rating' | 'helpfulVotes';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const GetAllReviewsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  type: ReviewTypeSchema.optional(),
  status: ReviewStatusSchema.optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  maxRating: z.number().int().min(1).max(5).optional(),
  productId: z.string().optional(),
  vendorId: z.string().optional(),
  customerId: z.string().optional(),
  isFlagged: z.boolean().optional(),
  needsModeration: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'rating', 'helpfulVotes']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

// ===== REQUEST TYPES =====

/**
 * Approve review request
 */
export interface ApproveReviewRequest {
  comment?: string;
}

export const ApproveReviewRequestSchema = z.object({
  comment: z.string().optional(),
});

/**
 * Reject review request
 */
export interface RejectReviewRequest {
  reason: string;
}

export const RejectReviewRequestSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

/**
 * Flag review request
 */
export interface FlagReviewRequest {
  reason: string;
}

export const FlagReviewRequestSchema = z.object({
  reason: z.string().min(1, 'Flag reason is required'),
});

/**
 * Bulk moderation request
 */
export interface BulkModerateRequest {
  reviewIds: string[];
  action: BulkModerationAction;
  reason?: string;
}

export const BulkModerateRequestSchema = z.object({
  reviewIds: z.array(z.string()).min(1, 'At least one review must be selected'),
  action: BulkModerationActionSchema,
  reason: z.string().optional(),
});

// ===== RESPONSE TYPES =====

/**
 * Review list response
 */
export interface ReviewListResponse {
  success: boolean;
  data: {
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const ReviewListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    reviews: z.array(ReviewSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    pages: z.number().int().nonnegative(),
  }),
});

/**
 * Single review response
 */
export interface ReviewResponse {
  success: boolean;
  data: Review;
}

export const ReviewResponseSchema = z.object({
  success: z.boolean(),
  data: ReviewSchema,
});

/**
 * Review moderation response
 */
export interface ReviewModerationResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    status: ReviewStatus;
    approvedAt?: string;
    rejectionReason?: string;
    flagReason?: string;
    isFlagged?: boolean;
    moderatedBy?: Moderator;
  };
}

export const ReviewModerationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    status: ReviewStatusSchema,
    approvedAt: z.string().datetime().optional(),
    rejectionReason: z.string().optional(),
    flagReason: z.string().optional(),
    isFlagged: z.boolean().optional(),
    moderatedBy: ModeratorSchema.optional(),
  }),
});

/**
 * Bulk moderation response
 */
export interface BulkModerateResponse {
  success: boolean;
  message: string;
  data: {
    processed: number;
    action: BulkModerationAction;
  };
}

export const BulkModerateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    processed: z.number().int().nonnegative(),
    action: BulkModerationActionSchema,
  }),
});

/**
 * Delete review response
 */
export interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

export const DeleteReviewResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ===== STATISTICS =====

/**
 * Rating distribution
 */
export interface RatingDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export const RatingDistributionSchema = z.object({
  '1': z.number().int().nonnegative(),
  '2': z.number().int().nonnegative(),
  '3': z.number().int().nonnegative(),
  '4': z.number().int().nonnegative(),
  '5': z.number().int().nonnegative(),
});

/**
 * Top rated product
 */
export interface TopRatedProduct {
  productId: string;
  title: string;
  averageRating: number;
  reviewCount: number;
}

export const TopRatedProductSchema = z.object({
  productId: z.string(),
  title: z.string(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});

/**
 * Top rated vendor
 */
export interface TopRatedVendor {
  vendorId: string;
  businessName: string;
  averageRating: number;
  reviewCount: number;
}

export const TopRatedVendorSchema = z.object({
  vendorId: z.string(),
  businessName: z.string(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
});

/**
 * Moderation metrics
 */
export interface ModerationMetrics {
  averageApprovalTime: string;
  autoApprovedPercentage: number;
  manuallyModeratedPercentage: number;
}

export const ModerationMetricsSchema = z.object({
  averageApprovalTime: z.string(),
  autoApprovedPercentage: z.number().min(0).max(100),
  manuallyModeratedPercentage: z.number().min(0).max(100),
});

/**
 * Recent activity data
 */
export interface RecentActivity {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export const RecentActivitySchema = z.object({
  last24Hours: z.number().int().nonnegative(),
  last7Days: z.number().int().nonnegative(),
  last30Days: z.number().int().nonnegative(),
});

/**
 * Platform review statistics
 * Based on actual API response structure
 */
export interface ReviewStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  productReviews: number;
  vendorReviews: number;
  fiveStarPercentage: number;
  positiveReviewPercentage: number;
  recentActivity: RecentActivity;
  topVendors: TopRatedVendor[];
}

export const ReviewStatisticsSchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  approved: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
  flagged: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  ratingDistribution: RatingDistributionSchema,
  productReviews: z.number().int().nonnegative(),
  vendorReviews: z.number().int().nonnegative(),
  fiveStarPercentage: z.number().min(0).max(100),
  positiveReviewPercentage: z.number().min(0).max(100),
  recentActivity: RecentActivitySchema,
  topVendors: z.array(TopRatedVendorSchema),
});

/**
 * Review statistics response
 */
export interface ReviewStatisticsResponse {
  success: boolean;
  data: ReviewStatistics;
}

export const ReviewStatisticsResponseSchema = z.object({
  success: z.boolean(),
  data: ReviewStatisticsSchema,
});

// ===== VENDOR ANALYTICS =====

/**
 * Review trend data
 */
export interface ReviewTrend {
  last30Days: number;
  previous30Days: number;
  growth: number;
}

export const ReviewTrendSchema = z.object({
  last30Days: z.number().int().nonnegative(),
  previous30Days: z.number().int().nonnegative(),
  growth: z.number(),
});

/**
 * Top reviewed product
 */
export interface TopReviewedProduct {
  productId: string;
  title: string;
  reviewCount: number;
  averageRating: number;
}

export const TopReviewedProductSchema = z.object({
  productId: z.string(),
  title: z.string(),
  reviewCount: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
});

/**
 * Vendor review analytics
 */
export interface VendorReviewAnalytics {
  vendorId: string;
  businessName: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  productReviews: number;
  vendorReviews: number;
  responseRate: number;
  averageResponseTime: string;
  reviewTrend: ReviewTrend;
  topReviewedProducts: TopReviewedProduct[];
}

export const VendorReviewAnalyticsSchema = z.object({
  vendorId: z.string(),
  businessName: z.string(),
  totalReviews: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  ratingDistribution: RatingDistributionSchema,
  productReviews: z.number().int().nonnegative(),
  vendorReviews: z.number().int().nonnegative(),
  responseRate: z.number().min(0).max(100),
  averageResponseTime: z.string(),
  reviewTrend: ReviewTrendSchema,
  topReviewedProducts: z.array(TopReviewedProductSchema),
});

/**
 * Vendor analytics response
 */
export interface VendorAnalyticsResponse {
  success: boolean;
  data: VendorReviewAnalytics;
}

export const VendorAnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: VendorReviewAnalyticsSchema,
});

// ===== PRODUCT ANALYTICS =====

/**
 * Sentiment analysis
 */
export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
}

export const SentimentAnalysisSchema = z.object({
  positive: z.number().int().nonnegative(),
  neutral: z.number().int().nonnegative(),
  negative: z.number().int().nonnegative(),
});

/**
 * Product review analytics
 */
export interface ProductReviewAnalytics {
  productId: string;
  title: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  verifiedPurchasePercentage: number;
  reviewsWithImages: number;
  reviewsWithVendorResponse: number;
  reviewTrend: ReviewTrend;
  sentimentAnalysis: SentimentAnalysis;
}

export const ProductReviewAnalyticsSchema = z.object({
  productId: z.string(),
  title: z.string(),
  totalReviews: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  ratingDistribution: RatingDistributionSchema,
  verifiedPurchasePercentage: z.number().min(0).max(100),
  reviewsWithImages: z.number().int().nonnegative(),
  reviewsWithVendorResponse: z.number().int().nonnegative(),
  reviewTrend: ReviewTrendSchema,
  sentimentAnalysis: SentimentAnalysisSchema,
});

/**
 * Product analytics response
 */
export interface ProductAnalyticsResponse {
  success: boolean;
  data: ProductReviewAnalytics;
}

export const ProductAnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: ProductReviewAnalyticsSchema,
});

// ===== TYPE EXPORTS =====

export type {
  Review,
  ReviewListResponse,
  ReviewResponse,
  ReviewModerationResponse,
  BulkModerateResponse,
  DeleteReviewResponse,
  ReviewStatistics,
  ReviewStatisticsResponse,
  VendorReviewAnalytics,
  VendorAnalyticsResponse,
  ProductReviewAnalytics,
  ProductAnalyticsResponse,
};
