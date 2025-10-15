/**
 * Security Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 9 security endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams } from './shared.types';
import {
  SecurityEventTypeSchema,
  SecurityEventSeveritySchema,
  AlertStatusSchema,
  AlertTypeSchema,
} from './enums.types';

// ===== SECURITY EVENT ENTITY =====

/**
 * Security event metadata
 */
export interface SecurityEventMetadata {
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
  };
  additionalData?: Record<string, any>;
}

export const SecurityEventMetadataSchema = z.object({
  ipAddress: z.string(),
  userAgent: z.string(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }).optional(),
  deviceInfo: z.object({
    type: z.string(),
    os: z.string(),
    browser: z.string(),
  }).optional(),
  additionalData: z.record(z.any()).optional(),
});

/**
 * Security event entity
 */
export interface SecurityEvent extends BaseEntity {
  type: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'ip_blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userName?: string;
  staffId?: string;
  staffName?: string;
  description: string;
  metadata: SecurityEventMetadata;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export const SecurityEventSchema = z.object({
  id: z.string(),
  type: SecurityEventTypeSchema,
  severity: SecurityEventSeveritySchema,
  userId: z.string().optional(),
  userName: z.string().optional(),
  staffId: z.string().optional(),
  staffName: z.string().optional(),
  description: z.string(),
  metadata: SecurityEventMetadataSchema,
  resolved: z.boolean(),
  resolvedBy: z.string().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolution: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== SECURITY ALERT ENTITY =====

/**
 * Security alert entity
 */
export interface SecurityAlert extends BaseEntity {
  type: 'brute_force_attempt' | 'suspicious_activity' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved';
  title: string;
  description: string;
  affectedUsers?: string[];
  affectedIps?: string[];
  eventCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  assignedTo?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  notes?: string[];
}

export const SecurityAlertSchema = z.object({
  id: z.string(),
  type: AlertTypeSchema,
  severity: SecurityEventSeveritySchema,
  status: AlertStatusSchema,
  title: z.string(),
  description: z.string(),
  affectedUsers: z.array(z.string()).optional(),
  affectedIps: z.array(z.string()).optional(),
  eventCount: z.number().int().positive(),
  firstSeenAt: z.string().datetime(),
  lastSeenAt: z.string().datetime(),
  assignedTo: z.string().optional(),
  resolvedBy: z.string().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolution: z.string().optional(),
  notes: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== IP BLOCK ENTITY =====

/**
 * IP block entity
 */
export interface IPBlock extends BaseEntity {
  ipAddress: string;
  reason: string;
  blockedBy: string;
  expiresAt?: string;
  permanent: boolean;
  attempts?: number;
  lastAttemptAt?: string;
}

export const IPBlockSchema = z.object({
  id: z.string(),
  ipAddress: z.string(),
  reason: z.string(),
  blockedBy: z.string(),
  expiresAt: z.string().datetime().optional(),
  permanent: z.boolean(),
  attempts: z.number().int().nonnegative().optional(),
  lastAttemptAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get security events query parameters
 */
export interface GetSecurityEventsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  type?: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'ip_blocked';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  staffId?: string;
  resolved?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'createdAt' | 'severity' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export const GetSecurityEventsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  type: SecurityEventTypeSchema.optional(),
  severity: SecurityEventSeveritySchema.optional(),
  userId: z.string().optional(),
  staffId: z.string().optional(),
  resolved: z.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'severity', 'type']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get security alerts query parameters
 */
export interface GetSecurityAlertsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  type?: 'brute_force_attempt' | 'suspicious_activity' | 'unauthorized_access';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'investigating' | 'resolved';
  assignedTo?: string;
  sortBy?: 'createdAt' | 'severity' | 'eventCount';
  sortOrder?: 'asc' | 'desc';
}

export const GetSecurityAlertsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  type: AlertTypeSchema.optional(),
  severity: SecurityEventSeveritySchema.optional(),
  status: AlertStatusSchema.optional(),
  assignedTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'severity', 'eventCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get blocked IPs query parameters
 */
export interface GetBlockedIPsParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  permanent?: boolean;
  expired?: boolean;
  search?: string;
}

export const GetBlockedIPsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  permanent: z.boolean().optional(),
  expired: z.boolean().optional(),
  search: z.string().optional(),
});

// ===== REQUEST TYPES =====

/**
 * Block IP request
 */
export interface BlockIPRequest {
  ipAddress: string;
  reason: string;
}

export const BlockIPRequestSchema = z.object({
  ipAddress: z.string().ip(),
  reason: z.string().min(1),
});

/**
 * Resolve security event request
 */
export interface ResolveSecurityEventRequest {
  resolution: string;
  notes?: string;
}

export const ResolveSecurityEventRequestSchema = z.object({
  resolution: z.string().min(1),
  notes: z.string().optional(),
});

/**
 * Update security alert request
 */
export interface UpdateSecurityAlertRequest {
  status?: 'active' | 'investigating' | 'resolved';
  assignedTo?: string;
  resolution?: string;
  notes?: string[];
}

export const UpdateSecurityAlertRequestSchema = z.object({
  status: AlertStatusSchema.optional(),
  assignedTo: z.string().optional(),
  resolution: z.string().optional(),
  notes: z.array(z.string()).optional(),
});

// ===== RESPONSE TYPES =====

/**
 * Security events list response
 */
export interface SecurityEventsListResponse {
  data: SecurityEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const SecurityEventsListResponseSchema = z.object({
  data: z.array(SecurityEventSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Security alerts list response
 */
export interface SecurityAlertsListResponse {
  data: SecurityAlert[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const SecurityAlertsListResponseSchema = z.object({
  data: z.array(SecurityAlertSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Blocked IPs list response
 */
export interface BlockedIPsListResponse {
  data: IPBlock[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const BlockedIPsListResponseSchema = z.object({
  data: z.array(IPBlockSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Block IP response
 */
export interface BlockIPResponse {
  message: string;
  data: IPBlock;
}

export const BlockIPResponseSchema = z.object({
  message: z.string(),
  data: IPBlockSchema,
});

/**
 * Unblock IP response
 */
export interface UnblockIPResponse {
  message: string;
  data: {
    id: string;
    ipAddress: string;
    unblockedBy: string;
    unblockedAt: string;
  };
}

export const UnblockIPResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    ipAddress: z.string(),
    unblockedBy: z.string(),
    unblockedAt: z.string().datetime(),
  }),
});

/**
 * Security statistics by severity
 */
export interface SecurityStatisticsBySeverity {
  severity: string;
  count: number;
  percentage: number;
}

export const SecurityStatisticsBySeveritySchema = z.object({
  severity: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
});

/**
 * Security statistics by type
 */
export interface SecurityStatisticsByType {
  type: string;
  count: number;
  percentage: number;
}

export const SecurityStatisticsByTypeSchema = z.object({
  type: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
});

/**
 * Security overview response
 */
export interface SecurityOverviewResponse {
  totalEvents: number;
  criticalEvents: number;
  activeAlerts: number;
  blockedIPs: number;
  resolvedEvents: number;
  bySeverity: SecurityStatisticsBySeverity[];
  byType: SecurityStatisticsByType[];
  recentEvents: SecurityEvent[];
  recentAlerts: SecurityAlert[];
  trend: {
    current: number;
    previous: number;
    growthRate: number;
  };
}

export const SecurityOverviewResponseSchema = z.object({
  totalEvents: z.number().int().nonnegative(),
  criticalEvents: z.number().int().nonnegative(),
  activeAlerts: z.number().int().nonnegative(),
  blockedIPs: z.number().int().nonnegative(),
  resolvedEvents: z.number().int().nonnegative(),
  bySeverity: z.array(SecurityStatisticsBySeveritySchema),
  byType: z.array(SecurityStatisticsByTypeSchema),
  recentEvents: z.array(SecurityEventSchema),
  recentAlerts: z.array(SecurityAlertSchema),
  trend: z.object({
    current: z.number(),
    previous: z.number(),
    growthRate: z.number(),
  }),
});

// ===== TYPE EXPORTS =====

export type {
  SecurityEvent,
  SecurityAlert,
  IPBlock,
  SecurityEventsListResponse,
  SecurityAlertsListResponse,
  BlockedIPsListResponse,
  BlockIPResponse,
  UnblockIPResponse,
  SecurityOverviewResponse,
};
