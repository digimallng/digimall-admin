/**
 * Test Utilities
 * Helper components and functions for testing
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './setup';

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Wait for a specific time
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock staff data
 */
export function createMockStaff(overrides = {}) {
  return {
    id: 'staff-1',
    email: 'staff@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin' as const,
    status: 'active' as const,
    permissions: ['dashboard:view', 'staff:view'],
    phoneNumber: '+2348012345678',
    department: 'Operations',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock vendor data
 */
export function createMockVendor(overrides = {}) {
  return {
    id: 'vendor-1',
    businessName: 'Test Vendor',
    email: 'vendor@example.com',
    status: 'active' as const,
    tier: 'basic' as const,
    verified: true,
    rating: 4.5,
    totalSales: 1000,
    totalRevenue: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock product data
 */
export function createMockProduct(overrides = {}) {
  return {
    id: 'product-1',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test product description',
    status: 'active' as const,
    price: 1000,
    compareAtPrice: 1500,
    stock: 100,
    vendorId: 'vendor-1',
    categoryId: 'category-1',
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock order data
 */
export function createMockOrder(overrides = {}) {
  return {
    id: 'order-1',
    orderNumber: 'ORD-001',
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    totalAmount: 5000,
    customerId: 'customer-1',
    vendorId: 'vendor-1',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock user data
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'customer' as const,
    verified: true,
    suspended: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock analytics data
 */
export function createMockAnalytics(overrides = {}) {
  return {
    totalRevenue: 100000,
    totalOrders: 500,
    totalUsers: 1000,
    totalVendors: 50,
    revenueGrowth: 15.5,
    ordersGrowth: 10.2,
    usersGrowth: 20.1,
    vendorsGrowth: 5.5,
    ...overrides,
  };
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
