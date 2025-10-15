/**
 * Vendors Validation Schemas
 */

import { z } from 'zod';
import { VendorStatusSchema, VendorTierSchema } from '../types';

export const GetAllVendorsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    status: VendorStatusSchema.optional(),
    tier: VendorTierSchema.optional(),
    verified: z.boolean().optional(),
    minRating: z.number().min(0).max(5).optional(),
    sortBy: z.enum(['createdAt', 'name', 'rating', 'sales', 'revenue']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetVendorStatisticsParamsSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    tier: VendorTierSchema.optional(),
  })
  .strict();

export const VendorApprovalRequestSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    reason: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const UpdateVendorTierRequestSchema = z
  .object({
    tier: VendorTierSchema,
    reason: z.string().trim().optional(),
  })
  .strict();

export const VendorSuspensionRequestSchema = z
  .object({
    action: z.enum(['suspend', 'unsuspend']),
    reason: z.string().trim().min(1, 'Reason is required'),
    duration: z.number().int().positive().optional(),
  })
  .strict();
