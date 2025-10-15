/**
 * Audit Logs Types
 * Based on ADMIN_API_DOCUMENTATION.md - Audit Logs section
 * Complete implementation matching backend API 100%
 */

// ===== ENUMS =====

export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

// ===== STAFF INFO IN AUDIT LOG =====

export interface AuditStaffInfo {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

// ===== AUDIT LOG METADATA =====

export interface AuditLogMetadata {
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  responseCode?: number;
  changes?: {
    [key: string]: {
      from: any;
      to: any;
    };
  };
  reason?: string;
  [key: string]: any; // Allow additional metadata fields
}

// ===== AUDIT LOG =====

export interface AuditLog {
  _id: string;
  staffId: AuditStaffInfo | null;
  action: string;
  actionType: ActionType;
  resource: string;
  resourceId: string;
  severity: SeverityLevel;
  success: boolean;
  errorMessage?: string;
  metadata?: AuditLogMetadata;
  createdAt: string;
  updatedAt: string;
}

// ===== PAGINATION =====

export interface AuditLogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== REQUEST/RESPONSE TYPES =====

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  staffId?: string;
  actionType?: ActionType;
  resource?: string;
  resourceId?: string;
  severity?: SeverityLevel;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  ipAddress?: string;
}

export interface GetAuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: AuditLogPagination;
}

export interface GetAuditLogByIdResponse {
  success: boolean;
  data: AuditLog;
}

// ===== STATISTICS =====

export interface AuditLogStatistics {
  success: boolean;
  data: {
    overview: {
      totalLogs: number;
      totalSuccess: number;
      totalFailure: number;
      successRate: string;
    };
    byActionType: {
      create: number;
      read: number;
      update: number;
      delete: number;
      login: number;
      logout: number;
    };
    byResource: Array<{
      resource: string;
      count: number;
    }>;
    bySeverity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    topUsers: Array<{
      staffId: string;
      email: string;
      firstName: string;
      lastName: string;
      actionsCount: number;
    }>;
    recentCriticalActions: Array<{
      _id: string;
      staffId: {
        email: string;
        firstName: string;
        lastName: string;
      };
      action: string;
      resource: string;
      severity: string;
      success: boolean;
      createdAt: string;
    }>;
  };
}

// ===== HELPER TYPES FOR FILTERS =====

export interface AuditLogFilters {
  staffId?: string;
  actionType?: ActionType | 'all';
  resource?: string;
  severity?: SeverityLevel | 'all';
  success?: boolean | 'all';
  startDate?: string;
  endDate?: string;
  search?: string;
}
