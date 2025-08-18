import { apiClient } from '../client';
import type { QueryParams, PaginatedResponse } from '../client';

// ===== TYPES =====

export interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    contactEmail: string;
    supportEmail: string;
    timezone: string;
    currency: string;
    language: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
    phoneVerificationRequired: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    passwordRequireSpecialChars: boolean;
    twoFactorAuthEnabled: boolean;
    twoFactorAuthRequired: boolean;
    ipWhitelistEnabled: boolean;
    rateLimitEnabled: boolean;
    rateLimitRequests: number;
    rateLimitWindow: number;
  };
  email: {
    provider: string;
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    templatesEnabled: boolean;
    deliveryEnabled: boolean;
  };
  sms: {
    provider: string;
    defaultCountryCode: string;
    deliveryEnabled: boolean;
    marketingEnabled: boolean;
  };
  storage: {
    provider: string;
    bucket: string;
    region: string;
    maxFileSize: number;
    allowedTypes: string[];
    cdnEnabled: boolean;
    cdnUrl: string;
  };
  payments: {
    paystackEnabled: boolean;
    paystackPublicKey: string;
    walletEnabled: boolean;
    cryptoEnabled: boolean;
    escrowEnabled: boolean;
    commissionRate: number;
    minimumPayout: number;
  };
  analytics: {
    googleAnalyticsEnabled: boolean;
    googleAnalyticsId: string;
    trackingEnabled: boolean;
    heatmapsEnabled: boolean;
    userSessionRecording: boolean;
  };
  integrations: {
    slackWebhook: string;
    discordWebhook?: string;
    telegramBotToken?: string;
    whatsappApiKey?: string;
  };
  features: {
    bargainingEnabled: boolean;
    reviewsEnabled: boolean;
    wishlistEnabled: boolean;
    comparisonsEnabled: boolean;
    recommendationsEnabled: boolean;
    advancedSearchEnabled: boolean;
    vendorChatEnabled: boolean;
    multiLanguageEnabled: boolean;
    darkModeEnabled: boolean;
    betaFeaturesEnabled: boolean;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  version: string;
  environment: string;
  lastRestart: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    queue: ServiceHealth;
    storage: ServiceHealth;
    email: ServiceHealth;
    payments: ServiceHealth;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIn: string;
    networkOut: string;
    responseTime: number;
    requestsPerMinute: number;
  };
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

export interface ServiceHealth {
  status: 'healthy' | 'warning' | 'critical';
  responseTime?: number;
  connections?: number;
  maxConnections?: number;
  memory?: string;
  memoryUsage?: number;
  pendingJobs?: number;
  processingJobs?: number;
  failedJobs?: number;
  usage?: string;
  available?: string;
  usagePercentage?: number;
  provider?: string;
  dailyQuota?: number;
  dailyUsage?: number;
  lastTransaction?: string;
  successRate?: number;
  lastCheck: string;
}

export interface SystemMetrics {
  cpu: Array<{ timestamp: string; value: number }>;
  memory: Array<{ timestamp: string; value: number }>;
  disk: Array<{ timestamp: string; value: number }>;
  network: {
    in: Array<{ timestamp: string; value: number }>;
    out: Array<{ timestamp: string; value: number }>;
  };
  requests: Array<{ timestamp: string; value: number }>;
  errors: Array<{ timestamp: string; value: number }>;
}

export interface QueueStatus {
  summary: {
    totalQueues: number;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    delayedJobs: number;
  };
  queues: Array<{
    name: string;
    displayName: string;
    active: number;
    waiting: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
    processingRate: number;
    throughput: number;
  }>;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  message: string;
  metadata: {
    userId?: string;
    requestId: string;
    duration: number;
    statusCode: number;
  };
  stack?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  health: 'healthy' | 'warning' | 'critical';
  config: Record<string, any>;
  metrics: Record<string, any>;
}

export interface Backup {
  id: string;
  type: 'full' | 'database' | 'files' | 'configuration';
  status: 'running' | 'completed' | 'failed';
  size: string;
  createdAt: string;
  completedAt?: string;
  description?: string;
  downloadUrl?: string;
  expiresAt?: string;
}

export interface MaintenanceMode {
  enabled: boolean;
  message: string;
  startTime?: string;
  endTime?: string;
  allowedIPs?: string[];
  bypassKey?: string;
}

// ===== SERVICE CLASS =====

export class SystemService {
  // Settings
  async getSystemSettings(category?: string): Promise<SystemSettings> {
    return apiClient.get('/system-settings', category ? { category } : undefined);
  }

  async updateSystemSettings(category: string, settings: any): Promise<SystemSettings> {
    return apiClient.put(`/system-settings/${category}`, settings);
  }

  async getSetting(key: string): Promise<{ key: string; value: any; type: string }> {
    return apiClient.get(`/system-settings/key/${key}`);
  }

  async updateSetting(key: string, value: any): Promise<{ success: boolean }> {
    return apiClient.put(`/system-settings/key/${key}`, { value });
  }

  // Health Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get('/system-monitoring/health');
  }

  async getSystemMetrics(timeRange?: 'hour' | 'day' | 'week' | 'month'): Promise<SystemMetrics> {
    return apiClient.get('/system-monitoring/metrics', { timeRange });
  }

  async getSystemStatusSummary(): Promise<{
    overall: string;
    services: { total: number; healthy: number; warning: number; critical: number };
    performance: { responseTime: number; throughput: number; errorRate: number };
    resources: { cpu: number; memory: number; disk: number };
    alerts: { critical: number; warning: number; info: number };
  }> {
    return apiClient.get('/system-monitoring/status-summary');
  }

  // Queue Management
  async getQueueStatus(): Promise<QueueStatus> {
    return apiClient.get('/system-monitoring/queues');
  }

  async getQueueDetails(queueName: string): Promise<{
    name: string;
    active: number;
    waiting: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
    jobs: Array<{
      id: string;
      name: string;
      data: any;
      progress: number;
      status: string;
      createdAt: string;
      processedAt?: string;
      finishedAt?: string;
      error?: string;
    }>;
  }> {
    return apiClient.get(`/system-monitoring/queues/${queueName}`);
  }

  async retryFailedJobs(queueName: string, jobIds?: string[]): Promise<{ success: boolean }> {
    return apiClient.post(`/system-monitoring/queues/${queueName}/retry`, { jobIds });
  }

  async pauseQueue(queueName: string): Promise<{ success: boolean }> {
    return apiClient.post(`/system-monitoring/queues/${queueName}/pause`);
  }

  async resumeQueue(queueName: string): Promise<{ success: boolean }> {
    return apiClient.post(`/system-monitoring/queues/${queueName}/resume`);
  }

  async clearQueue(queueName: string, status?: 'completed' | 'failed' | 'active' | 'waiting'): Promise<{ success: boolean }> {
    return apiClient.post(`/system-monitoring/queues/${queueName}/clear`, { status });
  }

  // Logs
  async getSystemLogs(params?: QueryParams): Promise<PaginatedResponse<SystemLog>> {
    return apiClient.get('/system-monitoring/logs', params);
  }

  async getLogsByService(serviceName: string, params?: QueryParams): Promise<PaginatedResponse<SystemLog>> {
    return apiClient.get(`/system-monitoring/logs/service/${serviceName}`, params);
  }

  async downloadLogs(params: {
    startDate: string;
    endDate: string;
    level?: string;
    service?: string;
    format: 'json' | 'txt' | 'csv';
  }): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.post('/system-monitoring/logs/download', params);
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    return apiClient.get('/system-integrations');
  }

  async getIntegration(integrationId: string): Promise<Integration> {
    return apiClient.get(`/system-integrations/${integrationId}`);
  }

  async updateIntegration(integrationId: string, config: any): Promise<Integration> {
    return apiClient.put(`/system-integrations/${integrationId}`, config);
  }

  async testIntegration(integrationId: string): Promise<{
    success: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
  }> {
    return apiClient.post(`/system-integrations/${integrationId}/test`);
  }

  async enableIntegration(integrationId: string): Promise<{ success: boolean }> {
    return apiClient.post(`/system-integrations/${integrationId}/enable`);
  }

  async disableIntegration(integrationId: string): Promise<{ success: boolean }> {
    return apiClient.post(`/system-integrations/${integrationId}/disable`);
  }

  // Backups
  async getBackups(): Promise<Backup[]> {
    return apiClient.get('/system-backups');
  }

  async getBackup(backupId: string): Promise<Backup> {
    return apiClient.get(`/system-backups/${backupId}`);
  }

  async createBackup(data: {
    type: 'full' | 'database' | 'files' | 'configuration';
    description?: string;
  }): Promise<{ backupId: string; status: string }> {
    return apiClient.post('/system-backups', data);
  }

  async deleteBackup(backupId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/system-backups/${backupId}`);
  }

  async restoreBackup(backupId: string, options: {
    confirm: boolean;
    restoreDatabase?: boolean;
    restoreFiles?: boolean;
    restoreConfiguration?: boolean;
  }): Promise<{ restoreId: string; status: string }> {
    return apiClient.post(`/system-backups/${backupId}/restore`, options);
  }

  async downloadBackup(backupId: string): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.post(`/system-backups/${backupId}/download`);
  }

  // Maintenance Mode
  async getMaintenanceStatus(): Promise<MaintenanceMode> {
    return apiClient.get('/system-maintenance');
  }

  async enableMaintenanceMode(data: {
    message: string;
    endTime?: string;
    allowedIPs?: string[];
  }): Promise<MaintenanceMode> {
    return apiClient.post('/system-maintenance/enable', data);
  }

  async disableMaintenanceMode(): Promise<{ success: boolean }> {
    return apiClient.post('/system-maintenance/disable');
  }

  async updateMaintenanceMessage(message: string): Promise<{ success: boolean }> {
    return apiClient.put('/system-maintenance/message', { message });
  }

  // Cache Management
  async getCacheStatus(): Promise<{
    redis: { memory: string; keys: number; hitRate: number };
    application: { size: string; entries: number };
    cdn: { enabled: boolean; provider: string; bandwidth: string };
  }> {
    return apiClient.get('/system-cache/status');
  }

  async clearCache(cacheType?: 'all' | 'redis' | 'application' | 'cdn'): Promise<{ success: boolean }> {
    return apiClient.post('/system-cache/clear', { cacheType });
  }

  async flushRedis(): Promise<{ success: boolean }> {
    return apiClient.post('/system-cache/redis/flush');
  }

  async getCacheKeys(pattern?: string): Promise<string[]> {
    return apiClient.get('/system-cache/redis/keys', { pattern });
  }

  async deleteCacheKey(key: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/system-cache/redis/keys/${encodeURIComponent(key)}`);
  }

  // Service Management
  async getServicesStatus(): Promise<Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
    memory: string;
    cpu: number;
    port?: number;
    pid?: number;
  }>> {
    return apiClient.get('/system-services/status');
  }

  async restartService(serviceName: string): Promise<{ success: boolean }> {
    return apiClient.post(`/system-services/${serviceName}/restart`);
  }

  async stopService(serviceName: string): Promise<{ success: boolean }> {
    return apiClient.post(`/system-services/${serviceName}/stop`);
  }

  async startService(serviceName: string): Promise<{ success: boolean }> {
    return apiClient.post(`/system-services/${serviceName}/start`);
  }

  // Configuration Management
  async getConfiguration(): Promise<Record<string, any>> {
    return apiClient.get('/system-configuration');
  }

  async updateConfiguration(config: Record<string, any>): Promise<{ success: boolean }> {
    return apiClient.put('/system-configuration', config);
  }

  async exportConfiguration(): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.post('/system-configuration/export');
  }

  async importConfiguration(file: File): Promise<{ success: boolean; changes: string[] }> {
    return apiClient.uploadFile('/system-configuration/import', file);
  }

  async validateConfiguration(config: Record<string, any>): Promise<{
    valid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
  }> {
    return apiClient.post('/system-configuration/validate', config);
  }

  // Performance Monitoring
  async getPerformanceReport(timeRange: '1h' | '24h' | '7d' | '30d'): Promise<{
    responseTime: { average: number; p50: number; p95: number; p99: number };
    throughput: { rpm: number; rps: number };
    errorRate: { percentage: number; count: number };
    uptime: { percentage: number; incidents: number };
    resources: { cpu: number; memory: number; disk: number };
  }> {
    return apiClient.get('/system-monitoring/performance', { timeRange });
  }

  // Updates and Maintenance
  async checkForUpdates(): Promise<{
    hasUpdates: boolean;
    currentVersion: string;
    latestVersion?: string;
    updates: Array<{
      component: string;
      currentVersion: string;
      latestVersion: string;
      type: 'security' | 'feature' | 'bugfix';
      description: string;
    }>;
  }> {
    return apiClient.get('/system-updates/check');
  }

  async installUpdates(updateIds: string[]): Promise<{
    updateId: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
  }> {
    return apiClient.post('/system-updates/install', { updateIds });
  }

  async getUpdateStatus(updateId: string): Promise<{
    status: string;
    progress: number;
    log: string[];
    error?: string;
  }> {
    return apiClient.get(`/system-updates/${updateId}/status`);
  }

  // Feature Flags
  async getFeatureFlags(): Promise<Record<string, boolean>> {
    return apiClient.get('/system-features');
  }

  async updateFeatureFlag(feature: string, enabled: boolean): Promise<{ success: boolean }> {
    return apiClient.put(`/system-features/${feature}`, { enabled });
  }

  // Export System Data
  async exportSystemData(data: {
    type: 'logs' | 'metrics' | 'configuration' | 'backup';
    format: 'json' | 'csv' | 'xlsx';
    startDate?: string;
    endDate?: string;
    filters?: any;
  }): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.post('/system-export', data);
  }
}

// ===== SINGLETON INSTANCE =====
export const systemService = new SystemService();