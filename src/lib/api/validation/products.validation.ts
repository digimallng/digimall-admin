/**
 * Products Validation Schemas
 */

import { z } from 'zod';
import { ProductStatusSchema, PaginationParamsSchema } from '../types';

export const GetAllProductsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    vendor: z.string().trim().optional(),
    status: ProductStatusSchema.optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
    sortBy: z.enum(['createdAt', 'name', 'price', 'stock', 'sales']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetPendingApprovalsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    vendor: z.string().trim().optional(),
    category: z.string().trim().optional(),
    sortBy: z.enum(['createdAt', 'price']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetProductStatisticsParamsSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    vendor: z.string().trim().optional(),
    category: z.string().trim().optional(),
  })
  .strict();

export const ProductApprovalRequestSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    reason: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const UpdateProductInventoryRequestSchema = z
  .object({
    stock: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0).optional(),
    reason: z.string().trim().optional(),
  })
  .strict();

export const BulkProductActionRequestSchema = z
  .object({
    productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
    action: z.enum(['approve', 'reject', 'delete', 'feature', 'unfeature']),
    reason: z.string().trim().optional(),
  })
  .strict();
