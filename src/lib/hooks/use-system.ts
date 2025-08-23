import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { systemService } from '@/lib/api/services/system.service';
import { useToast } from '@/hooks/use-notifications';

// Query keys
export const systemKeys = {
  all: ['system'] as const,
  settings: () => [...systemKeys.all, 'settings'] as const,
  setting: (key: string) => [...systemKeys.all, 'setting', key] as const,
  health: () => [...systemKeys.all, 'health'] as const,
  metrics: () => [...systemKeys.all, 'metrics'] as const,
  logs: () => [...systemKeys.all, 'logs'] as const,
  integrations: () => [...systemKeys.all, 'integrations'] as const,
  integration: (id: string) => [...systemKeys.all, 'integration', id] as const,
  backups: () => [...systemKeys.all, 'backups'] as const,
  backup: (id: string) => [...systemKeys.all, 'backup', id] as const,
  maintenance: () => [...systemKeys.all, 'maintenance'] as const,
  cache: () => [...systemKeys.all, 'cache'] as const,
  queues: () => [...systemKeys.all, 'queues'] as const,
  queue: (name: string) => [...systemKeys.all, 'queue', name] as const,
  jobs: () => [...systemKeys.all, 'jobs'] as const,
  job: (id: string) => [...systemKeys.all, 'job', id] as const,
  performance: () => [...systemKeys.all, 'performance'] as const,
  updates: () => [...systemKeys.all, 'updates'] as const,
  features: () => [...systemKeys.all, 'features'] as const,
  errors: () => [...systemKeys.all, 'errors'] as const,
  configuration: () => [...systemKeys.all, 'configuration'] as const,
} as const;

// ===== REAL SYSTEM API HOOKS =====

// System Configuration Hooks
export function useSystemConfig() {
  return useQuery({
    queryKey: ['system', 'config'],
    queryFn: () => systemService.getSystemConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (config: any) => systemService.updateSystemConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'config'] });
      toast({
        title: 'Configuration Updated',
        description: 'System configuration has been successfully updated.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update system configuration.',
        type: 'error',
      });
    },
  });
}

// System Status and Health Hooks
export function useSystemStatus() {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: () => systemService.getSystemStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15 * 1000, // Consider stale after 15 seconds
    retry: 3,
  });
}

export function useSystemMetricsReal() {
  return useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: () => systemService.getSystemMetrics(),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30 * 1000, // Consider stale after 30 seconds
    retry: 3,
  });
}

// Health Check Hooks
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health', 'check'],
    queryFn: () => systemService.getHealthCheck(),
    refetchInterval: 30000,
    retry: 3,
  });
}

export function useReadinessCheck() {
  return useQuery({
    queryKey: ['health', 'readiness'],
    queryFn: () => systemService.getReadinessCheck(),
    refetchInterval: 30000,
    retry: 3,
  });
}

export function useLivenessCheck() {
  return useQuery({
    queryKey: ['health', 'liveness'],
    queryFn: () => systemService.getLivenessCheck(),
    refetchInterval: 30000,
    retry: 3,
  });
}

export function useDetailedHealth() {
  return useQuery({
    queryKey: ['health', 'detailed'],
    queryFn: () => systemService.getDetailedHealth(),
    refetchInterval: 60000,
    retry: 3,
  });
}

export function useDatabaseHealth() {
  return useQuery({
    queryKey: ['health', 'database'],
    queryFn: () => systemService.getDatabaseHealth(),
    refetchInterval: 60000,
    retry: 3,
  });
}

// Maintenance Mode Hooks
export function useMaintenanceMode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleMutation = useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) =>
      systemService.toggleMaintenanceMode(enabled, message),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system', 'config'] });
      toast({
        title: data.maintenance.enabled ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        description: data.maintenance.enabled 
          ? 'The system is now in maintenance mode.' 
          : 'The system is back online.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Operation Failed',
        description: error.message || 'Failed to toggle maintenance mode.',
        type: 'error',
      });
    },
  });

  return {
    toggleMaintenanceMode: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    error: toggleMutation.error,
  };
}

// Cache Management Hooks
export function useClearCacheReal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => systemService.clearCache(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system'] });
      toast({
        title: 'Cache Cleared Successfully',
        description: data.message || 'System cache has been cleared.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Cache Clear Failed',
        description: error.message || 'Failed to clear system cache.',
        type: 'error',
      });
    },
  });
}

// Backup Management Hooks
export function useTriggerBackupReal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => systemService.triggerBackup(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system'] });
      toast({
        title: 'Backup Initiated',
        description: `${data.backup.id} has been started and will complete in approximately ${data.backup.estimatedTime}.`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Backup Failed',
        description: error.message || 'Failed to initiate backup.',
        type: 'error',
      });
    },
  });
}

// System Logs Hooks
export function useSystemLogsReal(limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ['system', 'logs', { limit, offset }],
    queryFn: () => systemService.getSystemLogs(limit, offset),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
}

// S3 Status Hooks
export function useS3Status() {
  return useQuery({
    queryKey: ['system', 's3', 'status'],
    queryFn: () => systemService.getS3Status(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useTestS3Connection() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => systemService.testS3Connection(),
    onSuccess: (data) => {
      toast({
        title: 'S3 Connection Test',
        description: data.success ? 'S3 connection successful' : 'S3 connection failed',
        type: data.success ? 'success' : 'error',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'S3 Connection Test Failed',
        description: error.message || 'Failed to test S3 connection.',
        type: 'error',
      });
    },
  });
}

// Combined System Overview Hook
export function useSystemOverview() {
  const config = useSystemConfig();
  const status = useSystemStatus();
  const metrics = useSystemMetricsReal();
  const health = useHealthCheck();

  return {
    config: config.data,
    status: status.data,
    metrics: metrics.data,
    health: health.data,
    isLoading: config.isLoading || status.isLoading || metrics.isLoading || health.isLoading,
    hasError: config.error || status.error || metrics.error || health.error,
    refetch: () => {
      config.refetch();
      status.refetch();
      metrics.refetch();
      health.refetch();
    },
  };
}

// System Real-time Monitoring Hook
export function useSystemMonitoring(options?: {
  enableRealTime?: boolean;
  refetchInterval?: number;
}) {
  const { enableRealTime = true, refetchInterval = 30000 } = options || {};

  const config = useQuery({
    queryKey: ['system', 'config'],
    queryFn: () => systemService.getSystemConfig(),
    refetchInterval: enableRealTime ? refetchInterval * 2 : false,
    staleTime: 60000,
  });

  const status = useQuery({
    queryKey: ['system', 'status'],
    queryFn: () => systemService.getSystemStatus(),
    refetchInterval: enableRealTime ? refetchInterval : false,
    staleTime: 15000,
  });

  const metrics = useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: () => systemService.getSystemMetrics(),
    refetchInterval: enableRealTime ? refetchInterval : false,
    staleTime: 30000,
  });

  const health = useQuery({
    queryKey: ['health', 'check'],
    queryFn: () => systemService.getHealthCheck(),
    refetchInterval: enableRealTime ? refetchInterval : false,
    staleTime: 20000,
  });

  const overallHealth = () => {
    if (!status.data || !health.data) return 0;
    
    let healthScore = 0;
    if (status.data.status === 'operational') healthScore += 25;
    if (health.data.status === 'ok') healthScore += 25;
    
    // Add metrics-based health scoring
    if (metrics.data) {
      const errorRate = metrics.data.requests?.failed / (metrics.data.requests?.total || 1);
      if (errorRate < 0.01) healthScore += 25; // Less than 1% error rate
      else if (errorRate < 0.05) healthScore += 15; // Less than 5% error rate
      else if (errorRate < 0.1) healthScore += 10; // Less than 10% error rate
      
      const cacheHitRate = metrics.data.cache?.hitRate || 0;
      if (cacheHitRate > 0.9) healthScore += 25; // Greater than 90% cache hit rate
      else if (cacheHitRate > 0.8) healthScore += 15; // Greater than 80% cache hit rate
      else if (cacheHitRate > 0.7) healthScore += 10; // Greater than 70% cache hit rate
    }

    return Math.min(100, healthScore);
  };

  const getSystemAlerts = () => {
    const alerts: Array<{
      level: 'info' | 'warning' | 'error';
      message: string;
      timestamp: string;
    }> = [];

    if (status.data?.status !== 'operational') {
      alerts.push({
        level: 'error',
        message: 'System is not operational',
        timestamp: new Date().toISOString(),
      });
    }

    if (health.data?.status !== 'ok') {
      alerts.push({
        level: 'error',
        message: 'Health check failing',
        timestamp: new Date().toISOString(),
      });
    }

    if (metrics.data) {
      const errorRate = metrics.data.requests?.failed / (metrics.data.requests?.total || 1);
      if (errorRate > 0.1) {
        alerts.push({
          level: 'error',
          message: `High error rate: ${(errorRate * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        });
      } else if (errorRate > 0.05) {
        alerts.push({
          level: 'warning',
          message: `Elevated error rate: ${(errorRate * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        });
      }

      const cacheHitRate = metrics.data.cache?.hitRate || 0;
      if (cacheHitRate < 0.7) {
        alerts.push({
          level: 'warning',
          message: `Low cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return alerts;
  };

  return {
    config: config.data,
    status: status.data,
    metrics: metrics.data,
    health: health.data,
    isLoading: config.isLoading || status.isLoading || metrics.isLoading || health.isLoading,
    hasError: !!(config.error || status.error || metrics.error || health.error),
    overallHealth: overallHealth(),
    alerts: getSystemAlerts(),
    refetch: () => {
      config.refetch();
      status.refetch();
      metrics.refetch();
      health.refetch();
    },
  };
}

// ===== LEGACY QUERY HOOKS =====

// Get system settings
export function useSystemSettings(
  category?: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: systemKeys.settings(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        general: {
          siteName: 'digiMall Admin',
          siteUrl: 'https://admin.digimall.ng',
          contactEmail: 'admin@digimall.ng',
          supportEmail: 'support@digimall.ng',
          timezone: 'Africa/Lagos',
          currency: 'NGN',
          language: 'en',
          maintenanceMode: false,
          registrationEnabled: true,
          emailVerificationRequired: true,
          phoneVerificationRequired: false
        },
        security: {
          sessionTimeout: 24, // hours
          maxLoginAttempts: 5,
          lockoutDuration: 30, // minutes
          passwordMinLength: 8,
          passwordRequireSpecialChars: true,
          twoFactorAuthEnabled: true,
          twoFactorAuthRequired: false,
          ipWhitelistEnabled: false,
          rateLimitEnabled: true,
          rateLimitRequests: 100,
          rateLimitWindow: 15 // minutes
        },
        email: {
          provider: 'sendgrid',
          fromName: 'digiMall Team',
          fromEmail: 'noreply@digimall.ng',
          smtpHost: 'smtp.sendgrid.net',
          smtpPort: 587,
          smtpSecure: true,
          templatesEnabled: true,
          deliveryEnabled: true
        },
        sms: {
          provider: 'twilio',
          defaultCountryCode: '+234',
          deliveryEnabled: true,
          marketingEnabled: false
        },
        storage: {
          provider: 's3',
          bucket: 'digimall-uploads',
          region: 'us-east-1',
          maxFileSize: 50, // MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          cdnEnabled: true,
          cdnUrl: 'https://cdn.digimall.ng'
        },
        payments: {
          paystackEnabled: true,
          paystackPublicKey: 'pk_test_...',
          walletEnabled: true,
          cryptoEnabled: false,
          escrowEnabled: true,
          commissionRate: 5.0, // percentage
          minimumPayout: 10000 // NGN
        },
        analytics: {
          googleAnalyticsEnabled: true,
          googleAnalyticsId: 'GA-XXXXXXXX',
          trackingEnabled: true,
          heatmapsEnabled: false,
          userSessionRecording: false
        },
        integrations: {
          slackWebhook: 'https://hooks.slack.com/...',
          discordWebhook: null,
          telegramBotToken: null,
          whatsappApiKey: null
        },
        features: {
          bargainingEnabled: true,
          reviewsEnabled: true,
          wishlistEnabled: true,
          comparisonsEnabled: true,
          recommendationsEnabled: true,
          advancedSearchEnabled: true,
          vendorChatEnabled: true,
          multiLanguageEnabled: false,
          darkModeEnabled: true,
          betaFeaturesEnabled: false
        }
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Get system health
export function useSystemHealth(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: systemKeys.health(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        status: 'healthy',
        uptime: 2592000, // seconds (30 days)
        version: '2.1.0',
        environment: 'production',
        lastRestart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        services: {
          database: {
            status: 'healthy',
            responseTime: 12, // ms
            connections: 45,
            maxConnections: 100,
            lastCheck: new Date(Date.now() - 30 * 1000).toISOString()
          },
          redis: {
            status: 'healthy',
            responseTime: 2, // ms
            memory: '256MB',
            memoryUsage: 45, // percentage
            lastCheck: new Date(Date.now() - 30 * 1000).toISOString()
          },
          queue: {
            status: 'healthy',
            pendingJobs: 12,
            processingJobs: 3,
            failedJobs: 2,
            lastCheck: new Date(Date.now() - 30 * 1000).toISOString()
          },
          storage: {
            status: 'healthy',
            usage: '45GB',
            available: '155GB',
            usagePercentage: 22.5,
            lastCheck: new Date(Date.now() - 30 * 1000).toISOString()
          },
          email: {
            status: 'healthy',
            provider: 'sendgrid',
            dailyQuota: 10000,
            dailyUsage: 2345,
            lastCheck: new Date(Date.now() - 30 * 1000).toISOString()
          },
          payments: {
            status: 'healthy',
            provider: 'paystack',
            lastTransaction: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            successRate: 97.8,
            lastCheck: new Date(Date.now() - 30 * 1000).toISOString()
          }
        },
        performance: {
          cpuUsage: 25.4, // percentage
          memoryUsage: 68.2, // percentage
          diskUsage: 42.1, // percentage
          networkIn: '125MB/s',
          networkOut: '89MB/s',
          responseTime: 245, // ms
          requestsPerMinute: 1234
        },
        alerts: [
          {
            level: 'warning',
            message: 'High memory usage detected',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          },
          {
            level: 'info',
            message: 'Scheduled backup completed successfully',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get system metrics
export function useSystemMetrics(
  timeRange?: 'hour' | 'day' | 'week' | 'month',
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: systemKeys.metrics(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      const points = timeRange === 'hour' ? 60 : timeRange === 'day' ? 24 : timeRange === 'week' ? 7 : 30;
      
      return {
        cpu: Array.from({ length: points }, (_, i) => ({
          timestamp: new Date(Date.now() - (points - i) * (timeRange === 'hour' ? 60 * 1000 : timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
          value: Math.random() * 80 + 10
        })),
        memory: Array.from({ length: points }, (_, i) => ({
          timestamp: new Date(Date.now() - (points - i) * (timeRange === 'hour' ? 60 * 1000 : timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
          value: Math.random() * 60 + 20
        })),
        disk: Array.from({ length: points }, (_, i) => ({
          timestamp: new Date(Date.now() - (points - i) * (timeRange === 'hour' ? 60 * 1000 : timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
          value: Math.random() * 30 + 40
        })),
        network: {
          in: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(Date.now() - (points - i) * (timeRange === 'hour' ? 60 * 1000 : timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
            value: Math.random() * 100 + 50
          })),
          out: Array.from({ length: points }, (_, i) => ({
            timestamp: new Date(Date.now() - (points - i) * (timeRange === 'hour' ? 60 * 1000 : timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
            value: Math.random() * 80 + 30
          }))
        },
        requests: Array.from({ length: points }, (_, i) => ({
          timestamp: new Date(Date.now() - (points - i) * (timeRange === 'hour' ? 60 * 1000 : timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
          value: Math.floor(Math.random() * 1000) + 500
        })),
        errors: Array.from({ length: points }, (_, i) => ({
          timestamp: new Date(Date.now() - (points - i) * (timeRange === 'hour' ? 60 * 1000 : timeRange === 'day' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
          value: Math.floor(Math.random() * 20)
        }))
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}

// Get queue status
export function useQueueStatus(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: systemKeys.queues(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        summary: {
          totalQueues: 8,
          totalJobs: 1245,
          activeJobs: 23,
          completedJobs: 1134,
          failedJobs: 88,
          delayedJobs: 15
        },
        queues: [
          {
            name: 'email',
            displayName: 'Email Processing',
            active: 5,
            waiting: 12,
            completed: 8934,
            failed: 23,
            delayed: 3,
            paused: false,
            processingRate: 45.2, // jobs per minute
            throughput: 156 // jobs per hour
          },
          {
            name: 'notifications',
            displayName: 'Push Notifications',
            active: 8,
            waiting: 34,
            completed: 12456,
            failed: 12,
            delayed: 7,
            paused: false,
            processingRate: 89.1,
            throughput: 2340
          },
          {
            name: 'image-processing',
            displayName: 'Image Processing',
            active: 3,
            waiting: 6,
            completed: 2345,
            failed: 45,
            delayed: 2,
            paused: false,
            processingRate: 12.5,
            throughput: 67
          },
          {
            name: 'analytics',
            displayName: 'Analytics Processing',
            active: 2,
            waiting: 8,
            completed: 5678,
            failed: 5,
            delayed: 1,
            paused: false,
            processingRate: 23.8,
            throughput: 134
          },
          {
            name: 'payments',
            displayName: 'Payment Processing',
            active: 4,
            waiting: 2,
            completed: 9876,
            failed: 2,
            delayed: 1,
            paused: false,
            processingRate: 67.4,
            throughput: 890
          },
          {
            name: 'reports',
            displayName: 'Report Generation',
            active: 1,
            waiting: 15,
            completed: 1234,
            failed: 8,
            delayed: 12,
            paused: false,
            processingRate: 5.2,
            throughput: 23
          }
        ]
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get system logs
export function useSystemLogs(
  filters?: {
    level?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    service?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: systemKeys.logs(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        data: Array.from({ length: filters?.limit || 50 }, (_, i) => ({
          id: `log-${i}`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          level: ['debug', 'info', 'warn', 'error', 'fatal'][Math.floor(Math.random() * 5)],
          service: ['auth', 'products', 'orders', 'payments', 'notifications', 'system'][Math.floor(Math.random() * 6)],
          message: [
            'User authentication successful',
            'Database connection established',
            'Payment processing completed',
            'Email notification sent',
            'API rate limit exceeded',
            'System backup completed',
            'Error processing order',
            'Cache invalidation triggered'
          ][Math.floor(Math.random() * 8)],
          metadata: {
            userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
            requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration: Math.floor(Math.random() * 1000) + 10,
            statusCode: [200, 201, 400, 401, 404, 500][Math.floor(Math.random() * 6)]
          },
          stack: Math.random() > 0.8 ? 'Error stack trace...' : undefined
        })),
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 50,
          total: 12456,
          totalPages: 249
        }
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

// Get integrations status
export function useIntegrationsStatus(
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: systemKeys.integrations(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        {
          id: 'paystack',
          name: 'Paystack',
          type: 'payment',
          status: 'connected',
          lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          health: 'healthy',
          config: {
            publicKey: 'pk_test_...',
            webhookUrl: 'https://api.digimall.ng/webhooks/paystack',
            environment: 'live'
          },
          metrics: {
            requestsToday: 1234,
            successRate: 98.5,
            averageResponseTime: 245
          }
        },
        {
          id: 'sendgrid',
          name: 'SendGrid',
          type: 'email',
          status: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          health: 'healthy',
          config: {
            apiKey: 'SG.xxx...',
            fromEmail: 'noreply@digimall.ng',
            templatesEnabled: true
          },
          metrics: {
            emailsSentToday: 2456,
            deliveryRate: 97.2,
            bounceRate: 1.8
          }
        },
        {
          id: 'twilio',
          name: 'Twilio SMS',
          type: 'sms',
          status: 'connected',
          lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          health: 'healthy',
          config: {
            accountSid: 'ACxxx...',
            fromNumber: '+1234567890'
          },
          metrics: {
            smsSentToday: 456,
            deliveryRate: 96.8,
            failureRate: 3.2
          }
        },
        {
          id: 's3',
          name: 'AWS S3',
          type: 'storage',
          status: 'connected',
          lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          health: 'healthy',
          config: {
            bucket: 'digimall-uploads',
            region: 'us-east-1',
            cdnEnabled: true
          },
          metrics: {
            filesUploaded: 123,
            totalStorage: '125GB',
            bandwidth: '45GB'
          }
        },
        {
          id: 'slack',
          name: 'Slack',
          type: 'notification',
          status: 'connected',
          lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          health: 'healthy',
          config: {
            webhookUrl: 'https://hooks.slack.com/...',
            channel: '#alerts'
          },
          metrics: {
            messagesSent: 67,
            lastAlert: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          }
        }
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Update system settings
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category, settings }: { category: string; settings: any }) =>
      api.system.updateSettings(category, settings),
    onSuccess: () => {
      // Invalidate system settings
      queryClient.invalidateQueries({ queryKey: systemKeys.settings() });
    },
  });
}

// Toggle maintenance mode
export function useToggleMaintenanceMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enabled, message }: { enabled: boolean; message?: string }) =>
      api.system.toggleMaintenance({ enabled, message }),
    onSuccess: () => {
      // Invalidate system settings
      queryClient.invalidateQueries({ queryKey: systemKeys.settings() });
      
      // Invalidate system health
      queryClient.invalidateQueries({ queryKey: systemKeys.health() });
    },
  });
}

// Clear cache
export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cacheType }: { cacheType?: 'all' | 'redis' | 'application' | 'cdn' }) =>
      api.system.clearCache({ cacheType }),
    onSuccess: () => {
      // Invalidate cache-related queries
      queryClient.invalidateQueries({ queryKey: systemKeys.cache() });
      
      // Invalidate system health
      queryClient.invalidateQueries({ queryKey: systemKeys.health() });
    },
  });
}

// Restart service
export function useRestartService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceName }: { serviceName: string }) =>
      api.system.restartService(serviceName),
    onSuccess: () => {
      // Invalidate system health
      queryClient.invalidateQueries({ queryKey: systemKeys.health() });
      
      // Invalidate queue status
      queryClient.invalidateQueries({ queryKey: systemKeys.queues() });
    },
  });
}

// Create backup
export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, description }: { 
      type: 'full' | 'database' | 'files' | 'configuration';
      description?: string;
    }) => api.system.createBackup({ type, description }),
    onSuccess: () => {
      // Invalidate backups
      queryClient.invalidateQueries({ queryKey: systemKeys.backups() });
    },
  });
}

// Restore backup
export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ backupId, confirm }: { backupId: string; confirm: boolean }) =>
      api.system.restoreBackup(backupId, { confirm }),
    onSuccess: () => {
      // Invalidate all queries after restore
      queryClient.invalidateQueries();
    },
  });
}

// Update integration
export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ integrationId, config }: { integrationId: string; config: any }) =>
      api.integrations.update(integrationId, config),
    onSuccess: () => {
      // Invalidate integrations
      queryClient.invalidateQueries({ queryKey: systemKeys.integrations() });
    },
  });
}

// Test integration
export function useTestIntegration() {
  return useMutation({
    mutationFn: ({ integrationId }: { integrationId: string }) =>
      api.integrations.test(integrationId),
  });
}

// Retry failed jobs
export function useRetryFailedJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueName, jobIds }: { queueName: string; jobIds?: string[] }) =>
      api.queues.retryJobs(queueName, { jobIds }),
    onSuccess: () => {
      // Invalidate queue status
      queryClient.invalidateQueries({ queryKey: systemKeys.queues() });
    },
  });
}

// Pause/resume queue
export function useToggleQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueName, paused }: { queueName: string; paused: boolean }) =>
      api.queues.toggle(queueName, { paused }),
    onSuccess: () => {
      // Invalidate queue status
      queryClient.invalidateQueries({ queryKey: systemKeys.queues() });
    },
  });
}

// Export system data
export function useExportSystemData() {
  return useMutation({
    mutationFn: (data: {
      type: 'logs' | 'metrics' | 'configuration' | 'backup';
      format: 'json' | 'csv' | 'xlsx';
      startDate?: string;
      endDate?: string;
      filters?: any;
    }) => api.system.export(data),
  });
}

// ===== UTILITY HOOKS =====

// Get system status summary
export function useSystemStatusSummary(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...systemKeys.all, 'status-summary'],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        overall: 'healthy',
        services: {
          total: 12,
          healthy: 11,
          warning: 1,
          critical: 0
        },
        performance: {
          responseTime: 245,
          throughput: 1234,
          errorRate: 0.5
        },
        resources: {
          cpu: 25.4,
          memory: 68.2,
          disk: 42.1
        },
        alerts: {
          critical: 0,
          warning: 2,
          info: 5
        }
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}