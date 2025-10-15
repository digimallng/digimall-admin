/**
 * Analytics React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services';
import type { GetAnalyticsParams } from '../types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'dashboard', params] as const,
  users: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'users', params] as const,
  vendors: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'vendors', params] as const,
  products: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'products', params] as const,
  orders: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'orders', params] as const,
  revenue: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'revenue', params] as const,
  traffic: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'traffic', params] as const,
  conversion: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'conversion', params] as const,
  performance: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'performance', params] as const,
  comparison: (params?: GetAnalyticsParams) => [...analyticsKeys.all, 'comparison', params] as const,
};

export function useDashboardAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.dashboard(params),
    queryFn: () => analyticsService.getDashboard(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.users(params),
    queryFn: () => analyticsService.getUsers(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.vendors(params),
    queryFn: () => analyticsService.getVendors(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.products(params),
    queryFn: () => analyticsService.getProducts(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrderAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.orders(params),
    queryFn: () => analyticsService.getOrders(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.revenue(params),
    queryFn: () => analyticsService.getRevenue(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrafficAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.traffic(params),
    queryFn: () => analyticsService.getTraffic(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useConversionAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.conversion(params),
    queryFn: () => analyticsService.getConversion(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerformanceAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.performance(params),
    queryFn: () => analyticsService.getPerformance(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useComparisonAnalytics(params?: GetAnalyticsParams) {
  return useQuery({
    queryKey: analyticsKeys.comparison(params),
    queryFn: () => analyticsService.getComparison(params),
    staleTime: 5 * 60 * 1000,
  });
}
