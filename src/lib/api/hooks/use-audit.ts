/**
 * Audit Logs React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit.service';
import type { GetAuditLogsParams } from '../types/audit.types';

// ===== AUDIT LOGS HOOKS =====

/**
 * Get all audit logs with filtering
 */
export function useAuditLogs(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getAuditLogs(params),
  });
}

/**
 * Get audit log by ID
 */
export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => auditService.getAuditLogById(id),
    enabled: !!id,
  });
}

/**
 * Get audit log statistics
 */
export function useAuditLogStatistics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['audit-log-statistics', startDate, endDate],
    queryFn: () => auditService.getAuditLogStatistics(startDate, endDate),
  });
}

/**
 * Get critical audit logs
 */
export function useCriticalAuditLogs(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['critical-audit-logs', page, limit],
    queryFn: () => auditService.getCriticalAuditLogs(page, limit),
  });
}

/**
 * Get failed audit logs
 */
export function useFailedAuditLogs(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['failed-audit-logs', page, limit],
    queryFn: () => auditService.getFailedAuditLogs(page, limit),
  });
}

/**
 * Get audit logs by staff member
 */
export function useAuditLogsByStaff(staffId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['audit-logs-by-staff', staffId, page, limit],
    queryFn: () => auditService.getAuditLogsByStaff(staffId, page, limit),
    enabled: !!staffId,
  });
}

/**
 * Get audit logs by resource
 */
export function useAuditLogsByResource(
  resource: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: ['audit-logs-by-resource', resource, page, limit],
    queryFn: () => auditService.getAuditLogsByResource(resource, page, limit),
    enabled: !!resource,
  });
}
