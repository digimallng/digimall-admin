/**
 * Shared Types for DigiMall Admin API
 *
 * Common types, interfaces, and utilities used across all API modules.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';

// ===== BASE INTERFACES =====

/**
 * Base entity with common fields for all entities
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Timestamped entity interface
 */
export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

/**
 * Soft deletable entity interface
 */
export interface SoftDeletableEntity {
  deletedAt?: string | null;
}

// ===== API RESPONSE WRAPPERS =====

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * Zod schema for API response
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
    timestamp: z.string().optional(),
    path: z.string().optional(),
  });

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

/**
 * Zod schema for pagination metadata
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean().optional(),
  hasPrevious: z.boolean().optional(),
});

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Alternative paginated response format (for compatibility)
 */
export interface PaginatedResponseAlt<T> {
  data: T[];
  pagination: PaginationMeta;
  meta?: {
    totalCount: number;
    filteredCount: number;
  };
}

/**
 * Zod schema for paginated response
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });

// ===== ERROR TYPES =====

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: ErrorDetail[];
}

/**
 * Error detail for validation errors
 */
export interface ErrorDetail {
  field: string;
  message: string;
  code?: string;
}

/**
 * Zod schema for API error response
 */
export const ApiErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().int(),
  timestamp: z.string(),
  path: z.string(),
  details: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
      code: z.string().optional(),
    })
  ).optional(),
});

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      data: this.data,
      code: this.code,
      stack: this.stack,
    };
  }
}

// ===== QUERY & FILTER TYPES =====

/**
 * Base query parameters for list endpoints
 */
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  search?: string;
}

/**
 * Zod schema for base query parameters
 */
export const BaseQueryParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
  search: z.string().optional(),
});

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

/**
 * Zod schema for date range filter
 */
export const DateRangeFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ===== BULK OPERATION TYPES =====

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  errors?: BulkOperationError[];
  results?: BulkOperationResult[];
}

/**
 * Bulk operation error
 */
export interface BulkOperationError {
  index: number;
  id?: string;
  error: string;
  details?: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  id: string;
  status: 'success' | 'failed';
  message?: string;
  error?: string;
}

/**
 * Zod schema for bulk operation response
 */
export const BulkOperationResponseSchema = z.object({
  success: z.boolean(),
  processed: z.number().int().nonnegative(),
  successful: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  errors: z.array(
    z.object({
      index: z.number().int(),
      id: z.string().optional(),
      error: z.string(),
      details: z.string().optional(),
    })
  ).optional(),
  results: z.array(
    z.object({
      id: z.string(),
      status: z.enum(['success', 'failed']),
      message: z.string().optional(),
      error: z.string().optional(),
    })
  ).optional(),
});

// ===== COMMON DATA TYPES =====

/**
 * Address interface
 */
export interface Address {
  id?: string;
  street: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode?: string;
  postalCode?: string;
  country: string;
  type?: 'home' | 'work' | 'billing' | 'shipping' | 'other';
  isDefault?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Zod schema for address
 */
export const AddressSchema = z.object({
  id: z.string().optional(),
  street: z.string().min(1),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1),
  type: z.enum(['home', 'work', 'billing', 'shipping', 'other']).optional(),
  isDefault: z.boolean().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Zod schema for file upload response
 */
export const FileUploadResponseSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  filename: z.string(),
  size: z.number().int().positive(),
  mimeType: z.string(),
  uploadedAt: z.string().datetime(),
});

// ===== STATISTICS & ANALYTICS =====

/**
 * Growth metric
 */
export interface GrowthMetric {
  current: number;
  previous: number;
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Zod schema for growth metric
 */
export const GrowthMetricSchema = z.object({
  current: z.number(),
  previous: z.number(),
  growthRate: z.number(),
  trend: z.enum(['up', 'down', 'stable']),
});

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Zod schema for time series data point
 */
export const TimeSeriesDataPointSchema = z.object({
  date: z.string(),
  value: z.number(),
  label: z.string().optional(),
});

// ===== UTILITY TYPES =====

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Exclude null and undefined from type
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract data type from API response
 */
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Extract data array from paginated response
 */
export type ExtractPaginatedData<T> = T extends PaginatedResponse<infer U> ? U[] : never;

// ===== HTTP METHOD TYPES =====

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// ===== REQUEST CONFIG =====

/**
 * Request configuration options
 */
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  validateStatus?: (status: number) => boolean;
  signal?: AbortSignal;
}

/**
 * Zod schema for request config
 */
export const RequestConfigSchema = z.object({
  timeout: z.number().int().positive().optional(),
  retries: z.number().int().nonnegative().max(5).optional(),
  retryDelay: z.number().int().nonnegative().optional(),
  cache: z.boolean().optional(),
  validateStatus: z.function().optional(),
  signal: z.instanceof(AbortSignal).optional(),
});

// ===== TYPE GUARDS =====

/**
 * Check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    'meta' in response &&
    Array.isArray((response as any).data)
  );
}

/**
 * Check if response is successful
 */
export function isSuccessResponse<T>(
  response: unknown
): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as any).success === true
  );
}

// ===== EXPORT UTILITY FUNCTIONS =====

/**
 * Create query string from params object
 */
export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Extract error message from unknown error
 */
export function extractErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Build full API URL with query parameters
 */
export function buildApiUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, any>
): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  const url = `${cleanBaseUrl}/${cleanEndpoint}`;

  if (params) {
    const queryString = createQueryString(params);
    return `${url}${queryString}`;
  }

  return url;
}
