/**
 * Orders Validation Schemas
 */

import { z } from 'zod';
import { OrderStatusSchema, PaymentStatusSchema } from '../types';

export const GetAllOrdersParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    status: OrderStatusSchema.optional(),
    paymentStatus: PaymentStatusSchema.optional(),
    vendor: z.string().trim().optional(),
    customer: z.string().trim().optional(),
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'totalAmount', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetOrderStatisticsParamsSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    vendor: z.string().trim().optional(),
    status: OrderStatusSchema.optional(),
  })
  .strict();

export const UpdateOrderStatusRequestSchema = z
  .object({
    status: OrderStatusSchema,
    reason: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const CancelOrderRequestSchema = z
  .object({
    reason: z.string().trim().min(1, 'Reason is required'),
    refundAmount: z.number().min(0).optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

export const RefundOrderRequestSchema = z
  .object({
    amount: z.number().min(0, 'Refund amount must be positive'),
    reason: z.string().trim().min(1, 'Reason is required'),
    notes: z.string().trim().optional(),
  })
  .strict();

export const ExportOrdersRequestSchema = z
  .object({
    format: z.enum(['csv', 'excel', 'pdf']),
    status: OrderStatusSchema.optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    vendor: z.string().trim().optional(),
  })
  .strict();
