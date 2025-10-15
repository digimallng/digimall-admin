/**
 * Enhanced API Client for DigiMall Admin
 *
 * Comprehensive HTTP client with:
 * - Automatic authentication handling
 * - Token refresh mechanism
 * - Request/response interceptors
 * - Error handling and transformation
 * - Retry logic with exponential backoff
 * - Request cancellation support
 * - Type-safe API calls
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { ApiError } from '../types/shared.types';
import type { ApiResponse } from '../types/shared.types';

// ===== TYPES =====

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

interface ClientConfig {
  baseURL: string;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  enableLogging?: boolean;
}

interface RequestMetadata {
  startTime: number;
  retryCount: number;
}

// ===== CONFIGURATION =====

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// ===== API CLIENT CLASS =====

export class ApiClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;
  private enableLogging: boolean;

  constructor(config: ClientConfig) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retry };
    this.enableLogging = config.enableLogging ?? process.env.NODE_ENV === 'development';

    // Create axios instance
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // ===== INTERCEPTORS =====

  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add request metadata for tracking
        const metadata: RequestMetadata = {
          startTime: Date.now(),
          retryCount: 0,
        };
        config.metadata = metadata;

        // Get authentication token
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }

        // Log request in development
        if (this.enableLogging) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        if (this.enableLogging) {
          console.error('[API Request Error]', error);
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const metadata = response.config.metadata as RequestMetadata;
        const duration = Date.now() - metadata.startTime;

        // Log response in development
        if (this.enableLogging) {
          console.log(
            `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
              status: response.status,
              duration: `${duration}ms`,
              data: response.data,
            }
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  // ===== ERROR HANDLING =====

  private async handleResponseError(error: AxiosError): Promise<never> {
    const config = error.config as InternalAxiosRequestConfig & {
      metadata?: RequestMetadata;
    };

    // Handle network errors
    if (!error.response) {
      if (this.enableLogging) {
        console.error('[API Network Error]', error.message);
      }
      throw this.transformError(error);
    }

    const { status } = error.response;
    const metadata = config.metadata;

    // Log error in development
    if (this.enableLogging) {
      console.error(
        `[API Response Error] ${config.method?.toUpperCase()} ${config.url}`,
        {
          status,
          data: error.response.data,
        }
      );
    }

    // Handle 401 Unauthorized - token refresh or logout
    if (status === 401) {
      return this.handleUnauthorized(error);
    }

    // Handle retry logic
    if (metadata && this.shouldRetry(status, metadata.retryCount)) {
      return this.retryRequest(config, metadata);
    }

    // Transform and throw error
    throw this.transformError(error);
  }

  private async handleUnauthorized(error: AxiosError): Promise<never> {
    const config = error.config as InternalAxiosRequestConfig;

    // Check if this is a token refresh endpoint to prevent infinite loop
    if (config.url?.includes('/auth/refresh')) {
      if (this.enableLogging) {
        console.log('[API] Token refresh failed, signing out');
      }
      await signOut({ redirect: false });
      throw this.transformError(error);
    }

    try {
      // Attempt to refresh token
      if (this.enableLogging) {
        console.log('[API] Attempting token refresh');
      }

      const session = await getSession();
      if (session?.refreshToken) {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${config.baseURL}/auth/refresh`,
          {
            refreshToken: session.refreshToken,
          }
        );

        const newAccessToken = refreshResponse.data.accessToken;

        // Update the failed request with new token and retry
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return this.client.request(config);
      }

      // No refresh token available, sign out
      if (this.enableLogging) {
        console.log('[API] No refresh token available, signing out');
      }
      await signOut({ redirect: false });
      throw this.transformError(error);
    } catch (refreshError) {
      // Refresh failed, sign out
      if (this.enableLogging) {
        console.error('[API] Token refresh failed', refreshError);
      }
      await signOut({ redirect: false });
      throw this.transformError(error);
    }
  }

  private shouldRetry(status: number, retryCount: number): boolean {
    return (
      retryCount < this.retryConfig.maxRetries &&
      this.retryConfig.retryableStatuses.includes(status)
    );
  }

  private async retryRequest(
    config: InternalAxiosRequestConfig,
    metadata: RequestMetadata
  ): Promise<never> {
    metadata.retryCount += 1;

    // Calculate exponential backoff delay
    const delay =
      this.retryConfig.retryDelay * Math.pow(2, metadata.retryCount - 1);

    if (this.enableLogging) {
      console.log(
        `[API] Retrying request (${metadata.retryCount}/${this.retryConfig.maxRetries}) after ${delay}ms`,
        {
          method: config.method,
          url: config.url,
        }
      );
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry the request
    return this.client.request(config);
  }

  private transformError(error: AxiosError): ApiError {
    // Network or timeout error
    if (!error.response) {
      return new ApiError(
        error.message || 'Network error occurred',
        0,
        undefined,
        error.code
      );
    }

    const { status, data } = error.response;
    const errorData = data as any;

    // Create structured error
    return new ApiError(
      errorData?.message || errorData?.error || 'An error occurred',
      status,
      {
        message: errorData?.message || 'An error occurred',
        error: errorData?.error,
        statusCode: status,
        timestamp: errorData?.timestamp || new Date().toISOString(),
        path: error.config?.url || '',
        details: errorData?.details,
      },
      errorData?.code
    );
  }

  // ===== HTTP METHODS =====

  /**
   * GET request
   * Returns the raw response data directly (backend doesn't wrap in ApiResponse)
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    try {
      const response = await this.client.get<T>(url, config);
      // Backend returns raw data, wrap it for consistent interface
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request
   * Returns the raw response data directly (backend doesn't wrap in ApiResponse)
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    try {
      const response = await this.client.post<T>(url, data, config);
      // Backend returns raw data, wrap it for consistent interface
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request
   * Returns the raw response data directly (backend doesn't wrap in ApiResponse)
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    try {
      const response = await this.client.put<T>(url, data, config);
      // Backend returns raw data, wrap it for consistent interface
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request
   * Returns the raw response data directly (backend doesn't wrap in ApiResponse)
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      // Backend returns raw data, wrap it for consistent interface
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request
   * Returns the raw response data directly (backend doesn't wrap in ApiResponse)
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    try {
      const response = await this.client.delete<T>(url, config);
      // Backend returns raw data, wrap it for consistent interface
      return { data: response.data };
    } catch (error) {
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Create an abort controller for request cancellation
   */
  createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// ===== AXIOS TYPE EXTENSIONS =====

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: RequestMetadata;
  }
}
