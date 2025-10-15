/**
 * DigiMall Admin API Types - Central Export
 *
 * This file exports all types from the modular type system.
 * Import types from this file for a clean and organized codebase.
 *
 * @example
 * import { Staff, Product, Order, ApiResponse } from '@/lib/api/types';
 */

// ===== SHARED & BASE TYPES =====
export * from './shared.types';
export * from './enums.types';

// Explicitly export ApiError class to avoid bundler issues
export { ApiError } from './shared.types';

// ===== DOMAIN ENTITY TYPES =====
export * from './staff.types';
export * from './analytics.types';
export * from './products.types';
export * from './vendors.types';
export * from './orders.types';
export * from './users.types';
export * from './categories.types';
export * from './security.types';
export * from './system.types';
export * from './subscription-plans.types';
export * from './admin-vendor.types';
export * from './reviews.types';

// ===== TYPE COLLECTIONS FOR CONVENIENCE =====

/**
 * All entity types
 */
export type EntityTypes = {
  Staff: import('./staff.types').Staff;
  Product: import('./products.types').Product;
  Vendor: import('./vendors.types').Vendor;
  Order: import('./orders.types').Order;
  User: import('./users.types').User;
  Category: import('./categories.types').Category;
  SecurityEvent: import('./security.types').SecurityEvent;
  SecurityAlert: import('./security.types').SecurityAlert;
  SubscriptionPlan: import('./subscription-plans.types').SubscriptionPlan;
  VendorSubscription: import('./subscription-plans.types').VendorSubscription;
  VendorPayout: import('./admin-vendor.types').VendorPayout;
  ProductReview: import('./admin-vendor.types').ProductReview;
  VendorDispute: import('./admin-vendor.types').VendorDispute;
};

/**
 * All list response types
 */
export type ListResponseTypes = {
  StaffList: import('./staff.types').StaffListResponse;
  ProductList: import('./products.types').ProductListResponse;
  VendorList: import('./vendors.types').VendorListResponse;
  OrderList: import('./orders.types').OrderListResponse;
  UserList: import('./users.types').UserListResponse;
  CategoryList: import('./categories.types').CategoryListResponse;
  SecurityEventsList: import('./security.types').SecurityEventsListResponse;
  SecurityAlertsList: import('./security.types').SecurityAlertsListResponse;
  SubscriptionPlansList: import('./subscription-plans.types').SubscriptionPlansListResponse;
  VendorSubscriptionsList: import('./subscription-plans.types').VendorSubscriptionsListResponse;
  VendorPayoutsList: import('./admin-vendor.types').VendorPayoutsListResponse;
  ProductReviewsList: import('./admin-vendor.types').ProductReviewsListResponse;
  VendorDisputesList: import('./admin-vendor.types').VendorDisputesListResponse;
};

/**
 * All analytics response types
 */
export type AnalyticsResponseTypes = {
  Dashboard: import('./analytics.types').DashboardAnalyticsResponse;
  User: import('./analytics.types').UserAnalyticsResponse;
  Vendor: import('./analytics.types').VendorAnalyticsResponse;
  Product: import('./analytics.types').ProductAnalyticsResponse;
  Order: import('./analytics.types').OrderAnalyticsResponse;
  Revenue: import('./analytics.types').RevenueAnalyticsResponse;
  Traffic: import('./analytics.types').TrafficAnalyticsResponse;
  Conversion: import('./analytics.types').ConversionAnalyticsResponse;
  Performance: import('./analytics.types').PerformanceAnalyticsResponse;
  Comparison: import('./analytics.types').ComparisonAnalyticsResponse;
};

/**
 * All statistics response types
 */
export type StatisticsResponseTypes = {
  Product: import('./products.types').ProductStatisticsResponse;
  Vendor: import('./vendors.types').VendorStatisticsResponse;
  Order: import('./orders.types').OrderStatisticsResponse;
  User: import('./users.types').UserStatisticsResponse;
  Subscription: import('./subscription-plans.types').SubscriptionStatisticsResponse;
  Security: import('./security.types').SecurityOverviewResponse;
  System: import('./system.types').SystemMetricsResponse;
};
