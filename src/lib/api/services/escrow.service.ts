/**
 * Escrow Service
 *
 * Service for managing escrow accounts, releases, refunds, and disputes.
 * Based on ADMIN_API_DOCUMENTATION.md - Escrow Management section
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  EscrowAccount,
  EscrowListResponse,
  EscrowStatisticsResponse,
  EscrowActionResponse,
  AuditLogResponse,
  ExpiringEscrowsResponse,
  GetAllEscrowsParams,
  GetEscrowStatisticsParams,
  GetAuditLogParams,
  ReleaseEscrowRequest,
  RefundEscrowRequest,
  ResolveDisputeRequest,
} from '../types/escrow.types';

/**
 * Escrow Service Class
 */
class EscrowService {
  /**
   * Get all escrow accounts with filtering and pagination
   */
  async getAll(params?: GetAllEscrowsParams): Promise<EscrowListResponse> {
    return apiClient.get<EscrowListResponse>(
      API_ENDPOINTS.ESCROW.GET_ALL,
      params as any
    );
  }

  /**
   * Get escrow statistics
   */
  async getStatistics(params?: GetEscrowStatisticsParams): Promise<EscrowStatisticsResponse> {
    return apiClient.get<EscrowStatisticsResponse>(
      API_ENDPOINTS.ESCROW.GET_STATISTICS,
      params as any
    );
  }

  /**
   * Get escrow account details by ID
   */
  async getById(id: string): Promise<EscrowAccount> {
    return apiClient.get<EscrowAccount>(
      API_ENDPOINTS.ESCROW.GET_BY_ID(id)
    );
  }

  /**
   * Get escrow account by order ID
   */
  async getByOrderId(orderId: string): Promise<EscrowAccount> {
    return apiClient.get<EscrowAccount>(
      API_ENDPOINTS.ESCROW.GET_BY_ORDER_ID(orderId)
    );
  }

  /**
   * Manually release escrow funds to vendor
   * @role SUPER_ADMIN only
   */
  async release(id: string, data: ReleaseEscrowRequest): Promise<EscrowActionResponse> {
    return apiClient.post<EscrowActionResponse>(
      API_ENDPOINTS.ESCROW.RELEASE(id),
      data
    );
  }

  /**
   * Manually refund escrow funds to customer
   * @role SUPER_ADMIN only
   */
  async refund(id: string, data: RefundEscrowRequest): Promise<EscrowActionResponse> {
    return apiClient.post<EscrowActionResponse>(
      API_ENDPOINTS.ESCROW.REFUND(id),
      data
    );
  }

  /**
   * Get list of disputed escrow accounts
   */
  async getDisputed(params?: { page?: number; limit?: number }): Promise<EscrowListResponse> {
    return apiClient.get<EscrowListResponse>(
      API_ENDPOINTS.ESCROW.GET_DISPUTED,
      params as any
    );
  }

  /**
   * Resolve a disputed escrow account
   * @role SUPER_ADMIN only
   */
  async resolveDispute(id: string, data: ResolveDisputeRequest): Promise<EscrowActionResponse> {
    return apiClient.post<EscrowActionResponse>(
      API_ENDPOINTS.ESCROW.RESOLVE_DISPUTE(id),
      data
    );
  }

  /**
   * Get escrows expiring soon
   */
  async getExpiringSoon(params?: {
    hours?: number;
    page?: number;
    limit?: number;
  }): Promise<ExpiringEscrowsResponse> {
    return apiClient.get<ExpiringEscrowsResponse>(
      API_ENDPOINTS.ESCROW.GET_EXPIRING_SOON,
      params as any
    );
  }

  /**
   * Get escrow audit log
   * @role SUPER_ADMIN only
   */
  async getAuditLog(params?: GetAuditLogParams): Promise<AuditLogResponse> {
    return apiClient.get<AuditLogResponse>(
      API_ENDPOINTS.ESCROW.GET_AUDIT_LOG,
      params as any
    );
  }
}

// Export singleton instance
export const escrowService = new EscrowService();

// Export class for testing
export { EscrowService };
