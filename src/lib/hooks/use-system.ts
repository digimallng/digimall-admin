/**
 * System Management Hooks
 *
 * React Query hooks for system management operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { systemService } from '../api/services/system.service';
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
} from '../api/types/system.types';

// ===== QUERY KEYS =====

export const systemKeys = {
  all: ['system'] as const,
  config: () => [...systemKeys.all, 'config'] as const,
  health: () => [...systemKeys.all, 'health'] as const,
  metrics: () => [...systemKeys.all, 'metrics'] as const,
  databaseStats: () => [...systemKeys.all, 'database-stats'] as const,
  logs: (params?: GetSystemLogsParams) => [...systemKeys.all, 'logs', params] as const,
};

// ===== QUERIES =====

/**
 * Get system configuration
 */
export function useSystemConfig(): UseQueryResult<SystemConfigResponse, Error> {
  return useQuery({
    queryKey: systemKeys.config(),
    queryFn: () => systemService.getConfig(),
  });
}

/**
 * Get system health
 */
export function useSystemHealth(): UseQueryResult<SystemHealthResponse, Error> {
  return useQuery({
    queryKey: systemKeys.health(),
    queryFn: () => systemService.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get system metrics
 */
export function useSystemMetrics(): UseQueryResult<SystemMetricsResponse, Error> {
  return useQuery({
    queryKey: systemKeys.metrics(),
    queryFn: () => systemService.getMetrics(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get database statistics
 */
export function useDatabaseStats(): UseQueryResult<DatabaseStatsResponse, Error> {
  return useQuery({
    queryKey: systemKeys.databaseStats(),
    queryFn: () => systemService.getDatabaseStats(),
  });
}

/**
 * Get system logs
 */
export function useSystemLogs(params?: GetSystemLogsParams): UseQueryResult<SystemLogsResponse, Error> {
  return useQuery({
    queryKey: systemKeys.logs(params),
    queryFn: () => systemService.getLogs(params),
  });
}

// ===== MUTATIONS =====

/**
 * Update system configuration
 */
export function useUpdateSystemConfig(): UseMutationResult<
  UpdateSystemConfigResponse,
  Error,
  UpdateSystemConfigRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSystemConfigRequest) => systemService.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.config() });
    },
  });
}

/**
 * Clear system cache
 */
export function useClearCache(): UseMutationResult<ClearCacheResponse, Error, void> {
  return useMutation({
    mutationFn: () => systemService.clearCache(),
  });
}

/**
 * Perform system backup
 */
export function useSystemBackup(): UseMutationResult<SystemBackupResponse, Error, void> {
  return useMutation({
    mutationFn: () => systemService.backup(),
  });
}
