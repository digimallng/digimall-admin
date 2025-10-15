/**
 * Admin Vendor Operations Types for DigiMall Admin API
 *
 * Complete type definitions for all 4 admin vendor operation endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity } from './shared.types';

// ===== VENDOR PAYOUT ENTITY =====

/**
 * Vendor payout entity
 */
export interface VendorPayout extends BaseEntity {
  vendorId: string;
  vendorName: string;
  amount: number;
  currency: string;
  period: {
    startDate: string;
    endDate: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankAccount: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  transactionReference?: string;
  processedBy?: string;
  processedAt?: string;
  failureReason?: string;
  notes?: string;
}

export const VendorPayoutSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  bankAccount: z.object({
    accountName: z.string(),
    accountNumber: z.string(),
    bankName: z.string(),
  }),
  transactionReference: z.string().optional(),
  processedBy: z.string().optional(),
  processedAt: z.string().datetime().optional(),
  failureReason: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== VENDOR PRODUCT REVIEW ENTITY =====

/**
 * Product review entity
 */
export interface ProductReview extends BaseEntity {
  productId: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  orderNumber?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export const ProductReviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string(),
  images: z.array(z.string().url()).optional(),
  helpful: z.number().int().nonnegative(),
  notHelpful: z.number().int().nonnegative(),
  status: z.enum(['pending', 'approved', 'rejected']),
  verified: z.boolean(),
  orderNumber: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== VENDOR DISPUTE ENTITY =====

/**
 * Dispute message
 */
export interface DisputeMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'vendor' | 'admin';
  message: string;
  attachments?: string[];
  timestamp: string;
}

export const DisputeMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderType: z.enum(['customer', 'vendor', 'admin']),
  message: z.string(),
  attachments: z.array(z.string().url()).optional(),
  timestamp: z.string().datetime(),
});

/**
 * Vendor dispute entity
 */
export interface VendorDispute extends BaseEntity {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  type: 'product_quality' | 'shipping' | 'refund' | 'service' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  evidence?: string[];
  messages: DisputeMessage[];
  assignedTo?: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  refundAmount?: number;
  closedAt?: string;
}

export const VendorDisputeSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  type: z.enum(['product_quality', 'shipping', 'refund', 'service', 'other']),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  subject: z.string(),
  description: z.string(),
  evidence: z.array(z.string().url()).optional(),
  messages: z.array(DisputeMessageSchema),
  assignedTo: z.string().optional(),
  resolution: z.string().optional(),
  resolvedBy: z.string().optional(),
  resolvedAt: z.string().datetime().optional(),
  refundAmount: z.number().nonnegative().optional(),
  closedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== REQUEST TYPES =====

/**
 * Process payout request
 */
export interface ProcessPayoutRequest {
  transactionReference: string;
  notes?: string;
}

export const ProcessPayoutRequestSchema = z.object({
  transactionReference: z.string().min(1),
  notes: z.string().optional(),
});

/**
 * Review product review request
 */
export interface ReviewProductReviewRequest {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export const ReviewProductReviewRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional(),
});

/**
 * Resolve dispute request
 */
export interface ResolveDisputeRequest {
  resolution: string;
  refundAmount?: number;
  notifyParties?: boolean;
}

export const ResolveDisputeRequestSchema = z.object({
  resolution: z.string().min(1),
  refundAmount: z.number().nonnegative().optional(),
  notifyParties: z.boolean().optional(),
});

/**
 * Add dispute message request
 */
export interface AddDisputeMessageRequest {
  message: string;
  attachments?: string[];
}

export const AddDisputeMessageRequestSchema = z.object({
  message: z.string().min(1),
  attachments: z.array(z.string().url()).optional(),
});

// ===== RESPONSE TYPES =====

/**
 * Vendor payouts list response
 */
export interface VendorPayoutsListResponse {
  data: VendorPayout[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const VendorPayoutsListResponseSchema = z.object({
  data: z.array(VendorPayoutSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Process payout response
 */
export interface ProcessPayoutResponse {
  message: string;
  data: {
    id: string;
    vendorId: string;
    amount: number;
    status: string;
    processedAt: string;
  };
}

export const ProcessPayoutResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    vendorId: z.string(),
    amount: z.number().positive(),
    status: z.string(),
    processedAt: z.string().datetime(),
  }),
});

/**
 * Product reviews list response
 */
export interface ProductReviewsListResponse {
  data: ProductReview[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ProductReviewsListResponseSchema = z.object({
  data: z.array(ProductReviewSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Review product review response
 */
export interface ReviewProductReviewResponse {
  message: string;
  data: {
    id: string;
    productId: string;
    status: string;
    reviewedBy: string;
    reviewedAt: string;
  };
}

export const ReviewProductReviewResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    productId: z.string(),
    status: z.string(),
    reviewedBy: z.string(),
    reviewedAt: z.string().datetime(),
  }),
});

/**
 * Vendor disputes list response
 */
export interface VendorDisputesListResponse {
  data: VendorDispute[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const VendorDisputesListResponseSchema = z.object({
  data: z.array(VendorDisputeSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Resolve dispute response
 */
export interface ResolveDisputeResponse {
  message: string;
  data: {
    id: string;
    orderId: string;
    status: string;
    resolution: string;
    resolvedBy: string;
    resolvedAt: string;
    refundAmount?: number;
  };
}

export const ResolveDisputeResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    orderId: z.string(),
    status: z.string(),
    resolution: z.string(),
    resolvedBy: z.string(),
    resolvedAt: z.string().datetime(),
    refundAmount: z.number().nonnegative().optional(),
  }),
});

// ===== TYPE EXPORTS =====

export type {
  VendorPayout,
  ProductReview,
  VendorDispute,
  VendorPayoutsListResponse,
  ProcessPayoutResponse,
  ProductReviewsListResponse,
  ReviewProductReviewResponse,
  VendorDisputesListResponse,
  ResolveDisputeResponse,
};
