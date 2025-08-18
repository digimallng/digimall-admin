import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';

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
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      const mockConfigs: PlatformConfig[] = [
        // General Settings
        {
          id: '1',
          key: 'platform_name',
          label: 'Platform Name',
          value: 'digiMall',
          type: 'string',
          category: 'general',
          description: 'The name of your e-commerce platform',
          required: true,
          editable: true,
        },
        {
          id: '2',
          key: 'platform_description',
          label: 'Platform Description',
          value: \"Nigeria's leading multi-vendor e-commerce platform\",
          type: 'textarea',
          category: 'general',
          description: 'Brief description of your platform',
          required: true,
          editable: true,
        },
        {
          id: '3',
          key: 'default_currency',
          label: 'Default Currency',
          value: 'NGN',
          type: 'select',
          category: 'general',
          options: ['NGN', 'USD', 'EUR', 'GBP'],
          description: 'Default currency for transactions',
          required: true,
          editable: true,
        },
        {
          id: '4',
          key: 'platform_timezone',
          label: 'Platform Timezone',
          value: 'Africa/Lagos',
          type: 'select',
          category: 'general',
          options: ['Africa/Lagos', 'UTC', 'America/New_York', 'Europe/London'],
          description: 'Default timezone for the platform',
          required: true,
          editable: true,
        },
        {
          id: '5',
          key: 'maintenance_mode',
          label: 'Maintenance Mode',
          value: false,
          type: 'boolean',
          category: 'general',
          description: 'Enable maintenance mode to restrict access',
          required: false,
          editable: true,
        },
        // Commission Settings
        {
          id: '6',
          key: 'default_commission_rate',
          label: 'Default Commission Rate',
          value: 5.0,
          type: 'number',
          category: 'commission',
          description: 'Default commission rate percentage for new vendors',
          required: true,
          editable: true,
        },
        {
          id: '7',
          key: 'minimum_payout_amount',
          label: 'Minimum Payout Amount',
          value: 10000,
          type: 'number',
          category: 'commission',
          description: 'Minimum amount required for vendor payouts',
          required: true,
          editable: true,
        },
        {
          id: '8',
          key: 'payout_schedule',
          label: 'Payout Schedule',
          value: 'weekly',
          type: 'select',
          category: 'commission',
          options: ['daily', 'weekly', 'monthly'],
          description: 'How often to process vendor payouts',
          required: true,
          editable: true,
        },
        // Security Settings
        {
          id: '9',
          key: 'two_factor_required',
          label: 'Require Two-Factor Authentication',
          value: true,
          type: 'boolean',
          category: 'security',
          description: 'Require 2FA for all admin accounts',
          required: false,
          editable: true,
        },
        {
          id: '10',
          key: 'session_timeout',
          label: 'Session Timeout (minutes)',
          value: 30,
          type: 'number',
          category: 'security',
          description: 'Auto-logout users after inactivity',
          required: true,
          editable: true,
        },
        // Payment Settings
        {
          id: '11',
          key: 'payment_gateway',
          label: 'Primary Payment Gateway',
          value: 'paystack',
          type: 'select',
          category: 'payments',
          options: ['paystack', 'flutterwave', 'interswitch'],
          description: 'Primary payment gateway for transactions',
          required: true,
          editable: true,
        },
        {
          id: '12',
          key: 'transaction_fee',
          label: 'Transaction Fee (%)',
          value: 2.5,
          type: 'number',
          category: 'payments',
          description: 'Platform transaction fee percentage',
          required: true,
          editable: true,
        },
        // Notification Settings
        {
          id: '13',
          key: 'email_notifications',
          label: 'Email Notifications',
          value: true,
          type: 'boolean',
          category: 'notifications',
          description: 'Enable email notifications',
          required: false,
          editable: true,
        },
        {
          id: '14',
          key: 'sms_notifications',
          label: 'SMS Notifications',
          value: false,
          type: 'boolean',
          category: 'notifications',
          description: 'Enable SMS notifications',
          required: false,
          editable: true,
        },
        // Vendor Settings
        {
          id: '15',
          key: 'vendor_approval_required',
          label: 'Vendor Approval Required',
          value: true,
          type: 'boolean',
          category: 'vendor',
          description: 'Require admin approval for new vendors',
          required: false,
          editable: true,
        },
        {
          id: '16',
          key: 'max_products_per_vendor',
          label: 'Max Products per Vendor',
          value: 1000,
          type: 'number',
          category: 'vendor',
          description: 'Maximum number of products per vendor',
          required: true,
          editable: true,
        },
        // Shipping Settings
        {
          id: '17',
          key: 'free_shipping_threshold',
          label: 'Free Shipping Threshold',
          value: 25000,
          type: 'number',
          category: 'shipping',
          description: 'Minimum order amount for free shipping',
          required: true,
          editable: true,
        },
        {
          id: '18',
          key: 'default_shipping_rate',
          label: 'Default Shipping Rate',
          value: 2500,
          type: 'number',
          category: 'shipping',
          description: 'Default shipping rate for orders',
          required: true,
          editable: true,
        },
      ];

      return category ? mockConfigs.filter(config => config.category === category) : mockConfigs;
    },
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
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        {
          id: '1',
          type: 'maintenance',
          title: 'Scheduled Maintenance',
          message: 'Platform will be under maintenance from 2:00 AM to 4:00 AM WAT',
          active: true,
          priority: 'high',
          targetUsers: 'all',
          startDate: new Date('2024-02-20T02:00:00'),
          endDate: new Date('2024-02-20T04:00:00'),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          type: 'feature',
          title: 'New Feature: Advanced Analytics',
          message: 'New advanced analytics dashboard is now available for all vendors',
          active: true,
          priority: 'medium',
          targetUsers: 'vendors',
          startDate: new Date(),
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          id: '3',
          type: 'security',
          title: 'Security Update',
          message: 'Enhanced security measures have been implemented. Please update your passwords.',
          active: false,
          priority: 'high',
          targetUsers: 'all',
          startDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        },
      ];
    },
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
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        {
          id: 'email-service',
          name: 'Email Service',
          type: 'email',
          status: 'healthy',
          uptime: 99.8,
          lastCheck: new Date(Date.now() - 30000), // 30 seconds ago
          responseTime: 120,
          version: '1.0.0',
          queues: {
            waiting: 45,
            active: 12,
            completed: 1234,
            failed: 8,
            delayed: 3,
            paused: 0,
          },
          stats: {
            sent24h: 1876,
            failed24h: 23,
            successRate: 98.7,
          },
          config: {
            provider: 'SendGrid',
            endpoint: 'https://api.sendgrid.com/v3/mail/send',
            rateLimit: 1000,
          },
        },
        {
          id: 'sms-service',
          name: 'SMS Service',
          type: 'sms',
          status: 'healthy',
          uptime: 99.5,
          lastCheck: new Date(Date.now() - 15000), // 15 seconds ago
          responseTime: 250,
          version: '1.2.1',
          queues: {
            waiting: 23,
            active: 5,
            completed: 567,
            failed: 12,
            delayed: 1,
            paused: 0,
          },
          stats: {
            sent24h: 456,
            failed24h: 8,
            successRate: 98.2,
          },
          config: {
            provider: 'Twilio',
            endpoint: 'https://api.twilio.com/2010-04-01/Accounts',
            rateLimit: 500,
          },
        },
        {
          id: 'push-service',
          name: 'Push Notifications',
          type: 'push',
          status: 'degraded',
          uptime: 97.2,
          lastCheck: new Date(Date.now() - 60000), // 1 minute ago
          responseTime: 450,
          version: '2.0.0',
          queues: {
            waiting: 89,
            active: 3,
            completed: 2345,
            failed: 45,
            delayed: 12,
            paused: 2,
          },
          stats: {
            sent24h: 3456,
            failed24h: 78,
            successRate: 97.7,
          },
          config: {
            provider: 'Firebase',
            endpoint: 'https://fcm.googleapis.com/fcm/send',
            rateLimit: 2000,
          },
        },
        {
          id: 'webhook-service',
          name: 'Webhook Service',
          type: 'webhook',
          status: 'healthy',
          uptime: 99.9,
          lastCheck: new Date(Date.now() - 10000), // 10 seconds ago
          responseTime: 95,
          version: '1.1.0',
          queues: {
            waiting: 12,
            active: 8,
            completed: 789,
            failed: 3,
            delayed: 0,
            paused: 0,
          },
          stats: {
            sent24h: 234,
            failed24h: 2,
            successRate: 99.1,
          },
          config: {
            provider: 'Internal',
            endpoint: 'https://api.digimall.ng/webhooks',
            rateLimit: 1500,
          },
        },
      ];
    },
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
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        overall: 'operational',
        uptime: 99.97,
        lastRestart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        version: '2.1.0',
        environment: 'production',
        services: {
          api: { status: 'healthy', responseTime: 85 },
          database: { status: 'healthy', responseTime: 12 },
          cache: { status: 'healthy', responseTime: 3 },
          storage: { status: 'healthy', responseTime: 45 },
          search: { status: 'healthy', responseTime: 25 },
        },
        resources: {
          cpu: { usage: 45, limit: 80 },
          memory: { usage: 68, limit: 85 },
          disk: { usage: 23, limit: 80 },
          network: { inbound: 125, outbound: 89 },
        },
        metrics: {
          requestsPerSecond: 156,
          activeUsers: 2456,
          queuedJobs: 89,
          errors24h: 12,
        },
      };
    },
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
    mutationFn: async ({ id, value }: { id: string; value: string | number | boolean }) => {
      // Mock implementation - replace with actual API call
      return { id, value, updatedAt: new Date().toISOString() };
    },
    onSuccess: (_, variables) => {
      // Update the cache
      queryClient.setQueryData(
        settingsKeys.platform(),
        (oldData: PlatformConfig[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(config =>
            config.id === variables.id
              ? { ...config, value: variables.value }
              : config
          );
        }
      );
    },
  });
}

// Create system notification
export function useCreateSystemNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: Omit<SystemNotification, 'id' | 'createdAt'>) => {
      // Mock implementation - replace with actual API call
      return {
        id: `notification_${Date.now()}`,
        ...notification,
        createdAt: new Date(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}

// Update system notification
export function useUpdateSystemNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Omit<SystemNotification, 'id' | 'createdAt'>> 
    }) => {
      // Mock implementation - replace with actual API call
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}

// Test notification service
export function useTestNotificationService() {
  return useMutation({
    mutationFn: async ({ serviceId, testData }: { serviceId: string; testData?: any }) => {
      // Mock implementation - replace with actual API call
      return {
        success: Math.random() > 0.2, // 80% success rate
        response: 'Test notification sent successfully',
        responseTime: Math.floor(Math.random() * 500) + 50,
        timestamp: new Date().toISOString(),
      };
    },
  });
}

// Restart notification service
export function useRestartNotificationService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      // Mock implementation - replace with actual API call
      return {
        serviceId,
        status: 'restarting',
        message: 'Service restart initiated',
      };
    },
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
    mutationFn: async ({ enabled, message }: { enabled: boolean; message?: string }) => {
      // Mock implementation - replace with actual API call
      return {
        enabled,
        message,
        scheduledStart: enabled ? new Date() : null,
        updatedAt: new Date().toISOString(),
      };
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