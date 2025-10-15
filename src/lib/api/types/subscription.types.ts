/**
 * Subscription Plans & Vendor Subscriptions Types
 * Based on SUBSCRIPTION_PLAN_API.md
 * Complete implementation matching backend API 100%
 */

// ===== ENUMS =====

export type PlanDuration = 'monthly' | 'quarterly' | 'yearly';
export type PlanStatus = 'active' | 'inactive' | 'deprecated';

// ===== SUBSCRIPTION PLAN LIMITATIONS =====

export interface PlanLimitations {
  maxProducts: number;
  maxOrdersPerMonth: number;
  maxStorageMB: number;
  maxImagesPerProduct: number;
  canUsePremiumThemes: boolean;
  canCreateCoupons: boolean;
  canAccessAnalytics: boolean;
  prioritySupport: boolean;
  canBeFeatured: boolean;
}

// ===== SUBSCRIPTION PLAN =====

export interface SubscriptionPlan {
  id: string;
  deletedAt: string | null;

  // Core plan information
  planName: string;
  displayName: string;
  description: string;

  // Pricing information
  price: number; // In kobo
  originalPrice?: number | null; // In kobo, for showing discounts
  currency: string;

  // Duration information
  duration: PlanDuration;
  durationDays: number;

  // Plan status and features
  status: PlanStatus;
  features: string[];
  limitations: PlanLimitations;

  // Display and sorting
  sortOrder: number;
  isRecommended: boolean;
  isFree: boolean;
  badge?: string | null;
  iconUrl?: string | null;
  colorTheme: string;

  // Paystack integration
  paystackPlanCode?: string | null;

  // Subscription counts
  activeSubscriptions: number;
  totalSubscriptions: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Computed fields (returned by API)
  formattedPrice?: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
  isPopular?: boolean;
}

export interface SubscriptionPlanStatistics {
  overview: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
    totalRevenue: number;
    monthlyRecurringRevenue: number;
  };
  byPlan: Array<{
    planId: string;
    planName: string;
    displayName: string;
    price: number;
    subscribers: number;
    revenue: number;
    percentage: number;
  }>;
  byStatus: {
    active: number;
    pending: number;
    cancelled: number;
    expired: number;
    suspended: number;
    trial: number;
  };
}

// ===== VENDOR SUBSCRIPTION =====

export interface VendorSubscription {
  id: string;
  vendorId: {
    id: string;
    businessName: string;
    email: string;
    phone: string;
    status: string;
  };
  planId: {
    id: string;
    planName: string;
    displayName: string;
    description?: string;
    price: number;
    currency: string;
    duration: string;
    features?: string[];
  };
  paymentId?: {
    id: string;
    transactionReference: string;
    amount: number;
    status: string;
    paymentMethod: string;
    paidAt: string;
  };
  status: 'active' | 'pending' | 'cancelled' | 'expired' | 'suspended' | 'trial';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  trialPeriod: boolean;
  trialEndDate?: string | null;
  paystackSubscriptionCode?: string;
  paystackCustomerCode?: string;
  metadata?: {
    scheduledCancellation?: boolean;
    lastRenewal?: string;
  };
  notes?: Array<{
    timestamp: string;
    action: string;
    note: string;
    performedBy: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ===== REQUEST/RESPONSE TYPES =====

export interface GetSubscriptionPlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

export interface GetSubscriptionPlanResponse {
  success: boolean;
  data: SubscriptionPlan;
}

export interface CreateSubscriptionPlanRequest {
  // Core plan information (Required)
  planName: string;
  displayName: string;
  description: string;

  // Pricing information (Required)
  price: number; // In kobo
  originalPrice?: number; // In kobo, optional for discounts
  currency: string; // Default: "NGN"
  duration: PlanDuration;
  durationDays?: number; // Auto-calculated if not provided

  // Features and limitations (Required)
  features: string[];
  limitations: PlanLimitations;

  // Display and sorting (Optional)
  sortOrder?: number;
  isRecommended?: boolean;
  isFree?: boolean;
  badge?: string;
  iconUrl?: string;
  colorTheme?: string; // Default: "#007bff"
}

export interface CreateSubscriptionPlanResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan;
}

export interface UpdateSubscriptionPlanRequest {
  // Core plan information (Optional)
  displayName?: string; // planName is immutable
  description?: string;

  // Pricing information (Optional)
  price?: number; // In kobo
  originalPrice?: number; // In kobo

  // Status and features (Optional)
  status?: PlanStatus;
  features?: string[];
  limitations?: PlanLimitations;

  // Display and sorting (Optional)
  sortOrder?: number;
  isRecommended?: boolean;
  badge?: string;
  iconUrl?: string;
  colorTheme?: string;

  // Note: planName, duration, currency, isFree are immutable
}

export interface UpdateSubscriptionPlanResponse {
  success: boolean;
  message: string;
  data: SubscriptionPlan;
}

export interface SyncPaystackResponse {
  success: boolean;
  message: string;
  data: {
    planCode: string;
    synced: boolean;
  };
}

export interface GetVendorSubscriptionsParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'pending' | 'cancelled' | 'expired' | 'suspended' | 'trial';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  vendorId?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetVendorSubscriptionsResponse {
  subscriptions: VendorSubscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CancelSubscriptionRequest {
  reason?: string;
  issueRefund?: boolean;
  cancelAtPeriodEnd?: boolean;
}

export interface CancelSubscriptionResponse {
  message: string;
  subscription: {
    id: string;
    vendorId: string;
    status: string;
    cancelledAt?: string;
    cancelledBy?: string;
    autoRenew?: boolean;
    metadata?: {
      scheduledCancellation?: boolean;
      cancellationDate?: string;
    };
  };
  refund?: any;
  note?: string;
}
