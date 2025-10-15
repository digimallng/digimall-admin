/**
 * API Configuration and Endpoint Constants
 *
 * Centralized configuration for all API endpoints, paths, and constants.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

// ===== BASE CONFIGURATION =====

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api/proxy',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  VERSION: 'v1',
} as const;

// ===== API ENDPOINTS =====

/**
 * Staff Management Endpoints (17 endpoints)
 */
export const STAFF_ENDPOINTS = {
  // Core CRUD
  GET_ALL: '/staff',
  GET_BY_ID: (id: string) => `/staff/${id}`,
  CREATE: '/staff',
  UPDATE: (id: string) => `/staff/${id}`,
  DELETE: (id: string) => `/staff/${id}`,

  // Authentication
  LOGIN: '/staff/login',
  LOGOUT: '/staff/logout',
  REFRESH_TOKEN: '/staff/refresh-token',
  CHANGE_PASSWORD: (id: string) => `/staff/${id}/change-password`,

  // Status & Permissions
  UPDATE_STATUS: (id: string) => `/staff/${id}/status`,
  UPDATE_PERMISSIONS: (id: string) => `/staff/${id}/permissions`,
  GET_PERMISSIONS: (role: string) => `/staff/roles/${role}/permissions`,

  // Sessions & Activity
  GET_SESSIONS: (id: string) => `/staff/${id}/sessions`,
  REVOKE_SESSION: (id: string, sessionId: string) =>
    `/staff/${id}/sessions/${sessionId}/revoke`,
  GET_ACTIVITY: (id: string) => `/staff/${id}/activity`,

  // Analytics
  GET_ANALYTICS: '/staff/analytics/overview',
  GET_SECURITY_AUDIT: '/staff/security/audit',
  GET_PRODUCTIVITY: (id: string) => `/staff/${id}/productivity`,
} as const;

/**
 * Analytics Endpoints (10 endpoints)
 */
export const ANALYTICS_ENDPOINTS = {
  DASHBOARD: '/admin/analytics/dashboard',
  USERS: '/admin/analytics/users',
  VENDORS: '/admin/analytics/vendors',
  PRODUCTS: '/admin/analytics/products',
  ORDERS: '/admin/analytics/orders',
  REVENUE: '/admin/analytics/revenue',
  TRAFFIC: '/admin/analytics/traffic',
  CONVERSION: '/admin/analytics/conversion',
  PERFORMANCE: '/admin/analytics/performance',
  COMPARISON: '/admin/analytics/comparison',
} as const;

/**
 * Product Management Endpoints (7 endpoints)
 * All endpoints require /admin prefix based on ADMIN_API_DOCUMENTATION.md
 */
export const PRODUCT_ENDPOINTS = {
  GET_ALL: '/admin/products',
  GET_BY_ID: (id: string) => `/admin/products/${id}`,
  GET_PENDING_APPROVALS: '/admin/products/pending-approvals',
  APPROVE_REJECT: (id: string) => `/admin/products/${id}/approval`,
  UPDATE_INVENTORY: (id: string) => `/admin/products/${id}/inventory`,
  GET_STATISTICS: '/admin/products/statistics',
  BULK_ACTION: '/admin/products/bulk-action',
} as const;

/**
 * Vendor Management Endpoints (8 endpoints)
 * Updated to match ADMIN_API_DOCUMENTATION.md
 */
export const VENDOR_ENDPOINTS = {
  GET_ALL: '/admin/vendors',
  GET_BY_ID: (id: string) => `/admin/vendors/${id}`,
  GET_PERFORMANCE: (id: string) => `/admin/vendors/${id}/performance`,
  APPROVE_REJECT: (id: string) => `/admin/vendors/${id}/approve`, // POST endpoint
  UPDATE_TIER: (id: string) => `/admin/vendors/${id}/tier`, // PUT endpoint
  SUSPEND_UNSUSPEND: (id: string) => `/admin/vendors/${id}/suspend`, // PATCH endpoint (inferred)
  GET_STATISTICS: '/admin/vendors/statistics',
  BULK_TIER_UPDATE: '/admin/vendors/bulk-tier-update',
  GET_PENDING: '/admin/vendors/pending', // GET pending approvals
  ACTIVATE: (id: string) => `/admin/vendors/${id}/activate`, // PUT activate vendor
} as const;

/**
 * Order Management Endpoints (7 endpoints)
 * All endpoints require /admin prefix based on ADMIN_API_DOCUMENTATION.md
 */
export const ORDER_ENDPOINTS = {
  GET_ALL: '/admin/orders',
  GET_BY_ID: (id: string) => `/admin/orders/${id}`,
  UPDATE_STATUS: (id: string) => `/admin/orders/${id}/status`,
  CANCEL: (id: string) => `/admin/orders/${id}/cancel`,
  REFUND: (id: string) => `/admin/orders/${id}/refund`,
  GET_STATISTICS: '/admin/orders/statistics',
  EXPORT: '/admin/orders/export',
} as const;

/**
 * User Management Endpoints (6 endpoints)
 * Note: No general UPDATE endpoint - use UPDATE_STATUS for status changes
 * Note: Suspend/unsuspend must be done via BULK_ACTION endpoint
 */
export const USER_ENDPOINTS = {
  GET_ALL: '/admin/users',
  GET_BY_ID: (id: string) => `/admin/users/${id}`,
  UPDATE_STATUS: (id: string) => `/admin/users/${id}/status`,
  DELETE: (id: string) => `/admin/users/${id}`,
  GET_STATISTICS: '/admin/users/statistics',
  BULK_ACTION: '/admin/users/bulk-action',
} as const;

/**
 * Category Management Endpoints (7 endpoints)
 */
export const CATEGORY_ENDPOINTS = {
  GET_ALL: '/admin/categories',
  GET_BY_ID: (id: string) => `/admin/categories/${id}`,
  CREATE: '/admin/categories',
  UPDATE: (id: string) => `/admin/categories/${id}`,
  DELETE: (id: string) => `/admin/categories/${id}`,
  GET_TREE: '/admin/categories/tree',
  REORDER: '/admin/categories/reorder',
  GET_STATISTICS: '/admin/categories/statistics',
} as const;

/**
 * Security Endpoints (9 endpoints)
 */
export const SECURITY_ENDPOINTS = {
  GET_EVENTS: '/security/events',
  GET_EVENT_BY_ID: (id: string) => `/security/events/${id}`,
  RESOLVE_EVENT: (id: string) => `/security/events/${id}/resolve`,
  GET_ALERTS: '/security/alerts',
  GET_ALERT_BY_ID: (id: string) => `/security/alerts/${id}`,
  UPDATE_ALERT: (id: string) => `/security/alerts/${id}`,
  GET_BLOCKED_IPS: '/security/blocked-ips',
  BLOCK_IP: '/security/block-ip',
  UNBLOCK_IP: (id: string) => `/security/blocked-ips/${id}/unblock`,
  GET_OVERVIEW: '/security/overview',
} as const;

/**
 * System Management Endpoints (8 endpoints)
 * Based on ADMIN_API_DOCUMENTATION.md - System Management section
 */
export const SYSTEM_ENDPOINTS = {
  GET_CONFIG: '/admin/system/config',
  UPDATE_CONFIG: '/admin/system/config',
  HEALTH: '/admin/system/health',
  METRICS: '/admin/system/metrics',
  DATABASE_STATS: '/admin/system/database-stats',
  LOGS: '/admin/system/logs',
  CLEAR_CACHE: '/admin/system/clear-cache',
  BACKUP: '/admin/system/backup',
} as const;

/**
 * Subscription Plans Endpoints (10 endpoints)
 * All endpoints require /admin prefix based on ADMIN_API_DOCUMENTATION.md
 */
export const SUBSCRIPTION_ENDPOINTS = {
  GET_ALL_PLANS: '/admin/subscription-plans',
  GET_PLAN_BY_ID: (id: string) => `/admin/subscription-plans/${id}`,
  CREATE_PLAN: '/admin/subscription-plans',
  UPDATE_PLAN: (id: string) => `/admin/subscription-plans/${id}`,
  DELETE_PLAN: (id: string) => `/admin/subscription-plans/${id}`,
  SYNC_PAYSTACK: (id: string) => `/admin/subscription-plans/${id}/sync-paystack`,
  GET_VENDOR_SUBSCRIPTIONS: '/admin/vendor-subscriptions',
  GET_VENDOR_SUBSCRIPTION_BY_ID: (id: string) => `/admin/vendor-subscriptions/${id}`,
  CANCEL_VENDOR_SUBSCRIPTION: (id: string) =>
    `/admin/vendor-subscriptions/${id}/cancel`,
  GET_STATISTICS: '/admin/subscription-plans/statistics',
} as const;

/**
 * Admin Vendor Operations Endpoints (4 endpoints)
 */
export const ADMIN_VENDOR_ENDPOINTS = {
  GET_PAYOUTS: '/admin/vendor/payouts',
  PROCESS_PAYOUT: (id: string) => `/admin/vendor/payouts/${id}/process`,
  GET_PRODUCT_REVIEWS: '/admin/vendor/product-reviews',
  REVIEW_PRODUCT_REVIEW: (id: string) =>
    `/admin/vendor/product-reviews/${id}/review`,
  GET_DISPUTES: '/admin/vendor/disputes',
  GET_DISPUTE_BY_ID: (id: string) => `/admin/vendor/disputes/${id}`,
  RESOLVE_DISPUTE: (id: string) => `/admin/vendor/disputes/${id}/resolve`,
} as const;

/**
 * Escrow Management Endpoints (10 endpoints)
 */
export const ESCROW_ENDPOINTS = {
  GET_ALL: '/admin/escrow',
  GET_STATISTICS: '/admin/escrow/statistics',
  GET_BY_ID: (id: string) => `/admin/escrow/${id}`,
  GET_BY_ORDER_ID: (orderId: string) => `/admin/escrow/order/${orderId}`,
  RELEASE: (id: string) => `/admin/escrow/${id}/release`,
  REFUND: (id: string) => `/admin/escrow/${id}/refund`,
  GET_DISPUTED: '/admin/escrow/disputed',
  RESOLVE_DISPUTE: (id: string) => `/admin/escrow/${id}/resolve-dispute`,
  GET_EXPIRING_SOON: '/admin/escrow/expiring-soon',
  GET_AUDIT_LOG: '/admin/escrow/audit-log',
} as const;

/**
 * Notifications Management Endpoints (9 endpoints)
 * All endpoints require /admin prefix based on ADMIN_API_DOCUMENTATION.md
 */
export const NOTIFICATIONS_ENDPOINTS = {
  GET_ALL: '/admin/notifications',
  GET_BY_ID: (id: string) => `/admin/notifications/${id}`,
  GET_STATISTICS: '/admin/notifications/statistics',
  BROADCAST: '/admin/notifications/broadcast',
  GET_FAILED: '/admin/notifications/failed',
  GET_SCHEDULED: '/admin/notifications/scheduled',
  RESEND: (id: string) => `/admin/notifications/${id}/resend`,
  DELETE: (id: string) => `/admin/notifications/${id}`,
  BULK_DELETE: '/admin/notifications/bulk-delete',
} as const;

/**
 * Reviews Management Endpoints (10 endpoints)
 * All endpoints require /admin prefix based on ADMIN_API_DOCUMENTATION.md
 */
export const REVIEWS_ENDPOINTS = {
  GET_ALL: '/admin/reviews',
  GET_BY_ID: (id: string) => `/admin/reviews/${id}`,
  APPROVE: (id: string) => `/admin/reviews/${id}/approve`,
  REJECT: (id: string) => `/admin/reviews/${id}/reject`,
  FLAG: (id: string) => `/admin/reviews/${id}/flag`,
  DELETE: (id: string) => `/admin/reviews/${id}`,
  GET_STATISTICS: '/admin/reviews/stats',
  BULK_MODERATE: '/admin/reviews/bulk/moderate',
  VENDOR_ANALYTICS: (vendorId: string) => `/admin/reviews/vendor/${vendorId}/analytics`,
  PRODUCT_ANALYTICS: (productId: string) => `/admin/reviews/product/${productId}/analytics`,
} as const;

/**
 * File Uploads & S3 Integration Endpoints (5 endpoints)
 * Based on ADMIN_API_DOCUMENTATION.md - File Uploads & S3 Integration section
 */
export const UPLOADS_ENDPOINTS = {
  UPLOAD_IMAGE: '/uploads/image',
  UPLOAD_IMAGES: '/uploads/images',
  UPLOAD_DOCUMENT: '/uploads/document',
  DELETE_FILE: (fileKey: string) => `/uploads/${encodeURIComponent(fileKey)}`,
  GET_SIGNED_URL: '/uploads/signed-url',
} as const;

/**
 * Landing Page Management Endpoints
 * Based on ADMIN_API_DOCUMENTATION.md - Landing Page Management section (lines 4082-4400)
 */
export const LANDING_ENDPOINTS = {
  // Hero Slides
  GET_HERO_SLIDES: '/admin/landing/hero-slides',
  GET_HERO_SLIDE: (id: string) => `/admin/landing/hero-slides/${id}`,
  CREATE_HERO_SLIDE: '/admin/landing/hero-slides',
  UPDATE_HERO_SLIDE: (id: string) => `/admin/landing/hero-slides/${id}`,
  DELETE_HERO_SLIDE: (id: string) => `/admin/landing/hero-slides/${id}`,

  // Platform Statistics
  GET_STATISTICS: '/admin/landing/statistics',
  UPDATE_STATISTICS: '/admin/landing/statistics',

  // Promotional Banners
  GET_BANNERS: '/admin/landing/banners',
  GET_BANNER: (id: string) => `/admin/landing/banners/${id}`,
  CREATE_BANNER: '/admin/landing/banners',
  UPDATE_BANNER: (id: string) => `/admin/landing/banners/${id}`,
  DELETE_BANNER: (id: string) => `/admin/landing/banners/${id}`,

  // Category Deals
  GET_CATEGORY_DEALS: '/admin/landing/category-deals',
  GET_CATEGORY_DEAL: (id: string) => `/admin/landing/category-deals/${id}`,
  CREATE_CATEGORY_DEAL: '/admin/landing/category-deals',
  UPDATE_CATEGORY_DEAL: (id: string) => `/admin/landing/category-deals/${id}`,
  DELETE_CATEGORY_DEAL: (id: string) => `/admin/landing/category-deals/${id}`,

  // Featured Vendors
  GET_FEATURED_VENDORS: '/admin/landing/featured-vendors',
  UPDATE_FEATURED_VENDORS: '/admin/landing/featured-vendors',
} as const;

/**
 * Settings Management Endpoints
 * Platform configuration and settings
 */
export const SETTINGS_ENDPOINTS = {
  GET_ALL: '/admin/settings',
  GET_BY_KEY: (key: string) => `/admin/settings/${key}`,
  UPDATE: '/admin/settings',
  UPDATE_BY_KEY: (key: string) => `/admin/settings/${key}`,
  GET_PLATFORM_FEES: '/admin/settings/platform-fees',
  UPDATE_PLATFORM_FEES: '/admin/settings/platform-fees',
  GET_COMMISSION_RATES: '/admin/settings/commission-rates',
  UPDATE_COMMISSION_RATES: '/admin/settings/commission-rates',
  GET_EMAIL_TEMPLATES: '/admin/settings/email-templates',
  UPDATE_EMAIL_TEMPLATE: (id: string) => `/admin/settings/email-templates/${id}`,
  GET_NOTIFICATION_SETTINGS: '/admin/settings/notifications',
  UPDATE_NOTIFICATION_SETTINGS: '/admin/settings/notifications',
} as const;

/**
 * Disputes Management Endpoints
 * Order and transaction dispute resolution
 */
export const DISPUTES_ENDPOINTS = {
  GET_ALL: '/admin/disputes',
  GET_BY_ID: (id: string) => `/admin/disputes/${id}`,
  ASSIGN: (id: string) => `/admin/disputes/${id}/assign`,
  RESOLVE: (id: string) => `/admin/disputes/${id}/resolve`,
  ESCALATE: (id: string) => `/admin/disputes/${id}/escalate`,
  ADD_NOTE: (id: string) => `/admin/disputes/${id}/notes`,
  GET_STATISTICS: '/admin/disputes/statistics',
  BULK_ASSIGN: '/admin/disputes/bulk-assign',
} as const;

/**
 * Reports Management Endpoints
 * Report generation and export functionality
 */
export const REPORTS_ENDPOINTS = {
  GET_ALL: '/admin/reports',
  GET_BY_ID: (id: string) => `/admin/reports/${id}`,
  GENERATE: '/admin/reports/generate',
  EXPORT_SALES: '/admin/reports/export/sales',
  EXPORT_PRODUCTS: '/admin/reports/export/products',
  EXPORT_VENDORS: '/admin/reports/export/vendors',
  EXPORT_ORDERS: '/admin/reports/export/orders',
  EXPORT_USERS: '/admin/reports/export/users',
  SCHEDULE_REPORT: '/admin/reports/schedule',
  GET_SCHEDULED: '/admin/reports/scheduled',
  DELETE_SCHEDULED: (id: string) => `/admin/reports/scheduled/${id}`,
} as const;

// ===== QUERY PARAMETER DEFAULTS =====

export const DEFAULT_QUERY_PARAMS = {
  PAGE: 1,
  LIMIT: 20,
  SORT_ORDER: 'desc' as const,
} as const;

// ===== PAGINATION =====

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  LIMITS: [10, 20, 50, 100] as const,
} as const;

// ===== SORT ORDERS =====

export const SORT_ORDERS = {
  ASC: 'asc' as const,
  DESC: 'desc' as const,
} as const;

// ===== HTTP STATUS CODES =====

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ===== ERROR CODES =====

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// ===== REQUEST TIMEOUTS =====

export const TIMEOUT_CONFIG = {
  DEFAULT: 30000, // 30 seconds
  LONG: 60000, // 1 minute (for large data operations)
  SHORT: 10000, // 10 seconds (for quick operations)
  ANALYTICS: 45000, // 45 seconds (for analytics queries)
} as const;

// ===== EXPORT ALL =====

export const API_ENDPOINTS = {
  STAFF: STAFF_ENDPOINTS,
  ANALYTICS: ANALYTICS_ENDPOINTS,
  PRODUCTS: PRODUCT_ENDPOINTS,
  VENDORS: VENDOR_ENDPOINTS,
  ORDERS: ORDER_ENDPOINTS,
  USERS: USER_ENDPOINTS,
  CATEGORIES: CATEGORY_ENDPOINTS,
  SECURITY: SECURITY_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
  SUBSCRIPTIONS: SUBSCRIPTION_ENDPOINTS,
  ADMIN_VENDOR: ADMIN_VENDOR_ENDPOINTS,
  ESCROW: ESCROW_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATIONS_ENDPOINTS,
  REVIEWS: REVIEWS_ENDPOINTS,
  UPLOADS: UPLOADS_ENDPOINTS,
  LANDING: LANDING_ENDPOINTS,
  SETTINGS: SETTINGS_ENDPOINTS,
  DISPUTES: DISPUTES_ENDPOINTS,
  REPORTS: REPORTS_ENDPOINTS,
} as const;
