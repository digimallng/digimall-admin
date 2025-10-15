/**
 * Notifications Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 9 notification endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md - Notifications Management section
 */

import { BaseEntity, PaginatedResponse } from './shared.types';

// ===== ENUMS =====

export type NotificationType =
  | 'order_status'
  | 'payment_confirmation'
  | 'system_announcement'
  | 'promotion'
  | 'security_alert'
  | 'account_update'
  | 'vendor_alert'
  | 'product_update'
  | 'review_notification'
  | 'chat_message';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push';

export type TargetRole = 'vendors' | 'customers' | 'all';

// ===== USER REFERENCE =====

export interface NotificationUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
}

// ===== NOTIFICATION ENTITY =====

export interface Notification {
  _id: string;
  notificationId: string;
  userId: NotificationUser | string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  channels: NotificationChannel[];
  status: NotificationStatus;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  channelStatus?: Record<NotificationChannel, string>;
  channelTimestamps?: Record<NotificationChannel, string>;
  channelErrors?: Record<NotificationChannel, string>;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
  scheduledAt?: string;
  expiresAt?: string;
  metadata?: {
    broadcast?: boolean;
    adminCreated?: boolean;
    campaign?: string;
    source?: string;
    [key: string]: any;
  };
  createdAt: string;
  sentAt?: string;
  updatedAt?: string;
}

// ===== QUERY PARAMETERS =====

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  userId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ===== BROADCAST NOTIFICATION =====

export interface CreateBroadcastNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  targetUserIds?: string[];
  targetRole?: TargetRole;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  scheduledAt?: string;
  expiresAt?: string;
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateBroadcastNotificationResponse {
  success: boolean;
  message: string;
  data: {
    targetCount: number;
    sentCount: number;
    failedCount: number;
    scheduledAt?: string;
  };
}

// ===== RESEND NOTIFICATION =====

export interface ResendNotificationRequest {
  channels: NotificationChannel[];
}

export interface ResendNotificationResponse {
  success: boolean;
  message: string;
  data: {
    channels: NotificationChannel[];
  };
}

// ===== BULK DELETE =====

export interface BulkDeleteNotificationsRequest {
  notificationIds: string[];
}

export interface BulkDeleteNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    deletedCount: number;
  };
}

// ===== STATISTICS =====

export interface NotificationStatistics {
  success: boolean;
  data: {
    overview: {
      totalNotifications: number;
      totalRead: number;
      totalUnread: number;
      readRate: string;
      deliveryRate: string;
      failureRate: string;
      avgReadTimeMinutes: number;
    };
    byStatus: Record<NotificationStatus, number>;
    byType: Record<string, number>;
    byPriority: Record<NotificationPriority, number>;
    byChannel: Record<NotificationChannel, number>;
  };
}

// ===== RESPONSE TYPES =====

export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetNotificationResponse {
  success: boolean;
  data: Notification;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}
