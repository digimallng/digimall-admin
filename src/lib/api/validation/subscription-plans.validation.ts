/**
 * Subscription Plans Validation Schemas
 */

import { z } from 'zod';
import { SubscriptionStatusSchema, BillingIntervalSchema } from '../types';

export const GetAllPlansParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    active: z.boolean().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetVendorSubscriptionsParamsSchema = z
  .object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional(),
    vendor: z.string().trim().optional(),
    plan: z.string().trim().optional(),
    status: SubscriptionStatusSchema.optional(),
    sortBy: z.enum(['createdAt', 'expiresAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const GetSubscriptionStatisticsParamsSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    plan: z.string().trim().optional(),
  })
  .strict();

export const CreateSubscriptionPlanRequestSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().min(1, 'Description is required'),
    price: z.number().min(0, 'Price must be non-negative'),
    billingInterval: BillingIntervalSchema,
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    limits: z
      .object({
        products: z.number().int().positive().optional(),
        storage: z.number().int().positive().optional(),
        orders: z.number().int().positive().optional(),
      })
      .optional(),
    active: z.boolean().optional(),
    trialDays: z.number().int().min(0).optional(),
  })
  .strict();

export const UpdateSubscriptionPlanRequestSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    price: z.number().min(0).optional(),
    billingInterval: BillingIntervalSchema.optional(),
    features: z.array(z.string()).min(1).optional(),
    limits: z
      .object({
        products: z.number().int().positive().optional(),
        storage: z.number().int().positive().optional(),
        orders: z.number().int().positive().optional(),
      })
      .optional(),
    active: z.boolean().optional(),
    trialDays: z.number().int().min(0).optional(),
  })
  .strict();
