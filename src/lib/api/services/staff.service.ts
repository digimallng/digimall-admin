import { apiClient } from '../client';

export interface StaffRoleEnum {
  SUPER_ADMIN: 'super_admin';
  ADMIN: 'admin';
  MODERATOR: 'moderator';
  ANALYST: 'analyst';
  SUPPORT: 'support';
  VIEWER: 'viewer';
}

export type StaffRole = 'super_admin' | 'admin' | 'moderator' | 'analyst' | 'support' | 'viewer';

export interface StaffStatus {
  ACTIVE: 'active';
  INACTIVE: 'inactive';
  SUSPENDED: 'suspended';
  PENDING: 'pending';
}

export interface StaffPermission {
  USER_READ: 'user:read';
  USER_WRITE: 'user:write';
  USER_DELETE: 'user:delete';
  USER_SUSPEND: 'user:suspend';
  VENDOR_READ: 'vendor:read';
  VENDOR_WRITE: 'vendor:write';
  VENDOR_VERIFY: 'vendor:verify';
  VENDOR_SUSPEND: 'vendor:suspend';
  ORDER_READ: 'order:read';
  ORDER_WRITE: 'order:write';
  ORDER_CANCEL: 'order:cancel';
  ORDER_REFUND: 'order:refund';
  PRODUCT_READ: 'product:read';
  PRODUCT_WRITE: 'product:write';
  PRODUCT_DELETE: 'product:delete';
  PRODUCT_MODERATE: 'product:moderate';
  FINANCIAL_READ: 'financial:read';
  FINANCIAL_WRITE: 'financial:write';
  FINANCIAL_PROCESS: 'financial:process';
  DISPUTE_READ: 'dispute:read';
  DISPUTE_WRITE: 'dispute:write';
  DISPUTE_RESOLVE: 'dispute:resolve';
  SYSTEM_READ: 'system:read';
  SYSTEM_WRITE: 'system:write';
  SYSTEM_ADMIN: 'system:admin';
  STAFF_READ: 'staff:read';
  STAFF_WRITE: 'staff:write';
  STAFF_DELETE: 'staff:delete';
  STAFF_MANAGE_ROLES: 'staff:manage_roles';
  ANALYTICS_READ: 'analytics:read';
  ANALYTICS_ADVANCED: 'analytics:advanced';
  REPORTS_READ: 'reports:read';
  REPORTS_CREATE: 'reports:create';
  API_KEYS_READ: 'api_keys:read';
  API_KEYS_WRITE: 'api_keys:write';
  WEBHOOKS_READ: 'webhooks:read';
  WEBHOOKS_WRITE: 'webhooks:write';
  AUDIT_READ: 'audit:read';
  AUDIT_ADVANCED: 'audit:advanced';
  MONITORING_READ: 'monitoring:read';
  ALL: '*';
}

export interface Staff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: StaffRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  department?: string;
  jobTitle?: string;
  permissions: (keyof StaffPermission)[];
  phoneNumber?: string;
  profilePicture?: string;
  startDate?: Date;
  endDate?: Date;
  lastActiveAt?: Date;
  lastLoginAt?: Date;
  loginCount: number;
  passwordChangedAt?: Date;
  requirePasswordChange: boolean;
  allowedIps: string[];
  notes?: string;
  metadata?: {
    cannotDelete?: boolean;
    [key: string]: any;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive: boolean;
}

export interface StaffSession {
  id: string;
  staffId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface CreateStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  role: keyof StaffRoleEnum;
  department?: string;
  jobTitle?: string;
  customPermissions?: (keyof StaffPermission)[];
  phoneNumber?: string;
  startDate?: string;
  endDate?: string;
  requirePasswordChange?: boolean;
  sendWelcomeEmail?: boolean;
  allowedIps?: string[];
  notes?: string;
}

export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  role?: keyof StaffRoleEnum;
  status?: keyof StaffStatus;
  department?: string;
  jobTitle?: string;
  customPermissions?: (keyof StaffPermission)[];
  phoneNumber?: string;
  endDate?: string;
  allowedIps?: string[];
  notes?: string;
}

export interface StaffFilterRequest {
  search?: string;
  role?: keyof StaffRoleEnum;
  status?: keyof StaffStatus;
  department?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastActiveAfter?: string;
  createdBy?: string;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

export interface StaffResponse {
  staff: Staff[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
  };
}

export interface StaffLoginRequest {
  email: string;
  password: string;
  rememberDevice?: boolean;
}

export interface StaffLoginResponse {
  message: string;
  staff: Staff;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
  requirePasswordChange: boolean;
  permissions: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions?: boolean;
  currentSessionId?: string;
}

export interface InviteStaffRequest {
  email: string;
  role: keyof StaffRoleEnum;
  firstName?: string;
  lastName?: string;
  department?: string;
  jobTitle?: string;
  customMessage?: string;
  expiresInDays?: number;
}

export interface BulkStaffActionRequest {
  staffIds: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'unsuspend' | 'delete' | 'update_role';
  newRole?: keyof StaffRole;
  reason?: string;
  notifyUsers?: boolean;
}

export interface StaffAnalytics {
  period: { startDate: string; endDate: string };
  overview: {
    totalActivities: number;
    activeStaff: number;
    avgActivitiesPerStaff: number;
    peakActivityHours: string[];
  };
  departmentMetrics: any[];
  roleMetrics: any[];
  topPerformers: any[];
  activityTrends: Record<string, number>;
  insights: {
    mostProductiveDepartment: string;
    leastActiveRole: string;
    peakProductivityDay: string;
    recommendedActions: string[];
  };
}

export interface StaffSecurityAudit {
  summary: {
    totalStaff: number;
    activeStaff: number;
    suspendedStaff: number;
    staffRequiringPasswordChange: number;
    staffWithoutMFA: number;
  };
  securityChecks: {
    passwordPolicy: any;
    multiFactorAuth: any;
    ipRestrictions: any;
    sessionManagement: any;
  };
  vulnerabilities: any[];
  recommendations: string[];
  complianceScore: number;
}

export class StaffService {
  private api = apiClient;

  // Staff CRUD operations
  async getStaff(filters?: StaffFilterRequest): Promise<StaffResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.api.get<StaffResponse>(`/staff?${params.toString()}`);
    return response;
  }

  async getStaffById(staffId: string): Promise<Staff> {
    const response = await this.api.get<Staff>(`/staff/${staffId}`);
    return response;
  }

  async createStaff(data: CreateStaffRequest): Promise<Staff> {
    const response = await this.api.post<Staff>('/staff', data);
    return response;
  }

  async updateStaff(staffId: string, data: UpdateStaffRequest): Promise<Staff> {
    const response = await this.api.put<Staff>(`/staff/${staffId}`, data);
    return response;
  }

  async deleteStaff(staffId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete<{ success: boolean; message: string }>(`/staff/${staffId}`);
    return response;
  }

  async inviteStaff(data: InviteStaffRequest): Promise<{ message: string; inviteId: string }> {
    const response = await this.api.post<{ message: string; inviteId: string }>('/staff/invite', data);
    return response;
  }

  async bulkStaffAction(data: BulkStaffActionRequest): Promise<{ success: boolean; results: any[] }> {
    const response = await this.api.put<{ success: boolean; results: any[] }>('/staff/bulk-action', data);
    return response;
  }

  // Staff authentication
  async staffLogin(data: StaffLoginRequest): Promise<StaffLoginResponse> {
    const response = await this.api.post<StaffLoginResponse>('/staff/auth/login', data);
    return response;
  }

  async staffLogout(sessionId: string, logoutAllDevices?: boolean): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>('/staff/auth/logout', {
      sessionId,
      logoutAllDevices,
    });
    return response;
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>('/staff/auth/change-password', data);
    return response;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await this.api.post<{ accessToken: string; expiresIn: number }>('/staff/auth/refresh-token', {
      refreshToken,
    });
    return response;
  }

  // Staff sessions
  async getStaffSessions(staffId?: string): Promise<{ sessions: StaffSession[]; total: number }> {
    const url = staffId ? `/staff/${staffId}/sessions` : '/staff/auth/sessions';
    const response = await this.api.get<{ sessions: StaffSession[]; total: number }>(url);
    return response;
  }

  async revokeStaffSession(sessionId: string, reason?: string): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>(`/staff/auth/sessions/${sessionId}`, {
      action: 'revoke',
      reason,
    });
    return response;
  }

  // Staff activity and analytics
  async getStaffActivity(staffId: string, filters?: {
    startDate?: string;
    endDate?: string;
    actionType?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.api.get(`/staff/${staffId}/activity?${params.toString()}`);
    return response;
  }

  async getStaffAnalytics(filters?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Promise<StaffAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.api.get<StaffAnalytics>(`/staff/analytics/overview?${params.toString()}`);
    return response;
  }

  async getStaffSecurityAudit(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<StaffSecurityAudit> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.api.get<StaffSecurityAudit>(`/staff/analytics/security-audit?${params.toString()}`);
    return response;
  }

  async getStaffProductivity(filters?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.api.get(`/staff/analytics/productivity?${params.toString()}`);
    return response;
  }

  // Staff permissions
  async updateStaffPermissions(staffId: string, permissions: (keyof StaffPermission)[]): Promise<Staff> {
    const response = await this.api.put<Staff>(`/staff/${staffId}/permissions`, {
      permissions,
    });
    return response;
  }

  async getRolePermissions(): Promise<{
    roles: Record<string, any>;
    permissions: Record<string, string>;
    allPermissions: string[];
  }> {
    const response = await this.api.get<{
      roles: Record<string, any>;
      permissions: Record<string, string>;
      allPermissions: string[];
    }>('/staff/roles/permissions');
    return response;
  }

  async updateRolePermissions(role: string, permissions: string[]): Promise<void> {
    const response = await this.api.put(`/staff/roles/${role}/permissions`, {
      permissions,
    });
    return response;
  }

  // Support agent specific methods
  async getSupportAgents(filters?: {
    teamId?: string;
    status?: string;
    available?: boolean;
  }): Promise<Staff[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.api.get<Staff[]>(`/staff/support-agents?${params.toString()}`);
    return response;
  }

  async assignStaffToSupportTeam(staffId: string, teamId: string): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>(`/staff/${staffId}/support-team`, {
      teamId,
    });
    return response;
  }

  async updateAgentStatus(
    staffId: string, 
    status: 'available' | 'busy' | 'away' | 'offline',
    reason?: string
  ): Promise<{ message: string }> {
    const response = await this.api.put<{ message: string }>(`/staff/${staffId}/agent-status`, {
      status,
      reason,
    });
    return response;
  }

  async getStaffWorkload(staffId: string): Promise<{
    activeTickets: number;
    pendingTickets: number;
    resolvedToday: number;
    avgResponseTime: string;
    currentCapacity: number;
    maxCapacity: number;
  }> {
    const response = await this.api.get(`/staff/${staffId}/workload`);
    return response;
  }

  // Staff stats and limits
  async getStaffLimitInfo(): Promise<{
    currentCount: number;
    maxLimit: number;
    availableSlots: number;
    billingPlan: string;
  }> {
    const response = await this.api.get('/staff/limit-info');
    return response;
  }

  async getStaffStats(filters?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
    includeActivityStats?: boolean;
    includePermissionStats?: boolean;
    includeSecurityEvents?: boolean;
  }): Promise<any> {
    const response = await this.api.post('/staff/stats', filters || {});
    return response;
  }

  // Utility methods
  getRoleDisplayName(role: keyof StaffRole): string {
    const roleNames = {
      super_admin: 'Super Administrator',
      admin: 'Administrator',
      moderator: 'Moderator', 
      analyst: 'Business Analyst',
      support: 'Customer Support',
      viewer: 'Viewer',
    };
    return roleNames[role] || role;
  }

  getStatusDisplayName(status: keyof StaffStatus): string {
    const statusNames = {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      pending: 'Pending',
    };
    return statusNames[status] || status;
  }

  getPermissionDisplayName(permission: keyof StaffPermission): string {
    const permissionNames = {
      'user:read': 'View Users',
      'user:write': 'Manage Users',
      'user:delete': 'Delete Users',
      'user:suspend': 'Suspend Users',
      'vendor:read': 'View Vendors',
      'vendor:write': 'Manage Vendors',
      'vendor:verify': 'Verify Vendors',
      'vendor:suspend': 'Suspend Vendors',
      'order:read': 'View Orders',
      'order:write': 'Manage Orders',
      'order:cancel': 'Cancel Orders',
      'order:refund': 'Process Refunds',
      'product:read': 'View Products',
      'product:write': 'Manage Products',
      'product:delete': 'Delete Products',
      'product:moderate': 'Moderate Products',
      'financial:read': 'View Financial Data',
      'financial:write': 'Manage Finances',
      'financial:process': 'Process Payments',
      'dispute:read': 'View Disputes',
      'dispute:write': 'Manage Disputes',
      'dispute:resolve': 'Resolve Disputes',
      'system:read': 'View System Info',
      'system:write': 'Modify System Settings',
      'system:admin': 'System Administration',
      'staff:read': 'View Staff',
      'staff:write': 'Manage Staff',
      'staff:delete': 'Delete Staff',
      'staff:manage_roles': 'Manage Staff Roles',
      'analytics:read': 'View Analytics',
      'analytics:advanced': 'Advanced Analytics',
      'reports:read': 'View Reports',
      'reports:create': 'Create Reports',
      'api_keys:read': 'View API Keys',
      'api_keys:write': 'Manage API Keys',
      'webhooks:read': 'View Webhooks',
      'webhooks:write': 'Manage Webhooks',
      'audit:read': 'View Audit Logs',
      'audit:advanced': 'Advanced Audit Features',
      'monitoring:read': 'View Monitoring Data',
      '*': 'All Permissions',
    };
    return permissionNames[permission] || permission;
  }
}

export const staffService = new StaffService();