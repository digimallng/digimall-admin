/**
 * React Query Client Configuration
 * Centralized configuration for React Query
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { CACHE_TIMES } from './constants';

/**
 * Default options for React Query
 */
const defaultOptions: DefaultOptions = {
  queries: {
    // Stale time - data is considered fresh for this duration
    staleTime: CACHE_TIMES.MEDIUM,

    // Cache time - data remains in cache for this duration after becoming unused
    gcTime: CACHE_TIMES.LONG,

    // Retry failed requests
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Don't refetch on window focus by default (can be overridden per query)
    refetchOnWindowFocus: false,

    // Don't refetch on reconnect by default (can be overridden per query)
    refetchOnReconnect: true,

    // Don't refetch on mount by default (can be overridden per query)
    refetchOnMount: false,
  },
  mutations: {
    // Retry failed mutations
    retry: false,

    // Default mutation error handler
    onError: (error: any) => {
      console.error('Mutation error:', error);
    },
  },
};

/**
 * Create and export the query client
 */
export const queryClient = new QueryClient({
  defaultOptions,
});

/**
 * Reset the query client (useful for tests or logout)
 */
export function resetQueryClient() {
  queryClient.clear();
}

/**
 * Invalidate all queries (force refetch)
 */
export function invalidateAllQueries() {
  queryClient.invalidateQueries();
}

/**
 * Remove all queries from cache
 */
export function clearAllQueries() {
  queryClient.clear();
}
