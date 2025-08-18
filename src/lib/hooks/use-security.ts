import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';

// Query keys
export const securityKeys = {
  all: ['security'] as const,
  auditLogs: () => [...securityKeys.all, 'audit-logs'] as const,
  auditLog: (id: string) => [...securityKeys.all, 'audit-log', id] as const,
  sessions: () => [...securityKeys.all, 'sessions'] as const,
  session: (id: string) => [...securityKeys.all, 'session', id] as const,
  loginAttempts: () => [...securityKeys.all, 'login-attempts'] as const,
  securitySettings: () => [...securityKeys.all, 'settings'] as const,
  permissions: () => [...securityKeys.all, 'permissions'] as const,
  roles: () => [...securityKeys.all, 'roles'] as const,
  role: (id: string) => [...securityKeys.all, 'role', id] as const,
  apiKeys: () => [...securityKeys.all, 'api-keys'] as const,
  apiKey: (id: string) => [...securityKeys.all, 'api-key', id] as const,
  webhooks: () => [...securityKeys.all, 'webhooks'] as const,
  webhook: (id: string) => [...securityKeys.all, 'webhook', id] as const,
  alerts: () => [...securityKeys.all, 'alerts'] as const,
  vulnerabilities: () => [...securityKeys.all, 'vulnerabilities'] as const,
  backups: () => [...securityKeys.all, 'backups'] as const,
  compliance: () => [...securityKeys.all, 'compliance'] as const,
  ipWhitelist: () => [...securityKeys.all, 'ip-whitelist'] as const,
  dataRetention: () => [...securityKeys.all, 'data-retention'] as const,
} as const;

// ===== QUERY HOOKS =====

// Get audit logs
export function useAuditLogs(
  filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'timestamp' | 'action' | 'severity';
    sortOrder?: 'ASC' | 'DESC';
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: securityKeys.auditLogs(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        data: Array.from({ length: filters?.limit || 20 }, (_, i) => ({
          id: `audit-${i}`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          userId: `user-${Math.floor(Math.random() * 100)}`,
          userName: `User ${Math.floor(Math.random() * 100) + 1}`,
          action: ['login', 'logout', 'create', 'update', 'delete', 'view', 'approve', 'reject'][Math.floor(Math.random() * 8)],
          resource: ['user', 'vendor', 'product', 'order', 'category', 'plan', 'payment'][Math.floor(Math.random() * 7)],
          resourceId: `resource-${Math.floor(Math.random() * 1000)}`,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          details: {
            changes: ['status updated', 'email changed', 'password reset', 'role modified'][Math.floor(Math.random() * 4)],
            oldValue: 'previous value',
            newValue: 'new value'
          },
          success: Math.random() > 0.1,
          errorMessage: Math.random() > 0.9 ? 'Permission denied' : null
        })),
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          total: 2456,
          totalPages: 123
        },
        summary: {
          totalLogs: 2456,
          criticalAlerts: 12,
          suspiciousActivity: 34,
          failedAttempts: 89,
          recentActivity: 156
        }
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Get single audit log
export function useAuditLog(
  id: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: securityKeys.auditLog(id),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        id,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userName: `User ${Math.floor(Math.random() * 100) + 1}`,
        action: 'update',
        resource: 'vendor',
        resourceId: 'vendor-123',
        severity: 'medium',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Lagos, Nigeria',
        device: 'Desktop',
        success: true,
        duration: 245, // milliseconds
        details: {
          endpoint: '/api/v1/vendors/123',
          method: 'PATCH',
          requestBody: { status: 'approved' },
          responseCode: 200,
          changes: {
            status: { from: 'pending', to: 'approved' },
            approvedBy: 'admin-456',
            approvedAt: new Date().toISOString()
          }
        },
        relatedLogs: [
          { id: 'audit-456', action: 'view', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
          { id: 'audit-789', action: 'approve', timestamp: new Date().toISOString() }
        ]
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get active sessions
export function useActiveSessions(
  filters?: {
    userId?: string;
    active?: boolean;
    device?: string;
    location?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: securityKeys.sessions(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        data: Array.from({ length: filters?.limit || 20 }, (_, i) => ({
          id: `session-${i}`,
          userId: `user-${Math.floor(Math.random() * 100)}`,
          userName: `User ${Math.floor(Math.random() * 100) + 1}`,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          location: ['Lagos, Nigeria', 'Abuja, Nigeria', 'London, UK', 'New York, USA'][Math.floor(Math.random() * 4)],
          isActive: Math.random() > 0.3,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          isSuspicious: Math.random() > 0.9
        })),
        summary: {
          totalSessions: 1234,
          activeSessions: 567,
          suspiciousSessions: 12,
          expiredSessions: 89
        }
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}

// Get login attempts
export function useLoginAttempts(
  filters?: {
    successful?: boolean;
    userId?: string;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: securityKeys.loginAttempts(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        data: Array.from({ length: filters?.limit || 20 }, (_, i) => ({
          id: `attempt-${i}`,
          email: `user${Math.floor(Math.random() * 100)}@example.com`,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: ['Lagos, Nigeria', 'Abuja, Nigeria', 'London, UK', 'New York, USA'][Math.floor(Math.random() * 4)],
          successful: Math.random() > 0.2,
          failureReason: Math.random() > 0.2 ? null : ['Invalid credentials', 'Account locked', 'Too many attempts', 'Invalid 2FA'][Math.floor(Math.random() * 4)],
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          isSuspicious: Math.random() > 0.8,
          riskScore: Math.floor(Math.random() * 100),
          blockedByRateLimit: Math.random() > 0.9,
          device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)]
        })),
        summary: {
          totalAttempts: 5678,
          successfulAttempts: 4234,
          failedAttempts: 1444,
          blockedAttempts: 89,
          suspiciousAttempts: 234
        }
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Get security settings
export function useSecuritySettings(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: securityKeys.securitySettings(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        authentication: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            maxAge: 90, // days
            preventReuse: 5
          },
          twoFactorAuth: {
            enabled: true,
            required: false,
            methods: ['sms', 'email', 'app']
          },
          sessionTimeout: 24, // hours
          maxConcurrentSessions: 3,
          lockoutPolicy: {
            maxAttempts: 5,
            lockoutDuration: 30 // minutes
          }
        },
        apiSecurity: {
          rateLimiting: {
            enabled: true,
            requestsPerMinute: 100,
            requestsPerHour: 5000
          },
          ipWhitelisting: {
            enabled: false,
            allowedIPs: []
          },
          encryption: {
            algorithm: 'AES-256',
            keyRotationInterval: 30 // days
          }
        },
        monitoring: {
          auditLogging: true,
          realTimeAlerts: true,
          suspiciousActivityDetection: true,
          alertThresholds: {
            failedLogins: 10,
            apiErrors: 50,
            dataChanges: 20
          }
        },
        compliance: {
          gdprCompliant: true,
          dataRetentionPeriod: 365, // days
          cookiePolicy: 'strict',
          privacyPolicyVersion: '2.1',
          lastComplianceReview: '2024-01-15'
        }
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Get roles and permissions
export function useRoles(
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: securityKeys.roles(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return [
        {
          id: 'super_admin',
          name: 'Super Administrator',
          description: 'Full system access with all permissions',
          permissions: ['*'],
          userCount: 2,
          isSystem: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Administrative access with most permissions',
          permissions: [
            'users.manage',
            'vendors.manage',
            'products.manage',
            'orders.manage',
            'analytics.view',
            'settings.manage'
          ],
          userCount: 8,
          isSystem: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'moderator',
          name: 'Moderator',
          description: 'Content moderation and basic management',
          permissions: [
            'products.approve',
            'vendors.review',
            'orders.view',
            'users.view'
          ],
          userCount: 15,
          isSystem: false,
          createdAt: '2024-02-01T00:00:00Z'
        },
        {
          id: 'support',
          name: 'Support Agent',
          description: 'Customer support and basic operations',
          permissions: [
            'orders.view',
            'users.view',
            'support.manage',
            'tickets.manage'
          ],
          userCount: 25,
          isSystem: false,
          createdAt: '2024-02-15T00:00:00Z'
        }
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Get security alerts
export function useSecurityAlerts(
  filters?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'open' | 'investigating' | 'resolved' | 'dismissed';
    type?: 'suspicious_login' | 'data_breach' | 'system_error' | 'policy_violation';
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: securityKeys.alerts(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        data: Array.from({ length: filters?.limit || 20 }, (_, i) => ({
          id: `alert-${i}`,
          title: [
            'Suspicious login attempt detected',
            'Multiple failed login attempts',
            'Unusual API activity',
            'Potential data breach attempt',
            'Policy violation detected'
          ][Math.floor(Math.random() * 5)],
          description: 'Detailed description of the security alert...',
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          status: ['open', 'investigating', 'resolved', 'dismissed'][Math.floor(Math.random() * 4)],
          type: ['suspicious_login', 'data_breach', 'system_error', 'policy_violation'][Math.floor(Math.random() * 4)],
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          affectedResources: [`user-${Math.floor(Math.random() * 100)}`, `order-${Math.floor(Math.random() * 1000)}`],
          source: ['automated_detection', 'manual_report', 'external_feed'][Math.floor(Math.random() * 3)],
          assignedTo: Math.random() > 0.5 ? `admin-${Math.floor(Math.random() * 10)}` : null,
          actions: [
            'Blocked IP address',
            'Suspended user account',
            'Increased monitoring',
            'Notified affected users'
          ].slice(0, Math.floor(Math.random() * 4) + 1)
        })),
        summary: {
          totalAlerts: 156,
          openAlerts: 23,
          criticalAlerts: 3,
          resolvedToday: 12
        }
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Revoke user session
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      api.sessions.revoke(sessionId, { reason }),
    onSuccess: () => {
      // Invalidate sessions
      queryClient.invalidateQueries({ queryKey: securityKeys.sessions() });
    },
  });
}

// Block IP address
export function useBlockIpAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ipAddress, reason, duration }: { 
      ipAddress: string; 
      reason: string;
      duration?: number; // hours
    }) => api.security.blockIp({ ipAddress, reason, duration }),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: securityKeys.loginAttempts() });
      queryClient.invalidateQueries({ queryKey: securityKeys.sessions() });
    },
  });
}

// Update security settings
export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      passwordPolicy?: any;
      sessionTimeout?: number;
      rateLimiting?: any;
      twoFactorAuth?: any;
    }) => api.security.updateSettings(data),
    onSuccess: () => {
      // Invalidate security settings
      queryClient.invalidateQueries({ queryKey: securityKeys.securitySettings() });
    },
  });
}

// Create role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      permissions: string[];
    }) => api.roles.create(data),
    onSuccess: () => {
      // Invalidate roles
      queryClient.invalidateQueries({ queryKey: securityKeys.roles() });
    },
  });
}

// Update role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { 
      roleId: string; 
      data: {
        name?: string;
        description?: string;
        permissions?: string[];
      };
    }) => api.roles.update(roleId, data),
    onSuccess: (_, { roleId }) => {
      // Update role cache
      queryClient.invalidateQueries({ queryKey: securityKeys.role(roleId) });
      
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: securityKeys.roles() });
    },
  });
}

// Resolve security alert
export function useResolveSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, data }: {
      alertId: string;
      data: {
        status: 'investigating' | 'resolved' | 'dismissed';
        resolution?: string;
        actions?: string[];
        assignedTo?: string;
      };
    }) => api.security.resolveAlert(alertId, data),
    onSuccess: () => {
      // Invalidate alerts
      queryClient.invalidateQueries({ queryKey: securityKeys.alerts() });
    },
  });
}

// Force password reset
export function useForcePasswordReset() {
  return useMutation({
    mutationFn: ({ userId, notify = true }: { userId: string; notify?: boolean }) =>
      api.security.forcePasswordReset(userId, { notify }),
  });
}

// Enable/disable 2FA for user
export function useToggle2FA() {
  return useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) =>
      api.security.toggle2FA(userId, { enabled }),
  });
}

// Bulk revoke sessions
export function useBulkRevokeSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      criteria: {
        userId?: string;
        ipAddress?: string;
        location?: string;
        olderThan?: string; // ISO date
      };
      reason: string;
    }) => api.sessions.bulkRevoke(data),
    onSuccess: () => {
      // Invalidate sessions
      queryClient.invalidateQueries({ queryKey: securityKeys.sessions() });
    },
  });
}

// Export audit logs
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (data: {
      format: 'csv' | 'xlsx' | 'json';
      startDate: string;
      endDate: string;
      filters?: any;
    }) => api.audit.export(data),
  });
}

// ===== UTILITY HOOKS =====

// Get security score/health
export function useSecurityScore(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...securityKeys.all, 'score'],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        overallScore: 85,
        maxScore: 100,
        grade: 'B+',
        components: {
          authentication: { score: 90, maxScore: 100, issues: 1 },
          authorization: { score: 88, maxScore: 100, issues: 0 },
          dataProtection: { score: 82, maxScore: 100, issues: 2 },
          monitoring: { score: 85, maxScore: 100, issues: 1 },
          compliance: { score: 78, maxScore: 100, issues: 3 }
        },
        recommendations: [
          'Enable mandatory 2FA for all admin users',
          'Update password policy to require special characters',
          'Review and update data retention policies',
          'Implement additional API rate limiting'
        ],
        lastAssessment: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextAssessment: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
    ...options,
  });
}

// Get recent security events
export function useRecentSecurityEvents(
  limit: number = 10,
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...securityKeys.all, 'recent-events', limit],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return Array.from({ length: limit }, (_, i) => ({
        id: `event-${i}`,
        type: ['login_success', 'login_failed', 'password_changed', 'role_updated', 'session_expired'][Math.floor(Math.random() * 5)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        description: `Security event ${i + 1} description`,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      }));
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}

// Get fraud patterns
export function useFraudPatterns(
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...securityKeys.all, 'fraud-patterns'],
    queryFn: async () => {
      // Replace with actual API call
      return [
        {
          id: 'FP-001',
          name: 'Card Testing',
          description: 'Multiple small transactions with different cards',
          riskScore: 8.5,
          detectionCount: 45,
          successRate: 92.3,
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
          active: true,
        },
        {
          id: 'FP-002',
          name: 'Account Takeover',
          description: 'Unusual login patterns and password changes',
          riskScore: 9.1,
          detectionCount: 23,
          successRate: 87.8,
          lastTriggered: new Date(Date.now() - 5 * 60 * 60 * 1000),
          active: true,
        },
        {
          id: 'FP-003',
          name: 'Fake Reviews',
          description: 'Coordinated review manipulation',
          riskScore: 6.8,
          detectionCount: 78,
          successRate: 94.1,
          lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000),
          active: true,
        },
        {
          id: 'FP-004',
          name: 'Price Manipulation',
          description: 'Artificial price inflation schemes',
          riskScore: 7.2,
          detectionCount: 34,
          successRate: 89.5,
          lastTriggered: new Date(Date.now() - 8 * 60 * 60 * 1000),
          active: true,
        },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get security metrics/trends
export function useSecurityMetrics(
  period: 'day' | 'week' | 'month' | 'year' = 'month',
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...securityKeys.all, 'metrics', period],
    queryFn: async () => {
      // Replace with actual API call
      return {
        trends: [
          { name: 'Jan', threats: 45, blocked: 42, false_positives: 3 },
          { name: 'Feb', threats: 52, blocked: 49, false_positives: 3 },
          { name: 'Mar', threats: 38, blocked: 36, false_positives: 2 },
          { name: 'Apr', threats: 67, blocked: 63, false_positives: 4 },
          { name: 'May', threats: 59, blocked: 55, false_positives: 4 },
          { name: 'Jun', threats: 71, blocked: 68, false_positives: 3 },
        ],
        threatTypes: [
          { type: 'Fraud', count: 45, percentage: 35 },
          { type: 'Suspicious Activity', count: 32, percentage: 25 },
          { type: 'Policy Violation', count: 28, percentage: 22 },
          { type: 'Security Breach', count: 15, percentage: 12 },
          { type: 'DDoS', count: 8, percentage: 6 },
        ],
        stats: {
          totalAlerts: 128,
          activeAlerts: 23,
          resolvedAlerts: 95,
          criticalAlerts: 10,
          avgResponseTime: 2.4,
          detectionRate: 94.8,
        }
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Get system security status
export function useSystemSecurityStatus(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...securityKeys.all, 'system-status'],
    queryFn: async () => {
      // Replace with actual API call
      return {
        overall: 'operational',
        components: [
          {
            name: 'Firewall',
            status: 'active',
            description: 'Active & Monitoring',
            icon: 'shield',
            color: 'green'
          },
          {
            name: 'Threat Detection',
            status: 'scanning',
            description: 'Scanning Traffic',
            icon: 'eye',
            color: 'blue'
          },
          {
            name: 'DDoS Protection',
            status: 'standby',
            description: 'Standby Mode',
            icon: 'zap',
            color: 'yellow'
          },
          {
            name: 'API Monitoring',
            status: 'healthy',
            description: 'Healthy',
            icon: 'activity',
            color: 'purple'
          }
        ]
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}