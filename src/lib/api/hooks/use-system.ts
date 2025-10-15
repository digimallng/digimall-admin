/**
 * System React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../services';
import type {
  GetSystemLogsParams,
  UpdateSystemConfigurationRequest,
  ClearCacheRequest,
  ToggleMaintenanceModeRequest,
} from '../types';

export const systemKeys = {
  all: ['system'] as const,
  health: () => [...systemKeys.all, 'health'] as const,
  logs: (params?: GetSystemLogsParams) => [...systemKeys.all, 'logs', params] as const,
  logDetail: (id: string) => [...systemKeys.all, 'log', id] as const,
  configurations: () => [...systemKeys.all, 'configurations'] as const,
  metrics: () => [...systemKeys.all, 'metrics'] as const,
};

export function useSystemHealth() {
  return useQuery({
    queryKey: systemKeys.health(),
    queryFn: () => systemService.getHealth(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useSystemLogs(params?: GetSystemLogsParams) {
  return useQuery({
    queryKey: systemKeys.logs(params),
    queryFn: () => systemService.getLogs(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useSystemLogById(id: string, enabled = true) {
  return useQuery({
    queryKey: systemKeys.logDetail(id),
    queryFn: () => systemService.getLogById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSystemConfigurations() {
  return useQuery({
    queryKey: systemKeys.configurations(),
    queryFn: () => systemService.getConfigurations(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSystemMetrics() {
  return useQuery({
    queryKey: systemKeys.metrics(),
    queryFn: () => systemService.getMetrics(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useUpdateSystemConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateSystemConfigurationRequest }) =>
      systemService.updateConfiguration(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.configurations() });
    },
  });
}

export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: ClearCacheRequest) => systemService.clearCache(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.metrics() });
    },
  });
}

export function useToggleMaintenanceMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleMaintenanceModeRequest) =>
      systemService.toggleMaintenanceMode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.health() });
      queryClient.invalidateQueries({ queryKey: systemKeys.configurations() });
    },
  });
}
