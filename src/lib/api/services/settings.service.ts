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
      // Get settings from admin service system config endpoint
      const systemResponse = await apiClient.get('/system/config');
      
      if (systemResponse && typeof systemResponse === 'object') {
        const transformedConfigs = this.transformSystemConfigToSettings(systemResponse, category);
        if (transformedConfigs.length > 0) {
          return transformedConfigs;
        }
      }
      
      // If no configs found, return empty array instead of fallback
      return [];
    } catch (error) {
      console.error('Failed to fetch platform config:', error);
      // Return empty array on error - let UI handle the error state
      throw new Error(`Failed to load platform configuration: ${error.message}`);
    }
  }

  async updatePlatformConfig(id: string, value: string | number | boolean): Promise<PlatformConfig> {
    try {
      const config = await this.getPlatformConfigById(id);
      if (!config) {
        throw new Error('Configuration not found');
      }

      // Update via system config endpoint
      const updateData = { [config.key]: value };
      await apiClient.put('/system/config', updateData);
      
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
      // Use notification management controller - regular notifications endpoint
      const response = await apiClient.get('/notification-management');
      
      if (response && Array.isArray(response)) {
        return response.map(this.transformSystemNotification);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch system notifications:', error);
      throw new Error(`Failed to load system notifications: ${error.message}`);
    }
  }

  async createSystemNotification(notification: Omit<SystemNotification, 'id' | 'createdAt'>): Promise<SystemNotification> {
    try {
      // Use notification management controller
      const response = await apiClient.post('/notification-management', {
        title: notification.title,
        message: notification.message,
        type: 'system',
        priority: notification.priority,
        targetAudience: notification.targetUsers,
        scheduledFor: notification.startDate.toISOString(),
        expiresAt: notification.endDate?.toISOString()
      });
      
      return this.transformSystemNotification(response);
    } catch (error) {
      console.error('Failed to create system notification:', error);
      throw new Error(`Failed to create system notification: ${error.message}`);
    }
  }

  async updateSystemNotification(id: string, updates: Partial<Omit<SystemNotification, 'id' | 'createdAt'>>): Promise<SystemNotification> {
    try {
      const response = await apiClient.put(`/admin/settings/notifications/system/${id}`, updates);
      return this.transformSystemNotification(response);
    } catch (error) {
      console.error('Failed to update system notification:', error);
      throw error;
    }
  }

  async deleteSystemNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/settings/notifications/system/${id}`);
    } catch (error) {
      console.error('Failed to delete system notification:', error);
      throw error;
    }
  }

  // Notification Services Monitoring
  async getNotificationServices(): Promise<NotificationService[]> {
    try {
      // Get real system status from admin service
      const systemStatus = await apiClient.get('/system/status');
      
      if (systemStatus?.services) {
        return this.transformSystemServicesToNotificationServices(systemStatus.services);
      }
      
      // Return empty array if no services data
      return [];
    } catch (error) {
      console.error('Failed to fetch notification services:', error);
      throw new Error(`Failed to load notification services: ${error.message}`);
    }
  }

  // Test and restart methods removed - no backend support

  // Maintenance Mode Management
  async enableMaintenanceMode(data: { message: string; endTime?: string; allowedIPs?: string[] }): Promise<any> {
    try {
      return await apiClient.post('/system/maintenance', { enabled: true, message: data.message });
    } catch (error) {
      console.error('Failed to enable maintenance mode:', error);
      throw error;
    }
  }

  async disableMaintenanceMode(): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/system/maintenance', { enabled: false });
    } catch (error) {
      console.error('Failed to disable maintenance mode:', error);
      throw error;
    }
  }

  // System Health and Status
  async getSystemStatus(): Promise<any> {
    try {
      const [status, metrics] = await Promise.all([
        apiClient.get('/system/status'),
        apiClient.get('/system/metrics')
      ]);
      
      return {
        overall: status?.overall || 'unknown',
        services: status?.services || {},
        resources: status?.resources || {},
        metrics: metrics || {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      throw new Error(`Failed to load system status: ${error.message}`);
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

  // generateNotificationServicesStatus method removed - using real data only

  // getDefaultPlatformConfig method removed - using real data only

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