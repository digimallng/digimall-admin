import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  platform: () => [...reportKeys.all, 'platform'] as const,
  vendors: (params?: any) => [...reportKeys.all, 'vendors', params] as const,
  topVendors: (params?: any) => [...reportKeys.all, 'top-vendors', params] as const,
  categories: (params?: any) => [...reportKeys.all, 'categories', params] as const,
  performance: (params?: any) => [...reportKeys.all, 'performance', params] as const,
  commission: (params?: any) => [...reportKeys.all, 'commission', params] as const,
  exports: () => [...reportKeys.all, 'exports'] as const,
} as const;

// ===== QUERY HOOKS =====

// Get platform-wide metrics for reports
export function usePlatformMetrics(
  params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...reportKeys.platform(), params],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        totalRevenue: 45000000,
        revenueGrowth: 23.5,
        totalCommission: 2250000,
        commissionGrowth: 18.2,
        totalVendors: 247,
        vendorGrowth: 12.8,
        totalCustomers: 15647,
        customerGrowth: 31.4,
        totalOrders: 8934,
        orderGrowth: 19.7,
        avgOrderValue: 87500,
        avgOrderGrowth: 8.3,
        disputeRate: 2.3,
        disputeChange: -15.2,
        vendorSatisfaction: 4.2,
        satisfactionChange: 5.1,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get vendor performance data for charts
export function useVendorPerformanceData(
  params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  },
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...reportKeys.performance(), params],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        { name: 'Jan', revenue: 3200000, commission: 160000, vendors: 198, orders: 1245 },
        { name: 'Feb', revenue: 3800000, commission: 190000, vendors: 210, orders: 1456 },
        { name: 'Mar', revenue: 4100000, commission: 205000, vendors: 225, orders: 1598 },
        { name: 'Apr', revenue: 4600000, commission: 230000, vendors: 235, orders: 1789 },
        { name: 'May', revenue: 5200000, commission: 260000, vendors: 242, orders: 1923 },
        { name: 'Jun', revenue: 5800000, commission: 290000, vendors: 247, orders: 2134 },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get top performing vendors
export function useTopVendors(
  params?: {
    limit?: number;
    period?: 'day' | 'week' | 'month' | 'year';
    sortBy?: 'revenue' | 'orders' | 'growth';
  },
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...reportKeys.topVendors(), params],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        { name: 'TechHub Nigeria', revenue: 2100000, commission: 105000, orders: 567, growth: 34.2 },
        { name: 'Fashion Forward', revenue: 1850000, commission: 92500, orders: 423, growth: 28.7 },
        { name: 'Home Essentials', revenue: 1620000, commission: 81000, orders: 389, growth: 22.1 },
        { name: 'Sports Arena', revenue: 1480000, commission: 74000, orders: 312, growth: 19.8 },
        { name: 'Book Paradise', revenue: 1350000, commission: 67500, orders: 298, growth: 15.3 },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get category distribution data
export function useCategoryDistribution(
  params?: {
    period?: 'day' | 'week' | 'month' | 'year';
  },
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...reportKeys.categories(), params],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        { category: 'Electronics', value: 35, revenue: 15750000 },
        { category: 'Fashion', value: 25, revenue: 11250000 },
        { category: 'Home & Garden', value: 18, revenue: 8100000 },
        { category: 'Sports', value: 12, revenue: 5400000 },
        { category: 'Books', value: 10, revenue: 4500000 },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get vendor status distribution
export function useVendorStatusDistribution(
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...reportKeys.vendors(), 'status'],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        { status: 'Active', count: 198, percentage: 80.2 },
        { status: 'Pending', count: 23, percentage: 9.3 },
        { status: 'Suspended', count: 15, percentage: 6.1 },
        { status: 'Under Review', count: 11, percentage: 4.5 },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get commission analytics
export function useCommissionAnalytics(
  params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    vendorId?: string;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...reportKeys.commission(), params],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        totalCommission: 2250000,
        avgCommissionRate: 5.0,
        topCommissionVendors: [
          { name: 'TechHub Nigeria', commission: 105000, rate: 5.0 },
          { name: 'Fashion Forward', commission: 92500, rate: 5.0 },
          { name: 'Home Essentials', commission: 81000, rate: 5.0 },
        ],
        monthlyTrend: [
          { month: 'Jan', commission: 160000, rate: 5.0 },
          { month: 'Feb', commission: 190000, rate: 5.0 },
          { month: 'Mar', commission: 205000, rate: 5.0 },
          { month: 'Apr', commission: 230000, rate: 5.0 },
          { month: 'May', commission: 260000, rate: 5.0 },
          { month: 'Jun', commission: 290000, rate: 5.0 },
        ],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get detailed platform reports for specific time periods
export function usePlatformReport(
  params: {
    reportType: 'revenue' | 'vendors' | 'analytics' | 'issues' | 'commission';
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...reportKeys.all, 'detailed', params],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      const { reportType, period = 'month' } = params;
      
      switch (reportType) {
        case 'revenue':
          return {
            summary: {
              totalRevenue: 45000000,
              avgOrderValue: 87500,
              conversionRate: 3.2,
              topPaymentMethods: ['Card', 'Bank Transfer', 'Wallet'],
            },
            breakdown: [
              { category: 'Electronics', revenue: 15750000, percentage: 35 },
              { category: 'Fashion', revenue: 11250000, percentage: 25 },
            ],
          };
          
        case 'vendors':
          return {
            summary: {
              totalVendors: 247,
              activeVendors: 198,
              avgRating: 4.2,
              topPerformers: 25,
            },
            performance: [
              { name: 'TechHub Nigeria', revenue: 2100000, rating: 4.8 },
              { name: 'Fashion Forward', revenue: 1850000, rating: 4.6 },
            ],
          };
          
        default:
          return {
            summary: { message: `${reportType} report data` },
            details: [],
          };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Export report data
export function useExportReport() {
  return useMutation({
    mutationFn: async (params: {
      reportType: 'revenue' | 'vendors' | 'analytics' | 'issues' | 'commission';
      format: 'pdf' | 'excel' | 'csv';
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
    }) => {
      // Mock implementation - replace with actual API call
      return {
        downloadUrl: `https://api.digimall.ng/reports/export/${params.reportType}.${params.format}`,
        filename: `${params.reportType}_report_${new Date().toISOString().split('T')[0]}.${params.format}`,
        size: Math.floor(Math.random() * 5000000), // Random file size
      };
    },
  });
}

// Schedule report generation
export function useScheduleReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      reportType: 'revenue' | 'vendors' | 'analytics' | 'issues' | 'commission';
      frequency: 'daily' | 'weekly' | 'monthly';
      recipients: string[];
      format: 'pdf' | 'excel' | 'csv';
    }) => {
      // Mock implementation - replace with actual API call
      return {
        id: `scheduled_${Date.now()}`,
        ...params,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      // Invalidate any related queries
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

// Generate custom report
export function useGenerateCustomReport() {
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      metrics: string[];
      filters: Record<string, any>;
      chartTypes: string[];
      recipients?: string[];
    }) => {
      // Mock implementation - replace with actual API call
      return {
        id: `custom_${Date.now()}`,
        status: 'generating',
        estimatedTime: 120, // seconds
        ...params,
      };
    },
  });
}

// ===== UTILITY HOOKS =====

// Get report generation status
export function useReportStatus(reportId: string | null) {
  return useQuery({
    queryKey: [...reportKeys.all, 'status', reportId],
    queryFn: async () => {
      if (!reportId) return null;
      
      // Mock implementation - replace with actual API call
      return {
        id: reportId,
        status: Math.random() > 0.5 ? 'completed' : 'generating',
        progress: Math.floor(Math.random() * 100),
        downloadUrl: Math.random() > 0.5 ? `https://api.digimall.ng/reports/download/${reportId}` : null,
      };
    },
    enabled: !!reportId,
    refetchInterval: (data) => {
      // Only refetch if still generating
      return data?.status === 'generating' ? 2000 : false;
    },
  });
}