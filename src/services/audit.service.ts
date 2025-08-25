import { apiClient } from '@/lib/api/client';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
  BULK_APPROVE = 'bulk_approve',
  BULK_REJECT = 'bulk_reject',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
  EXPORT = 'export',
  IMPORT = 'import',
  MODERATE = 'moderate',
  ESCALATE = 'escalate',
  ASSIGN = 'assign',
  TRANSFER = 'transfer',
  BLOCK = 'block',
  UNBLOCK = 'unblock',
  TOKEN_REFRESH = 'token_refresh',
  MFA_SETUP = 'mfa_setup',
  MFA_ENABLE = 'mfa_enable',
  MFA_DISABLE = 'mfa_disable',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCK = 'account_lock',
  ACCOUNT_UNLOCK = 'account_unlock',
  ROLE_CHANGE = 'role_change',
  PERMISSION_CHANGE = 'permission_change',
  VIEW = 'view',
  DOWNLOAD = 'download',
  
  // Security specific actions
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  PERMISSIONS_CHANGED = 'permissions_changed',
  SECURITY_ALERT = 'security_alert',
  FAILED_LOGIN_ATTEMPT = 'failed_login_attempt',
  
  // User management actions
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_STATUS_CHANGED = 'user_status_changed',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_ROLE_CHANGED = 'user_role_changed',
  
  // Vendor management actions
  VENDOR_CREATED = 'vendor_created',
  VENDOR_UPDATED = 'vendor_updated',
  VENDOR_APPROVED = 'vendor_approved',
  VENDOR_REJECTED = 'vendor_rejected',
  VENDOR_SUSPENDED = 'vendor_suspended',
  VENDOR_REACTIVATED = 'vendor_reactivated',
  VENDOR_DELETED = 'vendor_deleted',
  VENDOR_DOCUMENTS_REVIEWED = 'vendor_documents_reviewed',
  
  // Product management actions
  PRODUCT_CREATED = 'product_created',
  PRODUCT_UPDATED = 'product_updated',
  PRODUCT_DELETED = 'product_deleted',
  PRODUCT_APPROVED = 'product_approved',
  PRODUCT_REJECTED = 'product_rejected',
  PRODUCT_DELISTED = 'product_delisted',
  
  // Order management actions
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_PROCESSED = 'order_processed',
  ORDER_REFUNDED = 'order_refunded',
  
  // Payment management actions
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_REFUNDED = 'payment_refunded',
  PAYMENT_CANCELLED = 'payment_cancelled',
  
  // Escrow management actions
  ESCROW_CREATED = 'escrow_created',
  ESCROW_RELEASED = 'escrow_released',
  ESCROW_REFUNDED = 'escrow_refunded',
  
  // System management actions
  SYSTEM_CONFIG_CHANGED = 'system_config_changed',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  BACKUP_CREATED = 'backup_created',
  BACKUP_INITIATED = 'backup_initiated',
  BACKUP_COMPLETED = 'backup_completed',
  BACKUP_FAILED = 'backup_failed',
  CACHE_CLEARED = 'cache_cleared',
  ADMIN_LOGIN = 'admin_login',
  CONFIG_UPDATED = 'config_updated',
  
  // Content management actions
  CONTENT_MODERATED = 'content_moderated',
  CONTENT_FLAGGED = 'content_flagged',
  CONTENT_APPROVED = 'content_approved',
  
  // Analytics actions
  REPORT_GENERATED = 'report_generated',
  ANALYTICS_ACCESSED = 'analytics_accessed',
  
  // Support actions
  TICKET_CREATED = 'ticket_created',
  TICKET_RESOLVED = 'ticket_resolved',
  TICKET_ESCALATED = 'ticket_escalated',
  
  // Bulk operations
  BULK_OPERATION = 'bulk_operation',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  status: AuditStatus;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  riskScore: number;
  module?: string;
  endpoint?: string;
  httpMethod?: string;
  httpStatusCode?: number;
  responseTimeMs?: number;
  errorMessage?: string;
  stackTrace?: string;
  tags?: string[];
  isSystemGenerated: boolean;
  requiresReview: boolean;
  isReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  
  // User relationship
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  
  // Reviewer relationship
  reviewer?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  
  // Computed properties
  isHighRisk?: boolean;
  isFailed?: boolean;
  hasError?: boolean;
  isSlowRequest?: boolean;
  actionDisplayName?: string;
}

export interface AuditFilterDto {
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  userId?: string;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
  riskScore?: number;
  module?: string;
  requiresReview?: boolean;
  isReviewed?: boolean;
  page?: number;
  limit?: number;
}


export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AuditStatistics {
  totalLogs: number;
  totalActions: number;
  actionBreakdown: Record<string, number>;
  resourceBreakdown: Record<string, number>;
  userBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  highRiskActions: number;
  failedActions: number;
  pendingReviews: number;
  topUsers: Array<{
    userId: string;
    email: string;
    actionCount: number;
  }>;
  hourlyDistribution: Record<number, number>;
  timeSeriesData: Array<{
    date: string;
    count: number;
    failedCount: number;
    highRiskCount: number;
  }>;
  dateRange: {
    start?: string;
    end?: string;
  };
}

export class AuditService {
  private readonly basePath = '/audit';

  async getAuditLogs(filter?: AuditFilterDto): Promise<AuditLogsResponse> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = `${this.basePath}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<AuditLogsResponse>(url);
    return response;
  }


  async exportAuditLogs(
    filter?: AuditFilterDto,
    format: 'csv' | 'json' | 'xlsx' = 'csv'
  ): Promise<void> {
    console.log('📊 AuditService: Exporting audit logs');
    console.log('📍 Endpoint:', `${this.basePath}/export`);
    console.log('📦 Filter:', filter);
    console.log('📋 Format:', format);
    
    const params: Record<string, any> = { format };
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'page' && key !== 'limit') {
          params[key] = String(value);
        }
      });
    }

    try {
      await apiClient.downloadFile(
        `${this.basePath}/export`,
        `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`,
        params
      );
      console.log('✅ AuditService: Logs exported successfully');
    } catch (error) {
      console.error('❌ AuditService: Failed to export logs');
      console.error('🚨 Export Error:', error);
      throw error;
    }
  }

  async getAuditActions(): Promise<{ actions: AuditAction[] }> {
    console.log('📊 AuditService: Getting available audit actions');
    try {
      const response = await apiClient.get<{ actions: AuditAction[] }>(`${this.basePath}/actions`);
      console.log('✅ AuditService: Actions retrieved successfully');
      return response;
    } catch (error) {
      console.error('❌ AuditService: Failed to get actions');
      console.error('🚨 Actions Error:', error);
      throw error;
    }
  }


  async getUserAuditLogs(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<AuditLogsResponse> {
    console.log('📊 AuditService: Getting user audit logs');
    console.log('👤 User ID:', userId);
    console.log('📄 Pagination:', { page, limit });
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    try {
      const response = await apiClient.get<AuditLogsResponse>(
        `${this.basePath}/user/${userId}?${params.toString()}`
      );
      console.log('✅ AuditService: User logs retrieved successfully');
      return response;
    } catch (error) {
      console.error('❌ AuditService: Failed to get user logs');
      console.error('🚨 User Logs Error:', error);
      throw error;
    }
  }

  async getEntityAuditLogs(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<AuditLogsResponse> {
    console.log('📊 AuditService: Getting entity audit logs');
    console.log('🏷️ Entity:', { entityType, entityId });
    console.log('📄 Pagination:', { page, limit });
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    try {
      const response = await apiClient.get<AuditLogsResponse>(
        `${this.basePath}/entity/${entityType}/${entityId}?${params.toString()}`
      );
      console.log('✅ AuditService: Entity logs retrieved successfully');
      return response;
    } catch (error) {
      console.error('❌ AuditService: Failed to get entity logs');
      console.error('🚨 Entity Logs Error:', error);
      throw error;
    }
  }
}

export const auditService = new AuditService();