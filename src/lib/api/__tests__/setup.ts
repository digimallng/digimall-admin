/**
 * Test Setup
 * Configuration and utilities for testing
 */

import '@testing-library/jest-dom';
import { QueryClient } from '@tanstack/react-query';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'admin',
        name: 'Test User',
      },
      accessToken: 'test-access-token',
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

/**
 * Create a test query client with disabled retries and caching
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress errors in tests
    },
  });
}

/**
 * Mock fetch responses
 */
export function mockFetch(response: any, status: number = 200) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => response,
      text: async () => JSON.stringify(response),
      headers: new Headers(),
    } as Response)
  );
}

/**
 * Mock fetch error
 */
export function mockFetchError(error: Error) {
  global.fetch = jest.fn(() => Promise.reject(error));
}

/**
 * Reset all mocks
 */
export function resetMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
}
