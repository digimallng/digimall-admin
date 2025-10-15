/**
 * Escrow Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 10 escrow management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams } from './shared.types';

// ===== ESCROW ENTITY =====

/**
 * Escrow status enum
 */
export type EscrowStatus = 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';

export const EscrowStatusSchema = z.enum(['pending', 'funded', 'released', 'refunded', 'disputed']);

/**
 * Release conditions for escrow
 */
export interface ReleaseConditions {
  autoReleaseAfterDays: number;
  requiresDeliveryConfirmation: boolean;
  requiresCustomerApproval: boolean;
}

export const ReleaseConditionsSchema = z.object({
  autoReleaseAfterDays: z.number().int().positive(),
  requiresDeliveryConfirmation: z.boolean(),
  requiresCustomerApproval: z.boolean(),
});

/**
 * Escrow account entity
 */
export interface EscrowAccount extends BaseEntity {
  escrowId: string;
  orderId: {
    _id: string;
    orderNumber: string;
    status: string;
    totalAmount?: number;
  };
  parentOrderId?: {
    _id: string;
    parentOrderNumber: string;
  };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  vendorId: {
    _id: string;
    businessInfo: {
      businessName: string;
      contactEmail: string;
      contactPhone?: string;
    };
  };
  amount: number;
  currency: string;
  status: EscrowStatus;
  fundedAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  expiresAt?: string;
  releaseConditions: ReleaseConditions;
}

export const EscrowAccountSchema = z.object({
  _id: z.string(),
  escrowId: z.string(),
  orderId: z.object({
    _id: z.string(),
    orderNumber: z.string(),
    status: z.string(),
    totalAmount: z.number().optional(),
  }),
  parentOrderId: z.object({
    _id: z.string(),
    parentOrderNumber: z.string(),
  }).optional(),
  customerId: z.object({
    _id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  vendorId: z.object({
    _id: z.string(),
    businessInfo: z.object({
      businessName: z.string(),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
    }),
  }),
  amount: z.number().positive(),
  currency: z.string(),
  status: EscrowStatusSchema,
  fundedAt: z.string().datetime().optional(),
  releasedAt: z.string().datetime().optional(),
  refundedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  releaseConditions: ReleaseConditionsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all escrow accounts query parameters
 */
export interface GetAllEscrowsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  status?: EscrowStatus;
  customerId?: string;
  vendorId?: string;
  orderId?: string;
  parentOrderId?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const GetAllEscrowsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  status: EscrowStatusSchema.optional(),
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
  orderId: z.string().optional(),
  parentOrderId: z.string().optional(),
  searchTerm: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get escrow statistics query parameters
 */
export interface GetEscrowStatisticsParams {
  startDate?: string;
  endDate?: string;
}

export const GetEscrowStatisticsParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Get audit log query parameters
 */
export interface GetAuditLogParams extends BaseQueryParams {
  escrowId?: string;
  staffId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const GetAuditLogParamsSchema = z.object({
  escrowId: z.string().optional(),
  staffId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// ===== REQUEST TYPES =====

/**
 * Release escrow request
 */
export interface ReleaseEscrowRequest {
  reason: string;
  forceRelease?: boolean;
}

export const ReleaseEscrowRequestSchema = z.object({
  reason: z.string().min(1),
  forceRelease: z.boolean().optional(),
});

/**
 * Refund escrow request
 */
export interface RefundEscrowRequest {
  reason: string;
  forceRefund?: boolean;
}

export const RefundEscrowRequestSchema = z.object({
  reason: z.string().min(1),
  forceRefund: z.boolean().optional(),
});

/**
 * Resolve dispute request
 */
export interface ResolveDisputeRequest {
  resolution: 'release_to_vendor' | 'refund_to_customer';
  resolutionNotes: string;
}

export const ResolveDisputeRequestSchema = z.object({
  resolution: z.enum(['release_to_vendor', 'refund_to_customer']),
  resolutionNotes: z.string().min(1),
});

// ===== RESPONSE TYPES =====

/**
 * Escrow list response
 */
export interface EscrowListResponse {
  data: EscrowAccount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const EscrowListResponseSchema = z.object({
  data: z.array(EscrowAccountSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

/**
 * Escrow statistics response
 */
export interface EscrowStatisticsResponse {
  totalEscrows: number;
  totalAmount: number;
  statusBreakdown: {
    pending: number;
    funded: number;
    released: number;
    refunded: number;
    disputed: number;
  };
  averageHoldTime: number;
  disputedEscrows: number;
  expiringInNext24Hours: number;
}

export const EscrowStatisticsResponseSchema = z.object({
  totalEscrows: z.number().int().nonnegative(),
  totalAmount: z.number().nonnegative(),
  statusBreakdown: z.object({
    pending: z.number().int().nonnegative(),
    funded: z.number().int().nonnegative(),
    released: z.number().int().nonnegative(),
    refunded: z.number().int().nonnegative(),
    disputed: z.number().int().nonnegative(),
  }),
  averageHoldTime: z.number().nonnegative(),
  disputedEscrows: z.number().int().nonnegative(),
  expiringInNext24Hours: z.number().int().nonnegative(),
});

/**
 * Release/Refund response
 */
export interface EscrowActionResponse {
  _id: string;
  escrowId: string;
  status: EscrowStatus;
  releasedAt?: string;
  refundedAt?: string;
  amount: number;
  vendorId: string;
  customerId: string;
}

export const EscrowActionResponseSchema = z.object({
  _id: z.string(),
  escrowId: z.string(),
  status: EscrowStatusSchema,
  releasedAt: z.string().datetime().optional(),
  refundedAt: z.string().datetime().optional(),
  amount: z.number().positive(),
  vendorId: z.string(),
  customerId: z.string(),
});

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  _id: string;
  staffId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: string;
  resource: string;
  resourceId: string;
  actionType: string;
  severity: string;
  success: boolean;
  metadata: {
    reason?: string;
    forceRelease?: boolean;
    forceRefund?: boolean;
    escrowId?: string;
    amount?: number;
    resolution?: string;
    resolutionNotes?: string;
  };
  createdAt: string;
}

export const AuditLogEntrySchema = z.object({
  _id: z.string(),
  staffId: z.object({
    _id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    role: z.string(),
  }),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string(),
  actionType: z.string(),
  severity: z.string(),
  success: z.boolean(),
  metadata: z.object({
    reason: z.string().optional(),
    forceRelease: z.boolean().optional(),
    forceRefund: z.boolean().optional(),
    escrowId: z.string().optional(),
    amount: z.number().optional(),
    resolution: z.string().optional(),
    resolutionNotes: z.string().optional(),
  }),
  createdAt: z.string().datetime(),
});

/**
 * Audit log response
 */
export interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const AuditLogResponseSchema = z.object({
  data: z.array(AuditLogEntrySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Expiring escrows response
 */
export interface ExpiringEscrowsResponse {
  data: EscrowAccount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  threshold: string;
}

export const ExpiringEscrowsResponseSchema = z.object({
  data: z.array(EscrowAccountSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  threshold: z.string(),
});

// ===== TYPE EXPORTS =====

export type {
  EscrowAccount,
  EscrowListResponse,
  EscrowStatisticsResponse,
  EscrowActionResponse,
  AuditLogEntry,
  AuditLogResponse,
  ExpiringEscrowsResponse,
};
