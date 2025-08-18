import { apiClient } from '../client';
import type { QueryParams, PaginatedResponse, BulkOperationResponse } from '../client';

// ===== TYPES =====

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  location?: string;
  device?: string;
  success: boolean;
  duration?: number;
  details: {
    endpoint?: string;
    method?: string;
    requestBody?: any;
    responseCode?: number;
    changes?: Record<string, { from: any; to: any }>;
  };
  errorMessage?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isSuspicious: boolean;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  successful: boolean;
  failureReason?: string;
  timestamp: string;
  isSuspicious: boolean;
  riskScore: number;
  blockedByRateLimit: boolean;
  device: string;
}

export interface SecuritySettings {
  authentication: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
      preventReuse: number;
    };
    twoFactorAuth: {
      enabled: boolean;
      required: boolean;
      methods: string[];
    };
    sessionTimeout: number;
    maxConcurrentSessions: number;
    lockoutPolicy: {
      maxAttempts: number;
      lockoutDuration: number;
    };
  };
  apiSecurity: {
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
      requestsPerHour: number;
    };
    ipWhitelisting: {
      enabled: boolean;
      allowedIPs: string[];
    };
    encryption: {
      algorithm: string;
      keyRotationInterval: number;
    };
  };
  monitoring: {
    auditLogging: boolean;
    realTimeAlerts: boolean;
    suspiciousActivityDetection: boolean;
    alertThresholds: {
      failedLogins: number;
      apiErrors: number;
      dataChanges: number;
    };
  };
  compliance: {
    gdprCompliant: boolean;
    dataRetentionPeriod: number;
    cookiePolicy: string;
    privacyPolicyVersion: string;
    lastComplianceReview: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  type: 'suspicious_login' | 'data_breach' | 'system_error' | 'policy_violation';
  timestamp: string;
  affectedResources: string[];
  source: string;
  assignedTo?: string;
  actions: string[];
}

export interface SecurityScore {
  overallScore: number;
  maxScore: number;
  grade: string;
  components: {
    authentication: { score: number; maxScore: number; issues: number };
    authorization: { score: number; maxScore: number; issues: number };
    dataProtection: { score: number; maxScore: number; issues: number };
    monitoring: { score: number; maxScore: number; issues: number };
    compliance: { score: number; maxScore: number; issues: number };
  };
  recommendations: string[];
  lastAssessment: string;
  nextAssessment: string;
}

// ===== SERVICE CLASS =====

export class SecurityService {
  // Audit Logs
  async getAuditLogs(params?: QueryParams): Promise<PaginatedResponse<AuditLog>> {
    return apiClient.get('/security-management/audit-logs', params);
  }

  async getAuditLog(id: string): Promise<AuditLog> {
    return apiClient.get(`/security-management/audit-logs/${id}`);
  }

  async exportAuditLogs(data: {
    format: 'csv' | 'xlsx' | 'json';
    startDate: string;
    endDate: string;
    filters?: any;
  }): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.post('/security-management/audit-logs/export', data);
  }

  // Sessions
  async getActiveSessions(params?: QueryParams): Promise<PaginatedResponse<UserSession>> {
    return apiClient.get('/security-management/sessions', params);
  }

  async getSession(id: string): Promise<UserSession> {
    return apiClient.get(`/security-management/sessions/${id}`);
  }

  async revokeSession(sessionId: string, data: { reason?: string }): Promise<{ success: boolean }> {
    return apiClient.post(`/security-management/sessions/${sessionId}/revoke`, data);
  }

  async bulkRevokeSessions(data: {
    criteria: {
      userId?: string;
      ipAddress?: string;
      location?: string;
      olderThan?: string;
    };
    reason: string;
  }): Promise<BulkOperationResponse> {
    return apiClient.post('/security-management/sessions/bulk-revoke', data);
  }

  // Login Attempts
  async getLoginAttempts(params?: QueryParams): Promise<PaginatedResponse<LoginAttempt>> {
    return apiClient.get('/security-management/login-attempts', params);
  }

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    return apiClient.get('/security-management/settings');
  }

  async updateSecuritySettings(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
    return apiClient.put('/security-management/settings', data);
  }

  // Roles and Permissions
  async getRoles(): Promise<Role[]> {
    return apiClient.get('/security-management/roles');
  }

  async getRole(id: string): Promise<Role> {
    return apiClient.get(`/security-management/roles/${id}`);
  }

  async createRole(data: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<Role> {
    return apiClient.post('/security-management/roles', data);
  }

  async updateRole(roleId: string, data: {
    name?: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    return apiClient.put(`/security-management/roles/${roleId}`, data);
  }

  async deleteRole(roleId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/security-management/roles/${roleId}`);
  }

  async getPermissions(): Promise<{
    categories: Array<{
      name: string;
      permissions: Array<{
        key: string;
        name: string;
        description: string;
      }>;
    }>;
  }> {
    return apiClient.get('/security-management/permissions');
  }

  // Security Alerts
  async getSecurityAlerts(params?: QueryParams): Promise<PaginatedResponse<SecurityAlert>> {
    return apiClient.get('/security-management/alerts', params);
  }

  async getSecurityAlert(id: string): Promise<SecurityAlert> {
    return apiClient.get(`/security-management/alerts/${id}`);
  }

  async resolveAlert(alertId: string, data: {
    status: 'investigating' | 'resolved' | 'dismissed';
    resolution?: string;
    actions?: string[];
    assignedTo?: string;
  }): Promise<SecurityAlert> {
    return apiClient.post(`/security-management/alerts/${alertId}/resolve`, data);
  }

  // IP Management
  async blockIp(data: {
    ipAddress: string;
    reason: string;
    duration?: number; // hours
  }): Promise<{ success: boolean }> {
    return apiClient.post('/security-management/ip/block', data);
  }

  async unblockIp(ipAddress: string): Promise<{ success: boolean }> {
    return apiClient.post('/security-management/ip/unblock', { ipAddress });
  }

  async getBlockedIPs(): Promise<Array<{
    ipAddress: string;
    reason: string;
    blockedAt: string;
    expiresAt?: string;
    blockedBy: string;
  }>> {
    return apiClient.get('/security-management/ip/blocked');
  }

  async getIpWhitelist(): Promise<string[]> {
    return apiClient.get('/security-management/ip/whitelist');
  }

  async updateIpWhitelist(ips: string[]): Promise<{ success: boolean }> {
    return apiClient.put('/security-management/ip/whitelist', { ips });
  }

  // User Security Actions
  async forcePasswordReset(userId: string, data: { notify?: boolean }): Promise<{ success: boolean }> {
    return apiClient.post(`/security-management/users/${userId}/force-password-reset`, data);
  }

  async toggle2FA(userId: string, data: { enabled: boolean }): Promise<{ success: boolean }> {
    return apiClient.post(`/security-management/users/${userId}/2fa`, data);
  }

  async lockUser(userId: string, data: { reason: string; duration?: number }): Promise<{ success: boolean }> {
    return apiClient.post(`/security-management/users/${userId}/lock`, data);
  }

  async unlockUser(userId: string): Promise<{ success: boolean }> {
    return apiClient.post(`/security-management/users/${userId}/unlock`);
  }

  // Security Score
  async getSecurityScore(): Promise<SecurityScore> {
    return apiClient.get('/security-management/score');
  }

  async runSecurityAssessment(): Promise<SecurityScore> {
    return apiClient.post('/security-management/assessment');
  }

  // Recent Security Events
  async getRecentSecurityEvents(limit: number = 10): Promise<Array<{
    id: string;
    type: string;
    timestamp: string;
    severity: string;
    description: string;
    userId?: string;
    ipAddress?: string;
  }>> {
    return apiClient.get('/security-management/events/recent', { limit });
  }

  // API Keys Management
  async getApiKeys(): Promise<Array<{
    id: string;
    name: string;
    key: string; // masked
    permissions: string[];
    lastUsed?: string;
    expiresAt?: string;
    isActive: boolean;
    createdAt: string;
  }>> {
    return apiClient.get('/security-management/api-keys');
  }

  async createApiKey(data: {
    name: string;
    permissions: string[];
    expiresAt?: string;
  }): Promise<{
    id: string;
    key: string; // full key only returned on creation
  }> {
    return apiClient.post('/security-management/api-keys', data);
  }

  async revokeApiKey(keyId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/security-management/api-keys/${keyId}`);
  }

  // Webhooks Security
  async getWebhooks(): Promise<Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    secret: string; // masked
    isActive: boolean;
    lastTriggered?: string;
    createdAt: string;
  }>> {
    return apiClient.get('/security-management/webhooks');
  }

  async createWebhook(data: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
  }): Promise<{
    id: string;
    secret: string; // full secret only returned on creation
  }> {
    return apiClient.post('/security-management/webhooks', data);
  }

  async updateWebhook(webhookId: string, data: {
    name?: string;
    url?: string;
    events?: string[];
    isActive?: boolean;
  }): Promise<{ success: boolean }> {
    return apiClient.put(`/security-management/webhooks/${webhookId}`, data);
  }

  async deleteWebhook(webhookId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/security-management/webhooks/${webhookId}`);
  }

  async testWebhook(webhookId: string): Promise<{ success: boolean; responseTime: number }> {
    return apiClient.post(`/security-management/webhooks/${webhookId}/test`);
  }

  // Vulnerability Scanning
  async getVulnerabilities(): Promise<Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    component: string;
    detectedAt: string;
    status: 'open' | 'mitigated' | 'fixed' | 'false_positive';
    recommendation: string;
  }>> {
    return apiClient.get('/security-management/vulnerabilities');
  }

  async runVulnerabilityScan(): Promise<{ scanId: string; status: string }> {
    return apiClient.post('/security-management/vulnerabilities/scan');
  }

  async updateVulnerabilityStatus(vulnId: string, data: {
    status: 'open' | 'mitigated' | 'fixed' | 'false_positive';
    notes?: string;
  }): Promise<{ success: boolean }> {
    return apiClient.patch(`/security-management/vulnerabilities/${vulnId}`, data);
  }

  // Compliance
  async getComplianceStatus(): Promise<{
    gdpr: { compliant: boolean; lastAudit: string; issues: string[] };
    pci: { compliant: boolean; lastAudit: string; issues: string[] };
    iso27001: { compliant: boolean; lastAudit: string; issues: string[] };
    dataRetention: { policies: any[]; retentionPeriod: number };
  }> {
    return apiClient.get('/security-management/compliance');
  }

  async generateComplianceReport(standard: 'gdpr' | 'pci' | 'iso27001'): Promise<{
    reportId: string;
    downloadUrl: string;
  }> {
    return apiClient.post(`/security-management/compliance/report/${standard}`);
  }

  // Data Retention
  async getDataRetentionPolicies(): Promise<Array<{
    id: string;
    dataType: string;
    retentionPeriod: number; // days
    deleteAfter: boolean;
    archiveAfter: boolean;
    isActive: boolean;
  }>> {
    return apiClient.get('/security-management/data-retention');
  }

  async updateDataRetentionPolicy(policyId: string, data: {
    retentionPeriod?: number;
    deleteAfter?: boolean;
    archiveAfter?: boolean;
    isActive?: boolean;
  }): Promise<{ success: boolean }> {
    return apiClient.put(`/security-management/data-retention/${policyId}`, data);
  }

  async runDataCleanup(): Promise<{
    jobId: string;
    estimatedCompletion: string;
  }> {
    return apiClient.post('/security-management/data-retention/cleanup');
  }
}

// ===== SINGLETON INSTANCE =====
export const securityService = new SecurityService();