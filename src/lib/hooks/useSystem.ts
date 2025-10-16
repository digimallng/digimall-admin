import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mock system service for now
const systemService = {
  async getSystemStatus() {
    return {
      status: 'operational',
      uptime: 99.9,
      activeServices: 12,
      totalServices: 12,
      responseTime: 250,
      lastUpdate: new Date().toISOString(),
    };
  },

  async getSystemMetrics() {
    return {
      cpu: 25.5,
      memory: 68.2,
      disk: 42.1,
      network: {
        in: 125,
        out: 89,
      },
      requests: {
        total: 15420,
        successful: 15320,
        failed: 100,
      },
    };
  },

  async getSystemLogs(filters?: any) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 50,
    };
  },

  async getSystemServices() {
    return [
      { name: 'auth-service', status: 'healthy', uptime: 99.9, responseTime: 120 },
      { name: 'user-service', status: 'healthy', uptime: 99.8, responseTime: 150 },
      { name: 'product-service', status: 'healthy', uptime: 99.7, responseTime: 180 },
      { name: 'order-service', status: 'healthy', uptime: 99.9, responseTime: 200 },
      { name: 'payment-service', status: 'healthy', uptime: 99.6, responseTime: 300 },
    ];
  },

  async restartService(serviceName: string) {
    // Mock implementation
    return { success: true, message: `${serviceName} restarted successfully` };
  },

  async clearCache() {
    // Mock implementation
    return { success: true, message: 'Cache cleared successfully' };
  },

  async getSystemHealth() {
    return {
      status: 'healthy',
      checks: {
        database: { status: 'healthy', responseTime: 45 },
        redis: { status: 'healthy', responseTime: 2 },
        storage: { status: 'healthy', usage: 45 },
        external_apis: { status: 'healthy', responseTime: 120 },
      },
    };
  },
};

// Query keys
export const systemKeys = {
  all: ['system'] as const,
  status: () => [...systemKeys.all, 'status'] as const,
  metrics: () => [...systemKeys.all, 'metrics'] as const,
  logs: (filters?: any) => [...systemKeys.all, 'logs', filters] as const,
  services: () => [...systemKeys.all, 'services'] as const,
  health: () => [...systemKeys.all, 'health'] as const,
};

// System status hook
export function useSystemStatus() {
  return useQuery({
    queryKey: systemKeys.status(),
    queryFn: () => systemService.getSystemStatus(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 15 * 1000,
  });
}

// System metrics hook
export function useSystemMetrics() {
  return useQuery({
    queryKey: systemKeys.metrics(),
    queryFn: () => systemService.getSystemMetrics(),
    refetchInterval: 60 * 1000, // Refetch every minute
    staleTime: 30 * 1000,
  });
}

// System logs hook
export function useSystemLogs(filters?: any) {
  return useQuery({
    queryKey: systemKeys.logs(filters),
    queryFn: () => systemService.getSystemLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// System services hook
export function useSystemServices() {
  return useQuery({
    queryKey: systemKeys.services(),
    queryFn: () => systemService.getSystemServices(),
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}

// System health hook
export function useSystemHealth() {
  return useQuery({
    queryKey: systemKeys.health(),
    queryFn: () => systemService.getSystemHealth(),
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}

// Combined system overview hook
export function useSystemOverview() {
  const status = useSystemStatus();
  const metrics = useSystemMetrics();
  const health = useSystemHealth();
  const services = useSystemServices();

  return {
    status: status.data,
    metrics: metrics.data,
    health: health.data,
    services: services.data,
    isLoading: status.isLoading || metrics.isLoading || health.isLoading || services.isLoading,
    error: status.error || metrics.error || health.error || services.error,
    refetch: () => {
      status.refetch();
      metrics.refetch();
      health.refetch();
      services.refetch();
    },
  };
}

// Mutations
export function useRestartService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceName: string) => systemService.restartService(serviceName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: systemKeys.services() });
      queryClient.invalidateQueries({ queryKey: systemKeys.status() });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(`Failed to restart service: ${error.message}`);
    },
  });
}

export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => systemService.clearCache(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: systemKeys.metrics() });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(`Failed to clear cache: ${error.message}`);
    },
  });
}

// Aliases for backward compatibility
export const useQueueStatus = useSystemServices;
export const useSystemStatusSummary = useSystemStatus;