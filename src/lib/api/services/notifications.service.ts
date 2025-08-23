import { apiClient } from '../client';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'system' | 'order' | 'payment' | 'vendor' | 'security' | 'promotion';
  timestamp: string;
  read: boolean;
  recipientId?: string;
  recipientType?: string;
  channel?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead?: boolean;
  readAt?: string;
  userId?: string;
  vendorId?: string;
  status?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  campaignId?: string;
  templateId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface NotificationFilters {
  status?: 'read' | 'unread' | 'all';
  type?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  userId?: string;
  vendorId?: string;
  channel?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationItem['type'];
  userId?: string;
  vendorId?: string;
  channels?: string[];
  priority?: NotificationItem['priority'];
  data?: Record<string, any>;
  scheduledFor?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
}

export interface BulkNotificationData {
  title: string;
  message: string;
  type: NotificationItem['type'];
  userIds?: string[];
  vendorIds?: string[];
  allUsers?: boolean;
  allVendors?: boolean;
  channels?: string[];
  priority?: NotificationItem['priority'];
  data?: Record<string, any>;
  scheduledFor?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  template: string;
  type: NotificationItem['type'];
  description?: string;
  channels?: string[];
  variables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  lastUsed?: string;
}

export interface NotificationStats {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalNotifications: number;
    readNotifications: number;
    unreadNotifications: number;
    readRate: number;
  };
  breakdown: {
    byType: Record<string, number>;
    daily: Record<string, { sent: number; read: number }>;
  };
}

export interface BulkActionData {
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'delete' | 'resend';
  reason?: string;
}

export interface NotificationPreferences {
  id: string;
  userId?: string;
  vendorId?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  allowedTypes: NotificationItem['type'][];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export class NotificationsService {
  // Get notifications with filters
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    try {
      const params = {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 20,
      };
      
      const response = await apiClient.get<NotificationResponse>('/admin/notifications', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return empty data if service is unavailable
      return {
        notifications: [],
        total: 0,
        unreadCount: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: 0,
      };
    }
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<NotificationResponse>('/admin/notifications', {
        params: { status: 'unread', limit: 1 }
      });
      return response.unreadCount || 0;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/notifications/bulk-action`, {
        notificationIds: [notificationId],
        action: 'mark_read'
      });
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  // Mark notification as unread
  async markAsUnread(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/notifications/bulk-action`, {
        notificationIds: [notificationId],
        action: 'mark_unread'
      });
      return true;
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    try {
      // Get all unread notifications first
      const unreadResponse = await this.getNotifications({ status: 'unread', limit: 1000 });
      if (unreadResponse.notifications.length === 0) return true;
      
      const notificationIds = unreadResponse.notifications.map(n => n.id);
      await apiClient.patch(`/admin/notifications/bulk-action`, {
        notificationIds,
        action: 'mark_read'
      });
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/notifications/bulk-action`, {
        notificationIds: [notificationId],
        action: 'delete'
      });
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  }

  // Bulk actions on notifications
  async bulkAction(data: BulkActionData): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/notifications/bulk-action`, data);
      return true;
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      return false;
    }
  }

  // Get notification statistics
  async getNotificationStats(params: {
    startDate: string;
    endDate: string;
    type?: string;
    channel?: string;
  }): Promise<NotificationStats> {
    try {
      const response = await apiClient.post('/admin/notifications/stats', params);
      return response;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      return {
        period: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
        summary: {
          totalNotifications: 0,
          readNotifications: 0,
          unreadNotifications: 0,
          readRate: 0,
        },
        breakdown: {
          byType: {},
          daily: {},
        },
      };
    }
  }

  // Create notification
  async createNotification(data: CreateNotificationData): Promise<NotificationItem | null> {
    try {
      const response = await apiClient.post<NotificationItem>('/admin/notifications', data);
      return response;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  // Send bulk notification
  async sendBulkNotification(data: BulkNotificationData): Promise<{ sent: number; total: number; notifications: NotificationItem[] } | null> {
    try {
      const response = await apiClient.post('/admin/notifications/bulk', data);
      return response;
    } catch (error) {
      console.error('Failed to send bulk notification:', error);
      return null;
    }
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await apiClient.get<NotificationTemplate[]>('/admin/notifications/templates');
      return response;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      return [];
    }
  }

  // Create notification template
  async createNotificationTemplate(data: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate | null> {
    try {
      const response = await apiClient.post<NotificationTemplate>('/admin/notifications/templates', data);
      return response;
    } catch (error) {
      console.error('Failed to create notification template:', error);
      return null;
    }
  }

  // Update notification template
  async updateNotificationTemplate(templateId: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    try {
      const response = await apiClient.patch<NotificationTemplate>(`/admin/notifications/templates/${templateId}`, data);
      return response;
    } catch (error) {
      console.error('Failed to update notification template:', error);
      return null;
    }
  }

  // Delete notification template
  async deleteNotificationTemplate(templateId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/admin/notifications/templates/${templateId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification template:', error);
      return false;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId?: string, vendorId?: string): Promise<NotificationPreferences | null> {
    try {
      const params: any = {};
      if (userId) params.userId = userId;
      if (vendorId) params.vendorId = vendorId;
      
      const response = await apiClient.get<NotificationPreferences>('/admin/notifications/preferences', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      return null;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences | null> {
    try {
      const response = await apiClient.patch<NotificationPreferences>('/admin/notifications/preferences', data);
      return response;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return null;
    }
  }

  // Get delivery rate analytics
  async getDeliveryRates(params: { startDate: string; endDate: string; type?: string; channel?: string }) {
    try {
      const response = await apiClient.get('/admin/notifications/analytics/delivery-rates', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch delivery rates:', error);
      return null;
    }
  }

  // Get engagement analytics
  async getEngagementAnalytics(params: { startDate: string; endDate: string; type?: string; channel?: string }) {
    try {
      const response = await apiClient.get('/admin/notifications/analytics/engagement', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch engagement analytics:', error);
      return null;
    }
  }

  // Get channel performance
  async getChannelPerformance(params: { startDate: string; endDate: string; type?: string; channel?: string }) {
    try {
      const response = await apiClient.get('/admin/notifications/analytics/channel-performance', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch channel performance:', error);
      return null;
    }
  }

  // Resend notification
  async resendNotification(notificationId: string): Promise<boolean> {
    try {
      await apiClient.patch(`/admin/notifications/bulk-action`, {
        notificationIds: [notificationId],
        action: 'resend'
      });
      return true;
    } catch (error) {
      console.error('Failed to resend notification:', error);
      return false;
    }
  }
}

export const notificationsService = new NotificationsService();