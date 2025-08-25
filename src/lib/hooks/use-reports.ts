import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';
import { reportsService } from '../api/services/reports.service';

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
    queryFn: () => reportsService.getPlatformMetrics(params),
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
    queryFn: () => reportsService.getVendorPerformanceData(params),
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
    queryFn: () => reportsService.getTopVendors(params),
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
    queryFn: () => reportsService.getCategoryDistribution(params),
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
    queryFn: () => reportsService.getVendorStatusDistribution(),
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
    queryFn: () => reportsService.getCommissionAnalytics(params),
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
    mutationFn: (params: {
      reportType: 'revenue' | 'vendors' | 'analytics' | 'issues' | 'commission';
      format: 'pdf' | 'excel' | 'csv';
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
    }) => reportsService.exportReport(params),
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