import { apiClient } from '../client';
import type { QueryParams, PaginatedResponse, BulkOperationResponse } from '../client';

// ===== TYPES =====

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  method: 'paystack' | 'bank_transfer' | 'wallet' | 'crypto';
  type: 'order' | 'subscription' | 'commission' | 'refund';
  reference: string;
  providerReference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface Commission {
  id: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
}

export interface Payout {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  method: 'bank_transfer' | 'paystack' | 'wallet';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount?: string;
  reference: string;
  requestedAt: string;
  processedAt?: string;
  fees: number;
  netAmount: number;
  failureReason?: string;
}

export interface FinancialAnalytics {
  summary: {
    totalRevenue: number;
    totalCommissions: number;
    totalPayouts: number;
    totalRefunds: number;
    netProfit: number;
    transactionCount: number;
    averageTransactionValue: number;
    paymentSuccessRate: number;
    refundRate: number;
  };
  trends: Array<{
    date: string;
    revenue: number;
    commissions: number;
    payouts: number;
    refunds: number;
    transactionCount: number;
  }>;
  byMethod: Record<string, {
    revenue: number;
    transactions: number;
    percentage: number;
  }>;
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    revenue: number;
    commissions: number;
    transactionCount: number;
    rank: number;
  }>;
}

export interface Refund {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  processedBy?: string;
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export interface ReconciliationData {
  summary: {
    totalTransactions: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
    disputedTransactions: number;
    totalAmount: number;
    matchedAmount: number;
    unmatchedAmount: number;
    disputedAmount: number;
  };
  unmatched: Array<{
    id: string;
    reference: string;
    amount: number;
    provider: string;
    date: string;
    reason: string;
  }>;
  disputes: Array<{
    id: string;
    transactionId: string;
    amount: number;
    reason: string;
    status: string;
    createdAt: string;
  }>;
}

// ===== SERVICE CLASS =====

export class FinancialService {
  // Payments
  async getPayments(params?: QueryParams): Promise<PaginatedResponse<PaymentTransaction>> {
    return apiClient.get('/financial-management/payments', params);
  }

  async getPayment(id: string): Promise<PaymentTransaction> {
    return apiClient.get(`/financial-management/payments/${id}`);
  }

  async processRefund(paymentId: string, data: {
    amount: number;
    reason: string;
    notifyCustomer?: boolean;
    notes?: string;
  }): Promise<Refund> {
    return apiClient.post(`/financial-management/payments/${paymentId}/refund`, data);
  }

  // Commissions
  async getCommissions(params?: QueryParams): Promise<PaginatedResponse<Commission>> {
    return apiClient.get('/financial-management/commissions', params);
  }

  async getCommission(id: string): Promise<Commission> {
    return apiClient.get(`/financial-management/commissions/${id}`);
  }

  async approveCommission(id: string, data: { notes?: string }): Promise<Commission> {
    return apiClient.post(`/financial-management/commissions/${id}/approve`, data);
  }

  async bulkApproveCommissions(data: {
    commissionIds: string[];
    notes?: string;
  }): Promise<BulkOperationResponse> {
    return apiClient.post('/financial-management/commissions/bulk-approve', data);
  }

  async updateCommissionRates(data: {
    vendorId?: string;
    categoryId?: string;
    rate: number;
    effectiveDate?: string;
    reason?: string;
  }): Promise<{ success: boolean }> {
    return apiClient.post('/financial-management/commissions/update-rates', data);
  }

  // Payouts
  async getPayouts(params?: QueryParams): Promise<PaginatedResponse<Payout>> {
    return apiClient.get('/financial-management/payouts', params);
  }

  async getPayout(id: string): Promise<Payout> {
    return apiClient.get(`/financial-management/payouts/${id}`);
  }

  async processPayout(id: string, data: {
    method?: 'bank_transfer' | 'paystack' | 'wallet';
    bankAccount?: string;
    notes?: string;
    scheduledFor?: string;
  }): Promise<Payout> {
    return apiClient.post(`/financial-management/payouts/${id}/process`, data);
  }

  async bulkProcessPayouts(data: {
    payoutIds: string[];
    method: 'bank_transfer' | 'paystack' | 'wallet';
    scheduledFor?: string;
  }): Promise<BulkOperationResponse> {
    return apiClient.post('/financial-management/payouts/bulk-process', data);
  }

  // Analytics
  async getFinancialAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    vendorId?: string;
    includeProjections?: boolean;
  }): Promise<FinancialAnalytics> {
    return apiClient.get('/financial-management/analytics', params);
  }

  async getFinancialStats(): Promise<{
    overview: {
      totalRevenue: number;
      monthlyRevenue: number;
      dailyRevenue: number;
      totalTransactions: number;
      successfulTransactions: number;
      failedTransactions: number;
      totalCommissions: number;
      pendingPayouts: number;
      totalRefunds: number;
    };
    growth: {
      revenueGrowth: number;
      transactionGrowth: number;
      commissionGrowth: number;
      payoutGrowth: number;
    };
    health: {
      paymentSuccessRate: number;
      averageProcessingTime: number;
      refundRate: number;
      disputeRate: number;
      chargebackRate: number;
    };
  }> {
    return apiClient.get('/financial-management/statistics');
  }

  // Transactions
  async getTransactions(params?: QueryParams): Promise<PaginatedResponse<PaymentTransaction>> {
    return apiClient.get('/financial-management/transactions', params);
  }

  async getTransaction(id: string): Promise<PaymentTransaction> {
    return apiClient.get(`/financial-management/transactions/${id}`);
  }

  // Reconciliation
  async getReconciliation(params?: {
    date?: string;
    provider?: 'paystack' | 'bank' | 'all';
    status?: 'matched' | 'unmatched' | 'disputed';
  }): Promise<ReconciliationData> {
    return apiClient.get('/financial-management/reconciliation', params);
  }

  async performManualReconciliation(data: {
    transactionId: string;
    providerReference: string;
    amount: number;
    notes?: string;
  }): Promise<{ success: boolean }> {
    return apiClient.post('/financial-management/reconciliation/manual', data);
  }

  // Disputes
  async getDisputes(params?: QueryParams): Promise<PaginatedResponse<any>> {
    return apiClient.get('/financial-management/disputes', params);
  }

  async resolveDispute(disputeId: string, data: {
    resolution: 'accept' | 'decline' | 'partial';
    amount?: number;
    reason: string;
    evidence?: string[];
  }): Promise<{ success: boolean }> {
    return apiClient.post(`/financial-management/disputes/${disputeId}/resolve`, data);
  }

  // Reports
  async generateReport(data: {
    type: 'revenue' | 'commissions' | 'payouts' | 'refunds' | 'reconciliation';
    format: 'pdf' | 'excel' | 'csv';
    startDate: string;
    endDate: string;
    filters?: any;
  }): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.post('/financial-management/reports/generate', data);
  }

  // Export
  async exportData(data: {
    type: 'payments' | 'commissions' | 'payouts' | 'transactions';
    format: 'csv' | 'xlsx' | 'pdf';
    filters?: any;
    startDate?: string;
    endDate?: string;
  }): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.post('/financial-management/export', data);
  }

  // Bank accounts
  async getBankAccounts(): Promise<Array<{
    id: string;
    vendorId: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isVerified: boolean;
    isDefault: boolean;
  }>> {
    return apiClient.get('/financial-management/bank-accounts');
  }

  // Tax settings
  async getTaxSettings(): Promise<{
    vatRate: number;
    taxExemptCategories: string[];
    taxReportingEnabled: boolean;
    autoCalculateTax: boolean;
  }> {
    return apiClient.get('/financial-management/tax-settings');
  }

  async updateTaxSettings(data: {
    vatRate?: number;
    taxExemptCategories?: string[];
    taxReportingEnabled?: boolean;
    autoCalculateTax?: boolean;
  }): Promise<{ success: boolean }> {
    return apiClient.put('/financial-management/tax-settings', data);
  }
}

// ===== SINGLETON INSTANCE =====
export const financialService = new FinancialService();