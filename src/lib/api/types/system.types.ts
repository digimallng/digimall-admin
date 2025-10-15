/**
 * System Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 8 system endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md - System Management section
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams } from './shared.types';
import { ServiceStatusSchema, LogLevelSchema } from './enums.types';

// ===== SYSTEM CONFIGURATION =====

/**
 * Platform configuration
 */
export interface PlatformConfig {
  name: string;
  version: string;
  environment: string;
  maintenanceMode: boolean;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  bargaining: boolean;
  chat: boolean;
  reviews: boolean;
  wishlist: boolean;
  subscriptions: boolean;
}

/**
 * System limits
 */
export interface SystemLimits {
  maxProductImages: number;
  maxFileSize: number;
  orderRetentionDays: number;
}

/**
 * Email configuration
 */
export interface EmailConfig {
  provider: string;
  fromAddress: string;
}

/**
 * Payment configuration
 */
export interface PaymentConfig {
  providers: string[];
  currency: string;
}

/**
 * Complete system configuration response
 */
export interface SystemConfigResponse {
  platform: PlatformConfig;
  features: FeatureFlags;
  limits: SystemLimits;
  email: EmailConfig;
  payment: PaymentConfig;
}

/**
 * Update system configuration request
 */
export interface UpdateSystemConfigRequest {
  maintenanceMode?: boolean;
  features?: Partial<FeatureFlags>;
  limits?: Partial<SystemLimits>;
}

// ===== SYSTEM HEALTH =====

/**
 * Service health status (simplified to match API)
 */
export interface ServiceHealth {
  status: string;
  responseTime: string;
}

/**
 * System health response (matching API structure)
 */
export interface SystemHealthResponse {
  status: string;
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    elasticsearch: ServiceHealth;
    storage: ServiceHealth;
    email: ServiceHealth;
    payment: ServiceHealth;
  };
}

// ===== SYSTEM METRICS =====

/**
 * System metrics response (matching API structure)
 */
export interface SystemMetricsResponse {
  server: {
    uptime: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  application: {
    activeConnections: number;
    requestsPerMinute: number;
    averageResponseTime: string;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: string;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
  };
}

// ===== DATABASE STATISTICS =====

export interface CollectionStat {
  name: string;
  documents: number;
  size: string;
  averageObjectSize: string;
}

export interface DatabaseStatsResponse {
  size: string;
  collections: CollectionStat[];
  indexes: number;
  performance: {
    averageQueryTime: string;
    slowQueries: number;
  };
}

// ===== SYSTEM LOG ENTITY =====

/**
 * System log entity (matching API structure)
 */
export interface SystemLog {
  level: string;
  service: string;
  message: string;
  userId?: string;
  error?: string;
  timestamp: string;
}

/**
 * System logs response (matching API structure)
 */
export interface SystemLogsResponse {
  logs: SystemLog[];
  meta: {
    total: number;
    limit: number;
  };
}

// ===== QUERY PARAMETERS =====

/**
 * Get system logs query parameters (matching API)
 */
export interface GetSystemLogsParams {
  limit?: number;
  level?: string;
  service?: string;
}

// ===== RESPONSE TYPES =====

/**
 * Update system config response
 */
export interface UpdateSystemConfigResponse {
  message: string;
  data: {
    updatedBy: string;
    updatedAt: string;
  };
}

/**
 * Clear cache response (matching API)
 */
export interface ClearCacheResponse {
  message: string;
  data: {
    keysCleared: number;
    clearedBy: string;
    clearedAt: string;
  };
}

/**
 * System backup response (matching API)
 */
export interface SystemBackupResponse {
  message: string;
  data: {
    backupId: string;
    status: string;
    estimatedCompletion: string;
  };
}
