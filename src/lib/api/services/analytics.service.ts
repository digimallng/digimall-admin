import { apiClient } from '../client';
import { DashboardAnalytics, RevenueData, CategoryStats } from '../types';

export class AnalyticsService {
  // Dashboard analytics
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return apiClient.get<DashboardAnalytics>('/analytics/dashboard');
  }

  // Revenue analytics
  async getRevenueData(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<any> {
    return apiClient.get('/analytics/revenue', params);
  }

  // Category performance
  async getCategoryStats(params?: {
    limit?: number;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<CategoryStats[]> {
    return apiClient.get<CategoryStats[]>('/analytics/categories', params);
  }

  // User analytics
  async getUserAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }) {
    return apiClient.get('/analytics/users', params);
  }

  // Vendor analytics
  async getVendorAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }) {
    return apiClient.get('/analytics/vendors', params);
  }

  // Product analytics
  async getProductAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }) {
    return apiClient.get('/analytics/products', params);
  }

  // Order analytics
  async getOrderAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }) {
    return apiClient.get('/analytics/orders', params);
  }

  // System metrics
  async getSystemMetrics() {
    return apiClient.get('/analytics/system');
  }

  // Export analytics data
  async exportAnalytics(params: {
    type: 'revenue' | 'users' | 'vendors' | 'products' | 'orders';
    format: 'csv' | 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
  }) {
    return apiClient.get('/analytics/export', params);
  }
}

export const analyticsService = new AnalyticsService();