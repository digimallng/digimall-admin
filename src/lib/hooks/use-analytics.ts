import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { analyticsService } from '../api/services';
import type {
  DashboardAnalyticsResponse,
  RevenueAnalyticsResponse,
  OrderAnalyticsResponse,
  PerformanceAnalyticsResponse,
  DashboardAnalyticsParams,
} from '../api/types';

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
  params?: DashboardAnalyticsParams,
  options?: Omit<UseQueryOptions<DashboardAnalyticsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboard(params),
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchInterval: false, // Disable auto-refetch, use manual refresh button
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1,
    ...options,
  });
}

// Revenue data hook
export function useRevenueData(
  params?: DashboardAnalyticsParams,
  options?: Omit<UseQueryOptions<RevenueAnalyticsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsService.getRevenue(params),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval: false, // Disable auto-refetch
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

// Category stats hook
export function useCategoryStats(
  params?: DashboardAnalyticsParams,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.categories(params),
    queryFn: () => analyticsService.getProducts(params),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
}

// User analytics hook
export function useUserAnalytics(
  params?: DashboardAnalyticsParams,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.users(params),
    queryFn: () => analyticsService.getUsers(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  });
}

// Vendor analytics hook
export function useVendorAnalytics(
  params?: DashboardAnalyticsParams,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: analyticsKeys.vendors(params),
    queryFn: () => analyticsService.getVendors(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  });
}

// Product analytics hook
export function useProductAnalytics(
  params?: DashboardAnalyticsParams,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: analyticsKeys.products(params),
    queryFn: () => analyticsService.getProducts(params),
    refetchInterval: 10 * 60 * 1000,
    ...options,
  });
}

// Order analytics hook
export function useOrderAnalytics(
  params?: DashboardAnalyticsParams,
  options?: UseQueryOptions<OrderAnalyticsResponse, Error>
) {
  return useQuery({
    queryKey: analyticsKeys.orders(params),
    queryFn: () => analyticsService.getOrders(params),
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    cacheTime: 10 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

// System metrics hook
export function useSystemMetrics(
  params?: DashboardAnalyticsParams,
  options?: Omit<UseQueryOptions<PerformanceAnalyticsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: analyticsKeys.system(),
    queryFn: () => analyticsService.getPerformance(params),
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    cacheTime: 5 * 60 * 1000,
    refetchInterval: false, // Changed from 30 seconds to manual only
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}