/**
 * Notifications Management Hooks
 *
 * React Query hooks for notifications management operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { notificationsService } from '../api/services/notifications.service';
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
} from '../api/types/notifications.types';

// ===== QUERY KEYS =====

export const notificationsKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationsKeys.all, 'list'] as const,
  list: (params?: GetNotificationsParams) => [...notificationsKeys.lists(), params] as const,
  details: () => [...notificationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationsKeys.details(), id] as const,
  statistics: (startDate?: string, endDate?: string) => 
    [...notificationsKeys.all, 'statistics', { startDate, endDate }] as const,
  failed: (page?: number, limit?: number) => 
    [...notificationsKeys.all, 'failed', { page, limit }] as const,
  scheduled: (page?: number, limit?: number) => 
    [...notificationsKeys.all, 'scheduled', { page, limit }] as const,
};

// ===== QUERIES =====

/**
 * Get all notifications with filtering
 */
export function useNotifications(params?: GetNotificationsParams): UseQueryResult<GetNotificationsResponse, Error> {
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => notificationsService.getAll(params),
  });
}

/**
 * Get notification by ID
 */
export function useNotification(id: string): UseQueryResult<GetNotificationResponse, Error> {
  return useQuery({
    queryKey: notificationsKeys.detail(id),
    queryFn: () => notificationsService.getById(id),
    enabled: !!id,
  });
}

/**
 * Get notification statistics
 */
export function useNotificationStatistics(
  startDate?: string,
  endDate?: string
): UseQueryResult<NotificationStatistics, Error> {
  return useQuery({
    queryKey: notificationsKeys.statistics(startDate, endDate),
    queryFn: () => notificationsService.getStatistics(startDate, endDate),
  });
}

/**
 * Get failed notifications
 */
export function useFailedNotifications(
  page?: number,
  limit?: number
): UseQueryResult<GetNotificationsResponse, Error> {
  return useQuery({
    queryKey: notificationsKeys.failed(page, limit),
    queryFn: () => notificationsService.getFailed(page, limit),
  });
}

/**
 * Get scheduled notifications
 */
export function useScheduledNotifications(
  page?: number,
  limit?: number
): UseQueryResult<GetNotificationsResponse, Error> {
  return useQuery({
    queryKey: notificationsKeys.scheduled(page, limit),
    queryFn: () => notificationsService.getScheduled(page, limit),
  });
}

// ===== MUTATIONS =====

/**
 * Create broadcast notification
 */
export function useBroadcastNotification(): UseMutationResult<
  CreateBroadcastNotificationResponse,
  Error,
  CreateBroadcastNotificationRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBroadcastNotificationRequest) => 
      notificationsService.broadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.statistics() });
    },
  });
}

/**
 * Resend notification
 */
export function useResendNotification(): UseMutationResult<
  ResendNotificationResponse,
  Error,
  { id: string; data: ResendNotificationRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => notificationsService.resend(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.failed() });
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification(): UseMutationResult<
  DeleteNotificationResponse,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.statistics() });
    },
  });
}

/**
 * Bulk delete notifications
 */
export function useBulkDeleteNotifications(): UseMutationResult<
  BulkDeleteNotificationsResponse,
  Error,
  BulkDeleteNotificationsRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDeleteNotificationsRequest) => 
      notificationsService.bulkDelete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.statistics() });
    },
  });
}
