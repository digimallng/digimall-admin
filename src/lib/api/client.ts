import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

// ===== TYPE DEFINITIONS =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  meta?: {
    totalCount: number;
    filteredCount: number;
  };
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: any[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      data: this.data,
      code: this.code,
      stack: this.stack
    };
  }
}

// ===== REQUEST/RESPONSE TYPES =====

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  validateStatus?: (status: number) => boolean;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
  include?: string[];
  exclude?: string[];
  [key: string]: any;
}

// ===== AXIOS CLIENT CLASS =====

class AxiosApiClient {
  private instance: AxiosInstance;
  private baseURL: string;
  private retryQueue: Array<() => void> = [];
  private isRefreshing = false;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false, // Explicitly disable credentials for CORS
      validateStatus: (status) => status >= 200 && status < 500, // Don't throw for 4xx errors
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const session = await getSession();
        
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }

        // Request ID header removed to avoid CORS issues
        
        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data && !(config.data instanceof FormData) ? config.data : '[FormData]'
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(this.createApiError(error));
      }
    );

    // Response interceptor for error handling and token refresh
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle token refresh for 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request to retry after token refresh
            return new Promise((resolve) => {
              this.retryQueue.push(() => resolve(this.instance(originalRequest)));
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token using NextAuth
            const session = await getSession();
            if (session) {
              // Process retry queue
              this.retryQueue.forEach(callback => callback());
              this.retryQueue = [];
              
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Redirect to login or handle auth failure
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          } finally {
            this.isRefreshing = false;
          }
        }

        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  private createApiError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data as ApiErrorResponse;
      const message = data?.message || error.message || 'Network error occurred';
      
      return new ApiError(message, status, data, error.code);
    }
    
    return new ApiError(error.message || 'Unknown error occurred', 500);
  }

  // ===== HTTP METHODS =====

  async get<T>(
    endpoint: string,
    params?: QueryParams,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.instance.get<T>(endpoint, {
        params,
        timeout: config?.timeout,
        validateStatus: config?.validateStatus,
      });
      
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const axiosConfig: any = {
        timeout: config?.timeout,
        validateStatus: config?.validateStatus,
      };

      // Handle FormData differently
      if (data instanceof FormData) {
        axiosConfig.headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await this.instance.post<T>(endpoint, data, axiosConfig);
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.instance.put<T>(endpoint, data, {
        timeout: config?.timeout,
        validateStatus: config?.validateStatus,
      });
      
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.instance.patch<T>(endpoint, data, {
        timeout: config?.timeout,
        validateStatus: config?.validateStatus,
      });
      
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.instance.delete<T>(endpoint, {
        timeout: config?.timeout,
        validateStatus: config?.validateStatus,
      });
      
      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // ===== SPECIALIZED METHODS =====

  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const response = await this.instance.post<T>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
        timeout: 60000, // 1 minute for file uploads
      });

      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async bulkOperation<T>(
    endpoint: string,
    operations: Array<{
      method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      data?: any;
      id?: string;
    }>,
    config?: RequestConfig
  ): Promise<BulkOperationResponse> {
    try {
      const response = await this.instance.post<BulkOperationResponse>(
        `${endpoint}/bulk`,
        { operations },
        {
          timeout: config?.timeout || 60000, // Longer timeout for bulk operations
          validateStatus: config?.validateStatus,
        }
      );

      return response.data;
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  async downloadFile(
    endpoint: string,
    filename?: string,
    params?: QueryParams
  ): Promise<void> {
    try {
      const response = await this.instance.get(endpoint, {
        params,
        responseType: 'blob',
        timeout: 120000, // 2 minutes for downloads
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `download-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // ===== BATCH OPERATIONS =====

  async batch<T>(
    requests: Array<{
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      endpoint: string;
      data?: any;
      params?: QueryParams;
    }>
  ): Promise<T[]> {
    try {
      const promises = requests.map(async (request) => {
        switch (request.method) {
          case 'GET':
            return this.get(request.endpoint, request.params);
          case 'POST':
            return this.post(request.endpoint, request.data);
          case 'PUT':
            return this.put(request.endpoint, request.data);
          case 'PATCH':
            return this.patch(request.endpoint, request.data);
          case 'DELETE':
            return this.delete(request.endpoint);
          default:
            throw new Error(`Unsupported method: ${request.method}`);
        }
      });

      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Batch request ${index} failed:`, result.reason);
          throw result.reason;
        }
        return result.value;
      });
    } catch (error) {
      throw this.createApiError(error);
    }
  }

  // ===== UTILITY METHODS =====

  getBaseURL(): string {
    return this.baseURL;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }

  // Cancel all pending requests
  cancelAllRequests(message = 'Requests cancelled'): void {
    // Note: Axios doesn't have a built-in way to cancel all requests
    // This would need to be implemented with AbortController or CancelToken
    console.log(message);
  }
}

// ===== SINGLETON INSTANCE =====

export const apiClient = new AxiosApiClient();

// ===== HELPER FUNCTIONS =====

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken || null;
}

export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

export function handleApiError(error: unknown): string {
  if (isApiError(error)) {
    return error.data?.message || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// ===== CONVENIENCE API OBJECT =====

export const api = {
  // Health check
  health: () => apiClient.healthCheck(),

  // Admin analytics
  analytics: {
    overview: () => apiClient.get('/api/proxy/admin/analytics/dashboard'),
    users: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/users', params),
    vendors: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/vendors', params),
    orders: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/orders', params),
    revenue: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/revenue', params),
    system: () => apiClient.get('/api/proxy/admin/analytics/system'),
    performance: () => apiClient.get('/api/proxy/admin/analytics/performance'),
    categories: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/categories', params),
    products: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/products', params),
    export: (type: string, params?: QueryParams) => 
      apiClient.downloadFile(`/api/proxy/admin/analytics/export/${type}`, `analytics-${type}-${Date.now()}.csv`, params),
  },

  // User management
  users: {
    list: (params?: QueryParams) => apiClient.get('/api/proxy/user-service/users', params),
    get: (id: string) => apiClient.get(`/api/proxy/user-service/users/${id}`),
    create: (data: any) => apiClient.post('/api/proxy/user-service/users', data),
    update: (id: string, data: any) => apiClient.put(`/api/proxy/user-service/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/proxy/user-service/users/${id}`),
    statistics: () => apiClient.get('/api/proxy/user-service/internal/analytics/statistics'),
    count: (params?: QueryParams) => apiClient.get('/api/proxy/user-service/analytics/count', params),
    activity: (id: string) => apiClient.get(`/api/proxy/user-service/users/${id}/activity`),
    sessions: (id: string) => apiClient.get(`/api/proxy/user-service/users/${id}/sessions`),
  },

  // Vendor management
  vendors: {
    list: (params?: QueryParams) => apiClient.get('/api/proxy/admin/vendors', params),
    get: (id: string) => apiClient.get(`/api/proxy/admin/vendors/${id}`),
    pending: () => apiClient.get('/api/proxy/admin/vendors/pending'),
    statistics: () => apiClient.get('/api/proxy/admin/vendors/statistics'),
    approve: (id: string, data: any) => apiClient.post(`/api/proxy/admin/vendors/${id}/approve`, data),
    suspend: (id: string, data: any) => apiClient.post(`/api/proxy/admin/vendors/${id}/suspend`, data),
    reactivate: (id: string) => apiClient.post(`/api/proxy/admin/vendors/${id}/reactivate`),
    documents: (id: string) => apiClient.get(`/api/proxy/admin/vendors/${id}/documents`),
    updateTier: (id: string, data: any) => apiClient.patch(`/api/proxy/admin/vendors/${id}/tier`, data),
  },

  // Product management
  products: {
    list: (params?: QueryParams) => apiClient.get('/api/proxy/admin/products', params),
    get: (id: string) => apiClient.get(`/api/proxy/admin/products/${id}`),
    statistics: () => apiClient.get('/api/proxy/admin/analytics/statistics'),
    count: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/count', params),
    top: (limit?: number) => apiClient.get(`/api/proxy/admin/analytics/top?limit=${limit || 10}`),
    categoryAnalytics: (limit?: number) => apiClient.get(`/api/proxy/admin/categories/analytics?limit=${limit || 10}`),
  },

  // Order management
  orders: {
    list: (params?: QueryParams) => apiClient.get('/api/proxy/admin/orders', params),
    get: (id: string) => apiClient.get(`/api/proxy/admin/orders/${id}`),
    statistics: () => apiClient.get('/api/proxy/admin/analytics/statistics'),
    count: (params?: QueryParams) => apiClient.get('/api/proxy/admin/analytics/count', params),
    update: (id: string, data: any) => apiClient.put(`/api/proxy/admin/orders/${id}`, data),
    updateStatus: (id: string, status: string, data?: any) => 
      apiClient.post(`/api/proxy/admin/orders/${id}/status`, { status, ...data }),
    refund: (id: string, data: any) => apiClient.post(`/api/proxy/admin/orders/${id}/refund`, data),
    timeline: (id: string) => apiClient.get(`/api/proxy/admin/orders/${id}/timeline`),
  },

  // Category management
  categories: {
    list: (params?: QueryParams) => apiClient.get('/category-management', params),
    get: (id: string) => apiClient.get(`/category-management/${id}`),
    create: (data: any) => apiClient.post('/category-management', data),
    update: (id: string, data: any) => apiClient.put(`/category-management/${id}`, data),
    delete: (id: string) => apiClient.delete(`/category-management/${id}`),
    reorder: (data: any) => apiClient.post('/category-management/reorder', data),
    uploadImage: (id: string, file: File) => 
      apiClient.uploadFile(`/category-management/${id}/image`, file),
  },

  // Financial management
  financial: {
    transactions: (params?: QueryParams) => apiClient.get('/financial-management/transactions', params),
    commissions: (params?: QueryParams) => apiClient.get('/financial-management/commissions', params),
    payouts: (params?: QueryParams) => apiClient.get('/financial-management/payouts', params),
    escrow: (params?: QueryParams) => apiClient.get('/financial-management/escrow', params),
    processRefund: (transactionId: string, data: any) => 
      apiClient.post(`/financial-management/transactions/${transactionId}/refund`, data),
    generateReport: (type: string, params?: QueryParams) => 
      apiClient.downloadFile(`/financial-management/reports/${type}`, `financial-report-${type}-${Date.now()}.pdf`, params),
  },

  // Security management
  security: {
    auditLogs: (params?: QueryParams) => apiClient.get('/security-management/audit-logs', params),
    loginAttempts: (params?: QueryParams) => apiClient.get('/security-management/login-attempts', params),
    permissions: () => apiClient.get('/security-management/permissions'),
    roles: () => apiClient.get('/security-management/roles'),
    updatePermissions: (roleId: string, permissions: string[]) => 
      apiClient.put(`/security-management/roles/${roleId}/permissions`, { permissions }),
  },

  // System settings
  system: {
    settings: () => apiClient.get('/system-settings'),
    updateSettings: (data: any) => apiClient.put('/system-settings', data),
    backups: () => apiClient.get('/system-settings/backups'),
    createBackup: () => apiClient.post('/system-settings/backups'),
    maintenance: {
      status: () => apiClient.get('/system-settings/maintenance'),
      enable: (data: any) => apiClient.post('/system-settings/maintenance/enable', data),
      disable: () => apiClient.post('/system-settings/maintenance/disable'),
    },
  },

  // Notification management
  notifications: {
    list: (params?: QueryParams) => apiClient.get('/notification-management', params),
    send: (data: any) => apiClient.post('/notification-management/send', data),
    templates: () => apiClient.get('/notification-management/templates'),
    createTemplate: (data: any) => apiClient.post('/notification-management/templates', data),
    updateTemplate: (id: string, data: any) => apiClient.put(`/notification-management/templates/${id}`, data),
  },

  // Commission management
  commissions: {
    list: (params?: QueryParams) => apiClient.get('/commission-management', params),
    get: (id: string) => apiClient.get(`/commission-management/${id}`),
    update: (id: string, data: any) => apiClient.put(`/commission-management/${id}`, data),
    structures: () => apiClient.get('/commission-management/structures'),
    updateStructure: (id: string, data: any) => apiClient.put(`/commission-management/structures/${id}`, data),
  },

  // Plan management
  plans: {
    list: (params?: QueryParams) => apiClient.get('/plan-management', params),
    get: (id: string) => apiClient.get(`/plan-management/${id}`),
    create: (data: any) => apiClient.post('/plan-management', data),
    update: (id: string, data: any) => apiClient.put(`/plan-management/${id}`, data),
    delete: (id: string) => apiClient.delete(`/plan-management/${id}`),
    activate: (id: string) => apiClient.post(`/plan-management/${id}/activate`),
    deactivate: (id: string) => apiClient.post(`/plan-management/${id}/deactivate`),
  },
};

// Export default client
export default apiClient;