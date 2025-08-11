import { getSession } from 'next-auth/react';

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
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  public baseURL: string;

  constructor() {
    // Use direct admin service URL for admin app
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800/api/v1';
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;

      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.message || errorResponse.error || errorMessage;
        errorData = errorResponse;
      } catch {
        // If response isn't JSON, use the response text
        try {
          errorMessage = await response.text() || errorMessage;
        } catch {
          // If we can't read the response, use the default error message
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty responses (204 No Content, etc.)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    try {
      const result = await response.json();
      // Return the full response so services can handle the structure
      return result;
    } catch {
      // If response isn't JSON, return empty object
      return {} as T;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    
    // Check if data is FormData
    const isFormData = data instanceof FormData;
    
    // If it's FormData, don't set Content-Type and don't stringify
    const headers = isFormData 
      ? { ...authHeaders, ...options?.headers }
      : { ...authHeaders, ...options?.headers };
    
    // Remove Content-Type for FormData to let browser set it with boundary
    if (isFormData && headers['Content-Type']) {
      delete headers['Content-Type'];
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  // File upload method
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const authHeaders = await this.getAuthHeaders();
    const headers: Record<string, string> = { ...authHeaders };
    // Remove Content-Type for FormData to let browser set it with boundary
    delete headers['Content-Type'];

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  // Batch operations
  async batch<T>(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
    data?: any;
  }>): Promise<T[]> {
    const promises = requests.map(request => {
      switch (request.method) {
        case 'GET':
          return this.get(request.endpoint);
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

    return Promise.all(promises);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export helper to get access token
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken || null;
}

// Convenience methods for common patterns
export const api = {
  // Admin endpoints
  admin: {
    analytics: () => apiClient.get('/analytics'),
    users: (params?: any) => apiClient.get('/user-management', params),
    vendors: (params?: any) => apiClient.get('/vendor-management', params),
    orders: (params?: any) => apiClient.get('/order-management', params),
    products: (params?: any) => apiClient.get('/product-management', params),
  },
  
  // User management
  users: {
    list: (params?: any) => apiClient.get('/users', params),
    get: (id: string) => apiClient.get(`/users/${id}`),
    update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
    bulkUpdate: (data: any) => apiClient.post('/users/bulk-action', data),
    statistics: () => apiClient.get('/users/statistics'),
  },
  
  // Vendor management
  vendors: {
    list: (params?: any) => apiClient.get('/vendors', params),
    get: (id: string) => apiClient.get(`/vendors/${id}`),
    approve: (id: string, data: any) => apiClient.post(`/vendors/${id}/approve`, data),
    reject: (id: string, data: any) => apiClient.post(`/vendors/${id}/reject`, data),
    suspend: (id: string, data: any) => apiClient.post(`/vendors/${id}/suspend`, data),
  },
};