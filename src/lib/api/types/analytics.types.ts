/**
 * Analytics Types for DigiMall Admin API
 *
 * Complete type definitions for all 10 analytics endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseQueryParams } from './shared.types';
import { AnalyticsPeriodSchema, AnalyticsIntervalSchema } from './enums.types';

// ===== QUERY PARAMETERS =====

/**
 * General analytics query parameters
 */
export interface GetAnalyticsParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  timezone?: string;
}

/**
 * Dashboard analytics query parameters
 */
export interface DashboardAnalyticsParams {
  startDate?: string;
  endDate?: string;
  period?: 'today' | 'week' | 'month' | 'year';
}

/**
 * Zod schema for DashboardAnalyticsParams
 */
export const DashboardAnalyticsParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: AnalyticsPeriodSchema.optional(),
});

export type DashboardAnalyticsParamsType = z.infer<typeof DashboardAnalyticsParamsSchema>;

/**
 * User analytics query parameters
 */
export interface UserAnalyticsParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Zod schema for UserAnalyticsParams
 */
export const UserAnalyticsParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type UserAnalyticsParamsType = z.infer<typeof UserAnalyticsParamsSchema>;

/**
 * Revenue analytics query parameters
 */
export interface RevenueAnalyticsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

/**
 * Zod schema for RevenueAnalyticsParams
 */
export const RevenueAnalyticsParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: AnalyticsIntervalSchema.optional(),
});

export type RevenueAnalyticsParamsType = z.infer<typeof RevenueAnalyticsParamsSchema>;

/**
 * Export analytics query parameters
 */
export interface ExportAnalyticsParams extends BaseQueryParams {
  format?: 'json' | 'csv' | 'excel';
  type?: 'dashboard' | 'users' | 'orders' | 'revenue';
}

/**
 * Zod schema for ExportAnalyticsParams
 */
export const ExportAnalyticsParamsSchema = z.object({
  format: z.enum(['json', 'csv', 'excel']).optional(),
  type: z.enum(['dashboard', 'users', 'orders', 'revenue']).optional(),
});

export type ExportAnalyticsParamsType = z.infer<typeof ExportAnalyticsParamsSchema>;

// ===== COMMON ANALYTICS TYPES =====

/**
 * Growth data
 */
export interface GrowthData {
  current: number;
  previous: number;
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Zod schema for GrowthData
 */
export const GrowthDataSchema = z.object({
  current: z.number(),
  previous: z.number(),
  growthRate: z.number(),
  trend: z.enum(['up', 'down', 'stable']),
});

export type GrowthDataType = z.infer<typeof GrowthDataSchema>;

/**
 * Recent activity summary
 */
export interface RecentActivity {
  pendingOrders: number;
  pendingProducts: number;
  pendingVendors: number;
  unreadDisputes: number;
}

/**
 * Zod schema for RecentActivity
 */
export const RecentActivitySchema = z.object({
  pendingOrders: z.number().int().nonnegative(),
  pendingProducts: z.number().int().nonnegative(),
  pendingVendors: z.number().int().nonnegative(),
  unreadDisputes: z.number().int().nonnegative(),
});

export type RecentActivityType = z.infer<typeof RecentActivitySchema>;

// ===== DASHBOARD ANALYTICS =====

/**
 * Dashboard overview data
 */
export interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
}

/**
 * Zod schema for DashboardOverview
 */
export const DashboardOverviewSchema = z.object({
  totalRevenue: z.number().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  totalUsers: z.number().int().nonnegative(),
  totalVendors: z.number().int().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
});

export type DashboardOverviewType = z.infer<typeof DashboardOverviewSchema>;

/**
 * Dashboard growth metrics
 */
export interface DashboardGrowth {
  revenue: GrowthData;
  orders: GrowthData;
  users: GrowthData;
}

/**
 * Zod schema for DashboardGrowth
 */
export const DashboardGrowthSchema = z.object({
  revenue: GrowthDataSchema,
  orders: GrowthDataSchema,
  users: GrowthDataSchema,
});

export type DashboardGrowthType = z.infer<typeof DashboardGrowthSchema>;

/**
 * Complete dashboard analytics response (flat structure from backend)
 */
export interface DashboardAnalyticsResponse {
  totalRevenue: number;
  revenueGrowth: number;
  totalCommission: number;
  commissionGrowth: number;
  totalVendors: number;
  vendorGrowth: number;
  totalUsers: number;
  userGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  avgOrderValue: number;
  avgOrderGrowth: number;
  disputeRate: number;
  disputeChange: number;
  vendorSatisfaction: number;
  satisfactionChange: number;
}

/**
 * Zod schema for DashboardAnalyticsResponse
 */
export const DashboardAnalyticsResponseSchema = z.object({
  totalRevenue: z.number().nonnegative(),
  revenueGrowth: z.number(),
  totalCommission: z.number().nonnegative(),
  commissionGrowth: z.number(),
  totalVendors: z.number().int().nonnegative(),
  vendorGrowth: z.number(),
  totalUsers: z.number().int().nonnegative(),
  userGrowth: z.number(),
  totalOrders: z.number().int().nonnegative(),
  orderGrowth: z.number(),
  avgOrderValue: z.number().nonnegative(),
  avgOrderGrowth: z.number(),
  disputeRate: z.number().nonnegative(),
  disputeChange: z.number(),
  vendorSatisfaction: z.number().nonnegative(),
  satisfactionChange: z.number(),
});

export type DashboardAnalyticsResponseType = z.infer<typeof DashboardAnalyticsResponseSchema>;

// ===== USER ANALYTICS =====

/**
 * New users breakdown
 */
export interface NewUsersBreakdown {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

/**
 * Zod schema for NewUsersBreakdown
 */
export const NewUsersBreakdownSchema = z.object({
  today: z.number().int().nonnegative(),
  thisWeek: z.number().int().nonnegative(),
  thisMonth: z.number().int().nonnegative(),
});

export type NewUsersBreakdownType = z.infer<typeof NewUsersBreakdownSchema>;

/**
 * Users by role
 */
export interface UsersByRole {
  customer: number;
  vendor: number;
  admin: number;
}

/**
 * Zod schema for UsersByRole
 */
export const UsersByRoleSchema = z.object({
  customer: z.number().int().nonnegative(),
  vendor: z.number().int().nonnegative(),
  admin: z.number().int().nonnegative(),
});

export type UsersByRoleType = z.infer<typeof UsersByRoleSchema>;

/**
 * User engagement metrics
 */
export interface UserEngagement {
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
}

/**
 * Zod schema for UserEngagement
 */
export const UserEngagementSchema = z.object({
  dailyActive: z.number().int().nonnegative(),
  weeklyActive: z.number().int().nonnegative(),
  monthlyActive: z.number().int().nonnegative(),
});

export type UserEngagementType = z.infer<typeof UserEngagementSchema>;

/**
 * User retention metrics
 */
export interface UserRetention {
  day1: number;
  day7: number;
  day30: number;
}

/**
 * Zod schema for UserRetention
 */
export const UserRetentionSchema = z.object({
  day1: z.number().nonnegative(),
  day7: z.number().nonnegative(),
  day30: z.number().nonnegative(),
});

export type UserRetentionType = z.infer<typeof UserRetentionSchema>;

/**
 * User analytics response
 */
export interface UserAnalyticsResponse {
  totalUsers: number;
  activeUsers: number;
  newUsers: NewUsersBreakdown;
  usersByRole: UsersByRole;
  engagement: UserEngagement;
  retention: UserRetention;
}

/**
 * Zod schema for UserAnalyticsResponse
 */
export const UserAnalyticsResponseSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  newUsers: NewUsersBreakdownSchema,
  usersByRole: UsersByRoleSchema,
  engagement: UserEngagementSchema,
  retention: UserRetentionSchema,
});

export type UserAnalyticsResponseType = z.infer<typeof UserAnalyticsResponseSchema>;

// ===== VENDOR ANALYTICS =====

/**
 * Top vendor by revenue
 */
export interface TopVendorByRevenue {
  vendorId: string;
  businessName: string;
  revenue: number;
  orders: number;
}

/**
 * Zod schema for TopVendorByRevenue
 */
export const TopVendorByRevenueSchema = z.object({
  vendorId: z.string(),
  businessName: z.string(),
  revenue: z.number().nonnegative(),
  orders: z.number().int().nonnegative(),
});

export type TopVendorByRevenueType = z.infer<typeof TopVendorByRevenueSchema>;

/**
 * Vendor analytics response
 */
export interface VendorAnalyticsResponse {
  totalVendors: number;
  activeVendors: number;
  pendingApproval: number;
  suspended: number;
  newVendorsThisMonth: number;
  topVendorsByRevenue: TopVendorByRevenue[];
  averageOrderValue: number;
}

/**
 * Zod schema for VendorAnalyticsResponse
 */
export const VendorAnalyticsResponseSchema = z.object({
  totalVendors: z.number().int().nonnegative(),
  activeVendors: z.number().int().nonnegative(),
  pendingApproval: z.number().int().nonnegative(),
  suspended: z.number().int().nonnegative(),
  newVendorsThisMonth: z.number().int().nonnegative(),
  topVendorsByRevenue: z.array(TopVendorByRevenueSchema),
  averageOrderValue: z.number().nonnegative(),
});

export type VendorAnalyticsResponseType = z.infer<typeof VendorAnalyticsResponseSchema>;

// ===== PRODUCT ANALYTICS =====

/**
 * Top product
 */
export interface TopProduct {
  productId: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
}

/**
 * Zod schema for TopProduct
 */
export const TopProductSchema = z.object({
  productId: z.string(),
  name: z.string(),
  sales: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  views: z.number().int().nonnegative(),
});

export type TopProductType = z.infer<typeof TopProductSchema>;

/**
 * Category distribution
 */
export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

/**
 * Zod schema for CategoryDistribution
 */
export const CategoryDistributionSchema = z.object({
  category: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
});

export type CategoryDistributionType = z.infer<typeof CategoryDistributionSchema>;

/**
 * Product analytics response
 */
export interface ProductAnalyticsResponse {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  pendingApproval: number;
  topProducts: TopProduct[];
  categoriesDistribution: CategoryDistribution[];
}

/**
 * Zod schema for ProductAnalyticsResponse
 */
export const ProductAnalyticsResponseSchema = z.object({
  totalProducts: z.number().int().nonnegative(),
  activeProducts: z.number().int().nonnegative(),
  outOfStock: z.number().int().nonnegative(),
  pendingApproval: z.number().int().nonnegative(),
  topProducts: z.array(TopProductSchema),
  categoriesDistribution: z.array(CategoryDistributionSchema),
});

export type ProductAnalyticsResponseType = z.infer<typeof ProductAnalyticsResponseSchema>;

// ===== ORDER ANALYTICS =====

/**
 * Orders by status
 */
export interface OrdersByStatus {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

/**
 * Zod schema for OrdersByStatus
 */
export const OrdersByStatusSchema = z.object({
  pending: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  shipped: z.number().int().nonnegative(),
  delivered: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
});

export type OrdersByStatusType = z.infer<typeof OrdersByStatusSchema>;

/**
 * Order analytics response
 */
export interface OrderAnalyticsResponse {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  ordersByStatus: OrdersByStatus;
  averageOrderValue: number;
  averageProcessingTime: string;
}

/**
 * Zod schema for OrderAnalyticsResponse
 */
export const OrderAnalyticsResponseSchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  completedOrders: z.number().int().nonnegative(),
  pendingOrders: z.number().int().nonnegative(),
  cancelledOrders: z.number().int().nonnegative(),
  ordersByStatus: OrdersByStatusSchema,
  averageOrderValue: z.number().nonnegative(),
  averageProcessingTime: z.string(),
});

export type OrderAnalyticsResponseType = z.infer<typeof OrderAnalyticsResponseSchema>;

// ===== REVENUE ANALYTICS =====

/**
 * Monthly revenue breakdown
 */
export interface MonthlyRevenueBreakdown {
  month: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

/**
 * Zod schema for MonthlyRevenueBreakdown
 */
export const MonthlyRevenueBreakdownSchema = z.object({
  month: z.string(),
  revenue: z.number().nonnegative(),
  orders: z.number().int().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
});

export type MonthlyRevenueBreakdownType = z.infer<typeof MonthlyRevenueBreakdownSchema>;

/**
 * Top category by revenue
 */
export interface TopCategoryByRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

/**
 * Zod schema for TopCategoryByRevenue
 */
export const TopCategoryByRevenueSchema = z.object({
  category: z.string(),
  revenue: z.number().nonnegative(),
  percentage: z.number().nonnegative(),
});

export type TopCategoryByRevenueType = z.infer<typeof TopCategoryByRevenueSchema>;

/**
 * Revenue analytics response
 */
export interface RevenueAnalyticsResponse {
  totalRevenue: number;
  platformFees: number;
  vendorPayouts: number;
  monthlyBreakdown: MonthlyRevenueBreakdown[];
  topCategories: TopCategoryByRevenue[];
}

/**
 * Zod schema for RevenueAnalyticsResponse
 */
export const RevenueAnalyticsResponseSchema = z.object({
  totalRevenue: z.number().nonnegative(),
  platformFees: z.number().nonnegative(),
  vendorPayouts: z.number().nonnegative(),
  monthlyBreakdown: z.array(MonthlyRevenueBreakdownSchema),
  topCategories: z.array(TopCategoryByRevenueSchema),
});

export type RevenueAnalyticsResponseType = z.infer<typeof RevenueAnalyticsResponseSchema>;

// ===== CATEGORY ANALYTICS =====

/**
 * Top performing category
 */
export interface TopPerformingCategory {
  categoryId: string;
  name: string;
  products: number;
  orders: number;
  revenue: number;
}

/**
 * Zod schema for TopPerformingCategory
 */
export const TopPerformingCategorySchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  products: z.number().int().nonnegative(),
  orders: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
});

export type TopPerformingCategoryType = z.infer<typeof TopPerformingCategorySchema>;

/**
 * Category analytics response
 */
export interface CategoryAnalyticsResponse {
  totalCategories: number;
  categoriesWithProducts: number;
  topPerformingCategories: TopPerformingCategory[];
}

/**
 * Zod schema for CategoryAnalyticsResponse
 */
export const CategoryAnalyticsResponseSchema = z.object({
  totalCategories: z.number().int().nonnegative(),
  categoriesWithProducts: z.number().int().nonnegative(),
  topPerformingCategories: z.array(TopPerformingCategorySchema),
});

export type CategoryAnalyticsResponseType = z.infer<typeof CategoryAnalyticsResponseSchema>;

// ===== SYSTEM METRICS =====

/**
 * Database metrics
 */
export interface DatabaseMetrics {
  size: string;
  collections: number;
  totalDocuments: number;
}

/**
 * Zod schema for DatabaseMetrics
 */
export const DatabaseMetricsSchema = z.object({
  size: z.string(),
  collections: z.number().int().nonnegative(),
  totalDocuments: z.number().int().nonnegative(),
});

export type DatabaseMetricsType = z.infer<typeof DatabaseMetricsSchema>;

/**
 * Storage metrics
 */
export interface StorageMetrics {
  totalUsed: string;
  available: string;
  percentage: number;
}

/**
 * Zod schema for StorageMetrics
 */
export const StorageMetricsSchema = z.object({
  totalUsed: z.string(),
  available: z.string(),
  percentage: z.number().nonnegative(),
});

export type StorageMetricsType = z.infer<typeof StorageMetricsSchema>;

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  averageResponseTime: string;
  uptime: string;
  requestsPerMinute: number;
}

/**
 * Zod schema for PerformanceMetrics
 */
export const PerformanceMetricsSchema = z.object({
  averageResponseTime: z.string(),
  uptime: z.string(),
  requestsPerMinute: z.number().nonnegative(),
});

export type PerformanceMetricsType = z.infer<typeof PerformanceMetricsSchema>;

/**
 * System metrics response
 */
export interface SystemMetricsResponse {
  database: DatabaseMetrics;
  storage: StorageMetrics;
  performance: PerformanceMetrics;
}

/**
 * Zod schema for SystemMetricsResponse
 */
export const SystemMetricsResponseSchema = z.object({
  database: DatabaseMetricsSchema,
  storage: StorageMetricsSchema,
  performance: PerformanceMetricsSchema,
});

export type SystemMetricsResponseType = z.infer<typeof SystemMetricsResponseSchema>;

// ===== PERFORMANCE ANALYTICS =====

/**
 * API performance
 */
export interface ApiPerformance {
  averageResponseTime: string;
  p95ResponseTime: string;
  p99ResponseTime: string;
  errorRate: number;
}

/**
 * Zod schema for ApiPerformance
 */
export const ApiPerformanceSchema = z.object({
  averageResponseTime: z.string(),
  p95ResponseTime: z.string(),
  p99ResponseTime: z.string(),
  errorRate: z.number().nonnegative(),
});

export type ApiPerformanceType = z.infer<typeof ApiPerformanceSchema>;

/**
 * Endpoint metrics
 */
export interface EndpointMetrics {
  path: string;
  method: string;
  avgResponseTime: string;
  requestCount: number;
}

/**
 * Zod schema for EndpointMetrics
 */
export const EndpointMetricsSchema = z.object({
  path: z.string(),
  method: z.string(),
  avgResponseTime: z.string(),
  requestCount: z.number().int().nonnegative(),
});

export type EndpointMetricsType = z.infer<typeof EndpointMetricsSchema>;

/**
 * Performance analytics response
 */
export interface PerformanceAnalyticsResponse {
  apiPerformance: ApiPerformance;
  endpoints: EndpointMetrics[];
  cacheHitRate: number;
}

/**
 * Zod schema for PerformanceAnalyticsResponse
 */
export const PerformanceAnalyticsResponseSchema = z.object({
  apiPerformance: ApiPerformanceSchema,
  endpoints: z.array(EndpointMetricsSchema),
  cacheHitRate: z.number().nonnegative(),
});

export type PerformanceAnalyticsResponseType = z.infer<
  typeof PerformanceAnalyticsResponseSchema
>;

// ===== TRAFFIC ANALYTICS =====

/**
 * Traffic analytics response
 */
export interface TrafficAnalyticsResponse {
  totalPageviews: number;
  uniqueVisitors: number;
  averageSessionDuration: string;
  bounceRate: number;
}

/**
 * Zod schema for TrafficAnalyticsResponse
 */
export const TrafficAnalyticsResponseSchema = z.object({
  totalPageviews: z.number().int().nonnegative(),
  uniqueVisitors: z.number().int().nonnegative(),
  averageSessionDuration: z.string(),
  bounceRate: z.number().nonnegative(),
});

export type TrafficAnalyticsResponseType = z.infer<typeof TrafficAnalyticsResponseSchema>;

// ===== CONVERSION ANALYTICS =====

/**
 * Conversion analytics response
 */
export interface ConversionAnalyticsResponse {
  conversionRate: number;
  averageCartValue: number;
  abandonedCarts: number;
  completedCheckouts: number;
}

/**
 * Zod schema for ConversionAnalyticsResponse
 */
export const ConversionAnalyticsResponseSchema = z.object({
  conversionRate: z.number().nonnegative(),
  averageCartValue: z.number().nonnegative(),
  abandonedCarts: z.number().int().nonnegative(),
  completedCheckouts: z.number().int().nonnegative(),
});

export type ConversionAnalyticsResponseType = z.infer<typeof ConversionAnalyticsResponseSchema>;

// ===== COMPARISON ANALYTICS =====

/**
 * Comparison analytics response
 */
export interface ComparisonAnalyticsResponse {
  currentPeriod: DashboardOverview;
  previousPeriod: DashboardOverview;
  percentageChange: {
    revenue: number;
    orders: number;
    users: number;
    vendors: number;
    products: number;
  };
}

/**
 * Zod schema for ComparisonAnalyticsResponse
 */
export const ComparisonAnalyticsResponseSchema = z.object({
  currentPeriod: DashboardOverviewSchema,
  previousPeriod: DashboardOverviewSchema,
  percentageChange: z.object({
    revenue: z.number(),
    orders: z.number(),
    users: z.number(),
    vendors: z.number(),
    products: z.number(),
  }),
});

export type ComparisonAnalyticsResponseType = z.infer<typeof ComparisonAnalyticsResponseSchema>;

// ===== TYPE EXPORTS =====

export type {
  DashboardAnalyticsResponse,
  UserAnalyticsResponse,
  VendorAnalyticsResponse,
  ProductAnalyticsResponse,
  OrderAnalyticsResponse,
  RevenueAnalyticsResponse,
  CategoryAnalyticsResponse,
  SystemMetricsResponse,
  PerformanceAnalyticsResponse,
  TrafficAnalyticsResponse,
  ConversionAnalyticsResponse,
  ComparisonAnalyticsResponse,
};
