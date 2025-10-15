import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { settingsService } from '../api/services/settings.service';
import { systemService } from '../api/services/system.service';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  platform: () => [...settingsKeys.all, 'platform'] as const,
  category: (category: string) => [...settingsKeys.all, 'category', category] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  services: () => [...settingsKeys.all, 'services'] as const,
  system: () => [...settingsKeys.all, 'system'] as const,
  maintenance: () => [...settingsKeys.all, 'maintenance'] as const,
} as const;

// ===== TYPES =====
export interface PlatformConfig {
  id: string;
  key: string;
  label: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea';
  category: string;
  options?: string[];
  description: string;
  required: boolean;
  editable: boolean;
  encrypted?: boolean;
}

export interface SystemNotification {
  id: string;
  type: 'maintenance' | 'update' | 'security' | 'feature';
  title: string;
  message: string;
  active: boolean;
  priority: 'low' | 'medium' | 'high';
  targetUsers: 'all' | 'vendors' | 'customers';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface NotificationService {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  version: string;
  queues: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
  stats: {
    sent24h: number;
    failed24h: number;
    successRate: number;
  };
  config: {
    provider: string;
    endpoint: string;
    rateLimit: number;
  };
}

// ===== QUERY HOOKS =====

// Get platform configuration
export function usePlatformConfig(
  category?: string,
  options?: Omit<UseQueryOptions<PlatformConfig[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: category ? settingsKeys.category(category) : settingsKeys.platform(),
    queryFn: () => settingsService.getPlatformConfig(category),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Get system notifications
export function useSystemNotifications(
  options?: Omit<UseQueryOptions<SystemNotification[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: () => settingsService.getSystemNotifications(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get notification services status
export function useNotificationServices(
  options?: Omit<UseQueryOptions<NotificationService[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: settingsKeys.services(),
    queryFn: () => settingsService.getNotificationServices(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time status
    ...options,
  });
}

// Get system status and health
export function useSystemStatus(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: settingsKeys.system(),
    queryFn: () => settingsService.getSystemStatus(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get system health
export function useSystemHealth(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...settingsKeys.system(), 'health'] as const,
    queryFn: () => systemService.getHealth(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get system metrics
export function useSystemMetrics(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...settingsKeys.system(), 'metrics'] as const,
    queryFn: () => systemService.getMetrics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get database statistics
export function useDatabaseStats(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...settingsKeys.system(), 'database-stats'] as const,
    queryFn: () => systemService.getDatabaseStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get system logs with filters
export function useSystemLogs(
  params?: { limit?: number; level?: string; service?: string },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...settingsKeys.system(), 'logs', params] as const,
    queryFn: () => systemService.getLogs(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for near real-time logs
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Update platform configuration
export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: string | number | boolean }) =>
      settingsService.updatePlatformConfig(id, value),
    onSuccess: (updatedConfig, variables) => {
      // Update the cache with the real response
      queryClient.setQueryData(
        settingsKeys.platform(),
        (oldData: PlatformConfig[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(config =>
            config.id === variables.id ? updatedConfig : config
          );
        }
      );
      // Also update category-specific cache if exists
      const category = updatedConfig.category;
      if (category) {
        queryClient.setQueryData(
          settingsKeys.category(category),
          (oldData: PlatformConfig[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map(config =>
              config.id === variables.id ? updatedConfig : config
            );
          }
        );
      }
    },
  });
}

// Create system notification
export function useCreateSystemNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notification: Omit<SystemNotification, 'id' | 'createdAt'>) =>
      settingsService.createSystemNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}

// Update system notification
export function useUpdateSystemNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<SystemNotification, 'id' | 'createdAt'>> 
    }) => settingsService.updateSystemNotification(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}

// Test and restart notification service functionality removed - no backend support

// Update system maintenance mode
export function useUpdateMaintenanceMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) => {
      // Use system service for maintenance mode
      if (enabled) {
        return settingsService.enableMaintenanceMode({ message: message || 'Platform under maintenance' });
      } else {
        return settingsService.disableMaintenanceMode();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.platform() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.system() });
    },
  });
}

// Clear system cache
export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => systemService.clearCache(),
    onSuccess: () => {
      // Invalidate all queries to reflect cleared cache
      queryClient.invalidateQueries();
    },
  });
}

// Perform system backup
export function useSystemBackup() {
  return useMutation({
    mutationFn: () => systemService.backup(),
  });
}