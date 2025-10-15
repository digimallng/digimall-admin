/**
 * Notifications Management Service
 *
 * Service for admin notification operations including monitoring, broadcasting, and management.
 * Based on ADMIN_API_DOCUMENTATION.md - Notifications Management section
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  GetNotificationsParams,
  GetNotificationsResponse,
  GetNotificationResponse,
  NotificationStatistics,
  CreateBroadcastNotificationRequest,
  CreateBroadcastNotificationResponse,
  ResendNotificationRequest,
  ResendNotificationResponse,
  DeleteNotificationResponse,
  BulkDeleteNotificationsRequest,
  BulkDeleteNotificationsResponse,
} from '../types/notifications.types';

/**
 * Notifications Service Class
 */
class NotificationsService {
  /**
   * Get all notifications with filtering
   * @role ADMIN, SUPER_ADMIN
   */
  async getAll(params?: GetNotificationsParams): Promise<GetNotificationsResponse> {
    return apiClient.get<GetNotificationsResponse>(
      API_ENDPOINTS.NOTIFICATIONS.GET_ALL,
      params as any
    );
  }

  /**
   * Get notification by ID
   * @role ADMIN, SUPER_ADMIN
   */
  async getById(id: string): Promise<GetNotificationResponse> {
    return apiClient.get<GetNotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.GET_BY_ID(id)
    );
  }

  /**
   * Get notification statistics
   * @role ADMIN, SUPER_ADMIN
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<NotificationStatistics> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiClient.get<NotificationStatistics>(
      API_ENDPOINTS.NOTIFICATIONS.GET_STATISTICS,
      params
    );
  }

  /**
   * Create broadcast notification
   * @role ADMIN, SUPER_ADMIN
   */
  async broadcast(data: CreateBroadcastNotificationRequest): Promise<CreateBroadcastNotificationResponse> {
    return apiClient.post<CreateBroadcastNotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.BROADCAST,
      data
    );
  }

  /**
   * Get failed notifications
   * @role ADMIN, SUPER_ADMIN
   */
  async getFailed(page?: number, limit?: number): Promise<GetNotificationsResponse> {
    const params: Record<string, number> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    return apiClient.get<GetNotificationsResponse>(
      API_ENDPOINTS.NOTIFICATIONS.GET_FAILED,
      params
    );
  }

  /**
   * Get scheduled notifications
   * @role ADMIN, SUPER_ADMIN
   */
  async getScheduled(page?: number, limit?: number): Promise<GetNotificationsResponse> {
    const params: Record<string, number> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    return apiClient.get<GetNotificationsResponse>(
      API_ENDPOINTS.NOTIFICATIONS.GET_SCHEDULED,
      params
    );
  }

  /**
   * Resend notification
   * @role ADMIN, SUPER_ADMIN
   */
  async resend(id: string, data: ResendNotificationRequest): Promise<ResendNotificationResponse> {
    return apiClient.post<ResendNotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.RESEND(id),
      data
    );
  }

  /**
   * Delete notification (soft delete)
   * @role ADMIN, SUPER_ADMIN
   */
  async delete(id: string): Promise<DeleteNotificationResponse> {
    return apiClient.delete<DeleteNotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS.DELETE(id)
    );
  }

  /**
   * Bulk delete notifications
   * @role ADMIN, SUPER_ADMIN
   */
  async bulkDelete(data: BulkDeleteNotificationsRequest): Promise<BulkDeleteNotificationsResponse> {
    return apiClient.post<BulkDeleteNotificationsResponse>(
      API_ENDPOINTS.NOTIFICATIONS.BULK_DELETE,
      data
    );
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService();

// Export class for testing
export { NotificationsService };
