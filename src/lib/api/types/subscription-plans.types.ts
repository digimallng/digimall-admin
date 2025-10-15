/**
 * Subscription Plans Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 6 subscription plan endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams } from './shared.types';
import { PlanDurationSchema, SubscriptionStatusSchema } from './enums.types';

// ===== SUBSCRIPTION PLAN ENTITY =====

/**
 * Plan feature
 */
export interface PlanFeature {
  name: string;
  description?: string;
  included: boolean;
  limit?: number;
}

export const PlanFeatureSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  included: z.boolean(),
  limit: z.number().int().positive().optional(),
});

/**
 * Plan pricing
 */
export interface PlanPricing {
  monthly: number;
  quarterly: number;
  yearly: number;
  currency: string;
}

export const PlanPricingSchema = z.object({
  monthly: z.number().nonnegative(),
  quarterly: z.number().nonnegative(),
  yearly: z.number().nonnegative(),
  currency: z.string(),
});

/**
 * Subscription plan entity
 */
export interface SubscriptionPlan extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  tier: 'basic' | 'silver' | 'gold' | 'platinum';
  pricing: PlanPricing;
  features: PlanFeature[];
  limitations: {
    maxProducts: number;
    maxOrders: number;
    maxRevenue?: number;
    commissionRate: number;
  };
  popular: boolean;
  active: boolean;
  displayOrder: number;
  subscriberCount: number;
}

export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  tier: z.enum(['basic', 'silver', 'gold', 'platinum']),
  pricing: PlanPricingSchema,
  features: z.array(PlanFeatureSchema),
  limitations: z.object({
    maxProducts: z.number().int().positive(),
    maxOrders: z.number().int().positive(),
    maxRevenue: z.number().positive().optional(),
    commissionRate: z.number().min(0).max(100),
  }),
  popular: z.boolean(),
  active: z.boolean(),
  displayOrder: z.number().int().nonnegative(),
  subscriberCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== VENDOR SUBSCRIPTION ENTITY =====

/**
 * Vendor subscription entity
 */
export interface VendorSubscription extends BaseEntity {
  vendorId: string;
  vendorName: string;
  planId: string;
  planName: string;
  planTier: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  duration: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  renewalDate?: string;
  autoRenew: boolean;
  price: number;
  currency: string;
  paymentMethod: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export const VendorSubscriptionSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  planId: z.string(),
  planName: z.string(),
  planTier: z.string(),
  status: SubscriptionStatusSchema,
  duration: PlanDurationSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  renewalDate: z.string().datetime().optional(),
  autoRenew: z.boolean(),
  price: z.number().positive(),
  currency: z.string(),
  paymentMethod: z.string(),
  lastPaymentDate: z.string().datetime().optional(),
  nextPaymentDate: z.string().datetime().optional(),
  cancelledAt: z.string().datetime().optional(),
  cancellationReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all subscription plans query parameters
 */
export interface GetAllSubscriptionPlansParams extends BaseQueryParams {
  active?: boolean;
  tier?: 'basic' | 'silver' | 'gold' | 'platinum';
  sortBy?: 'name' | 'displayOrder' | 'subscriberCount' | 'pricing';
  sortOrder?: 'asc' | 'desc';
}

export const GetAllSubscriptionPlansParamsSchema = z.object({
  active: z.boolean().optional(),
  tier: z.enum(['basic', 'silver', 'gold', 'platinum']).optional(),
  sortBy: z.enum(['name', 'displayOrder', 'subscriberCount', 'pricing']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get vendor subscriptions query parameters
 */
export interface GetVendorSubscriptionsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  vendorId?: string;
  planId?: string;
  status?: 'active' | 'inactive' | 'cancelled' | 'expired';
  duration?: 'monthly' | 'quarterly' | 'yearly';
  search?: string;
  sortBy?: 'startDate' | 'endDate' | 'vendorName' | 'price';
  sortOrder?: 'asc' | 'desc';
}

export const GetVendorSubscriptionsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  vendorId: z.string().optional(),
  planId: z.string().optional(),
  status: SubscriptionStatusSchema.optional(),
  duration: PlanDurationSchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['startDate', 'endDate', 'vendorName', 'price']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ===== REQUEST TYPES =====

/**
 * Create subscription plan request
 */
export interface CreateSubscriptionPlanRequest {
  name: string;
  slug: string;
  description: string;
  tier: 'basic' | 'silver' | 'gold' | 'platinum';
  pricing: PlanPricing;
  features: PlanFeature[];
  limitations: {
    maxProducts: number;
    maxOrders: number;
    maxRevenue?: number;
    commissionRate: number;
  };
  popular?: boolean;
  active?: boolean;
  displayOrder?: number;
}

export const CreateSubscriptionPlanRequestSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  tier: z.enum(['basic', 'silver', 'gold', 'platinum']),
  pricing: PlanPricingSchema,
  features: z.array(PlanFeatureSchema),
  limitations: z.object({
    maxProducts: z.number().int().positive(),
    maxOrders: z.number().int().positive(),
    maxRevenue: z.number().positive().optional(),
    commissionRate: z.number().min(0).max(100),
  }),
  popular: z.boolean().optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

/**
 * Update subscription plan request
 */
export interface UpdateSubscriptionPlanRequest {
  name?: string;
  slug?: string;
  description?: string;
  pricing?: PlanPricing;
  features?: PlanFeature[];
  limitations?: {
    maxProducts?: number;
    maxOrders?: number;
    maxRevenue?: number;
    commissionRate?: number;
  };
  popular?: boolean;
  active?: boolean;
  displayOrder?: number;
}

export const UpdateSubscriptionPlanRequestSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  pricing: PlanPricingSchema.optional(),
  features: z.array(PlanFeatureSchema).optional(),
  limitations: z.object({
    maxProducts: z.number().int().positive().optional(),
    maxOrders: z.number().int().positive().optional(),
    maxRevenue: z.number().positive().optional(),
    commissionRate: z.number().min(0).max(100).optional(),
  }).optional(),
  popular: z.boolean().optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

/**
 * Cancel vendor subscription request
 */
export interface CancelVendorSubscriptionRequest {
  reason: string;
  immediate?: boolean;
  refundAmount?: number;
}

export const CancelVendorSubscriptionRequestSchema = z.object({
  reason: z.string().min(1),
  immediate: z.boolean().optional(),
  refundAmount: z.number().nonnegative().optional(),
});

// ===== RESPONSE TYPES =====

/**
 * Subscription plans list response
 */
export interface SubscriptionPlansListResponse {
  data: SubscriptionPlan[];
}

export const SubscriptionPlansListResponseSchema = z.object({
  data: z.array(SubscriptionPlanSchema),
});

/**
 * Create subscription plan response
 */
export interface CreateSubscriptionPlanResponse {
  message: string;
  data: SubscriptionPlan;
}

export const CreateSubscriptionPlanResponseSchema = z.object({
  message: z.string(),
  data: SubscriptionPlanSchema,
});

/**
 * Update subscription plan response
 */
export interface UpdateSubscriptionPlanResponse {
  message: string;
  data: SubscriptionPlan;
}

export const UpdateSubscriptionPlanResponseSchema = z.object({
  message: z.string(),
  data: SubscriptionPlanSchema,
});

/**
 * Delete subscription plan response
 */
export interface DeleteSubscriptionPlanResponse {
  message: string;
  data: {
    id: string;
    name: string;
    deletedAt: string;
  };
}

export const DeleteSubscriptionPlanResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    deletedAt: z.string().datetime(),
  }),
});

/**
 * Vendor subscriptions list response
 */
export interface VendorSubscriptionsListResponse {
  data: VendorSubscription[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const VendorSubscriptionsListResponseSchema = z.object({
  data: z.array(VendorSubscriptionSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Cancel vendor subscription response
 */
export interface CancelVendorSubscriptionResponse {
  message: string;
  data: {
    id: string;
    vendorId: string;
    status: string;
    cancelledAt: string;
    refundAmount?: number;
  };
}

export const CancelVendorSubscriptionResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    vendorId: z.string(),
    status: z.string(),
    cancelledAt: z.string().datetime(),
    refundAmount: z.number().nonnegative().optional(),
  }),
});

/**
 * Subscription statistics by plan
 */
export interface SubscriptionStatisticsByPlan {
  planId: string;
  planName: string;
  tier: string;
  subscriberCount: number;
  revenue: number;
  percentage: number;
}

export const SubscriptionStatisticsByPlanSchema = z.object({
  planId: z.string(),
  planName: z.string(),
  tier: z.string(),
  subscriberCount: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  percentage: z.number().nonnegative(),
});

/**
 * Subscription statistics response
 */
export interface SubscriptionStatisticsResponse {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageSubscriptionValue: number;
  churnRate: number;
  byPlan: SubscriptionStatisticsByPlan[];
  growth: {
    current: number;
    previous: number;
    growthRate: number;
  };
}

export const SubscriptionStatisticsResponseSchema = z.object({
  totalSubscriptions: z.number().int().nonnegative(),
  activeSubscriptions: z.number().int().nonnegative(),
  cancelledSubscriptions: z.number().int().nonnegative(),
  expiredSubscriptions: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  monthlyRecurringRevenue: z.number().nonnegative(),
  averageSubscriptionValue: z.number().nonnegative(),
  churnRate: z.number().min(0).max(100),
  byPlan: z.array(SubscriptionStatisticsByPlanSchema),
  growth: z.object({
    current: z.number(),
    previous: z.number(),
    growthRate: z.number(),
  }),
});

// ===== TYPE EXPORTS =====

export type {
  SubscriptionPlan,
  VendorSubscription,
  SubscriptionPlansListResponse,
  VendorSubscriptionsListResponse,
  CreateSubscriptionPlanResponse,
  UpdateSubscriptionPlanResponse,
  DeleteSubscriptionPlanResponse,
  CancelVendorSubscriptionResponse,
  SubscriptionStatisticsResponse,
};
