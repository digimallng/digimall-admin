import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { settingsService } from '../api/services/settings.service';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  platform: () => [...settingsKeys.all, 'platform'] as const,
  category: (category: string) => [...settingsKeys.all, 'category', category] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  services: () => [...settingsKeys.all, 'services'] as const,
  system: () => [...settingsKeys.all, 'system'] as const,
  backups: () => [...settingsKeys.all, 'backups'] as const,
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

// Test notification service
export function useTestNotificationService() {
  return useMutation({
    mutationFn: ({ serviceId, testData }: { serviceId: string; testData?: any }) =>
      settingsService.testNotificationService(serviceId),
  });
}

// Restart notification service
export function useRestartNotificationService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => settingsService.restartNotificationService(serviceId),
    onSuccess: () => {
      // Invalidate services to refresh status
      queryClient.invalidateQueries({ queryKey: settingsKeys.services() });
    },
  });
}

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

// Backup system data
export function useBackupSystem() {
  return useMutation({
    mutationFn: async (params: {
      type: 'full' | 'database' | 'files' | 'configuration';
      schedule?: boolean;
      retention?: number;
    }) => {
      // Mock implementation - replace with actual API call
      return {
        backupId: `backup_${Date.now()}`,
        type: params.type,
        status: 'started',
        estimatedSize: Math.floor(Math.random() * 5000) + 1000, // MB
        estimatedTime: Math.floor(Math.random() * 30) + 5, // minutes
      };
    },
  });
}

// Get backup status
export function useBackupStatus(backupId: string | null) {
  return useQuery({
    queryKey: [...settingsKeys.backups(), backupId],
    queryFn: async () => {
      if (!backupId) return null;

      // Mock implementation - replace with actual API call
      const statuses = ['in_progress', 'completed', 'failed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: backupId,
        status,
        progress: status === 'in_progress' ? Math.floor(Math.random() * 100) : 100,
        size: Math.floor(Math.random() * 5000) + 1000, // MB
        downloadUrl: status === 'completed' ? `https://api.digimall.ng/backups/${backupId}` : null,
        error: status === 'failed' ? 'Backup failed due to insufficient storage' : null,
      };
    },
    enabled: !!backupId,
    refetchInterval: (data) => {
      // Only refetch if still in progress
      return data?.status === 'in_progress' ? 2000 : false;
    },
  });
}