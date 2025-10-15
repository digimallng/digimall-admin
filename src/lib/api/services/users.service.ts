/**
 * Users Management Service
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  User,
  BackendUser,
  BackendUserListResponse,
  UserListResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UserSuspensionRequest,
  UserSuspensionResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  UserStatisticsResponse,
  GetAllUsersParams,
  GetUserStatisticsParams,
} from '../types';

class UsersService {
  /**
   * Transform backend user to frontend User type
   */
  private transformUser(backendUser: BackendUser): User {
    console.log('[UsersService] Transforming backend user:', backendUser._id);

    // Normalize status - backend returns various statuses like 'verified', 'pending_verification'
    // Map them to our standard statuses: active, inactive, suspended, deleted
    let normalizedStatus: 'active' | 'inactive' | 'suspended' | 'deleted' = 'active';
    const backendStatus = backendUser.status.toLowerCase();

    if (backendStatus === 'verified' || backendStatus === 'active') {
      normalizedStatus = 'active';
    } else if (backendStatus.includes('pending') || backendStatus === 'inactive') {
      normalizedStatus = 'inactive';
    } else if (backendStatus === 'suspended') {
      normalizedStatus = 'suspended';
    } else if (backendStatus === 'deleted') {
      normalizedStatus = 'deleted';
    }

    return {
      id: backendUser._id,
      email: backendUser.email,
      role: backendUser.role,
      status: normalizedStatus,
      profile: {
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        phone: backendUser.phone,
        dateOfBirth: undefined,
        gender: undefined,
        avatar: undefined,
      },
      addresses: [],
      preferences: backendUser.preferences ? {
        language: backendUser.language || 'en',
        currency: 'NGN',
        notifications: backendUser.preferences.notifications,
        marketing: backendUser.preferences.marketing,
      } : {
        language: 'en',
        currency: 'NGN',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        marketing: {
          email: false,
          sms: false,
        },
      },
      statistics: {
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        wishlistItems: 0,
        cartItems: 0,
      },
      emailVerified: backendUser.isEmailVerified || false,
      phoneVerified: backendUser.isPhoneVerified || false,
      twoFactorEnabled: backendUser.is2FAEnabled || false,
      lastLoginAt: backendUser.lastLoginAt,
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
      deletedAt: backendUser.deletedAt || undefined,
    };
  }

  async getAll(params?: GetAllUsersParams): Promise<UserListResponse> {
    console.log('[UsersService] Fetching users with params:', params);

    const response = await apiClient.get<BackendUserListResponse>(
      API_ENDPOINTS.USERS.GET_ALL,
      { params }
    );

    console.log('[UsersService] Backend response:', response.data);

    // Transform backend response { users: [], pagination: {} } to { data: [], meta: {} }
    const backendData = response.data;

    if (!backendData || !backendData.users || !backendData.pagination) {
      console.error('[UsersService] Invalid backend response structure:', backendData);
      throw new Error('Invalid response structure from backend');
    }

    const transformedResponse: UserListResponse = {
      data: backendData.users.map((user) => this.transformUser(user)),
      meta: {
        page: backendData.pagination.page,
        limit: backendData.pagination.limit,
        total: backendData.pagination.total,
        totalPages: backendData.pagination.totalPages,
      },
    };

    console.log('[UsersService] Transformed response:', {
      userCount: transformedResponse.data.length,
      meta: transformedResponse.meta,
    });

    return transformedResponse;
  }

  async getById(id: string): Promise<User> {
    console.log('[UsersService] Fetching user by ID:', id);

    const response = await apiClient.get<BackendUser>(
      API_ENDPOINTS.USERS.GET_BY_ID(id)
    );

    console.log('[UsersService] Backend user response:', response.data);

    // Transform backend user response
    const backendUser = response.data;
    if (!backendUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    const transformedUser = this.transformUser(backendUser);
    console.log('[UsersService] Transformed user:', transformedUser);

    return transformedUser;
  }

  // Note: General user update endpoint doesn't exist in the API
  // Use updateStatus() for status changes

  async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<UpdateUserResponse> {
    const response = await apiClient.put<UpdateUserResponse>(
      API_ENDPOINTS.USERS.UPDATE_STATUS(id),
      { status }
    );
    return response.data!;
  }

  async suspendUnsuspend(
    id: string,
    data: UserSuspensionRequest
  ): Promise<UserSuspensionResponse> {
    // Use bulk action endpoint for suspend/unsuspend as per API documentation
    // Note: Backend does not support duration parameter
    const bulkData = {
      userIds: [id],
      action: data.action,
      reason: data.reason,
    };

    const response = await apiClient.post<{ message: string; successful: number; failed: number }>(
      API_ENDPOINTS.USERS.BULK_ACTION,
      bulkData
    );

    // Return a compatible response
    return {
      message: response.data?.message || `User ${data.action}ed successfully`,
      user: { id } as any, // The API doesn't return full user data, we'll refetch
    };
  }

  async delete(id: string, data: DeleteUserRequest): Promise<DeleteUserResponse> {
    const response = await apiClient.delete<DeleteUserResponse>(
      API_ENDPOINTS.USERS.DELETE(id),
      { data }
    );
    return response.data!;
  }

  async getStatistics(
    params?: GetUserStatisticsParams
  ): Promise<UserStatisticsResponse> {
    const response = await apiClient.get<UserStatisticsResponse>(
      API_ENDPOINTS.USERS.GET_STATISTICS,
      { params }
    );
    return response.data!;
  }
}

export const usersService = new UsersService();
export default usersService;
