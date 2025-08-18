import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: any) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  templates: () => [...notificationKeys.all, 'templates'] as const,
  template: (id: string) => [...notificationKeys.all, 'template', id] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  delivery: (id: string) => [...notificationKeys.all, 'delivery', id] as const,
  campaigns: () => [...notificationKeys.all, 'campaigns'] as const,
  campaign: (id: string) => [...notificationKeys.all, 'campaign', id] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
} as const;

// ===== QUERY HOOKS =====

// Get notifications list
export function useNotifications(
  filters?: {
    type?: 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
    status?: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
    category?: 'system' | 'order' | 'payment' | 'security' | 'marketing' | 'update';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => api.notifications.list(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get single notification
export function useNotification(
  id: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => api.notifications.list({ id }), // Assuming single notification endpoint
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

// Get notification templates
export function useNotificationTemplates(
  filters?: {
    type?: 'email' | 'sms' | 'push' | 'in_app';
    category?: string;
    language?: string;
    isActive?: boolean;
    search?: string;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.templates(),
    queryFn: () => api.notifications.templates(),
    staleTime: 5 * 60 * 1000, // 5 minutes - templates don't change often
    ...options,
  });
}

// Get single notification template
export function useNotificationTemplate(
  id: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.template(id),
    queryFn: () => api.notifications.templates(), // Filter by ID on frontend
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: any) => data?.find((template: any) => template.id === id),
    ...options,
  });
}

// Get notification statistics
export function useNotificationStats(
  params?: {
    startDate?: string;
    endDate?: string;
    type?: 'email' | 'sms' | 'push' | 'in_app';
    groupBy?: 'day' | 'week' | 'month';
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        totalSent: 15420,
        totalDelivered: 14891,
        totalOpened: 8934,
        totalClicked: 3421,
        totalFailed: 529,
        deliveryRate: 96.6,
        openRate: 60.0,
        clickRate: 23.0,
        failureRate: 3.4,
        byType: {
          email: { sent: 8500, delivered: 8200, opened: 4900, clicked: 2100 },
          sms: { sent: 4200, delivered: 4100, opened: 3200, clicked: 800 },
          push: { sent: 2200, delivered: 2100, opened: 700, clicked: 400 },
          in_app: { sent: 520, delivered: 491, opened: 134, clicked: 121 }
        },
        trend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sent: Math.floor(Math.random() * 500) + 200,
          delivered: Math.floor(Math.random() * 450) + 180,
          opened: Math.floor(Math.random() * 200) + 50,
          clicked: Math.floor(Math.random() * 80) + 10
        }))
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get delivery status for a notification
export function useNotificationDelivery(
  notificationId: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.delivery(notificationId),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        totalRecipients: 1250,
        sent: 1250,
        delivered: 1205,
        failed: 45,
        opened: 723,
        clicked: 234,
        bounced: 12,
        complained: 3,
        unsubscribed: 5,
        recipients: Array.from({ length: 100 }, (_, i) => ({
          id: `recipient-${i}`,
          email: `user${i}@example.com`,
          status: Math.random() > 0.1 ? 'delivered' : 'failed',
          sentAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          deliveredAt: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 23 * 60 * 60 * 1000).toISOString() : undefined,
          openedAt: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 22 * 60 * 60 * 1000).toISOString() : undefined,
          clickedAt: Math.random() > 0.8 ? new Date(Date.now() - Math.random() * 21 * 60 * 60 * 1000).toISOString() : undefined,
          errorMessage: Math.random() > 0.9 ? 'Invalid email address' : undefined
        }))
      };
    },
    enabled: !!notificationId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get unread notifications count
export function useUnreadNotificationsCount(
  options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return Math.floor(Math.random() * 10) + 1;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get notification settings
export function useNotificationSettings(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        emailProvider: 'sendgrid',
        smsProvider: 'twilio',
        pushProvider: 'firebase',
        defaultSender: {
          name: 'digiMall Admin',
          email: 'noreply@digimall.ng'
        },
        retrySettings: {
          maxRetries: 3,
          retryDelay: 300, // seconds
          backoffMultiplier: 2
        },
        rateLimits: {
          email: { perMinute: 100, perHour: 5000 },
          sms: { perMinute: 50, perHour: 2000 },
          push: { perMinute: 1000, perHour: 50000 }
        },
        templates: {
          autoGenerateSubject: true,
          defaultLanguage: 'en',
          allowCustomVariables: true
        }
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - settings don't change often
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Send notification
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      message: string;
      type: 'email' | 'sms' | 'push' | 'in_app';
      category?: 'system' | 'order' | 'payment' | 'security' | 'marketing' | 'update';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      recipients: Array<{
        userId?: string;
        email?: string;
        phoneNumber?: string;
      }>;
      scheduledAt?: string;
      templateId?: string;
      variables?: Record<string, any>;
      attachments?: Array<{
        fileName: string;
        fileUrl: string;
        mimeType: string;
      }>;
    }) => api.notifications.send(data),
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
  });
}

// Create notification template
export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      type: 'email' | 'sms' | 'push' | 'in_app';
      category: string;
      subject?: string;
      content: string;
      htmlContent?: string;
      variables: string[];
      language?: string;
      tags?: string[];
    }) => api.notifications.createTemplate(data),
    onSuccess: () => {
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() });
    },
  });
}

// Update notification template
export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        subject?: string;
        content?: string;
        htmlContent?: string;
        variables?: string[];
        isActive?: boolean;
        tags?: string[];
      };
    }) => api.notifications.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific template
      queryClient.invalidateQueries({ queryKey: notificationKeys.template(id) });
      
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() });
    },
  });
}

// Delete notification template
export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({ success: true });
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: notificationKeys.template(id) });
      
      // Invalidate templates list
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates() });
    },
  });
}

// Cancel scheduled notification
export function useCancelNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({ success: true });
    },
    onSuccess: (_, { id }) => {
      // Invalidate notification detail
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
      
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

// Resend failed notification
export function useResendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recipientIds }: { id: string; recipientIds?: string[] }) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({ success: true });
    },
    onSuccess: (_, { id }) => {
      // Invalidate notification detail
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
      
      // Invalidate delivery status
      queryClient.invalidateQueries({ queryKey: notificationKeys.delivery(id) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
  });
}

// Bulk send notifications
export function useBulkSendNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      notifications: Array<{
        title: string;
        message: string;
        type: 'email' | 'sms' | 'push' | 'in_app';
        recipients: Array<{
          userId?: string;
          email?: string;
          phoneNumber?: string;
        }>;
        templateId?: string;
        variables?: Record<string, any>;
      }>;
      scheduledAt?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    }) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({ 
        success: true, 
        queued: data.notifications.length,
        estimatedSendTime: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
    },
    onSuccess: () => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
    },
  });
}

// Update notification settings
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      emailProvider?: string;
      smsProvider?: string;
      pushProvider?: string;
      defaultSender?: {
        name: string;
        email: string;
      };
      retrySettings?: {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier: number;
      };
      rateLimits?: {
        email: { perMinute: number; perHour: number };
        sms: { perMinute: number; perHour: number };
        push: { perMinute: number; perHour: number };
      };
    }) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      // Invalidate settings
      queryClient.invalidateQueries({ queryKey: notificationKeys.settings() });
    },
  });
}

// Test notification delivery
export function useTestNotification() {
  return useMutation({
    mutationFn: (data: {
      type: 'email' | 'sms' | 'push';
      recipient: string; // email or phone number
      templateId?: string;
      variables?: Record<string, any>;
      testMessage?: string;
    }) => {
      // Mock implementation - replace with actual API call
      return Promise.resolve({ 
        success: true, 
        deliveryId: `test-${Date.now()}`,
        estimatedDelivery: new Date(Date.now() + 30 * 1000).toISOString()
      });
    },
  });
}

// ===== UTILITY HOOKS =====

// Get notification metrics for dashboard
export function useNotificationMetrics(
  timeRange: 'today' | 'week' | 'month' = 'today',
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...notificationKeys.all, 'metrics', timeRange],
    queryFn: async () => {
      const stats = await api.notifications.list({ /* stats endpoint */ });
      // Transform to dashboard metrics format
      return {
        totalSent: stats?.totalSent || 0,
        deliveryRate: stats?.deliveryRate || 0,
        openRate: stats?.openRate || 0,
        clickRate: stats?.clickRate || 0,
        trend: stats?.trend || []
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get recent notifications
export function useRecentNotifications(
  limit: number = 10,
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...notificationKeys.all, 'recent', limit],
    queryFn: () => api.notifications.list({ 
      limit, 
      sortBy: 'createdAt', 
      sortOrder: 'DESC' 
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}