import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Mock financial service for now
const financialService = {
  async getOverview() {
    return {
      totalRevenue: 1500000,
      totalCommission: 75000,
      pendingPayouts: 25000,
      completedPayouts: 50000,
      revenueGrowth: 12.5,
      commissionRate: 5.0,
    };
  },

  async getTransactions(filters?: any) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
  },

  async getCommissions(filters?: any) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
  },

  async getPayouts(filters?: any) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
  },

  async processPayouts(payoutIds: string[]) {
    // Mock implementation
    return { success: true, processed: payoutIds.length };
  },

  async adjustCommission(vendorId: string, adjustment: number) {
    // Mock implementation
    return { success: true, newAmount: adjustment };
  },

  async generateReport(type: string, params: any) {
    // Mock implementation
    return { reportId: 'report-123', status: 'generated' };
  },
};

// Query keys
export const financialKeys = {
  all: ['financial'] as const,
  overview: () => [...financialKeys.all, 'overview'] as const,
  transactions: (filters?: any) => [...financialKeys.all, 'transactions', filters] as const,
  commissions: (filters?: any) => [...financialKeys.all, 'commissions', filters] as const,
  payouts: (filters?: any) => [...financialKeys.all, 'payouts', filters] as const,
};

// Hooks
export function useFinancialOverview() {
  return useQuery({
    queryKey: financialKeys.overview(),
    queryFn: () => financialService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFinancialTransactions(filters?: any) {
  return useQuery({
    queryKey: financialKeys.transactions(filters),
    queryFn: () => financialService.getTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFinancialCommissions(filters?: any) {
  return useQuery({
    queryKey: financialKeys.commissions(filters),
    queryFn: () => financialService.getCommissions(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useFinancialPayouts(filters?: any) {
  return useQuery({
    queryKey: financialKeys.payouts(filters),
    queryFn: () => financialService.getPayouts(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProcessPayouts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutIds: string[]) => financialService.processPayouts(payoutIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financialKeys.payouts() });
      queryClient.invalidateQueries({ queryKey: financialKeys.overview() });
      toast.success(`Successfully processed ${data.processed} payouts`);
    },
    onError: (error: any) => {
      toast.error(`Failed to process payouts: ${error.message}`);
    },
  });
}

export function useAdjustCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, adjustment }: { vendorId: string; adjustment: number }) =>
      financialService.adjustCommission(vendorId, adjustment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialKeys.commissions() });
      queryClient.invalidateQueries({ queryKey: financialKeys.overview() });
      toast.success('Commission adjusted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to adjust commission: ${error.message}`);
    },
  });
}

export function useGenerateFinancialReport() {
  return useMutation({
    mutationFn: ({ type, params }: { type: string; params: any }) =>
      financialService.generateReport(type, params),
    onSuccess: () => {
      toast.success('Report generated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });
}

// Aliases for backward compatibility
export const useFinancialStats = useFinancialOverview;
export const useFinancialAnalytics = useFinancialTransactions;
export const usePayments = useFinancialTransactions;