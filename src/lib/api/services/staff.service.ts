/**
 * Staff Management Service
 *
 * Service layer for all staff-related API operations.
 * Implements all 17 staff management endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  Staff,
  StaffListResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffLoginRequest,
  StaffLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  UpdateStaffStatusRequest,
  UpdateStaffPermissionsRequest,
  StaffSessionsResponse,
  StaffActivityResponse,
  StaffAnalyticsOverviewResponse,
  SecurityAuditResponse,
  ProductivityResponse,
  RolePermissionsResponse,
  GetAllStaffParams,
} from '../types';

// ===== STAFF SERVICE CLASS =====

class StaffService {
  // ===== CORE CRUD OPERATIONS =====

  /**
   * Get all staff members with optional filtering
   */
  async getAll(params?: GetAllStaffParams): Promise<StaffListResponse> {
    const response = await apiClient.get<StaffListResponse>(
      API_ENDPOINTS.STAFF.GET_ALL,
      { params }
    );
    return response.data!;
  }

  /**
   * Get staff member by ID
   */
  async getById(id: string): Promise<Staff> {
    const response = await apiClient.get<Staff>(
      API_ENDPOINTS.STAFF.GET_BY_ID(id)
    );
    return response.data!;
  }

  /**
   * Create new staff member
   */
  async create(data: CreateStaffRequest): Promise<Staff> {
    const response = await apiClient.post<Staff>(
      API_ENDPOINTS.STAFF.CREATE,
      data
    );
    return response.data!;
  }

  /**
   * Update existing staff member
   */
  async update(id: string, data: UpdateStaffRequest): Promise<Staff> {
    const response = await apiClient.patch<Staff>(
      API_ENDPOINTS.STAFF.UPDATE(id),
      data
    );
    return response.data!;
  }

  /**
   * Delete staff member
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.STAFF.DELETE(id));
  }

  // ===== AUTHENTICATION =====

  /**
   * Staff login
   */
  async login(data: StaffLoginRequest): Promise<StaffLoginResponse> {
    const response = await apiClient.post<StaffLoginResponse>(
      API_ENDPOINTS.STAFF.LOGIN,
      data
    );
    return response.data!;
  }

  /**
   * Staff logout
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.STAFF.LOGOUT);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.STAFF.REFRESH_TOKEN,
      data
    );
    return response.data!;
  }

  /**
   * Change staff password
   */
  async changePassword(
    id: string,
    data: ChangePasswordRequest
  ): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.STAFF.CHANGE_PASSWORD(id), data);
  }

  // ===== STATUS & PERMISSIONS =====

  /**
   * Update staff status
   */
  async updateStatus(
    id: string,
    data: UpdateStaffStatusRequest
  ): Promise<Staff> {
    const response = await apiClient.patch<Staff>(
      API_ENDPOINTS.STAFF.UPDATE_STATUS(id),
      data
    );
    return response.data!;
  }

  /**
   * Update staff permissions
   */
  async updatePermissions(
    id: string,
    data: UpdateStaffPermissionsRequest
  ): Promise<Staff> {
    const response = await apiClient.patch<Staff>(
      API_ENDPOINTS.STAFF.UPDATE_PERMISSIONS(id),
      data
    );
    return response.data!;
  }

  /**
   * Get role permissions
   * Backend endpoint: GET /staff/roles/permissions (returns all roles)
   */
  async getRolePermissions(): Promise<RolePermissionsResponse> {
    const response = await apiClient.get<RolePermissionsResponse>(
      '/staff/roles/permissions'
    );
    return response.data!;
  }

  // ===== SESSIONS & ACTIVITY =====

  /**
   * Get staff sessions
   */
  async getSessions(id: string): Promise<StaffSessionsResponse> {
    const response = await apiClient.get<StaffSessionsResponse>(
      API_ENDPOINTS.STAFF.GET_SESSIONS(id)
    );
    return response.data!;
  }

  /**
   * Revoke staff session
   */
  async revokeSession(id: string, sessionId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.STAFF.REVOKE_SESSION(id, sessionId));
  }

  /**
   * Get staff activity
   */
  async getActivity(id: string): Promise<StaffActivityResponse> {
    const response = await apiClient.get<StaffActivityResponse>(
      API_ENDPOINTS.STAFF.GET_ACTIVITY(id)
    );
    return response.data!;
  }

  // ===== ANALYTICS =====

  /**
   * Get staff analytics overview
   */
  async getAnalytics(): Promise<StaffAnalyticsOverviewResponse> {
    const response = await apiClient.get<StaffAnalyticsOverviewResponse>(
      API_ENDPOINTS.STAFF.GET_ANALYTICS
    );
    return response.data!;
  }

  /**
   * Get security audit
   * Backend endpoint: GET /staff/analytics/security-audit?days=30
   */
  async getSecurityAudit(days: number = 30): Promise<SecurityAuditResponse> {
    const response = await apiClient.get<SecurityAuditResponse>(
      `/staff/analytics/security-audit?days=${days}`
    );
    return response.data!;
  }

  /**
   * Get staff productivity
   * Backend endpoint: GET /staff/analytics/productivity
   */
  async getProductivity(staffId?: string): Promise<ProductivityResponse> {
    const params = staffId ? { staffId } : {};
    const response = await apiClient.get<ProductivityResponse>(
      '/staff/analytics/productivity',
      { params }
    );
    return response.data!;
  }

  // ===== ALIAS METHODS FOR HOOKS COMPATIBILITY =====

  /**
   * Alias for getAll - used by hooks
   */
  async getStaff(params?: any): Promise<any> {
    return this.getAll(params);
  }

  /**
   * Alias for getById - used by hooks
   */
  async getStaffById(id: string): Promise<Staff> {
    return this.getById(id);
  }

  /**
   * Alias for create - used by hooks
   */
  async createStaff(data: CreateStaffRequest): Promise<Staff> {
    return this.create(data);
  }

  /**
   * Alias for update - used by hooks
   */
  async updateStaff(id: string, data: UpdateStaffRequest): Promise<Staff> {
    return this.update(id, data);
  }

  /**
   * Alias for delete - used by hooks
   */
  async deleteStaff(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Alias for login - used by hooks
   */
  async staffLogin(data: StaffLoginRequest): Promise<StaffLoginResponse> {
    return this.login(data);
  }

  /**
   * Alias for logout - used by hooks
   */
  async staffLogout(sessionId: string, logoutAllDevices?: boolean): Promise<void> {
    return this.logout();
  }

  /**
   * Alias for getSessions - used by hooks
   */
  async getStaffSessions(staffId?: string): Promise<StaffSessionsResponse> {
    if (!staffId) {
      return { sessions: [], total: 0 } as StaffSessionsResponse;
    }
    return this.getSessions(staffId);
  }

  /**
   * Alias for revokeSession - used by hooks
   */
  async revokeStaffSession(sessionId: string, reason?: string): Promise<void> {
    // Extract staffId from sessionId or use a default approach
    // For now, we'll need to modify the endpoint to work with just sessionId
    await apiClient.post(`/staff/sessions/${sessionId}/revoke`, { reason });
  }

  /**
   * Alias for getActivity - used by hooks
   */
  async getStaffActivity(staffId: string, filters?: any): Promise<StaffActivityResponse> {
    return this.getActivity(staffId);
  }

  /**
   * Alias for getAnalytics - used by hooks
   */
  async getStaffAnalytics(filters?: any): Promise<StaffAnalyticsOverviewResponse> {
    return this.getAnalytics();
  }

  /**
   * Alias for getSecurityAudit - used by hooks
   */
  async getStaffSecurityAudit(filters?: any): Promise<SecurityAuditResponse> {
    const days = filters?.days || 30;
    return this.getSecurityAudit(days);
  }

  /**
   * Alias for getProductivity - used by hooks
   */
  async getStaffProductivity(filters?: any): Promise<ProductivityResponse> {
    return this.getProductivity(filters?.staffId);
  }

  /**
   * Alias for updatePermissions - used by hooks
   */
  async updateStaffPermissions(staffId: string, permissions: any): Promise<Staff> {
    return this.updatePermissions(staffId, permissions);
  }

  /**
   * Update role permissions - used by hooks
   */
  async updateRolePermissions(role: string, permissions: string[]): Promise<any> {
    const response = await apiClient.patch(
      `/staff/roles/${role}/permissions`,
      { permissions }
    );
    return response.data!;
  }

  /**
   * Invite staff member
   */
  async inviteStaff(data: any): Promise<any> {
    const response = await apiClient.post('/staff/invite', data);
    return response.data!;
  }

  /**
   * Bulk staff actions
   */
  async bulkStaffAction(data: any): Promise<any> {
    const response = await apiClient.post('/staff/bulk-action', data);
    return response.data!;
  }


  /**
   * Get staff limit info - Note: This endpoint doesn't exist in the backend
   * Returns mock data for UI compatibility
   */
  async getStaffLimitInfo(): Promise<any> {
    // This endpoint doesn't exist in the backend API
    // Return default data to prevent errors
    return {
      currentCount: 0,
      maxLimit: 100,
      availableSlots: 100,
      usagePercentage: 0
    };
  }

  /**
   * Get staff stats - Uses analytics/overview endpoint
   * Backend endpoint: GET /staff/analytics/overview
   */
  async getStaffStats(filters?: any): Promise<any> {
    const response = await apiClient.get('/staff/analytics/overview');
    return response.data!;
  }
}

// ===== SINGLETON INSTANCE =====

export const staffService = new StaffService();
export default staffService;
