/**
 * Admin Vendor Operations Validation Schemas
 */

import { z } from 'zod';
import { PayoutStatusSchema, DisputeStatusSchema } from '../types';

export const GetVendorPayoutsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    vendor: z.string().trim().optional(),
    status: PayoutStatusSchema.optional(),
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'amount', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetProductReviewsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    product: z.string().trim().optional(),
    vendor: z.string().trim().optional(),
    flagged: z.boolean().optional(),
    minRating: z.number().min(1).max(5).optional(),
    maxRating: z.number().min(1).max(5).optional(),
    sortBy: z.enum(['createdAt', 'rating']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetVendorDisputesParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    vendor: z.string().trim().optional(),
    customer: z.string().trim().optional(),
    order: z.string().trim().optional(),
    status: DisputeStatusSchema.optional(),
    sortBy: z.enum(['createdAt', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const ProcessPayoutRequestSchema = z
  .object({
    status: PayoutStatusSchema,
    transactionReference: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const ReviewProductReviewRequestSchema = z
  .object({
    action: z.enum(['approve', 'reject', 'flag']),
    reason: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const ResolveDisputeRequestSchema = z
  .object({
    resolution: z.enum(['vendor_favor', 'customer_favor', 'partial_refund', 'dismissed']),
    refundAmount: z.number().min(0).optional(),
    notes: z.string().trim().min(1, 'Notes are required'),
  })
  .strict();
