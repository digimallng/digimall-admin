/**
 * Analytics Service
 *
 * Service layer for all analytics-related API operations.
 * Implements all 10 analytics endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  DashboardAnalyticsResponse,
  UserAnalyticsResponse,
  VendorAnalyticsResponse,
  ProductAnalyticsResponse,
  OrderAnalyticsResponse,
  RevenueAnalyticsResponse,
  TrafficAnalyticsResponse,
  ConversionAnalyticsResponse,
  PerformanceAnalyticsResponse,
  ComparisonAnalyticsResponse,
  GetAnalyticsParams,
} from '../types';

// ===== ANALYTICS SERVICE CLASS =====

class AnalyticsService {
  // ===== CORE ANALYTICS ENDPOINTS =====

  /**
   * Get dashboard analytics overview
   */
  async getDashboard(
    params?: GetAnalyticsParams
  ): Promise<DashboardAnalyticsResponse> {
    const response = await apiClient.get<DashboardAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD,
      { params }
    );
    return response.data!;
  }

  /**
   * Get user analytics
   */
  async getUsers(params?: GetAnalyticsParams): Promise<UserAnalyticsResponse> {
    const response = await apiClient.get<UserAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.USERS,
      { params }
    );
    return response.data!;
  }

  /**
   * Get vendor analytics
   */
  async getVendors(
    params?: GetAnalyticsParams
  ): Promise<VendorAnalyticsResponse> {
    const response = await apiClient.get<VendorAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.VENDORS,
      { params }
    );
    return response.data!;
  }

  /**
   * Get product analytics
   */
  async getProducts(
    params?: GetAnalyticsParams
  ): Promise<ProductAnalyticsResponse> {
    const response = await apiClient.get<ProductAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.PRODUCTS,
      { params }
    );
    return response.data!;
  }

  /**
   * Get order analytics
   */
  async getOrders(
    params?: GetAnalyticsParams
  ): Promise<OrderAnalyticsResponse> {
    const response = await apiClient.get<OrderAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.ORDERS,
      { params }
    );
    return response.data!;
  }

  /**
   * Get revenue analytics
   */
  async getRevenue(
    params?: GetAnalyticsParams
  ): Promise<RevenueAnalyticsResponse> {
    const response = await apiClient.get<RevenueAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.REVENUE,
      { params }
    );
    return response.data!;
  }

  /**
   * Get traffic analytics
   */
  async getTraffic(
    params?: GetAnalyticsParams
  ): Promise<TrafficAnalyticsResponse> {
    const response = await apiClient.get<TrafficAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.TRAFFIC,
      { params }
    );
    return response.data!;
  }

  /**
   * Get conversion analytics
   */
  async getConversion(
    params?: GetAnalyticsParams
  ): Promise<ConversionAnalyticsResponse> {
    const response = await apiClient.get<ConversionAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.CONVERSION,
      { params }
    );
    return response.data!;
  }

  /**
   * Get performance analytics
   */
  async getPerformance(
    params?: GetAnalyticsParams
  ): Promise<PerformanceAnalyticsResponse> {
    const response = await apiClient.get<PerformanceAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.PERFORMANCE,
      { params }
    );
    return response.data!;
  }

  /**
   * Get comparison analytics
   */
  async getComparison(
    params?: GetAnalyticsParams
  ): Promise<ComparisonAnalyticsResponse> {
    const response = await apiClient.get<ComparisonAnalyticsResponse>(
      API_ENDPOINTS.ANALYTICS.COMPARISON,
      { params }
    );
    return response.data!;
  }
}

// ===== SINGLETON INSTANCE =====

export const analyticsService = new AnalyticsService();
export default analyticsService;
