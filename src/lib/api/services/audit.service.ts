/**
 * Audit Logs Service
 * All 7 endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import type {
  GetAuditLogsParams,
  GetAuditLogsResponse,
  GetAuditLogByIdResponse,
  AuditLogStatistics,
} from '../types/audit.types';

class AuditService {
  // 1. GET /admin/audit-logs - Get all audit logs with filtering
  async getAuditLogs(params?: GetAuditLogsParams): Promise<GetAuditLogsResponse> {
    const response = await apiClient.get<GetAuditLogsResponse>(
      '/admin/audit-logs',
      params
    );
    return response;
  }

  // 2. GET /admin/audit-logs/:id - Get audit log by ID
  async getAuditLogById(id: string): Promise<GetAuditLogByIdResponse> {
    const response = await apiClient.get<GetAuditLogByIdResponse>(
      `/admin/audit-logs/${id}`
    );
    return response;
  }

  // 3. GET /admin/audit-logs/statistics - Get audit log statistics
  async getAuditLogStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<AuditLogStatistics> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get<AuditLogStatistics>(
      '/admin/audit-logs/statistics',
      params
    );
    return response;
  }

  // 4. GET /admin/audit-logs/critical - Get critical audit logs
  async getCriticalAuditLogs(
    page: number = 1,
    limit: number = 20
  ): Promise<GetAuditLogsResponse> {
    const response = await apiClient.get<GetAuditLogsResponse>(
      '/admin/audit-logs/critical',
      { page, limit }
    );
    return response;
  }

  // 5. GET /admin/audit-logs/failed - Get failed audit logs
  async getFailedAuditLogs(
    page: number = 1,
    limit: number = 20
  ): Promise<GetAuditLogsResponse> {
    const response = await apiClient.get<GetAuditLogsResponse>(
      '/admin/audit-logs/failed',
      { page, limit }
    );
    return response;
  }

  // 6. GET /admin/audit-logs/staff/:staffId - Get audit logs by staff member
  async getAuditLogsByStaff(
    staffId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<GetAuditLogsResponse> {
    const response = await apiClient.get<GetAuditLogsResponse>(
      `/admin/audit-logs/staff/${staffId}`,
      { page, limit }
    );
    return response;
  }

  // 7. GET /admin/audit-logs/resource/:resource - Get audit logs by resource
  async getAuditLogsByResource(
    resource: string,
    page: number = 1,
    limit: number = 20
  ): Promise<GetAuditLogsResponse> {
    const response = await apiClient.get<GetAuditLogsResponse>(
      `/admin/audit-logs/resource/${resource}`,
      { page, limit }
    );
    return response;
  }
}

export const auditService = new AuditService();
export default auditService;
