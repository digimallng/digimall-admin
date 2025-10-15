/**
 * API Client Instance Configuration
 *
 * Creates and exports the configured API client instance
 * for use throughout the application.
 */

import { ApiClient } from './api-client';

// ===== CONFIGURATION =====

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);
const ENABLE_LOGGING = process.env.NODE_ENV === 'development';

// ===== CLIENT INSTANCE =====

/**
 * Main API client instance for the application
 */
export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  enableLogging: ENABLE_LOGGING,
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
});

/**
 * Export API client class for creating custom instances
 */
export { ApiClient } from './api-client';

/**
 * Export types
 */
export type { ApiClient as ApiClientType } from './api-client';
