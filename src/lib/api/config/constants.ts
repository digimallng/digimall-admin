/**
 * API Constants
 * Central location for all API-related constants
 */

// =========================
// API Configuration
// =========================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api/proxy',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// =========================
// Cache Configuration
// =========================

export const CACHE_TIMES = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 2 * 60 * 1000, // 2 minutes
  LONG: 5 * 60 * 1000, // 5 minutes
  EXTRA_LONG: 10 * 60 * 1000, // 10 minutes
} as const;

export const REFETCH_INTERVALS = {
  REALTIME: 30 * 1000, // 30 seconds
  FREQUENT: 1 * 60 * 1000, // 1 minute
  MODERATE: 2 * 60 * 1000, // 2 minutes
  OCCASIONAL: 5 * 60 * 1000, // 5 minutes
} as const;

// =========================
// Pagination Defaults
// =========================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  SORT_ORDER: {
    ASC: 'asc',
    DESC: 'desc',
  },
} as const;

// =========================
// HTTP Status Codes
// =========================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// =========================
// Error Messages
// =========================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// =========================
// Date Formats
// =========================

export const DATE_FORMATS = {
  API: 'yyyy-MM-dd',
  DATETIME_API: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm:ss',
} as const;

// =========================
// File Upload Configuration
// =========================

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_IMAGE: 2 * 1024 * 1024, // 2MB
  MAX_SIZE_DOCUMENT: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// =========================
// Permission Constants
// =========================

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // Staff Management
  STAFF_VIEW: 'staff:view',
  STAFF_CREATE: 'staff:create',
  STAFF_UPDATE: 'staff:update',
  STAFF_DELETE: 'staff:delete',
  STAFF_MANAGE_PERMISSIONS: 'staff:manage-permissions',

  // Vendor Management
  VENDORS_VIEW: 'vendors:view',
  VENDORS_APPROVE: 'vendors:approve',
  VENDORS_UPDATE: 'vendors:update',
  VENDORS_SUSPEND: 'vendors:suspend',
  VENDORS_DELETE: 'vendors:delete',

  // Product Management
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_APPROVE: 'products:approve',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',

  // Order Management
  ORDERS_VIEW: 'orders:view',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_REFUND: 'orders:refund',
  ORDERS_CANCEL: 'orders:cancel',

  // User Management
  USERS_VIEW: 'users:view',
  USERS_UPDATE: 'users:update',
  USERS_SUSPEND: 'users:suspend',
  USERS_DELETE: 'users:delete',

  // Category Management
  CATEGORIES_VIEW: 'categories:view',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  // Security Management
  SECURITY_VIEW: 'security:view',
  SECURITY_MANAGE: 'security:manage',

  // System Management
  SYSTEM_VIEW: 'system:view',
  SYSTEM_MANAGE: 'system:manage',

  // Subscription Management
  SUBSCRIPTIONS_VIEW: 'subscriptions:view',
  SUBSCRIPTIONS_MANAGE: 'subscriptions:manage',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
} as const;

// =========================
// Role Permissions Mapping
// =========================

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.VENDORS_VIEW,
    PERMISSIONS.VENDORS_APPROVE,
    PERMISSIONS.VENDORS_UPDATE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_APPROVE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.SECURITY_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SUBSCRIPTIONS_VIEW,
  ],
  staff: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.VENDORS_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
} as const;

// =========================
// Export All Constants
// =========================

export const API_CONSTANTS = {
  API_CONFIG,
  CACHE_TIMES,
  REFETCH_INTERVALS,
  PAGINATION,
  HTTP_STATUS,
  ERROR_MESSAGES,
  DATE_FORMATS,
  FILE_UPLOAD,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} as const;
