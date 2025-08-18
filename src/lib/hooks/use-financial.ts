import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../api/client';

// Query keys
export const financialKeys = {
  all: ['financial'] as const,
  payments: () => [...financialKeys.all, 'payments'] as const,
  payment: (id: string) => [...financialKeys.all, 'payment', id] as const,
  commissions: () => [...financialKeys.all, 'commissions'] as const,
  commission: (id: string) => [...financialKeys.all, 'commission', id] as const,
  payouts: () => [...financialKeys.all, 'payouts'] as const,
  payout: (id: string) => [...financialKeys.all, 'payout', id] as const,
  refunds: () => [...financialKeys.all, 'refunds'] as const,
  refund: (id: string) => [...financialKeys.all, 'refund', id] as const,
  transactions: () => [...financialKeys.all, 'transactions'] as const,
  transaction: (id: string) => [...financialKeys.all, 'transaction', id] as const,
  analytics: (params?: any) => [...financialKeys.all, 'analytics', params] as const,
  stats: () => [...financialKeys.all, 'stats'] as const,
  reports: (type: string, params?: any) => [...financialKeys.all, 'reports', type, params] as const,
  reconciliation: (params?: any) => [...financialKeys.all, 'reconciliation', params] as const,
  disputes: () => [...financialKeys.all, 'disputes'] as const,
  bankAccounts: () => [...financialKeys.all, 'bank-accounts'] as const,
  taxSettings: () => [...financialKeys.all, 'tax-settings'] as const,
} as const;

// ===== QUERY HOOKS =====

// Get payments list
export function usePayments(
  filters?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    method?: 'paystack' | 'bank_transfer' | 'wallet' | 'crypto';
    type?: 'order' | 'subscription' | 'commission' | 'refund';
    vendorId?: string;
    customerId?: string;
    amountRange?: { min: number; max: number };
    dateRange?: { start: string; end: string };
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'amount' | 'createdAt' | 'status';
    sortOrder?: 'ASC' | 'DESC';
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.payments(),
    queryFn: () => api.payments.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Get single payment
export function usePayment(
  id: string,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.payment(id),
    queryFn: () => api.payments.get(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get commissions list
export function useCommissions(
  filters?: {
    vendorId?: string;
    orderId?: string;
    status?: 'pending' | 'approved' | 'paid' | 'disputed';
    dateRange?: { start: string; end: string };
    amountRange?: { min: number; max: number };
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.commissions(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        data: Array.from({ length: filters?.limit || 20 }, (_, i) => ({
          id: `commission-${i}`,
          orderId: `order-${Math.floor(Math.random() * 1000)}`,
          vendorId: `vendor-${Math.floor(Math.random() * 100)}`,
          vendorName: `Vendor ${Math.floor(Math.random() * 100) + 1}`,
          orderAmount: Math.floor(Math.random() * 50000) + 10000,
          commissionRate: Math.floor(Math.random() * 15) + 5,
          commissionAmount: Math.floor(Math.random() * 5000) + 500,
          status: ['pending', 'approved', 'paid', 'disputed'][Math.floor(Math.random() * 4)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          paidAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
        })),
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          total: 456,
          totalPages: 23
        },
        summary: {
          totalCommissions: 456,
          totalAmount: 2450000,
          pendingAmount: 890000,
          paidAmount: 1560000
        }
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options,
  });
}

// Get payouts list
export function usePayouts(
  filters?: {
    vendorId?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    method?: 'bank_transfer' | 'paystack' | 'wallet';
    dateRange?: { start: string; end: string };
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.payouts(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        data: Array.from({ length: filters?.limit || 20 }, (_, i) => ({
          id: `payout-${i}`,
          vendorId: `vendor-${Math.floor(Math.random() * 100)}`,
          vendorName: `Vendor ${Math.floor(Math.random() * 100) + 1}`,
          amount: Math.floor(Math.random() * 100000) + 10000,
          method: ['bank_transfer', 'paystack', 'wallet'][Math.floor(Math.random() * 3)],
          status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
          bankAccount: `****${Math.floor(Math.random() * 10000)}`,
          reference: `PO${Date.now()}${Math.floor(Math.random() * 1000)}`,
          requestedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          processedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : null,
          fees: Math.floor(Math.random() * 1000) + 100,
          netAmount: Math.floor(Math.random() * 95000) + 9500
        })),
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          total: 234,
          totalPages: 12
        }
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// Get financial analytics
export function useFinancialAnalytics(
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    vendorId?: string;
    includeProjections?: boolean;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.analytics(params),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        summary: {
          totalRevenue: 12450000,
          totalCommissions: 1245000,
          totalPayouts: 890000,
          totalRefunds: 125000,
          netProfit: 11205000,
          transactionCount: 8945,
          averageTransactionValue: 1392,
          paymentSuccessRate: 97.8,
          refundRate: 1.4
        },
        trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 500000) + 200000,
          commissions: Math.floor(Math.random() * 50000) + 20000,
          payouts: Math.floor(Math.random() * 40000) + 15000,
          refunds: Math.floor(Math.random() * 10000) + 2000,
          transactionCount: Math.floor(Math.random() * 300) + 100
        })),
        byMethod: {
          paystack: { revenue: 8945000, transactions: 5234, percentage: 71.8 },
          bank_transfer: { revenue: 2145000, transactions: 1890, percentage: 17.2 },
          wallet: { revenue: 987000, transactions: 1234, percentage: 7.9 },
          crypto: { revenue: 373000, transactions: 587, percentage: 3.0 }
        },
        byCategory: {
          orders: { revenue: 10450000, commissions: 1045000 },
          subscriptions: { revenue: 1200000, commissions: 120000 },
          fees: { revenue: 800000, commissions: 80000 }
        },
        topVendors: Array.from({ length: 10 }, (_, i) => ({
          vendorId: `vendor-${i}`,
          vendorName: `Top Vendor ${i + 1}`,
          revenue: Math.floor(Math.random() * 500000) + 100000,
          commissions: Math.floor(Math.random() * 50000) + 10000,
          transactionCount: Math.floor(Math.random() * 500) + 100,
          rank: i + 1
        }))
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
}

// Get financial statistics
export function useFinancialStats(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.stats(),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        overview: {
          totalRevenue: 12450000,
          monthlyRevenue: 1850000,
          dailyRevenue: 65000,
          totalTransactions: 45689,
          successfulTransactions: 44234,
          failedTransactions: 1455,
          totalCommissions: 1245000,
          pendingPayouts: 234500,
          totalRefunds: 89500
        },
        growth: {
          revenueGrowth: 24.5,
          transactionGrowth: 18.2,
          commissionGrowth: 22.1,
          payoutGrowth: 15.8
        },
        health: {
          paymentSuccessRate: 96.8,
          averageProcessingTime: 2.4, // minutes
          refundRate: 1.96,
          disputeRate: 0.34,
          chargebackRate: 0.12
        }
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get transactions list
export function useTransactions(
  filters?: {
    type?: 'payment' | 'refund' | 'payout' | 'commission' | 'fee';
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    method?: string;
    dateRange?: { start: string; end: string };
    search?: string;
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.transactions(),
    queryFn: () => api.transactions.list(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// Get reconciliation data
export function useReconciliation(
  params?: {
    date?: string;
    provider?: 'paystack' | 'bank' | 'all';
    status?: 'matched' | 'unmatched' | 'disputed';
  },
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: financialKeys.reconciliation(params),
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return {
        summary: {
          totalTransactions: 1245,
          matchedTransactions: 1198,
          unmatchedTransactions: 35,
          disputedTransactions: 12,
          totalAmount: 4567890,
          matchedAmount: 4456780,
          unmatchedAmount: 89890,
          disputedAmount: 21220
        },
        unmatched: Array.from({ length: 35 }, (_, i) => ({
          id: `unmatched-${i}`,
          reference: `REF${Date.now()}${i}`,
          amount: Math.floor(Math.random() * 10000) + 1000,
          provider: ['paystack', 'bank'][Math.floor(Math.random() * 2)],
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          reason: ['No matching order', 'Amount mismatch', 'Duplicate transaction', 'Invalid reference'][Math.floor(Math.random() * 4)]
        })),
        disputes: Array.from({ length: 12 }, (_, i) => ({
          id: `dispute-${i}`,
          transactionId: `txn-${i}`,
          amount: Math.floor(Math.random() * 50000) + 5000,
          reason: 'Chargeback',
          status: ['open', 'under_review', 'resolved'][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }))
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ===== MUTATION HOOKS =====

// Process payout
export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, data }: { 
      payoutId: string;
      data: {
        method?: 'bank_transfer' | 'paystack' | 'wallet';
        bankAccount?: string;
        notes?: string;
        scheduledFor?: string;
      };
    }) => api.payouts.process(payoutId, data),
    onSuccess: () => {
      // Invalidate payouts
      queryClient.invalidateQueries({ queryKey: financialKeys.payouts() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: financialKeys.stats() });
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: financialKeys.analytics() });
    },
  });
}

// Approve commission
export function useApproveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commissionId, notes }: { commissionId: string; notes?: string }) =>
      api.commissions.approve(commissionId, { notes }),
    onSuccess: () => {
      // Invalidate commissions
      queryClient.invalidateQueries({ queryKey: financialKeys.commissions() });
      
      // Invalidate payouts (might affect pending payouts)
      queryClient.invalidateQueries({ queryKey: financialKeys.payouts() });
    },
  });
}

// Bulk approve commissions
export function useBulkApproveCommissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      commissionIds: string[];
      notes?: string;
    }) => api.commissions.bulkApprove(data),
    onSuccess: () => {
      // Invalidate all commission-related queries
      queryClient.invalidateQueries({ queryKey: financialKeys.commissions() });
      queryClient.invalidateQueries({ queryKey: financialKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: financialKeys.stats() });
    },
  });
}

// Process refund
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, data }: {
      paymentId: string;
      data: {
        amount: number;
        reason: string;
        notifyCustomer?: boolean;
        notes?: string;
      };
    }) => api.payments.refund(paymentId, data),
    onSuccess: () => {
      // Invalidate payments
      queryClient.invalidateQueries({ queryKey: financialKeys.payments() });
      
      // Invalidate refunds
      queryClient.invalidateQueries({ queryKey: financialKeys.refunds() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: financialKeys.stats() });
    },
  });
}

// Update commission rates
export function useUpdateCommissionRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      vendorId?: string;
      categoryId?: string;
      rate: number;
      effectiveDate?: string;
      reason?: string;
    }) => api.commissions.updateRates(data),
    onSuccess: () => {
      // Invalidate commissions
      queryClient.invalidateQueries({ queryKey: financialKeys.commissions() });
    },
  });
}

// Resolve payment dispute
export function useResolvePaymentDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }: {
      disputeId: string;
      data: {
        resolution: 'accept' | 'decline' | 'partial';
        amount?: number;
        reason: string;
        evidence?: string[];
      };
    }) => api.disputes.resolve(disputeId, data),
    onSuccess: () => {
      // Invalidate disputes
      queryClient.invalidateQueries({ queryKey: financialKeys.disputes() });
      
      // Invalidate reconciliation
      queryClient.invalidateQueries({ queryKey: financialKeys.reconciliation() });
    },
  });
}

// Generate financial report
export function useGenerateFinancialReport() {
  return useMutation({
    mutationFn: (data: {
      type: 'revenue' | 'commissions' | 'payouts' | 'refunds' | 'reconciliation';
      format: 'pdf' | 'excel' | 'csv';
      startDate: string;
      endDate: string;
      filters?: any;
    }) => api.reports.generate(data),
  });
}

// Bulk process payouts
export function useBulkProcessPayouts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      payoutIds: string[];
      method: 'bank_transfer' | 'paystack' | 'wallet';
      scheduledFor?: string;
    }) => api.payouts.bulkProcess(data),
    onSuccess: () => {
      // Invalidate payouts
      queryClient.invalidateQueries({ queryKey: financialKeys.payouts() });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: financialKeys.stats() });
    },
  });
}

// Manual reconciliation
export function useManualReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      transactionId: string;
      providerReference: string;
      amount: number;
      notes?: string;
    }) => api.reconciliation.manual(data),
    onSuccess: () => {
      // Invalidate reconciliation
      queryClient.invalidateQueries({ queryKey: financialKeys.reconciliation() });
    },
  });
}

// Export financial data
export function useExportFinancialData() {
  return useMutation({
    mutationFn: (data: {
      type: 'payments' | 'commissions' | 'payouts' | 'transactions';
      format: 'csv' | 'xlsx' | 'pdf';
      filters?: any;
      startDate?: string;
      endDate?: string;
    }) => {
      // Implementation would call appropriate export endpoint
      return Promise.resolve({ 
        success: true,
        downloadUrl: `https://api.digimall.ng/exports/${data.type}-${Date.now()}.${data.format}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    },
  });
}

// ===== UTILITY HOOKS =====

// Get pending approvals count
export function usePendingApprovalsCount(
  options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...financialKeys.all, 'pending-approvals-count'],
    queryFn: async () => {
      // Mock implementation - replace with actual API call
      return Math.floor(Math.random() * 50) + 10;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}

// Get recent transactions
export function useRecentTransactions(
  limit: number = 10,
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...financialKeys.all, 'recent-transactions', limit],
    queryFn: () => api.transactions.list({ 
      limit, 
      sortBy: 'createdAt', 
      sortOrder: 'DESC' 
    }),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    ...options,
  });
}