import { apiClient } from '../client';
import { 
  Order, 
  OrderFilter, 
  OrderStatus, 
  PaymentStatus,
  OrderDetail,
  OrderBulkAction,
  OrderExport,
  RefundRequest
} from '@/types/order';

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  totalRevenue: number;
  cancelledCount: number;
  refundedCount: number;
}

export const orderService = {
  // Get all orders with filters
  async getOrders(filter?: OrderFilter): Promise<OrderListResponse> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    return apiClient.get(`/api/proxy/admin/orders?${params.toString()}`);
  },

  // Get order by ID
  async getOrderById(id: string): Promise<OrderDetail> {
    return apiClient.get(`/api/proxy/admin/orders/${id}`);
  },

  // Update order status
  async updateOrderStatus(id: string, data: {
    status: OrderStatus;
    reason?: string;
    trackingNumber?: string;
    note?: string;
  }): Promise<Order> {
    return apiClient.put(`/api/proxy/admin/orders/${id}/status`, data);
  },

  // Process refund
  async processRefund(id: string, data: RefundRequest): Promise<{
    message: string;
    refundId: string;
    amount: number;
  }> {
    return apiClient.post(`/api/proxy/admin/orders/${id}/refund`, data);
  },

  // Bulk actions
  async bulkAction(data: OrderBulkAction): Promise<{
    action: string;
    totalProcessed: number;
    successful: number;
    failed: number;
    results: Array<{ id: string; success: boolean; error?: string }>;
  }> {
    return apiClient.post('/api/proxy/admin/orders/bulk-action', data);
  },

  // Export orders
  async exportOrders(params: OrderExport): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    const response = await fetch(`${apiClient.baseURL}/orders/export?${queryParams.toString()}`, {
      headers: await apiClient.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },

  // Get order statistics
  async getOrderStats(filter?: {
    startDate?: string;
    endDate?: string;
    vendorId?: string;
  }): Promise<OrderStats> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const orders = await this.getOrders({ 
      ...(filter || {}),
      limit: 1000 // Get more orders for stats
    });
    
    // Calculate stats from orders
    const stats: OrderStats = {
      total: orders.total,
      pending: 0,
      processing: 0,
      delivered: 0,
      totalRevenue: 0,
      cancelledCount: 0,
      refundedCount: 0,
    };
    
    orders.orders.forEach(order => {
      switch (order.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'processing':
          stats.processing++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'cancelled':
          stats.cancelledCount++;
          break;
        case 'refunded':
          stats.refundedCount++;
          break;
      }
      
      if (order.paymentStatus === 'paid' || order.paymentStatus === 'completed') {
        stats.totalRevenue += order.total;
      }
    });
    
    return stats;
  },

  // Order analytics from backend service
  async getOrderStatistics() {
    try {
      const response = await apiClient.get('/api/proxy/admin/analytics/statistics');
      return response;
    } catch (error) {
      console.error('Failed to fetch order statistics:', error);
      return {
        totalOrders: 0,
        ordersByStatus: {},
        totalRevenue: 0,
        revenueByPeriod: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0,
        },
        recentOrders: [],
        orderMetrics: {
          averageOrderValue: 0,
          conversionRate: 0,
          completionRate: 0,
          cancellationRate: 0,
        },
      };
    }
  },

  async getOrderCount(filters?: {
    status?: string;
    paymentStatus?: string;
    userId?: string;
    vendorId?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.vendorId) params.append('vendorId', filters.vendorId);
      if (filters?.createdAfter) params.append('createdAfter', filters.createdAfter.toISOString());
      if (filters?.createdBefore) params.append('createdBefore', filters.createdBefore.toISOString());

      const response = await apiClient.get(`/api/proxy/admin/analytics/count?${params.toString()}`);
      return response.count || 0;
    } catch (error) {
      console.error('Failed to get order count:', error);
      return 0;
    }
  },
};

// Export as class for consistency with index.ts
export class OrderService {
  static async getOrders(params?: any) {
    return orderService.getOrders(params);
  }
  
  static async getOrderById(id: string) {
    return orderService.getOrderById(id);
  }
  
  static async updateOrderStatus(id: string, status: any) {
    return orderService.updateOrderStatus(id, status);
  }
  
  static async processRefund(id: string, data: any) {
    return orderService.processRefund(id, data);
  }
  
  static async exportOrders(filters: any) {
    return orderService.exportOrders(filters);
  }
  
  static async bulkUpdateOrders(data: any) {
    return orderService.bulkUpdateOrders(data);
  }
  
  static async getOrderStats(filters: any) {
    return orderService.getOrderStats(filters);
  }
}