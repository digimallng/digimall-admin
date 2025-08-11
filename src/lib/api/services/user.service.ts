import { apiClient } from '../client';
import { User, UserFilters, PaginatedResponse } from '../types';

export class UserService {
  // List users with filters and pagination
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>('/users', filters);
  }

  // Create new staff member
  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'admin' | 'super_admin';
    password: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
  }): Promise<User> {
    const response = await apiClient.post<any>('/users/create', data);
    return response?.data || response;
  }

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, data);
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }

  // Activate user
  async activateUser(id: string): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${id}/status`, { 
      status: 'active', 
      reason: 'Activated by admin' 
    });
    return response?.user || response;
  }

  // Deactivate user
  async deactivateUser(id: string, reason?: string): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${id}/status`, { 
      status: 'inactive', 
      reason: reason || 'Deactivated by admin' 
    });
    return response?.user || response;
  }

  // Suspend user
  async suspendUser(id: string, reason: string, duration?: number): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${id}/status`, { 
      status: 'suspended', 
      reason,
      duration 
    });
    return response?.user || response;
  }

  // Unsuspend user
  async unsuspendUser(id: string): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${id}/status`, { 
      status: 'active', 
      reason: 'Unsuspended by admin' 
    });
    return response?.user || response;
  }

  // Verify email
  async verifyEmail(id: string): Promise<User> {
    const response = await apiClient.post<any>(`/users/${id}/verify-email`);
    return response?.user || response;
  }

  // Verify phone
  async verifyPhone(id: string): Promise<User> {
    const response = await apiClient.post<any>(`/users/${id}/verify-phone`);
    return response?.user || response;
  }

  // Reset password
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<any>(`/users/${id}/reset-password`);
    return response || {};
  }

  // Bulk operations
  async bulkUpdateUsers(data: {
    userIds: string[];
    action: 'activate' | 'deactivate' | 'suspend' | 'delete';
    reason?: string;
    duration?: number;
  }): Promise<{ success: number; failed: number; errors: any[] }> {
    return apiClient.post('/users/bulk-update', data);
  }

  // Export users
  async exportUsers(filters?: UserFilters & { format: 'csv' | 'excel' }): Promise<Blob> {
    const params = { ...filters };
    return apiClient.get('/users/export', params);
  }

  // Get user activity
  async getUserActivity(id: string, params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get(`/users/${id}/activity`, params);
  }

  // Get user sessions
  async getUserSessions(id: string) {
    return apiClient.get(`/users/${id}/sessions`);
  }

  // Revoke user session
  async revokeUserSession(userId: string, sessionId: string): Promise<void> {
    return apiClient.delete(`/users/${userId}/sessions/${sessionId}`);
  }

  // Get user statistics
  async getUserStats() {
    return apiClient.get('/users/statistics');
  }

  // Search users
  async searchUsers(query: string, filters?: {
    role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    limit?: number;
  }): Promise<User[]> {
    return apiClient.get<User[]>('/users/search', {
      q: query,
      ...filters
    });
  }
}

export const userService = new UserService();