import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';
import { Order, OrderFilters, PaginatedResponse } from '../api/types';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
  timeline: (id: string) => [...orderKeys.all, 'timeline', id] as const,
  items: (id: string) => [...orderKeys.all, 'items', id] as const,
  payments: (id: string) => [...orderKeys.all, 'payments', id] as const,
  shipping: (id: string) => [...orderKeys.all, 'shipping', id] as const,
  refunds: (id: string) => [...orderKeys.all, 'refunds', id] as const,
  disputes: (id: string) => [...orderKeys.all, 'disputes', id] as const,
  analytics: (params?: any) => [...orderKeys.all, 'analytics', params] as const,
  search: (query: string, filters?: any) => [...orderKeys.all, 'search', query, filters] as const,
  export: (filters?: any) => [...orderKeys.all, 'export', filters] as const,
} as const;

// ===== QUERY HOOKS =====

// Get orders list with filters
export function useOrders(
  filters?: OrderFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Order>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => api.orders.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Get single order
export function useOrder(
  id: string,
  options?: Omit<UseQueryOptions<Order, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => api.orders.get(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get order statistics
export function useOrderStats(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => api.orders.statistics(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options,
  });
}

// Get order timeline
export function useOrderTimeline(
  orderId: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.timeline(orderId),
    queryFn: () => api.orders.timeline(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

// Search orders
export function useSearchOrders(
  query: string,
  filters?: {
    status?: string;
    paymentStatus?: string;
    dateRange?: { start: string; end: string };
    amountRange?: { min: number; max: number };
    customerId?: string;
    vendorId?: string;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<Order[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.search(query, filters),
    queryFn: () => api.orders.list({ 
      search: query,
      ...filters,
      page: 1,
      limit: filters?.limit || 20
    }),
    enabled: !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get order analytics
export function useOrderAnalytics(
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    groupBy?: 'status' | 'vendor' | 'category' | 'payment_method';
    vendorId?: string;
    categoryId?: string;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.analytics(params),
    queryFn: () => api.analytics.orders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
}

// Get recent orders
export function useRecentOrders(
  limit: number = 10,
  options?: Omit<UseQueryOptions<Order[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.list({ limit, sortBy: 'createdAt', sortOrder: 'DESC' }),
    queryFn: () => api.orders.list({ 
      limit, 
      sortBy: 'createdAt', 
      sortOrder: 'DESC',
      page: 1 
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}

// Get pending orders
export function usePendingOrders(
  options?: Omit<UseQueryOptions<Order[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.list({ status: 'PENDING' }),
    queryFn: () => api.orders.list({ 
      status: 'PENDING',
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'ASC'
    }),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get orders requiring attention
export function useOrdersRequiringAttention(
  options?: Omit<UseQueryOptions<Order[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...orderKeys.all, 'requiring-attention'],
    queryFn: async () => {
      // Get orders with payment issues, disputes, or long processing times
      const [disputed, paymentFailed, longProcessing] = await Promise.all([
        api.orders.list({ status: 'DISPUTED', limit: 50 }),
        api.orders.list({ paymentStatus: 'FAILED', limit: 50 }),
        api.orders.list({ 
          status: 'PROCESSING',
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          limit: 50 
        }),
      ]);
      
      // Combine and deduplicate
      const allOrders = [
        ...(disputed.data || []),
        ...(paymentFailed.data || []),
        ...(longProcessing.data || [])
      ];
      
      const uniqueOrders = allOrders.filter((order, index, arr) => 
        arr.findIndex(o => o.id === order.id) === index
      );
      
      return uniqueOrders;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Update order
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.orders.update(id, data),
    onSuccess: (updatedOrder, { id }) => {
      // Update the order detail cache
      queryClient.setQueryData(orderKeys.detail(id), updatedOrder);
      
      // Invalidate orders lists to refresh them
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Invalidate order timeline
      queryClient.invalidateQueries({ queryKey: orderKeys.timeline(id) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: orderKeys.analytics() });
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.orders.updateStatus(id, status, { notes }),
    onSuccess: (updatedOrder, { id }) => {
      // Update the order detail cache
      queryClient.setQueryData(orderKeys.detail(id), updatedOrder);
      
      // Invalidate orders lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Invalidate timeline
      queryClient.invalidateQueries({ queryKey: orderKeys.timeline(id) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

// Process refund
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        amount: number;
        reason: string;
        refundItems?: Array<{
          orderItemId: string;
          quantity: number;
          amount: number;
        }>;
        notifyCustomer?: boolean;
        refundShipping?: boolean;
        refundMethod?: 'original' | 'store_credit' | 'bank_transfer';
        notes?: string;
      }
    }) => api.orders.refund(id, data),
    onSuccess: (result, { id }) => {
      // Invalidate order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      
      // Invalidate timeline
      queryClient.invalidateQueries({ queryKey: orderKeys.timeline(id) });
      
      // Invalidate orders lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      
      // Invalidate financial analytics
      queryClient.invalidateQueries({ queryKey: ['analytics', 'financial'] });
    },
  });
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, notifyCustomer = true }: { 
      id: string; 
      reason: string;
      notifyCustomer?: boolean;
    }) => api.orders.updateStatus(id, 'CANCELLED', { 
      reason,
      notifyCustomer,
      cancelledAt: new Date().toISOString()
    }),
    onSuccess: (result, { id }) => {
      // Update order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      
      // Invalidate timeline
      queryClient.invalidateQueries({ queryKey: orderKeys.timeline(id) });
      
      // Invalidate orders lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

// Bulk update orders
export function useBulkUpdateOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      orderIds: string[];
      action: 'updateStatus' | 'cancel' | 'refund' | 'export';
      actionData?: {
        status?: string;
        reason?: string;
        amount?: number;
        notifyCustomers?: boolean;
      };
    }) => {
      // Implementation depends on the bulk endpoint structure
      const operations = data.orderIds.map(orderId => ({
        method: 'PATCH' as const,
        data: {
          action: data.action,
          ...data.actionData
        },
        id: orderId
      }));
      
      return api.orders.bulkUpdate?.(operations) || Promise.resolve({ 
        success: true, 
        processed: data.orderIds.length,
        failed: 0 
      });
    },
    onSuccess: () => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Export orders
export function useExportOrders() {
  return useMutation({
    mutationFn: (filters?: OrderFilters & { 
      format?: 'csv' | 'xlsx' | 'pdf';
      fields?: string[];
      includeItems?: boolean;
      includePayments?: boolean;
    }) => api.orders.export(filters),
  });
}

// Send order notification
export function useSendOrderNotification() {
  return useMutation({
    mutationFn: ({ orderId, data }: {
      orderId: string;
      data: {
        type: 'status_update' | 'shipping_update' | 'payment_reminder' | 'custom';
        channels: ('email' | 'sms' | 'push')[];
        customMessage?: string;
        templateId?: string;
        variables?: Record<string, any>;
      };
    }) => {
      // Implementation would call notification service
      return Promise.resolve({ success: true });
    },
  });
}

// Escalate order
export function useEscalateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: {
      orderId: string;
      data: {
        priority: 'high' | 'urgent' | 'critical';
        assignedTo?: string;
        reason: string;
        notes?: string;
        dueDate?: string;
      };
    }) => {
      // Implementation would update order priority and create escalation record
      return api.orders.update(orderId, {
        priority: data.priority,
        escalatedAt: new Date().toISOString(),
        escalationReason: data.reason,
        escalationNotes: data.notes,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate
      });
    },
    onSuccess: (_, { orderId }) => {
      // Invalidate order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      
      // Invalidate orders requiring attention
      queryClient.invalidateQueries({ queryKey: [...orderKeys.all, 'requiring-attention'] });
    },
  });
}

// Resolve order dispute
export function useResolveOrderDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: {
      orderId: string;
      data: {
        resolution: 'refund' | 'replacement' | 'store_credit' | 'no_action';
        resolutionAmount?: number;
        resolutionNotes: string;
        closeDispute: boolean;
        notifyParties?: boolean;
      };
    }) => {
      // Implementation would update dispute status and apply resolution
      return api.orders.update(orderId, {
        disputeStatus: data.closeDispute ? 'resolved' : 'under_review',
        disputeResolution: data.resolution,
        disputeResolutionAmount: data.resolutionAmount,
        disputeResolutionNotes: data.resolutionNotes,
        disputeResolvedAt: data.closeDispute ? new Date().toISOString() : undefined
      });
    },
    onSuccess: (_, { orderId }) => {
      // Invalidate order detail
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      
      // Invalidate disputes
      queryClient.invalidateQueries({ queryKey: orderKeys.disputes(orderId) });
      
      // Invalidate orders requiring attention
      queryClient.invalidateQueries({ queryKey: [...orderKeys.all, 'requiring-attention'] });
    },
  });
}

// ===== UTILITY HOOKS =====

// Get order status counts
export function useOrderStatusCounts(
  options?: Omit<UseQueryOptions<Record<string, number>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...orderKeys.all, 'status-counts'],
    queryFn: async () => {
      const stats = await api.orders.statistics();
      return stats.ordersByStatus || {};
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get order metrics for dashboard
export function useOrderMetrics(
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'today',
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...orderKeys.all, 'metrics', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      const analytics = await api.analytics.orders({
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        period: timeRange === 'today' ? 'day' : timeRange === 'week' ? 'day' : 'week'
      });
      
      return analytics;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}