import { apiClient } from '../client';
import { PaginatedResponse } from '../types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: User['status'];
  role?: User['role'];
}

export class UsersService {
  // Get users with pagination and filtering
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.emailVerified !== undefined) params.append('emailVerified', String(filters.emailVerified));
    if (filters?.phoneVerified !== undefined) params.append('phoneVerified', String(filters.phoneVerified));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return apiClient.get<PaginatedResponse<User>>(`/users?${params.toString()}`);
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  // Update user
  async updateUser(id: string, data: UserUpdateData): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data);
  }

  // Soft delete user
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }

  // Get user activity
  async getUserActivity(id: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<UserActivity>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));

    return apiClient.get<PaginatedResponse<UserActivity>>(`/users/${id}/activity?${searchParams.toString()}`);
  }

  // Get user statistics
  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    pending: number;
    customers: number;
    vendors: number;
    admins: number;
    emailVerified: number;
    phoneVerified: number;
    recentUsers: User[];
  }> {
    try {
      // Get comprehensive stats and user count
      const [stats, userCount] = await Promise.all([
        apiClient.get('/user-service/internal/analytics/statistics'),
        apiClient.get('/user-service/analytics/count')
      ]);

      return {
        total: userCount.count || 0,
        active: stats.activeUsers || 0,
        inactive: stats.inactiveUsers || 0,
        suspended: stats.suspendedUsers || 0,
        pending: stats.pendingUsers || 0,
        customers: stats.customers || 0,
        vendors: stats.vendors || 0,
        admins: stats.admins || 0,
        emailVerified: stats.emailVerifiedUsers || 0,
        phoneVerified: stats.phoneVerifiedUsers || 0,
        recentUsers: stats.recentUsers || [],
      };
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
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

  // Bulk operations
  async bulkUpdateUsers(userIds: string[], data: Partial<UserUpdateData>): Promise<{ updated: number }> {
    return apiClient.patch('/users/bulk', { userIds, data });
  }

  async bulkDeleteUsers(userIds: string[]): Promise<{ deleted: number }> {
    return apiClient.delete('/users/bulk', { userIds });
  }
}

export const usersService = new UsersService();