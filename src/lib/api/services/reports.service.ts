import { apiClient } from '../core';

// TypeScript interfaces for report data
export interface PlatformMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalCommission: number;
  commissionGrowth: number;
  totalVendors: number;
  vendorGrowth: number;
  totalCustomers: number;
  customerGrowth: number;
  totalOrders: number;
  orderGrowth: number;
  avgOrderValue: number;
  avgOrderGrowth: number;
  disputeRate: number;
  disputeChange: number;
  vendorSatisfaction: number;
  satisfactionChange: number;
}

export interface VendorPerformanceData {
  name: string;
  revenue: number;
  commission: number;
  vendors: number;
  orders: number;
}

export interface TopVendor {
  name: string;
  revenue: number;
  commission: number;
  orders: number;
  growth: number;
}

export interface CategoryDistribution {
  category: string;
  value: number;
  revenue: number;
}

export interface VendorStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface CommissionAnalytics {
  totalCommission: number;
  avgCommissionRate: number;
  topCommissionVendors: Array<{
    name: string;
    commission: number;
    rate: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    commission: number;
    rate: number;
  }>;
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  size: number;
}

export class ReportsService {
  // Get platform-wide metrics
  async getPlatformMetrics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<PlatformMetrics> {
    try {
      // Get dashboard metrics from analytics with correct versioned path
      const response = await apiClient.get('/admin/analytics/dashboard', {
        params,
      });

      // Transform backend data to match frontend interface
      const data = response.data;
      return {
        totalRevenue: data.totalRevenue || 0,
        revenueGrowth: data.revenueGrowth || 0,
        totalCommission: data.totalCommission || 0,
        commissionGrowth: data.commissionGrowth || 0,
        totalVendors: data.totalVendors || 0,
        vendorGrowth: data.vendorGrowth || 0,
        totalCustomers: data.totalUsers || 0,
        customerGrowth: data.userGrowth || 0,
        totalOrders: data.totalOrders || 0,
        orderGrowth: data.orderGrowth || 0,
        avgOrderValue: data.avgOrderValue || 0,
        avgOrderGrowth: data.avgOrderGrowth || 0,
        disputeRate: data.disputeRate || 0,
        disputeChange: data.disputeChange || 0,
        vendorSatisfaction: data.vendorSatisfaction || 0,
        satisfactionChange: data.satisfactionChange || 0,
      };
    } catch (error) {
      console.error('Failed to fetch platform metrics:', error);
      // Return default values on error
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        totalCommission: 0,
        commissionGrowth: 0,
        totalVendors: 0,
        vendorGrowth: 0,
        totalCustomers: 0,
        customerGrowth: 0,
        totalOrders: 0,
        orderGrowth: 0,
        avgOrderValue: 0,
        avgOrderGrowth: 0,
        disputeRate: 0,
        disputeChange: 0,
        vendorSatisfaction: 0,
        satisfactionChange: 0,
      };
    }
  }

  // Get vendor performance data for charts
  async getVendorPerformanceData(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<VendorPerformanceData[]> {
    try {
      const response = await apiClient.get('/admin/analytics/revenue', {
        params,
      });

      // Transform to chart data format
      const data = response.data;
      if (data.monthlyData && Array.isArray(data.monthlyData)) {
        return data.monthlyData.map((item: any) => ({
          name: item.month || item.name || 'Unknown',
          revenue: item.revenue || 0,
          commission: item.commission || 0,
          vendors: item.vendors || 0,
          orders: item.orders || 0,
        }));
      }

      // Fallback to empty array
      return [];
    } catch (error) {
      console.error('Failed to fetch vendor performance data:', error);
      return [];
    }
  }

  // Get top performing vendors
  async getTopVendors(params?: {
    limit?: number;
    period?: 'day' | 'week' | 'month' | 'year';
    sortBy?: 'revenue' | 'orders' | 'growth';
  }): Promise<TopVendor[]> {
    try {
      const response = await apiClient.get('/admin/analytics/vendors', {
        params: {
          period: params?.period || 'month',
        },
      });

      const data = response.data;
      if (data.topVendors && Array.isArray(data.topVendors)) {
        return data.topVendors.map((vendor: any) => ({
          name: vendor.businessName || vendor.name || 'Unknown Vendor',
          revenue: vendor.totalRevenue || vendor.revenue || 0,
          commission: vendor.commission || (vendor.totalRevenue * 0.05) || 0,
          orders: vendor.totalOrders || vendor.orders || 0,
          growth: vendor.growth || 0,
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch top vendors:', error);
      return [];
    }
  }

  // Get category distribution data
  async getCategoryDistribution(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<CategoryDistribution[]> {
    try {
      const response = await apiClient.get('/admin/analytics/categories', {
        params: {
          period: params?.period || 'month',
        },
      });

      const data = response.data;
      if (data.categoryMetrics && Array.isArray(data.categoryMetrics)) {
        return data.categoryMetrics.map((category: any) => ({
          category: category.name || category.category || 'Unknown',
          value: category.percentage || 0,
          revenue: category.revenue || 0,
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch category distribution:', error);
      return [];
    }
  }

  // Get vendor status distribution
  async getVendorStatusDistribution(): Promise<VendorStatusDistribution[]> {
    try {
      const response = await apiClient.get('/admin/analytics/vendors');
      
      const data = response.data;
      if (data.vendorsByStatus && Array.isArray(data.vendorsByStatus)) {
        const statusData = data.vendorsByStatus;
        const total = statusData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);

        return statusData.map((item: any) => ({
          status: (item.status || 'Unknown').charAt(0).toUpperCase() + (item.status || 'Unknown').slice(1),
          count: item.count || 0,
          percentage: total > 0 ? Math.round(((item.count || 0) / total) * 100) : 0,
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch vendor status distribution:', error);
      return [];
    }
  }

  // Get commission analytics
  async getCommissionAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    vendorId?: string;
  }): Promise<CommissionAnalytics> {
    try {
      const response = await apiClient.get('/admin/financial/overview', {
        params,
      });

      const data = response.data;
      return {
        totalCommission: data.totalCommissions || 0,
        avgCommissionRate: 5.0, // Default rate
        topCommissionVendors: data.topCommissionVendors || [],
        monthlyTrend: data.monthlyTrend || [],
      };
    } catch (error) {
      console.error('Failed to fetch commission analytics:', error);
      return {
        totalCommission: 0,
        avgCommissionRate: 0,
        topCommissionVendors: [],
        monthlyTrend: [],
      };
    }
  }

  // Export report data
  async exportReport(params: {
    reportType: 'dashboard' | 'users' | 'orders' | 'revenue';
    format: 'json' | 'csv' | 'excel';
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<ExportResponse> {
    try {
      const response = await apiClient.post('/admin/analytics/export', {
        type: params.reportType,
        format: params.format,
        period: params.period,
        startDate: params.startDate,
        endDate: params.endDate,
      }, {
        responseType: 'blob', // Important for file downloads
      });

      // Map format to MIME type and file extension
      const formatConfig: Record<string, { mimeType: string; extension: string }> = {
        'excel': {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          extension: 'xlsx',
        },
        'csv': {
          mimeType: 'text/csv',
          extension: 'csv',
        },
        'json': {
          mimeType: 'application/json',
          extension: 'json',
        },
      };

      const config = formatConfig[params.format] || {
        mimeType: 'application/octet-stream',
        extension: params.format,
      };

      // Create blob URL for download with correct MIME type
      const blob = new Blob([response.data], { type: config.mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = `${params.reportType}_report_${new Date().toISOString().split('T')[0]}.${config.extension}`;

      return {
        downloadUrl,
        filename,
        size: blob.size,
      };
    } catch (error) {
      console.error('Failed to export report:', error);
      throw new Error('Failed to generate report. Please try again.');
    }
  }

  // Get financial analytics for reports
  async getFinancialAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const response = await apiClient.get('/admin/financial/overview', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch financial analytics:', error);
      return null;
    }
  }

  // Get user analytics
  async getUserAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const response = await apiClient.get('/admin/analytics/users', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user analytics:', error);
      return null;
    }
  }

  // Get product analytics
  async getProductAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const response = await apiClient.get('/admin/analytics/products', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch product analytics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const reportsService = new ReportsService();