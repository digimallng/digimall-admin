import { apiClient } from '../client';
import {
  Escrow,
  EscrowFilters,
  EscrowActionRequest,
  CreateDisputeRequest,
  BulkEscrowActionRequest,
  EscrowStatistics,
  EscrowDashboard,
  EscrowAnalytics,
  EscrowComplianceReport,
  EscrowDispute,
  PaginatedResponse,
} from '../types';

export class EscrowService {
  // ===== CORE ESCROW OPERATIONS =====

  async getEscrows(filters?: EscrowFilters): Promise<PaginatedResponse<Escrow>> {
    const response = await apiClient.get<any>('/escrows', filters);
    
    // Transform API response to match frontend expectations
    if (response.escrows) {
      return {
        data: response.escrows,
        total: response.total || 0,
        page: response.page || 1,
        pages: response.totalPages || 1,
        limit: response.limit || 20,
        // Additional fields for component compatibility
        currentPage: response.page || 1,
        totalPages: response.totalPages || 1,
      };
    }
    
    // Return original response if already in correct format
    return response;
  }

  async getEscrowById(escrowId: string): Promise<Escrow> {
    return apiClient.get<Escrow>(`/escrows/${escrowId}`);
  }

  async performEscrowAction(escrowId: string, data: EscrowActionRequest): Promise<Escrow> {
    return apiClient.post<Escrow>(`/escrows/${escrowId}/action`, data);
  }

  // Dispute endpoints temporarily disabled - not available in backend
  // async createDispute(data: CreateDisputeRequest): Promise<EscrowDispute> {
  //   return apiClient.post<EscrowDispute>('/escrows/disputes', data);
  // }

  async performBulkAction(data: BulkEscrowActionRequest): Promise<{ 
    successful: string[]; 
    failed: Array<{ escrowId: string; error: string }> 
  }> {
    return apiClient.post('/escrows/bulk-action', data);
  }

  // ===== STATISTICS & DASHBOARD =====

  async getEscrowStatistics(): Promise<EscrowStatistics> {
    return apiClient.get<EscrowStatistics>('/escrows/statistics');
  }

  async getEscrowDashboard(): Promise<EscrowDashboard> {
    return apiClient.get<EscrowDashboard>('/escrows/dashboard');
  }

  // ===== ANALYTICS =====

  async getPerformanceAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<EscrowAnalytics['performance']> {
    return apiClient.get('/escrows/analytics/performance', params);
  }

  async getDisputeAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<EscrowAnalytics['disputes']> {
    return apiClient.get('/escrows/analytics/disputes', params);
  }

  async getTimeoutAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<EscrowAnalytics['timeouts']> {
    return apiClient.get('/escrows/analytics/timeouts', params);
  }

  // ===== REPORTS =====

  async generateComplianceReport(params?: {
    startDate?: string;
    endDate?: string;
    includeDetails?: boolean;
  }): Promise<EscrowComplianceReport> {
    return apiClient.get<EscrowComplianceReport>('/escrows/reports/compliance', params);
  }

  // ===== DISPUTE MANAGEMENT =====
  // Note: Dispute endpoints temporarily disabled - not available in backend

  // async getDisputes(filters?: {
  //   status?: string[];
  //   escrowId?: string;
  //   assignedTo?: string;
  //   reason?: string[];
  //   page?: number;
  //   limit?: number;
  // }): Promise<PaginatedResponse<EscrowDispute>> {
  //   return apiClient.get<PaginatedResponse<EscrowDispute>>('/escrows/disputes', filters);
  // }

  // async getDisputeById(disputeId: string): Promise<EscrowDispute> {
  //   return apiClient.get<EscrowDispute>(`/escrows/disputes/${disputeId}`);
  // }

  // async updateDispute(disputeId: string, data: {
  //   status?: string;
  //   assignedTo?: string;
  //   adminNotes?: string;
  //   resolution?: string;
  //   resolutionNotes?: string;
  // }): Promise<EscrowDispute> {
  //   return apiClient.patch<EscrowDispute>(`/escrows/disputes/${disputeId}`, data);
  // }

  // async resolveDispute(disputeId: string, data: {
  //   resolution: string;
  //   resolutionNotes: string;
  //   escrowAction?: EscrowActionRequest;
  // }): Promise<EscrowDispute> {
  //   return apiClient.post<EscrowDispute>(`/escrows/disputes/${disputeId}/resolve`, data);
  // }

  // ===== QUICK ACTIONS =====

  async releaseEscrow(escrowId: string, reason?: string): Promise<Escrow> {
    return this.performEscrowAction(escrowId, {
      action: 'release',
      reason: reason || 'Manual release by admin',
    });
  }

  async refundEscrow(escrowId: string, reason?: string, amount?: number): Promise<Escrow> {
    return this.performEscrowAction(escrowId, {
      action: amount ? 'partial_release' : 'refund',
      amount,
      reason: reason || 'Manual refund by admin',
    });
  }

  async extendEscrow(escrowId: string, days: number, reason?: string): Promise<Escrow> {
    return this.performEscrowAction(escrowId, {
      action: 'extend',
      expiryExtension: days,
      reason: reason || `Extended by ${days} days`,
    });
  }

  async cancelEscrow(escrowId: string, reason?: string): Promise<Escrow> {
    return this.performEscrowAction(escrowId, {
      action: 'cancel',
      reason: reason || 'Cancelled by admin',
    });
  }

  async forceReleaseEscrow(escrowId: string, reason: string): Promise<Escrow> {
    return this.performEscrowAction(escrowId, {
      action: 'force_release',
      reason,
    });
  }

  // ===== SEARCH & FILTERING HELPERS =====

  async searchEscrows(query: string, filters?: EscrowFilters): Promise<PaginatedResponse<Escrow>> {
    return this.getEscrows({
      ...filters,
      search: query,
    });
  }

  async getEscrowsByStatus(status: string, filters?: EscrowFilters): Promise<PaginatedResponse<Escrow>> {
    return this.getEscrows({
      ...filters,
      status: status as EscrowStatus,
    });
  }

  async getEscrowsByCustomer(customerId: string, filters?: EscrowFilters): Promise<PaginatedResponse<Escrow>> {
    return this.getEscrows({
      ...filters,
      customerId,
    });
  }

  async getEscrowsByVendor(vendorId: string, filters?: EscrowFilters): Promise<PaginatedResponse<Escrow>> {
    return this.getEscrows({
      ...filters,
      vendorId,
    });
  }

  async getExpiringSoon(hours: number = 24): Promise<Escrow[]> {
    try {
      const result = await this.getEscrows({
        expiringWithinHours: hours,
        limit: 100,
      });
      return result.data || [];
    } catch (error) {
      console.error('Error fetching expiring escrows:', error);
      return [];
    }
  }

  // ===== VALIDATION HELPERS =====

  validateEscrowAction(escrow: Escrow, action: string): { valid: boolean; reason?: string } {
    switch (action) {
      case 'release':
        if (!['funded', 'pending'].includes(escrow.status)) {
          return { valid: false, reason: 'Escrow must be funded or pending to release' };
        }
        break;
      case 'refund':
        if (!['funded', 'pending', 'disputed'].includes(escrow.status)) {
          return { valid: false, reason: 'Escrow must be funded, pending, or disputed to refund' };
        }
        break;
      case 'extend':
        if (!['funded', 'pending'].includes(escrow.status)) {
          return { valid: false, reason: 'Escrow must be funded or pending to extend' };
        }
        if (escrow.expiresAt && new Date(escrow.expiresAt) < new Date()) {
          return { valid: false, reason: 'Cannot extend expired escrow' };
        }
        break;
      case 'cancel':
        if (!['created', 'funded', 'pending'].includes(escrow.status)) {
          return { valid: false, reason: 'Escrow cannot be cancelled in current status' };
        }
        break;
      case 'dispute':
        if (!['funded', 'pending'].includes(escrow.status)) {
          return { valid: false, reason: 'Escrow must be funded or pending to dispute' };
        }
        if (escrow.dispute) {
          return { valid: false, reason: 'Escrow already has an active dispute' };
        }
        break;
    }
    return { valid: true };
  }

  // ===== ANALYTICS METHODS =====

  async getAnalytics(options?: {
    timeRange?: string;
    includeCharts?: boolean;
    includeComparisons?: boolean;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (options?.timeRange) params.append('timeRange', options.timeRange);
    if (options?.includeCharts) params.append('includeCharts', 'true');
    if (options?.includeComparisons) params.append('includeComparisons', 'true');

    return apiClient.get<any>(`/escrows/analytics${params.toString() ? `?${params.toString()}` : ''}`);
  }

  // ===== UTILITY METHODS =====

  formatEscrowAmount(amount: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  calculateEscrowAge(createdAt: string): { days: number; hours: number; minutes: number } {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }

  calculateTimeToExpiry(expiresAt: string): { expired: boolean; days: number; hours: number; minutes: number } {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { expired: false, days, hours, minutes };
  }
}

export const escrowService = new EscrowService();