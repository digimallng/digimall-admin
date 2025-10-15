/**
 * Staff Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 17 staff management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import {
  BaseEntity,
  BaseQueryParams,
  PaginatedResponse,
  ApiResponse,
} from './shared.types';
import { StaffRole, StaffRoleSchema, StaffStatus, StaffStatusSchema } from './enums.types';

// ===== STAFF ENTITY =====

/**
 * Staff member interface
 */
export interface Staff extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  status: StaffStatus;
  permissions: string[];
  phone?: string | null;
  department?: string | null;
  lastLogin?: string | null;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Zod schema for Staff
 */
export const StaffSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: StaffRoleSchema,
  status: StaffStatusSchema,
  permissions: z.array(z.string()),
  phone: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  lastLogin: z.string().datetime().nullable().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

export type StaffType = z.infer<typeof StaffSchema>;

// ===== STAFF SESSION =====

/**
 * Staff session interface
 */
export interface StaffSession {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

/**
 * Zod schema for StaffSession
 */
export const StaffSessionSchema = z.object({
  sessionId: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  createdAt: z.string().datetime(),
  lastActivity: z.string().datetime(),
  isActive: z.boolean(),
});

export type StaffSessionType = z.infer<typeof StaffSessionSchema>;

// ===== STAFF ACTIVITY =====

/**
 * Staff activity log entry
 */
export interface StaffActivity {
  action: string;
  resource: string;
  resourceId: string;
  details: string | object;
  ipAddress: string;
  timestamp: string;
  severity?: string;
  success?: boolean;
}

/**
 * Staff activity response (paginated)
 */
export interface StaffActivityResponse {
  data: StaffActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Zod schema for StaffActivity
 */
export const StaffActivitySchema = z.object({
  action: z.string(),
  resource: z.string(),
  resourceId: z.string(),
  details: z.string(),
  ipAddress: z.string(),
  timestamp: z.string().datetime(),
});

export type StaffActivityType = z.infer<typeof StaffActivitySchema>;

// ===== REQUEST TYPES =====

/**
 * Get all staff query parameters
 */
export interface GetAllStaffParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  role?: StaffRole;
  status?: StaffStatus;
  search?: string;
}

/**
 * Zod schema for GetAllStaffParams
 */
export const GetAllStaffParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  role: StaffRoleSchema.optional(),
  status: StaffStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
});

export type GetAllStaffParamsType = z.infer<typeof GetAllStaffParamsSchema>;

/**
 * Create staff request
 */
export interface CreateStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: StaffRole;
  department?: string;
  permissions?: string[];
}

/**
 * Zod schema for CreateStaffRequest
 */
export const CreateStaffRequestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
  role: StaffRoleSchema,
  department: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export type CreateStaffRequestType = z.infer<typeof CreateStaffRequestSchema>;

/**
 * Update staff request
 */
export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  status?: StaffStatus;
  department?: string;
}

/**
 * Zod schema for UpdateStaffRequest
 */
export const UpdateStaffRequestSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  status: StaffStatusSchema.optional(),
  department: z.string().optional(),
});

export type UpdateStaffRequestType = z.infer<typeof UpdateStaffRequestSchema>;

/**
 * Staff login request
 */
export interface StaffLoginRequest {
  email: string;
  password: string;
}

/**
 * Zod schema for StaffLoginRequest
 */
export const StaffLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type StaffLoginRequestType = z.infer<typeof StaffLoginRequestSchema>;

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Zod schema for RefreshTokenRequest
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenRequestType = z.infer<typeof RefreshTokenRequestSchema>;

/**
 * Logout request
 */
export interface LogoutRequest {
  sessionId?: string;
}

/**
 * Zod schema for LogoutRequest
 */
export const LogoutRequestSchema = z.object({
  sessionId: z.string().optional(),
});

export type LogoutRequestType = z.infer<typeof LogoutRequestSchema>;

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Zod schema for ChangePasswordRequest
 */
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export type ChangePasswordRequestType = z.infer<typeof ChangePasswordRequestSchema>;

/**
 * Invite staff request
 */
export interface InviteStaffRequest {
  email: string;
  role: StaffRole;
  permissions?: string[];
}

/**
 * Zod schema for InviteStaffRequest
 */
export const InviteStaffRequestSchema = z.object({
  email: z.string().email(),
  role: StaffRoleSchema,
  permissions: z.array(z.string()).optional(),
});

export type InviteStaffRequestType = z.infer<typeof InviteStaffRequestSchema>;

/**
 * Update permissions request
 */
export interface UpdatePermissionsRequest {
  permissions: string[];
}

/**
 * Zod schema for UpdatePermissionsRequest
 */
export const UpdatePermissionsRequestSchema = z.object({
  permissions: z.array(z.string()).min(1),
});

export type UpdatePermissionsRequestType = z.infer<typeof UpdatePermissionsRequestSchema>;

/**
 * Bulk staff action request
 */
export interface BulkStaffActionRequest {
  staffIds: string[];
  action: 'activate' | 'suspend' | 'delete';
  reason?: string;
}

/**
 * Zod schema for BulkStaffActionRequest
 */
export const BulkStaffActionRequestSchema = z.object({
  staffIds: z.array(z.string()).min(1),
  action: z.enum(['activate', 'suspend', 'delete']),
  reason: z.string().optional(),
});

export type BulkStaffActionRequestType = z.infer<typeof BulkStaffActionRequestSchema>;

/**
 * Get staff activity query params
 */
export interface GetStaffActivityParams extends BaseQueryParams {
  page?: number;
  limit?: number;
}

/**
 * Zod schema for GetStaffActivityParams
 */
export const GetStaffActivityParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type GetStaffActivityParamsType = z.infer<typeof GetStaffActivityParamsSchema>;

/**
 * Get security audit query params
 */
export interface GetSecurityAuditParams {
  days?: number;
}

/**
 * Zod schema for GetSecurityAuditParams
 */
export const GetSecurityAuditParamsSchema = z.object({
  days: z.number().int().positive().max(365).optional(),
});

export type GetSecurityAuditParamsType = z.infer<typeof GetSecurityAuditParamsSchema>;

/**
 * Get productivity query params
 */
export interface GetProductivityParams {
  staffId?: string;
}

/**
 * Zod schema for GetProductivityParams
 */
export const GetProductivityParamsSchema = z.object({
  staffId: z.string().optional(),
});

export type GetProductivityParamsType = z.infer<typeof GetProductivityParamsSchema>;

// ===== RESPONSE TYPES =====

/**
 * Staff list response (matches ADMIN_API_DOCUMENTATION.md)
 * Backend returns: {data: [], total, page, limit, totalPages, hasNext, hasPrev}
 */
export interface StaffListResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Zod schema for StaffListResponse
 */
export const StaffListResponseSchema = z.object({
  data: z.array(StaffSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type StaffListResponseType = z.infer<typeof StaffListResponseSchema>;

/**
 * Staff login response
 */
export interface StaffLoginResponse {
  accessToken: string;
  refreshToken: string;
  staff: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: StaffRole;
    permissions: string[];
  };
}

/**
 * Zod schema for StaffLoginResponse
 */
export const StaffLoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  staff: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: StaffRoleSchema,
    permissions: z.array(z.string()),
  }),
});

export type StaffLoginResponseType = z.infer<typeof StaffLoginResponseSchema>;

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Zod schema for RefreshTokenResponse
 */
export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RefreshTokenResponseType = z.infer<typeof RefreshTokenResponseSchema>;

/**
 * Invite staff response
 */
export interface InviteStaffResponse {
  message: string;
  invitationToken: string;
}

/**
 * Zod schema for InviteStaffResponse
 */
export const InviteStaffResponseSchema = z.object({
  message: z.string(),
  invitationToken: z.string(),
});

export type InviteStaffResponseType = z.infer<typeof InviteStaffResponseSchema>;

/**
 * Sessions list response
 */
export interface SessionsListResponse {
  data: StaffSession[];
}

/**
 * Zod schema for SessionsListResponse
 */
export const SessionsListResponseSchema = z.object({
  data: z.array(StaffSessionSchema),
});

export type SessionsListResponseType = z.infer<typeof SessionsListResponseSchema>;

/**
 * Activity log response
 */
export interface ActivityLogResponse {
  data: StaffActivity[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Zod schema for ActivityLogResponse
 */
export const ActivityLogResponseSchema = z.object({
  data: z.array(StaffActivitySchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

export type ActivityLogResponseType = z.infer<typeof ActivityLogResponseSchema>;

/**
 * Role permissions response
 */
export interface RolePermissionsResponse {
  super_admin: {
    description: string;
    permissions: string[];
  };
  admin: {
    description: string;
    permissions: string[];
  };
  staff: {
    description: string;
    permissions: string[];
  };
}

/**
 * Zod schema for RolePermissionsResponse
 */
export const RolePermissionsResponseSchema = z.object({
  super_admin: z.object({
    description: z.string(),
    permissions: z.array(z.string()),
  }),
  admin: z.object({
    description: z.string(),
    permissions: z.array(z.string()),
  }),
  staff: z.object({
    description: z.string(),
    permissions: z.array(z.string()),
  }),
});

export type RolePermissionsResponseType = z.infer<typeof RolePermissionsResponseSchema>;

/**
 * Staff analytics overview response (matches ADMIN_API_DOCUMENTATION.md)
 */
export interface StaffAnalyticsOverviewResponse {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  byRole: {
    super_admin: number;
    admin: number;
    staff: number;
  };
  recentActivity: {
    last24Hours: number;
    last7Days: number;
  };
}

/**
 * Zod schema for StaffAnalyticsOverviewResponse
 */
export const StaffAnalyticsOverviewResponseSchema = z.object({
  totalStaff: z.number().int().nonnegative(),
  activeStaff: z.number().int().nonnegative(),
  inactiveStaff: z.number().int().nonnegative(),
  byRole: z.object({
    super_admin: z.number().int().nonnegative(),
    admin: z.number().int().nonnegative(),
    staff: z.number().int().nonnegative(),
  }),
  recentActivity: z.object({
    last24Hours: z.number().int().nonnegative(),
    last7Days: z.number().int().nonnegative(),
  }),
});

export type StaffAnalyticsOverviewResponseType = z.infer<
  typeof StaffAnalyticsOverviewResponseSchema
>;

/**
 * Security audit event
 */
export interface SecurityAuditEvent {
  type: string;
  staffEmail: string;
  ipAddress: string;
  timestamp: string;
}

/**
 * Zod schema for SecurityAuditEvent
 */
export const SecurityAuditEventSchema = z.object({
  type: z.string(),
  staffEmail: z.string().email(),
  ipAddress: z.string(),
  timestamp: z.string().datetime(),
});

export type SecurityAuditEventType = z.infer<typeof SecurityAuditEventSchema>;

/**
 * Security audit response
 */
export interface SecurityAuditResponse {
  period: string;
  failedLoginAttempts: number;
  suspiciousActivities: number;
  passwordChanges: number;
  events: SecurityAuditEvent[];
}

/**
 * Zod schema for SecurityAuditResponse
 */
export const SecurityAuditResponseSchema = z.object({
  period: z.string(),
  failedLoginAttempts: z.number().int().nonnegative(),
  suspiciousActivities: z.number().int().nonnegative(),
  passwordChanges: z.number().int().nonnegative(),
  events: z.array(SecurityAuditEventSchema),
});

export type SecurityAuditResponseType = z.infer<typeof SecurityAuditResponseSchema>;

/**
 * Productivity metrics entry
 */
export interface ProductivityMetric {
  staffId: string;
  staffName: string;
  actionsPerformed: number;
  productsApproved: number;
  ordersProcessed: number;
  averageResponseTime: string;
}

/**
 * Zod schema for ProductivityMetric
 */
export const ProductivityMetricSchema = z.object({
  staffId: z.string(),
  staffName: z.string(),
  actionsPerformed: z.number().int().nonnegative(),
  productsApproved: z.number().int().nonnegative(),
  ordersProcessed: z.number().int().nonnegative(),
  averageResponseTime: z.string(),
});

export type ProductivityMetricType = z.infer<typeof ProductivityMetricSchema>;

/**
 * Productivity response
 */
export interface ProductivityResponse {
  metrics: ProductivityMetric[];
}

/**
 * Zod schema for ProductivityResponse
 */
export const ProductivityResponseSchema = z.object({
  metrics: z.array(ProductivityMetricSchema),
});

export type ProductivityResponseType = z.infer<typeof ProductivityResponseSchema>;

/**
 * Bulk action response
 */
export interface BulkStaffActionResponse {
  message: string;
  successful: number;
  failed: number;
}

/**
 * Zod schema for BulkStaffActionResponse
 */
export const BulkStaffActionResponseSchema = z.object({
  message: z.string(),
  successful: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

export type BulkStaffActionResponseType = z.infer<typeof BulkStaffActionResponseSchema>;

/**
 * Create super admin request (setup endpoint)
 */
export interface CreateSuperAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  setupToken: string;
}

/**
 * Zod schema for CreateSuperAdminRequest
 */
export const CreateSuperAdminRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  setupToken: z.string().min(1),
});

export type CreateSuperAdminRequestType = z.infer<typeof CreateSuperAdminRequestSchema>;

/**
 * Create super admin response
 */
export interface CreateSuperAdminResponse {
  message: string;
  accessToken: string;
  staff: {
    id: string;
    email: string;
    role: 'super_admin';
  };
}

/**
 * Zod schema for CreateSuperAdminResponse
 */
export const CreateSuperAdminResponseSchema = z.object({
  message: z.string(),
  accessToken: z.string(),
  staff: z.object({
    id: z.string(),
    email: z.string().email(),
    role: z.literal('super_admin'),
  }),
});

export type CreateSuperAdminResponseType = z.infer<typeof CreateSuperAdminResponseSchema>;

// ===== TYPE EXPORTS =====

export type {
  Staff,
  StaffSession,
  StaffActivity,
  StaffListResponse,
  StaffLoginResponse,
  RefreshTokenResponse,
  InviteStaffResponse,
  SessionsListResponse,
  ActivityLogResponse,
  RolePermissionsResponse,
  StaffAnalyticsOverviewResponse,
  SecurityAuditResponse,
  ProductivityResponse,
  BulkStaffActionResponse,
  CreateSuperAdminResponse,
};
