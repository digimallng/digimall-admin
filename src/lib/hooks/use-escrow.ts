import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { escrowService, EscrowTransaction, EscrowStats } from '../api/services/escrow.service';

// Query keys
export const escrowKeys = {
  all: ['escrow'] as const,
  transactions: () => [...escrowKeys.all, 'transactions'] as const,
  transaction: (id: string) => [...escrowKeys.all, 'transaction', id] as const,
  stats: () => [...escrowKeys.all, 'stats'] as const,
};

// Get escrow transactions
export function useEscrowTransactions(params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}, options?: Omit<UseQueryOptions<{ transactions: EscrowTransaction[]; total: number }, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: [...escrowKeys.transactions(), params],
    queryFn: () => escrowService.getTransactions(params),
    ...options,
  });
}

// Get escrow statistics
export function useEscrowStats(
  options?: Omit<UseQueryOptions<EscrowStats, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: escrowKeys.stats(),
    queryFn: () => escrowService.getStats(),
    refetchInterval: 60000, // Refetch every minute
    ...options,
  });
}

// Get single transaction
export function useEscrowTransaction(
  id: string,
  options?: UseQueryOptions<EscrowTransaction, Error>
) {
  return useQuery({
    queryKey: escrowKeys.transaction(id),
    queryFn: () => escrowService.getTransaction(id),
    enabled: !!id,
    ...options,
  });
}

// Release funds mutation
export function useReleaseFunds() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ transactionId, notes }: { transactionId: string; notes?: string }) =>
      escrowService.releaseFunds(transactionId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

// Refund funds mutation
export function useRefundFunds() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      escrowService.refundFunds(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

// Resolve dispute mutation
export function useResolveDispute() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ transactionId, resolution }: {
      transactionId: string;
      resolution: {
        decision: 'release' | 'refund' | 'split';
        notes: string;
        splitPercentage?: number;
      };
    }) => escrowService.resolveDispute(transactionId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

// Export transactions mutation
export function useExportEscrowTransactions() {
  return useMutation({
    mutationFn: (params: {
      format: 'csv' | 'excel' | 'pdf';
      startDate?: string;
      endDate?: string;
      status?: string;
    }) => escrowService.exportTransactions(params),
  });
}