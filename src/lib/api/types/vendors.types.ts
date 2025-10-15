/**
 * Vendors Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 6 vendor management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams, PaginatedResponse } from './shared.types';
import { VendorStatusSchema, VendorTierSchema, KycStatusSchema } from './enums.types';

// ===== VENDOR ENTITY =====

/**
 * Vendor bank account
 */
export interface VendorBankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export const VendorBankAccountSchema = z.object({
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  bankName: z.string().min(1),
  bankCode: z.string().min(1),
});

/**
 * Vendor business info
 */
export interface VendorBusinessInfo {
  businessName: string;
  businessAddress: string;
  businessType: string;
  description?: string;
  registrationNumber?: string;
  taxId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
}

export const VendorBusinessInfoSchema = z.object({
  businessName: z.string().min(1),
  businessAddress: z.string().min(1),
  businessType: z.string().min(1),
  description: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string().optional(),
  }).optional(),
});

/**
 * Vendor KYC info
 * NOTE: Vendors do not need to provide documents per latest requirements
 */
export interface VendorKyc {
  status: 'verified' | 'pending' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export const VendorKycSchema = z.object({
  status: KycStatusSchema,
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  rejectionReason: z.string().optional(),
});

/**
 * Vendor metrics
 */
export interface VendorMetrics {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  totalReviews?: number;
  responseRate: number;
  fulfillmentRate: number;
}

export const VendorMetricsSchema = z.object({
  totalProducts: z.number().int().nonnegative(),
  activeProducts: z.number().int().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  completedOrders: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  totalReviews: z.number().int().nonnegative().optional(),
  responseRate: z.number().min(0).max(100),
  fulfillmentRate: z.number().min(0).max(100),
});

/**
 * Vendor entity
 */
export interface Vendor extends BaseEntity {
  userId: string;
  email: string;
  phone: string;
  businessInfo: VendorBusinessInfo;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  tier: 'basic' | 'silver' | 'gold' | 'platinum';
  kyc: VendorKyc;
  bankAccount?: VendorBankAccount;
  metrics: VendorMetrics;
  commissionRate: number;
  balance: number;
  pendingBalance: number;
  lastActiveAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
}

export const VendorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().email(),
  phone: z.string().min(1),
  businessInfo: VendorBusinessInfoSchema,
  status: VendorStatusSchema,
  tier: VendorTierSchema,
  kyc: VendorKycSchema,
  bankAccount: VendorBankAccountSchema.optional(),
  metrics: VendorMetricsSchema,
  commissionRate: z.number().min(0).max(100),
  balance: z.number().nonnegative(),
  pendingBalance: z.number().nonnegative(),
  lastActiveAt: z.string().datetime().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().datetime().optional(),
  suspendedAt: z.string().datetime().optional(),
  suspensionReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all vendors query parameters
 */
export interface GetAllVendorsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'active' | 'suspended' | 'inactive';
  tier?: 'basic' | 'silver' | 'gold' | 'platinum';
  kycStatus?: 'verified' | 'pending' | 'rejected';
  search?: string;
  sortBy?: 'businessName' | 'createdAt' | 'revenue' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export const GetAllVendorsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  status: VendorStatusSchema.optional(),
  tier: VendorTierSchema.optional(),
  kycStatus: KycStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['businessName', 'createdAt', 'revenue', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get vendor statistics query parameters
 */
export interface GetVendorStatisticsParams {
  vendorId?: string;
  startDate?: string;
  endDate?: string;
}

export const GetVendorStatisticsParamsSchema = z.object({
  vendorId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ===== REQUEST TYPES =====

/**
 * Approve/Reject vendor request
 * Updated to match API documentation:
 * - approved: true/false instead of status: 'approved'/'rejected'
 * - comments for approval, rejectionReason for rejection
 */
export interface VendorApprovalRequest {
  approved: boolean;
  comments?: string; // For approval
  rejectionReason?: string; // For rejection
}

export const VendorApprovalRequestSchema = z.object({
  approved: z.boolean(),
  comments: z.string().optional(),
  rejectionReason: z.string().optional(),
});

/**
 * Update vendor tier request
 * Updated to match API documentation (uses commission, not commissionRate)
 */
export interface UpdateVendorTierRequest {
  tier: 'basic' | 'silver' | 'gold' | 'platinum';
  commission: number;
  reason: string;
}

export const UpdateVendorTierRequestSchema = z.object({
  tier: VendorTierSchema,
  commission: z.number().min(0).max(100),
  reason: z.string().min(1),
});

/**
 * Suspend/Unsuspend vendor request
 */
export interface VendorSuspensionRequest {
  action: 'suspend' | 'unsuspend';
  reason: string;
  duration?: number;
}

export const VendorSuspensionRequestSchema = z.object({
  action: z.enum(['suspend', 'unsuspend']),
  reason: z.string().min(1),
  duration: z.number().int().positive().optional(),
});

/**
 * Update vendor commission request
 */
export interface UpdateVendorCommissionRequest {
  commissionRate: number;
  reason: string;
  effectiveDate?: string;
}

export const UpdateVendorCommissionRequestSchema = z.object({
  commissionRate: z.number().min(0).max(100),
  reason: z.string().min(1),
  effectiveDate: z.string().datetime().optional(),
});

// ===== RESPONSE TYPES =====

/**
 * Vendor list response
 */
export interface VendorListResponse {
  data: Vendor[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const VendorListResponseSchema = z.object({
  data: z.array(VendorSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Vendor approval response
 */
export interface VendorApprovalResponse {
  message: string;
  data: {
    id: string;
    businessName: string;
    status: string;
    tier: string;
    approvedBy: string;
    approvedAt: string;
  };
}

export const VendorApprovalResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    businessName: z.string(),
    status: z.string(),
    tier: z.string(),
    approvedBy: z.string(),
    approvedAt: z.string().datetime(),
  }),
});

/**
 * Top vendor by revenue
 */
export interface TopVendorByRevenue {
  vendorId: string;
  businessName: string;
  revenue: number;
  orders: number;
  rating: number;
}

export const TopVendorByRevenueSchema = z.object({
  vendorId: z.string(),
  businessName: z.string(),
  revenue: z.number().nonnegative(),
  orders: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
});

/**
 * Vendor statistics by tier
 */
export interface VendorStatisticsByTier {
  tier: string;
  count: number;
  percentage: number;
  revenue: number;
}

export const VendorStatisticsByTierSchema = z.object({
  tier: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
  revenue: z.number().nonnegative(),
});

/**
 * Vendor statistics response
 */
export interface VendorStatisticsResponse {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  suspendedVendors: number;
  verifiedVendors: number;
  totalRevenue: number;
  averageRating: number;
  byTier: VendorStatisticsByTier[];
  topVendors: TopVendorByRevenue[];
  growth: {
    current: number;
    previous: number;
    growthRate: number;
  };
}

export const VendorStatisticsResponseSchema = z.object({
  totalVendors: z.number().int().nonnegative(),
  activeVendors: z.number().int().nonnegative(),
  pendingVendors: z.number().int().nonnegative(),
  suspendedVendors: z.number().int().nonnegative(),
  verifiedVendors: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  averageRating: z.number().min(0).max(5),
  byTier: z.array(VendorStatisticsByTierSchema),
  topVendors: z.array(TopVendorByRevenueSchema),
  growth: z.object({
    current: z.number(),
    previous: z.number(),
    growthRate: z.number(),
  }),
});

// ===== TYPE EXPORTS =====

export type {
  Vendor,
  VendorListResponse,
  VendorApprovalResponse,
  VendorStatisticsResponse,
};
