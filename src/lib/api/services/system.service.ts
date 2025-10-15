/**
 * System Management Service
 *
 * Service for system configuration, health monitoring, metrics, and maintenance operations.
 * Based on ADMIN_API_DOCUMENTATION.md - System Management section
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  SystemConfigResponse,
  UpdateSystemConfigRequest,
  UpdateSystemConfigResponse,
  SystemHealthResponse,
  SystemMetricsResponse,
  DatabaseStatsResponse,
  SystemLogsResponse,
  GetSystemLogsParams,
  ClearCacheResponse,
  SystemBackupResponse,
} from '../types/system.types';

/**
 * System Service Class
 */
class SystemService {
  /**
   * Get system configuration
   * @role SUPER_ADMIN
   */
  async getConfig(): Promise<SystemConfigResponse> {
    return apiClient.get<SystemConfigResponse>(
      API_ENDPOINTS.SYSTEM.GET_CONFIG
    );
  }

  /**
   * Update system configuration
   * @role SUPER_ADMIN
   */
  async updateConfig(data: UpdateSystemConfigRequest): Promise<UpdateSystemConfigResponse> {
    return apiClient.put<UpdateSystemConfigResponse>(
      API_ENDPOINTS.SYSTEM.UPDATE_CONFIG,
      data
    );
  }

  /**
   * Get system health status
   */
  async getHealth(): Promise<SystemHealthResponse> {
    return apiClient.get<SystemHealthResponse>(
      API_ENDPOINTS.SYSTEM.HEALTH
    );
  }

  /**
   * Get system metrics
   */
  async getMetrics(): Promise<SystemMetricsResponse> {
    return apiClient.get<SystemMetricsResponse>(
      API_ENDPOINTS.SYSTEM.METRICS
    );
  }

  /**
   * Get database statistics
   * @role ADMIN, SUPER_ADMIN
   */
  async getDatabaseStats(): Promise<DatabaseStatsResponse> {
    return apiClient.get<DatabaseStatsResponse>(
      API_ENDPOINTS.SYSTEM.DATABASE_STATS
    );
  }

  /**
   * Get system logs
   */
  async getLogs(params?: GetSystemLogsParams): Promise<SystemLogsResponse> {
    return apiClient.get<SystemLogsResponse>(
      API_ENDPOINTS.SYSTEM.LOGS,
      params as any
    );
  }

  /**
   * Clear system cache
   * @role SUPER_ADMIN
   */
  async clearCache(): Promise<ClearCacheResponse> {
    return apiClient.post<ClearCacheResponse>(
      API_ENDPOINTS.SYSTEM.CLEAR_CACHE
    );
  }

  /**
   * Perform system backup
   * @role SUPER_ADMIN
   */
  async backup(): Promise<SystemBackupResponse> {
    return apiClient.post<SystemBackupResponse>(
      API_ENDPOINTS.SYSTEM.BACKUP
    );
  }
}

// Export singleton instance
export const systemService = new SystemService();

// Export class for testing
export { SystemService };
