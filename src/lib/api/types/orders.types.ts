/**
 * Orders Management Types for DigiMall Admin API
 *
 * Complete type definitions for all 7 order management endpoints.
 * Based on ADMIN_API_DOCUMENTATION.md
 */

import { z } from 'zod';
import { BaseEntity, BaseQueryParams, Address, AddressSchema } from './shared.types';
import { OrderStatusSchema, PaymentStatusSchema, PaymentMethodSchema } from './enums.types';

// ===== ORDER ENTITY =====

/**
 * Order item
 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendorId: string;
  vendorName: string;
}

export const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  productImage: z.string().url(),
  sku: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  vendorId: z.string(),
  vendorName: z.string(),
});

/**
 * Order customer info
 */
export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export const OrderCustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

/**
 * Order payment info
 */
export interface OrderPayment {
  method: 'paystack' | 'card' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  reference: string;
  paidAt?: string;
  amount: number;
}

export const OrderPaymentSchema = z.object({
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  transactionId: z.string().optional(),
  reference: z.string(),
  paidAt: z.string().datetime().optional(),
  amount: z.number().positive(),
});

/**
 * Order shipping info
 */
export interface OrderShipping {
  address: Address;
  method: string;
  cost: number;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export const OrderShippingSchema = z.object({
  address: AddressSchema,
  method: z.string(),
  cost: z.number().nonnegative(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  shippedAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
});

/**
 * Order status history
 */
export interface OrderStatusHistory {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export const OrderStatusHistorySchema = z.object({
  status: OrderStatusSchema,
  timestamp: z.string().datetime(),
  note: z.string().optional(),
  updatedBy: z.string().optional(),
});

/**
 * Order entity
 */
export interface Order extends BaseEntity {
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment: OrderPayment;
  shipping: OrderShipping;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  statusHistory: OrderStatusHistory[];
  cancelledAt?: string;
  cancellationReason?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
}

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customer: OrderCustomerSchema,
  items: z.array(OrderItemSchema),
  status: OrderStatusSchema,
  payment: OrderPaymentSchema,
  shipping: OrderShippingSchema,
  subtotal: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().positive(),
  notes: z.string().optional(),
  statusHistory: z.array(OrderStatusHistorySchema),
  cancelledAt: z.string().datetime().optional(),
  cancellationReason: z.string().optional(),
  refundedAt: z.string().datetime().optional(),
  refundAmount: z.number().positive().optional(),
  refundReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable().optional(),
});

// ===== QUERY PARAMETERS =====

/**
 * Get all orders query parameters
 * Updated to match backend AdminOrderFiltersDto
 */
export interface GetAllOrdersParams extends BaseQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  customerId?: string;
  vendorId?: string;
  orderNumber?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export const GetAllOrdersParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']).optional(),
  customerId: z.string().optional(),
  vendorId: z.string().optional(),
  orderNumber: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  searchTerm: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get order statistics query parameters
 */
export interface GetOrderStatisticsParams {
  vendorId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export const GetOrderStatisticsParamsSchema = z.object({
  vendorId: z.string().optional(),
  customerId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ===== REQUEST TYPES =====

/**
 * Update order status request
 */
export interface UpdateOrderStatusRequest {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  note?: string;
  trackingNumber?: string;
  carrier?: string;
}

export const UpdateOrderStatusRequestSchema = z.object({
  status: OrderStatusSchema,
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

/**
 * Cancel order request
 */
export interface CancelOrderRequest {
  reason: string;
  refundAmount?: number;
  notifyCustomer?: boolean;
}

export const CancelOrderRequestSchema = z.object({
  reason: z.string().min(1),
  refundAmount: z.number().positive().optional(),
  notifyCustomer: z.boolean().optional(),
});

/**
 * Refund order request
 */
export interface RefundOrderRequest {
  amount: number;
  reason: string;
  refundMethod: 'original' | 'wallet';
  notifyCustomer?: boolean;
}

export const RefundOrderRequestSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1),
  refundMethod: z.enum(['original', 'wallet']),
  notifyCustomer: z.boolean().optional(),
});

// ===== RESPONSE TYPES =====

/**
 * Order list response
 */
export interface OrderListResponse {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const OrderListResponseSchema = z.object({
  data: z.array(OrderSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

/**
 * Update order status response
 */
export interface UpdateOrderStatusResponse {
  message: string;
  data: {
    id: string;
    orderNumber: string;
    status: string;
    updatedBy: string;
    updatedAt: string;
  };
}

export const UpdateOrderStatusResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    orderNumber: z.string(),
    status: z.string(),
    updatedBy: z.string(),
    updatedAt: z.string().datetime(),
  }),
});

/**
 * Cancel order response
 */
export interface CancelOrderResponse {
  message: string;
  data: {
    id: string;
    orderNumber: string;
    status: string;
    refundAmount?: number;
    cancelledAt: string;
  };
}

export const CancelOrderResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    orderNumber: z.string(),
    status: z.string(),
    refundAmount: z.number().positive().optional(),
    cancelledAt: z.string().datetime(),
  }),
});

/**
 * Refund order response
 */
export interface RefundOrderResponse {
  message: string;
  data: {
    id: string;
    orderNumber: string;
    refundAmount: number;
    refundMethod: string;
    refundedAt: string;
  };
}

export const RefundOrderResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    orderNumber: z.string(),
    refundAmount: z.number().positive(),
    refundMethod: z.string(),
    refundedAt: z.string().datetime(),
  }),
});

/**
 * Order statistics by status
 */
export interface OrderStatisticsByStatus {
  status: string;
  count: number;
  percentage: number;
  value: number;
}

export const OrderStatisticsByStatusSchema = z.object({
  status: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
  value: z.number().nonnegative(),
});

/**
 * Top customer by orders
 */
export interface TopCustomerByOrders {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalSpent: number;
}

export const TopCustomerByOrdersSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  orderCount: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
});

/**
 * Order statistics response
 */
export interface OrderStatisticsResponse {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  byStatus: OrderStatisticsByStatus[];
  topCustomers: TopCustomerByOrders[];
  growth: {
    current: number;
    previous: number;
    growthRate: number;
  };
}

export const OrderStatisticsResponseSchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  pendingOrders: z.number().int().nonnegative(),
  processingOrders: z.number().int().nonnegative(),
  shippedOrders: z.number().int().nonnegative(),
  deliveredOrders: z.number().int().nonnegative(),
  cancelledOrders: z.number().int().nonnegative(),
  refundedOrders: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  averageOrderValue: z.number().nonnegative(),
  byStatus: z.array(OrderStatisticsByStatusSchema),
  topCustomers: z.array(TopCustomerByOrdersSchema),
  growth: z.object({
    current: z.number(),
    previous: z.number(),
    growthRate: z.number(),
  }),
});

// ===== TYPE EXPORTS =====

export type {
  Order,
  OrderListResponse,
  UpdateOrderStatusResponse,
  CancelOrderResponse,
  RefundOrderResponse,
  OrderStatisticsResponse,
};
