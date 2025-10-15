/**
 * Security Management Service
 *
 * All 9 security & audit endpoints from ADMIN_API_DOCUMENTATION.md
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  SecurityEvent,
  SecurityAlert,
  IPBlock,
  SecurityEventsListResponse,
  SecurityAlertsListResponse,
  BlockedIPsListResponse,
  BlockIPRequest,
  BlockIPResponse,
  UnblockIPResponse,
  ResolveSecurityEventRequest,
  UpdateSecurityAlertRequest,
  SecurityOverviewResponse,
  GetSecurityEventsParams,
  GetSecurityAlertsParams,
  GetBlockedIPsParams,
} from '../types';

// Additional types from documentation
export interface FraudDetectionData {
  suspicious: {
    orders: number;
    users: number;
    transactions: number;
  };
  flaggedOrders: Array<{
    orderId: string;
    reason: string;
    riskScore: number;
    timestamp: string;
  }>;
  flaggedUsers: Array<{
    userId: string;
    email: string;
    reason: string;
    riskScore: number;
    timestamp: string;
  }>;
}

export interface ThreatIntelligence {
  knownThreats: number;
  blockedIPs: number;
  blockedCountries: string[];
  recentThreats: Array<{
    type: string;
    source: string;
    attempts: number;
    lastAttempt: string;
    status: string;
  }>;
}

export interface LoginAnalytics {
  period: string;
  successful: number;
  failed: number;
  successRate: number;
  byHour: Array<{
    hour: number;
    count: number;
  }>;
  byCountry: Array<{
    country: string;
    count: number;
  }>;
  topIPs: Array<{
    ip: string;
    count: number;
    lastLogin: string;
  }>;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: {
    staffId: string;
    staffName: string;
    role: string;
  };
  target: {
    type: string;
    id: string;
    email?: string;
  };
  details: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
  meta: {
    period: string;
    total: number;
  };
}

export interface SecurityAlertsResponse {
  alerts: SecurityAlert[];
  summary: {
    total: number;
    active: number;
    investigating: number;
    resolved: number;
  };
}

class SecurityService {
  // 1. GET /admin/security/events - Get security events
  async getEvents(params?: GetSecurityEventsParams): Promise<any> {
    const response = await apiClient.get(
      '/admin/security/events',
      params
    );
    return response;
  }

  async getEventById(id: string): Promise<SecurityEvent> {
    const response = await apiClient.get<SecurityEvent>(
      API_ENDPOINTS.SECURITY.GET_EVENT_BY_ID(id)
    );
    return response.data!;
  }

  async resolveEvent(id: string, data: ResolveSecurityEventRequest): Promise<SecurityEvent> {
    const response = await apiClient.patch<SecurityEvent>(
      API_ENDPOINTS.SECURITY.RESOLVE_EVENT(id),
      data
    );
    return response.data!;
  }

  // 2. GET /admin/security/alerts - Get security alerts
  async getAlerts(params?: GetSecurityAlertsParams): Promise<SecurityAlertsResponse> {
    const response = await apiClient.get<SecurityAlertsResponse>(
      '/admin/security/alerts',
      params
    );
    return response;
  }

  async getAlertById(id: string): Promise<SecurityAlert> {
    const response = await apiClient.get<SecurityAlert>(
      API_ENDPOINTS.SECURITY.GET_ALERT_BY_ID(id)
    );
    return response.data!;
  }

  async updateAlert(id: string, data: UpdateSecurityAlertRequest): Promise<SecurityAlert> {
    const response = await apiClient.patch<SecurityAlert>(
      API_ENDPOINTS.SECURITY.UPDATE_ALERT(id),
      data
    );
    return response.data!;
  }

  // 3. GET /admin/security/audit-log - Get audit log
  async getAuditLog(params?: { days?: number }): Promise<AuditLogResponse> {
    const response = await apiClient.get<AuditLogResponse>(
      '/admin/security/audit-log',
      params
    );
    return response;
  }

  // 4. GET /admin/security/fraud-detection - Get fraud detection data
  async getFraudDetection(): Promise<FraudDetectionData> {
    const response = await apiClient.get<FraudDetectionData>(
      '/admin/security/fraud-detection'
    );
    return response;
  }

  // 5. GET /admin/security/threat-intelligence - Get threat intelligence
  async getThreatIntelligence(): Promise<ThreatIntelligence> {
    const response = await apiClient.get<ThreatIntelligence>(
      '/admin/security/threat-intelligence'
    );
    return response;
  }

  // 6. GET /admin/security/login-analytics - Get login analytics
  async getLoginAnalytics(params?: { days?: number }): Promise<LoginAnalytics> {
    const response = await apiClient.get<LoginAnalytics>(
      '/admin/security/login-analytics',
      params
    );
    return response;
  }

  // 7. GET /admin/security/blocked-ips - Get blocked IPs
  async getBlockedIPs(params?: GetBlockedIPsParams): Promise<any> {
    const response = await apiClient.get(
      '/admin/security/blocked-ips',
      params
    );
    return response;
  }

  // 8. POST /admin/security/block-ip - Block IP address
  async blockIP(data: BlockIPRequest): Promise<BlockIPResponse> {
    const response = await apiClient.post<BlockIPResponse>(
      '/admin/security/block-ip',
      data
    );
    return response;
  }

  // 9. DELETE /admin/security/unblock-ip/:ipAddress - Unblock IP address
  async unblockIP(ipAddress: string): Promise<any> {
    const response = await apiClient.delete(
      `/admin/security/unblock-ip/${ipAddress}`
    );
    return response;
  }

  async getOverview(): Promise<SecurityOverviewResponse> {
    const response = await apiClient.get<SecurityOverviewResponse>(
      API_ENDPOINTS.SECURITY.GET_OVERVIEW
    );
    return response.data!;
  }
}

export const securityService = new SecurityService();
export default securityService;
