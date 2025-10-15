/**
 * Orders Management Service
 *
 * Service layer for all order-related API operations.
 * Implements all 7 order management endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  Order,
  OrderListResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  RefundOrderRequest,
  RefundOrderResponse,
  OrderStatisticsResponse,
  GetAllOrdersParams,
  GetOrderStatisticsParams,
} from '../types';

class OrdersService {
  async getAll(params?: GetAllOrdersParams): Promise<OrderListResponse> {
    const response = await apiClient.get<OrderListResponse>(
      API_ENDPOINTS.ORDERS.GET_ALL,
      { params }
    );
    return response.data!;
  }

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(
      API_ENDPOINTS.ORDERS.GET_BY_ID(id)
    );
    return response.data!;
  }

  async updateStatus(
    id: string,
    data: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> {
    const response = await apiClient.patch<UpdateOrderStatusResponse>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
      data
    );
    return response.data!;
  }

  async cancel(
    id: string,
    data: CancelOrderRequest
  ): Promise<CancelOrderResponse> {
    const response = await apiClient.post<CancelOrderResponse>(
      API_ENDPOINTS.ORDERS.CANCEL(id),
      data
    );
    return response.data!;
  }

  async refund(
    id: string,
    data: RefundOrderRequest
  ): Promise<RefundOrderResponse> {
    const response = await apiClient.post<RefundOrderResponse>(
      API_ENDPOINTS.ORDERS.REFUND(id),
      data
    );
    return response.data!;
  }

  async getStatistics(
    params?: GetOrderStatisticsParams
  ): Promise<OrderStatisticsResponse> {
    const response = await apiClient.get<OrderStatisticsResponse>(
      API_ENDPOINTS.ORDERS.GET_STATISTICS,
      { params }
    );
    return response.data!;
  }

  async export(params?: GetAllOrdersParams): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.ORDERS.EXPORT,
      { params, responseType: 'blob' }
    );
    return response.data!;
  }
}

export const ordersService = new OrdersService();
export default ordersService;
