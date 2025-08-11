import { apiClient } from '../client';

export interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'held' | 'disputed' | 'released' | 'refunded' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  releaseDate?: string;
  disputeReason?: string;
  commission?: number;
  netAmount?: number;
}

export interface EscrowStats {
  totalHeld: number;
  totalReleased: number;
  totalRefunded: number;
  activeDisputes: number;
  pendingReleases: number;
  totalTransactions: number;
}

export class EscrowService {
  // Get escrow transactions with filters
  async getTransactions(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ transactions: EscrowTransaction[]; total: number }> {
    return apiClient.get('/escrow-management/transactions', params);
  }

  // Get escrow statistics
  async getStats(): Promise<EscrowStats> {
    return apiClient.get('/escrow-management/stats');
  }

  // Get single transaction
  async getTransaction(id: string): Promise<EscrowTransaction> {
    return apiClient.get(`/escrow-management/transactions/${id}`);
  }

  // Release funds
  async releaseFunds(transactionId: string, notes?: string): Promise<EscrowTransaction> {
    return apiClient.post(`/escrow-management/transactions/${transactionId}/release`, { notes });
  }

  // Refund funds
  async refundFunds(transactionId: string, reason: string): Promise<EscrowTransaction> {
    return apiClient.post(`/escrow-management/transactions/${transactionId}/refund`, { reason });
  }

  // Resolve dispute
  async resolveDispute(transactionId: string, resolution: {
    decision: 'release' | 'refund' | 'split';
    notes: string;
    splitPercentage?: number;
  }): Promise<EscrowTransaction> {
    return apiClient.post(`/escrow-management/transactions/${transactionId}/resolve-dispute`, resolution);
  }

  // Export transactions
  async exportTransactions(params: {
    format: 'csv' | 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<Blob> {
    return apiClient.get('/escrow-management/export', params);
  }
}

export const escrowService = new EscrowService();