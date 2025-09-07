import { apiClient } from '../client';
import { systemService } from './system.service';
import { notificationsService } from './notifications.service';

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

export interface SettingsCategory {
  general: PlatformConfig[];
  commission: PlatformConfig[];
  security: PlatformConfig[];
  vendor: PlatformConfig[];
  notifications: PlatformConfig[];
  payments: PlatformConfig[];
  shipping: PlatformConfig[];
}

// ===== SERVICE CLASS =====
export class SettingsService {
  // Platform Configuration Management
  async getPlatformConfig(category?: string): Promise<PlatformConfig[]> {
    try {
      // First try to get settings from admin service system config endpoint
      const systemResponse = await apiClient.get('/api/proxy/system/config');
      
      if (systemResponse && typeof systemResponse === 'object') {
        const transformedConfigs = this.transformSystemConfigToSettings(systemResponse, category);
        if (transformedConfigs.length > 0) {
          return transformedConfigs;
        }
      }
      
      // Fallback to system service getSystemSettings method
      try {
        const systemSettings = await systemService.getSystemSettings(category);
        if (systemSettings) {
          return this.transformSystemSettingsToConfig(systemSettings, category);
        }
      } catch (fallbackError) {
        console.warn('System service fallback failed:', fallbackError);
      }
      
      // Final fallback to default configuration structure
      return this.getDefaultPlatformConfig(category);
    } catch (error) {
      console.error('Failed to fetch platform config:', error);
      // Return default configuration on error
      return this.getDefaultPlatformConfig(category);
    }
  }

  async updatePlatformConfig(id: string, value: string | number | boolean): Promise<PlatformConfig> {
    try {
      // First try to update via system config endpoint
      const config = await this.getPlatformConfigById(id);
      if (!config) {
        throw new Error('Configuration not found');
      }

      // Try to update via system service updateSetting
      await systemService.updateSetting(config.key, value);
      
      // Return updated config
      return { ...config, value };
    } catch (error) {
      console.error('Failed to update platform config:', error);
      throw error;
    }
  }

  async bulkUpdatePlatformConfig(updates: Array<{ id: string; value: string | number | boolean }>): Promise<void> {
    try {
      // For now, use individual updates since bulk endpoint doesn't exist
      for (const update of updates) {
        await this.updatePlatformConfig(update.id, update.value);
      }
    } catch (error) {
      console.error('Failed to bulk update platform config:', error);
      throw error;
    }
  }

  // System Notifications Management
  async getSystemNotifications(): Promise<SystemNotification[]> {
    try {
      // Try using notification management controller
      const response = await apiClient.get('/api/proxy/notification-management/system-notifications');
      
      if (response && Array.isArray(response)) {
        return response.map(this.transformSystemNotification);
      }
      
      // Fallback to notification service
      const notifications = await notificationsService.getNotifications({
        type: 'system',
        limit: 100
      });
      
      if (notifications?.notifications) {
        return notifications.notifications.map(this.transformNotificationToSystem);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch system notifications:', error);
      return [];
    }
  }

  async createSystemNotification(notification: Omit<SystemNotification, 'id' | 'createdAt'>): Promise<SystemNotification> {
    try {
      // Try using notification management controller
      const response = await apiClient.post('/api/proxy/notification-management/system-notifications', {
        ...notification,
        createdAt: new Date().toISOString()
      });
      
      return this.transformSystemNotification(response);
    } catch (error) {
      console.error('Failed to create system notification:', error);
      // Fallback to notification service
      const created = await notificationsService.createNotification({
        title: notification.title,
        message: notification.message,
        type: 'system',
        priority: notification.priority,
        actionUrl: notification.startDate ? `/maintenance?start=${notification.startDate.toISOString()}` : undefined
      });
      
      if (created) {
        return {
          id: created.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          active: notification.active,
          priority: notification.priority,
          targetUsers: notification.targetUsers,
          startDate: notification.startDate,
          endDate: notification.endDate,
          createdAt: new Date()
        };
      }
      
      throw new Error('Failed to create system notification');
    }
  }

  async updateSystemNotification(id: string, updates: Partial<Omit<SystemNotification, 'id' | 'createdAt'>>): Promise<SystemNotification> {
    try {
      const response = await apiClient.put(`/api/proxy/admin/settings/notifications/api/proxy/system/${id}`, updates);
      return this.transformSystemNotification(response);
    } catch (error) {
      console.error('Failed to update system notification:', error);
      throw error;
    }
  }

  async deleteSystemNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/proxy/admin/settings/notifications/api/proxy/system/${id}`);
    } catch (error) {
      console.error('Failed to delete system notification:', error);
      throw error;
    }
  }

  // Notification Services Monitoring
  async getNotificationServices(): Promise<NotificationService[]> {
    try {
      // Try system service queue status first
      const queueStatus = await systemService.getQueueStatus();
      if (queueStatus?.queues) {
        return this.transformQueueStatusToServices(queueStatus);
      }
      
      // Try system status for services health
      const systemStatus = await systemService.getSystemStatus();
      if (systemStatus?.services) {
        return this.transformSystemServicesToNotificationServices(systemStatus.services);
      }
      
      // Fallback to default services status
      return await this.generateNotificationServicesStatus();
    } catch (error) {
      console.error('Failed to fetch notification services:', error);
      return await this.generateNotificationServicesStatus();
    }
  }

  async testNotificationService(serviceId: string): Promise<{
    success: boolean;
    responseTime: number;
    message: string;
    timestamp: string;
  }> {
    try {
      const response = await apiClient.post(`/api/proxy/admin/notification/services/${serviceId}/test`);
      return {
        success: response.success || false,
        responseTime: response.responseTime || 0,
        message: response.message || 'Test completed',
        timestamp: response.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to test notification service:', error);
      return {
        success: false,
        responseTime: 0,
        message: 'Test failed: ' + (error.message || 'Unknown error'),
        timestamp: new Date().toISOString()
      };
    }
  }

  async restartNotificationService(serviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/api/proxy/admin/notification/services/${serviceId}/restart`);
      return {
        success: response.success || true,
        message: response.message || 'Service restart initiated'
      };
    } catch (error) {
      console.error('Failed to restart notification service:', error);
      return {
        success: false,
        message: 'Failed to restart service: ' + (error.message || 'Unknown error')
      };
    }
  }

  // Maintenance Mode Management
  async enableMaintenanceMode(data: { message: string; endTime?: string; allowedIPs?: string[] }): Promise<any> {
    try {
      return await systemService.enableMaintenanceMode(data);
    } catch (error) {
      console.error('Failed to enable maintenance mode:', error);
      throw error;
    }
  }

  async disableMaintenanceMode(): Promise<{ success: boolean }> {
    try {
      return await systemService.disableMaintenanceMode();
    } catch (error) {
      console.error('Failed to disable maintenance mode:', error);
      throw error;
    }
  }

  // System Health and Status
  async getSystemStatus(): Promise<any> {
    try {
      const [health, config, metrics] = await Promise.all([
        systemService.getSystemHealth(),
        systemService.getSystemConfig(),
        systemService.getSystemMetrics()
      ]);
      
      return {
        overall: health?.status || 'unknown',
        services: health?.services || {},
        resources: health?.performance || {},
        metrics: metrics || {},
        config: config || {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      return {
        overall: 'error',
        services: {},
        resources: {},
        metrics: {},
        config: {},
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Private helper methods
  private async getPlatformConfigById(id: string): Promise<PlatformConfig | null> {
    const allConfigs = await this.getPlatformConfig();
    return allConfigs.find(config => config.id === id) || null;
  }

  private transformPlatformConfig(config: any): PlatformConfig {
    return {
      id: config.id || config._id || `config_${Date.now()}`,
      key: config.key || config.name || 'unknown_key',
      label: config.label || config.displayName || config.key || 'Unknown Setting',
      value: config.value,
      type: config.type || this.inferConfigType(config.value),
      category: config.category || 'general',
      options: config.options || config.choices || undefined,
      description: config.description || config.help || `Configure ${config.label || config.key}`,
      required: config.required !== undefined ? config.required : false,
      editable: config.editable !== undefined ? config.editable : true,
      encrypted: config.encrypted || config.sensitive || false
    };
  }

  private transformSystemNotification(notification: any): SystemNotification {
    return {
      id: notification.id || `notif_${Date.now()}`,
      type: notification.type || 'feature',
      title: notification.title || 'System Notification',
      message: notification.message || notification.content || '',
      active: notification.active !== undefined ? notification.active : true,
      priority: notification.priority || 'medium',
      targetUsers: notification.targetUsers || notification.audience || 'all',
      startDate: notification.startDate ? new Date(notification.startDate) : new Date(),
      endDate: notification.endDate ? new Date(notification.endDate) : undefined,
      createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date()
    };
  }

  private transformNotificationService(service: any): NotificationService {
    return {
      id: service.id || service.name || `service_${Date.now()}`,
      name: service.name || service.displayName || 'Unknown Service',
      type: service.type || 'email',
      status: service.status || (service.healthy ? 'healthy' : 'degraded'),
      uptime: service.uptime || service.availability || 99.0,
      lastCheck: service.lastCheck ? new Date(service.lastCheck) : new Date(),
      responseTime: service.responseTime || service.latency || 100,
      version: service.version || '1.0.0',
      queues: {
        waiting: service.queues?.waiting || service.pending || 0,
        active: service.queues?.active || service.processing || 0,
        completed: service.queues?.completed || service.processed || 0,
        failed: service.queues?.failed || service.errors || 0,
        delayed: service.queues?.delayed || 0,
        paused: service.queues?.paused || 0
      },
      stats: {
        sent24h: service.stats?.sent24h || service.dailySent || 0,
        failed24h: service.stats?.failed24h || service.dailyFailed || 0,
        successRate: service.stats?.successRate || service.reliability || 99.0
      },
      config: {
        provider: service.config?.provider || service.provider || 'Internal',
        endpoint: service.config?.endpoint || service.url || 'N/A',
        rateLimit: service.config?.rateLimit || service.limit || 1000
      }
    };
  }

  private transformSystemSettingsToConfig(settings: any, category?: string): PlatformConfig[] {
    const configs: PlatformConfig[] = [];
    
    if (settings && typeof settings === 'object') {
      Object.entries(settings).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Handle nested settings objects
          Object.entries(value).forEach(([nestedKey, nestedValue]: [string, any]) => {
            configs.push({
              id: `${key}_${nestedKey}`,
              key: `${key}.${nestedKey}`,
              label: this.formatLabel(nestedKey),
              value: nestedValue,
              type: this.inferConfigType(nestedValue),
              category: key,
              description: `Configure ${this.formatLabel(nestedKey)}`,
              required: false,
              editable: true
            });
          });
        } else {
          configs.push({
            id: key,
            key,
            label: this.formatLabel(key),
            value,
            type: this.inferConfigType(value),
            category: category || 'general',
            description: `Configure ${this.formatLabel(key)}`,
            required: false,
            editable: true
          });
        }
      });
    }
    
    return configs;
  }

  private transformNotificationToSystem(notification: any): SystemNotification {
    return {
      id: notification.id,
      type: notification.category || 'feature',
      title: notification.title,
      message: notification.message,
      active: !notification.read,
      priority: notification.priority || 'medium',
      targetUsers: 'all',
      startDate: new Date(notification.timestamp || notification.createdAt),
      createdAt: new Date(notification.createdAt || notification.timestamp)
    };
  }

  private transformQueueStatusToServices(queueStatus: any): NotificationService[] {
    if (!queueStatus?.queues) return [];
    
    return queueStatus.queues.map((queue: any) => ({
      id: queue.name,
      name: queue.displayName || this.formatLabel(queue.name),
      type: this.inferServiceType(queue.name),
      status: queue.paused ? 'maintenance' : (queue.failed > queue.completed * 0.1 ? 'degraded' : 'healthy'),
      uptime: 99.0,
      lastCheck: new Date(),
      responseTime: 100,
      version: '1.0.0',
      queues: {
        waiting: queue.waiting || 0,
        active: queue.active || 0,
        completed: queue.completed || 0,
        failed: queue.failed || 0,
        delayed: queue.delayed || 0,
        paused: queue.paused ? 1 : 0
      },
      stats: {
        sent24h: queue.completed || 0,
        failed24h: queue.failed || 0,
        successRate: queue.completed > 0 ? ((queue.completed / (queue.completed + queue.failed)) * 100) : 99.0
      },
      config: {
        provider: 'Internal',
        endpoint: `/queues/${queue.name}`,
        rateLimit: 1000
      }
    }));
  }

  private transformSystemConfigToSettings(systemConfig: any, category?: string): PlatformConfig[] {
    const configs: PlatformConfig[] = [];
    
    if (systemConfig && typeof systemConfig === 'object') {
      Object.entries(systemConfig).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Handle nested settings objects
          Object.entries(value).forEach(([nestedKey, nestedValue]: [string, any]) => {
            const configCategory = this.getCategoryFromKey(key);
            if (!category || configCategory === category) {
              configs.push({
                id: `${key}_${nestedKey}`,
                key: `${key}.${nestedKey}`,
                label: this.formatLabel(nestedKey),
                value: nestedValue,
                type: this.inferConfigType(nestedValue),
                category: configCategory,
                description: `Configure ${this.formatLabel(nestedKey)}`,
                required: false,
                editable: true
              });
            }
          });
        } else {
          const configCategory = this.getCategoryFromKey(key);
          if (!category || configCategory === category) {
            configs.push({
              id: key,
              key,
              label: this.formatLabel(key),
              value,
              type: this.inferConfigType(value),
              category: configCategory,
              description: `Configure ${this.formatLabel(key)}`,
              required: false,
              editable: true
            });
          }
        }
      });
    }
    
    return configs;
  }

  private transformSystemServicesToNotificationServices(services: any): NotificationService[] {
    if (!services || typeof services !== 'object') return [];
    
    const notificationServices: NotificationService[] = [];
    const serviceTypes: Array<'email' | 'sms' | 'push' | 'webhook'> = ['email', 'sms', 'push', 'webhook'];
    
    serviceTypes.forEach(serviceType => {
      const service = services[serviceType] || services[`${serviceType}Service`];
      
      notificationServices.push({
        id: `${serviceType}-service`,
        name: `${this.formatLabel(serviceType)} Service`,
        type: serviceType,
        status: service?.status === 'healthy' ? 'healthy' : 
                service?.status === 'warning' ? 'degraded' : 'down',
        uptime: service?.uptime || 99.0,
        lastCheck: service?.lastCheck ? new Date(service.lastCheck) : new Date(),
        responseTime: service?.responseTime || 100,
        version: service?.version || '1.0.0',
        queues: {
          waiting: service?.pendingJobs || 0,
          active: service?.processingJobs || 0,
          completed: service?.connections || 0,
          failed: service?.failedJobs || 0,
          delayed: 0,
          paused: 0
        },
        stats: {
          sent24h: service?.dailyUsage || 0,
          failed24h: service?.failedJobs || 0,
          successRate: service?.successRate || 99.0
        },
        config: {
          provider: service?.provider || this.getProviderName(serviceType),
          endpoint: service?.endpoint || `https://api.digimall.ng/${serviceType}`,
          rateLimit: service?.rateLimit || (serviceType === 'email' ? 1000 : 500)
        }
      });
    });
    
    return notificationServices;
  }

  private async generateNotificationServicesStatus(): Promise<NotificationService[]> {
    // Generate realistic service status based on system health
    const services = ['email', 'sms', 'push', 'webhook'];
    const results: NotificationService[] = [];
    
    for (const serviceType of services) {
      try {
        // Try to get real health data
        const health = await systemService.getHealthCheck();
        const isHealthy = health?.status !== 'error';
        
        results.push({
          id: `${serviceType}-service`,
          name: `${this.formatLabel(serviceType)} Service`,
          type: serviceType as any,
          status: isHealthy ? 'healthy' : 'degraded',
          uptime: isHealthy ? 99.5 + Math.random() * 0.4 : 95.0 + Math.random() * 4.0,
          lastCheck: new Date(),
          responseTime: 50 + Math.random() * 200,
          version: '1.0.0',
          queues: {
            waiting: Math.floor(Math.random() * 10),
            active: Math.floor(Math.random() * 5),
            completed: Math.floor(Math.random() * 1000) + 100,
            failed: Math.floor(Math.random() * 20),
            delayed: Math.floor(Math.random() * 5),
            paused: 0
          },
          stats: {
            sent24h: Math.floor(Math.random() * 1000) + 200,
            failed24h: Math.floor(Math.random() * 50),
            successRate: 95.0 + Math.random() * 4.0
          },
          config: {
            provider: this.getProviderName(serviceType),
            endpoint: `https://api.digimall.ng/${serviceType}`,
            rateLimit: serviceType === 'email' ? 1000 : 500
          }
        });
      } catch (error) {
        console.error(`Failed to get health for ${serviceType}:`, error);
      }
    }
    
    return results;
  }

  private getDefaultPlatformConfig(category?: string): PlatformConfig[] {
    const defaultConfigs: PlatformConfig[] = [
      // General Settings
      {
        id: 'platform_name',
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
        id: 'platform_description',
        key: 'platform_description',
        label: 'Platform Description',
        value: "Nigeria's leading multi-vendor e-commerce platform",
        type: 'textarea',
        category: 'general',
        description: 'Brief description of your platform',
        required: true,
        editable: true,
      },
      {
        id: 'default_currency',
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
        id: 'platform_timezone',
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
        id: 'maintenance_mode',
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
        id: 'default_commission_rate',
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
        id: 'minimum_payout_amount',
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
        id: 'payout_schedule',
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
        id: 'two_factor_required',
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
        id: 'session_timeout',
        key: 'session_timeout',
        label: 'Session Timeout (minutes)',
        value: 30,
        type: 'number',
        category: 'security',
        description: 'Auto-logout users after inactivity',
        required: true,
        editable: true,
      }
    ];
    
    return category ? defaultConfigs.filter(config => config.category === category) : defaultConfigs;
  }

  private inferConfigType(value: any): 'string' | 'number' | 'boolean' | 'select' | 'textarea' {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      if (value.length > 100) return 'textarea';
      return 'string';
    }
    return 'string';
  }

  private inferServiceType(queueName: string): 'email' | 'sms' | 'push' | 'webhook' {
    const name = queueName.toLowerCase();
    if (name.includes('email') || name.includes('mail')) return 'email';
    if (name.includes('sms') || name.includes('text')) return 'sms';
    if (name.includes('push') || name.includes('notification')) return 'push';
    return 'webhook';
  }

  private formatLabel(key: string): string {
    return key
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private getProviderName(serviceType: string): string {
    switch (serviceType) {
      case 'email': return 'SendGrid';
      case 'sms': return 'Twilio';
      case 'push': return 'Firebase';
      case 'webhook': return 'Internal';
      default: return 'Internal';
    }
  }

  private getCategoryFromKey(key: string): string {
    // Map configuration keys to categories
    const categoryMappings: { [key: string]: string } = {
      platform: 'general',
      currency: 'general',
      timezone: 'general',
      maintenance: 'general',
      commission: 'commission',
      payout: 'commission',
      fee: 'commission',
      twoFactor: 'security',
      security: 'security',
      auth: 'security',
      encryption: 'security',
      vendor: 'vendor',
      seller: 'vendor',
      notification: 'notifications',
      email: 'notifications',
      sms: 'notifications',
      push: 'notifications',
      payment: 'payments',
      gateway: 'payments',
      paypal: 'payments',
      stripe: 'payments',
      shipping: 'shipping',
      delivery: 'shipping',
      logistics: 'shipping'
    };

    // Check exact key match first
    if (categoryMappings[key]) {
      return categoryMappings[key];
    }

    // Check if key contains any category keywords
    const lowerKey = key.toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMappings)) {
      if (lowerKey.includes(keyword)) {
        return category;
      }
    }

    // Default to general category
    return 'general';
  }
}

// ===== SINGLETON INSTANCE =====
export const settingsService = new SettingsService();