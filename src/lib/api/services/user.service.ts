import { apiClient } from '../client';
import { User, UserFilters, PaginatedResponse } from '../types';

export class UserService {
  // List users with filters and pagination
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    console.log('🔥 UserService.getUsers() called with filters:', filters);
    
    const params = new URLSearchParams();
    
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.query) params.append('search', filters.query);
    if (filters?.isEmailVerified !== undefined) params.append('emailVerified', String(filters.isEmailVerified));
    if (filters?.isPhoneVerified !== undefined) params.append('phoneVerified', String(filters.isPhoneVerified));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    console.log('🔥 UserService making API call to /users with params:', params.toString());
    
    const response = await apiClient.get<any>(`/users?${params.toString()}`);
    
    console.log('🔥 UserService received API response:', response);
    
    // Handle various response formats from the admin service
    let users: User[] = [];
    let total = 0;
    let page = filters?.page || 1;
    let pages = 1;
    let limit = filters?.limit || 20;

    // Try nested data format: { data: { data: { users: [...] } } }
    if (response?.data?.data?.users && Array.isArray(response.data.data.users)) {
      users = response.data.data.users;
      total = response.data.data.total || users.length;
      page = response.data.data.page || page;
      pages = response.data.data.pages || Math.ceil(total / limit);
      limit = response.data.data.limit || limit;
    }
    // Try simple data format: { data: [...] } or { users: [...] }
    else if (response?.data?.users && Array.isArray(response.data.users)) {
      users = response.data.users;
      total = response.data.total || users.length;
      page = response.data.page || page;
      pages = response.data.pages || Math.ceil(total / limit);
      limit = response.data.limit || limit;
    }
    // Try direct array in data: { data: [...] }
    else if (Array.isArray(response?.data)) {
      users = response.data;
      total = users.length;
      pages = Math.ceil(total / limit);
    }
    // Try direct array response: [...]
    else if (Array.isArray(response)) {
      users = response;
      total = users.length;
      pages = Math.ceil(total / limit);
    }
    
    console.log(`Debug - Fetched ${users.length} users from API (total: ${total})`);

    return {
      users,
      total,
      page,
      pages,
      limit,
    };
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
    // Since individual user endpoints are failing, get user from users list
    // This is a workaround until the endpoints are fixed
    try {
      const usersResponse = await this.getUsers({ limit: 10000 });
      const user = usersResponse.users.find((u: User) => u.id === id);
      
      if (user) {
        return user;
      } else {
        throw new Error(`User with id ${id} not found`);
      }
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<any>(`/users/${id}`, data);
    
    console.log('Debug - Update user API response:', response);
    
    // Handle different response formats
    if (response?.data?.user) return response.data.user;
    if (response?.user) return response.user;
    if (response?.data) return response.data;
    return response;
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
    
    console.log('Debug - Activate user API response:', response);
    
    // Handle different response formats
    if (response?.data?.user) return response.data.user;
    if (response?.user) return response.user;
    if (response?.data) return response.data;
    return response;
  }

  // Deactivate user
  async deactivateUser(id: string, reason?: string): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${id}/status`, { 
      status: 'inactive', 
      reason: reason || 'Deactivated by admin' 
    });
    
    console.log('Debug - Deactivate user API response:', response);
    
    // Handle different response formats
    if (response?.data?.user) return response.data.user;
    if (response?.user) return response.user;
    if (response?.data) return response.data;
    return response;
  }

  // Suspend user
  async suspendUser(id: string, reason: string, duration?: number): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${id}/status`, { 
      status: 'suspended', 
      reason,
      duration 
    });
    
    console.log('Debug - Suspend user API response:', response);
    
    // Handle different response formats
    if (response?.data?.user) return response.data.user;
    if (response?.user) return response.user;
    if (response?.data) return response.data;
    return response;
  }

  // Unsuspend user
  async unsuspendUser(id: string): Promise<User> {
    const response = await apiClient.patch<any>(`/users/${id}/status`, { 
      status: 'active', 
      reason: 'Unsuspended by admin' 
    });
    
    console.log('Debug - Unsuspend user API response:', response);
    
    // Handle different response formats
    if (response?.data?.user) return response.data.user;
    if (response?.user) return response.user;
    if (response?.data) return response.data;
    return response;
  }

  // Verify email
  async verifyEmail(id: string): Promise<User> {
    const response = await apiClient.post<any>(`/users/${id}/verify-email`);
    
    console.log('Debug - Verify email API response:', response);
    
    // Handle different response formats
    if (response?.data?.user) return response.data.user;
    if (response?.user) return response.user;
    if (response?.data) return response.data;
    return response;
  }

  // Verify phone
  async verifyPhone(id: string): Promise<User> {
    const response = await apiClient.post<any>(`/users/${id}/verify-phone`);
    
    console.log('Debug - Verify phone API response:', response);
    
    // Handle different response formats
    if (response?.data?.user) return response.data.user;
    if (response?.user) return response.user;
    if (response?.data) return response.data;
    return response;
  }

  // Reset password
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<any>(`/users/${id}/reset-password`);
    
    console.log('Debug - Reset password API response:', response);
    
    // Handle different response formats
    if (response?.data) return response.data;
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

  // Get comprehensive user statistics from user service
  async getUserStatistics() {
    try {
      const response = await apiClient.get('/user-service/internal/analytics/statistics');
      return response;
    } catch (error) {
      console.error('Failed to fetch user statistics from service:', error);
      // Fallback to local calculation
      return this.getUserStats();
    }
  }

  // Get user count with filters
  async getUserCount(filters?: {
    role?: string;
    status?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.createdAfter) params.append('createdAfter', filters.createdAfter.toISOString());
      if (filters?.createdBefore) params.append('createdBefore', filters.createdBefore.toISOString());

      const response = await apiClient.get(`/analytics/count?${params.toString()}`);
      return response.count || 0;
    } catch (error) {
      console.error('Failed to get user count:', error);
      return 0;
    }
  }

  // Get user statistics (fallback method using local calculation)
  async getUserStats() {
    console.log('🔥 getUserStats() called - calculating stats from user data');
    
    try {
      // Fetch users with a large limit to get all users for accurate stats
      const usersResponse = await this.getUsers({ 
        page: 1, 
        limit: 10000, // Get all users
        sortBy: 'createdAt',
        sortOrder: 'DESC' 
      });
      
      const users = usersResponse.users || [];
      console.log('🔥 Got users for stats calculation:', users.length);

      // Calculate stats from user data
      const total = users.length;
      const active = users.filter(user => user.status === 'active' || user.status === 'ACTIVE').length;
      const inactive = users.filter(user => user.status === 'inactive' || user.status === 'INACTIVE').length;
      const suspended = users.filter(user => user.status === 'suspended' || user.status === 'SUSPENDED').length;
      const pending = users.filter(user => user.status === 'pending' || user.status === 'PENDING').length;
      
      // Count by role
      const customers = users.filter(user => 
        user.role === 'customer' || user.role === 'CUSTOMER'
      ).length;
      const vendors = users.filter(user => 
        user.role === 'vendor' || user.role === 'VENDOR'
      ).length;
      const admins = users.filter(user => 
        user.role === 'admin' || user.role === 'super_admin' || 
        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
      ).length;
      
      // Count verified users
      const emailVerified = users.filter(user => user.isEmailVerified).length;
      const phoneVerified = users.filter(user => user.isPhoneVerified).length;
      
      // Get recent users (last 10)
      const recentUsers = users.slice(0, 10);
      
      const result = {
        total,
        active,
        inactive,
        suspended,
        pending,
        customers,
        vendors,
        admins,
        emailVerified,
        phoneVerified,
        recentUsers,
      };
      
      console.log('🔥 Calculated stats result:', result);
      return result;
      
    } catch (error) {
      console.error('🔥 Error in getUserStats:', error);
      // Return default stats on error
      return {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        pending: 0,
        customers: 0,
        vendors: 0,
        admins: 0,
        emailVerified: 0,
        phoneVerified: 0,
        recentUsers: [],
      };
    }
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