import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { analyticsService } from '../api/services';
import { DashboardAnalytics, RevenueData, CategoryStats } from '../api/types';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  revenue: (params?: any) => [...analyticsKeys.all, 'revenue', params] as const,
  categories: (params?: any) => [...analyticsKeys.all, 'categories', params] as const,
  users: (params?: any) => [...analyticsKeys.all, 'users', params] as const,
  vendors: (params?: any) => [...analyticsKeys.all, 'vendors', params] as const,
  products: (params?: any) => [...analyticsKeys.all, 'products', params] as const,
  orders: (params?: any) => [...analyticsKeys.all, 'orders', params] as const,
  system: () => [...analyticsKeys.all, 'system'] as const,
};

// Dashboard analytics hook
export function useDashboardAnalytics(
  options?: Omit<UseQueryOptions<DashboardAnalytics, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboardAnalytics(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Revenue data hook
export function useRevenueData(
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  },
  options?: Omit<UseQueryOptions<RevenueData[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsService.getRevenueData(params),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
}

// Category stats hook
export function useCategoryStats(
  params?: {
    limit?: number;
    period?: 'day' | 'week' | 'month' | 'year';
  },
  options?: Omit<UseQueryOptions<CategoryStats[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.categories(params),
    queryFn: () => analyticsService.getCategoryStats(params),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
}

// User analytics hook
export function useUserAnalytics(
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.users(params),
    queryFn: () => analyticsService.getUserAnalytics(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  });
}

// Vendor analytics hook
export function useVendorAnalytics(
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: analyticsKeys.vendors(params),
    queryFn: () => analyticsService.getVendorAnalytics(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  });
}

// Product analytics hook
export function useProductAnalytics(
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: analyticsKeys.products(params),
    queryFn: () => analyticsService.getProductAnalytics(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  });
}

// Order analytics hook
export function useOrderAnalytics(
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: analyticsKeys.orders(params),
    queryFn: () => analyticsService.getOrderAnalytics(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  });
}

// System metrics hook
export function useSystemMetrics(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.system(),
    queryFn: () => analyticsService.getSystemMetrics(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for system metrics
    ...options,
  });
}