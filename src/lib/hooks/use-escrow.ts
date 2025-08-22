import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { escrowService } from '@/lib/api/services';
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
} from '@/lib/api/types';
import { toast } from 'sonner';

// Query Keys
export const escrowKeys = {
  all: ['escrows'] as const,
  lists: () => [...escrowKeys.all, 'list'] as const,
  list: (filters: EscrowFilters) => [...escrowKeys.lists(), { filters }] as const,
  details: () => [...escrowKeys.all, 'detail'] as const,
  detail: (id: string) => [...escrowKeys.details(), id] as const,
  statistics: () => [...escrowKeys.all, 'statistics'] as const,
  dashboard: () => [...escrowKeys.all, 'dashboard'] as const,
  analytics: () => [...escrowKeys.all, 'analytics'] as const,
  disputes: () => [...escrowKeys.all, 'disputes'] as const,
  dispute: (id: string) => [...escrowKeys.disputes(), id] as const,
  reports: () => [...escrowKeys.all, 'reports'] as const,
  expiring: () => [...escrowKeys.all, 'expiring'] as const,
};

// ===== CORE ESCROW QUERIES =====

export function useEscrows(filters?: EscrowFilters) {
  return useQuery({
    queryKey: escrowKeys.list(filters || {}),
    queryFn: () => escrowService.getEscrows(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEscrow(escrowId: string, enabled = true) {
  return useQuery({
    queryKey: escrowKeys.detail(escrowId),
    queryFn: () => escrowService.getEscrowById(escrowId),
    enabled: enabled && !!escrowId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useEscrowStatistics() {
  return useQuery({
    queryKey: escrowKeys.statistics(),
    queryFn: () => escrowService.getEscrowStatistics(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useEscrowDashboard() {
  return useQuery({
    queryKey: escrowKeys.dashboard(),
    queryFn: () => escrowService.getEscrowDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
}

export function useExpiringSoonEscrows(hours = 24) {
  return useQuery({
    queryKey: [...escrowKeys.expiring(), { hours }],
    queryFn: () => escrowService.getExpiringSoon(hours),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
  });
}

// ===== ANALYTICS QUERIES =====

export function useEscrowPerformanceAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: [...escrowKeys.analytics(), 'performance', params],
    queryFn: () => escrowService.getPerformanceAnalytics(params),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!params?.startDate && !!params?.endDate,
  });
}

export function useEscrowDisputeAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: [...escrowKeys.analytics(), 'disputes', params],
    queryFn: () => escrowService.getDisputeAnalytics(params),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!params?.startDate && !!params?.endDate,
  });
}

export function useEscrowTimeoutAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: [...escrowKeys.analytics(), 'timeouts', params],
    queryFn: () => escrowService.getTimeoutAnalytics(params),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!params?.startDate && !!params?.endDate,
  });
}

// ===== REPORTS =====

export function useEscrowComplianceReport(params?: {
  startDate?: string;
  endDate?: string;
  includeDetails?: boolean;
}) {
  return useQuery({
    queryKey: [...escrowKeys.reports(), 'compliance', params],
    queryFn: () => escrowService.generateComplianceReport(params),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!params?.startDate && !!params?.endDate,
  });
}

// ===== DISPUTE QUERIES =====
// Note: Dispute endpoints not available in backend - removed for now

// export function useEscrowDisputes(filters?: {
//   status?: string;
//   escrowId?: string;
//   assignedTo?: string;
//   reason?: string;
//   search?: string;
//   includeEscrowDetails?: boolean;
//   page?: number;
//   limit?: number;
// }) {
//   return useQuery({
//     queryKey: [...escrowKeys.disputes(), { filters }],
//     queryFn: () => escrowService.getDisputes(filters),
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// }

// export function useEscrowDispute(disputeId: string, enabled = true) {
//   return useQuery({
//     queryKey: escrowKeys.dispute(disputeId),
//     queryFn: () => escrowService.getDisputeById(disputeId),
//     enabled: enabled && !!disputeId,
//     staleTime: 1000 * 60 * 2, // 2 minutes
//   });
// }

// ===== SEARCH & FILTERING HELPERS =====

export function useSearchEscrows(query: string, filters?: EscrowFilters) {
  return useQuery({
    queryKey: [...escrowKeys.lists(), 'search', { query, filters }],
    queryFn: () => escrowService.searchEscrows(query, filters),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useEscrowsByStatus(status: string, filters?: EscrowFilters) {
  return useQuery({
    queryKey: [...escrowKeys.lists(), 'status', { status, filters }],
    queryFn: () => escrowService.getEscrowsByStatus(status, filters),
    enabled: !!status,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEscrowsByCustomer(customerId: string, filters?: EscrowFilters) {
  return useQuery({
    queryKey: [...escrowKeys.lists(), 'customer', customerId, { filters }],
    queryFn: () => escrowService.getEscrowsByCustomer(customerId, filters),
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useEscrowsByVendor(vendorId: string, filters?: EscrowFilters) {
  return useQuery({
    queryKey: [...escrowKeys.lists(), 'vendor', vendorId, { filters }],
    queryFn: () => escrowService.getEscrowsByVendor(vendorId, filters),
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ===== MUTATIONS =====

export function useEscrowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrowId, data }: { escrowId: string; data: EscrowActionRequest }) =>
      escrowService.performEscrowAction(escrowId, data),
    onSuccess: (data, variables) => {
      toast.success(`Escrow action "${variables.data.action}" completed successfully`);
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(variables.escrowId) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to perform escrow action');
    },
  });
}

export function useBulkEscrowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkEscrowActionRequest) => escrowService.performBulkAction(data),
    onSuccess: (result) => {
      const { successful, failed } = result;
      if (successful.length > 0) {
        toast.success(`Successfully processed ${successful.length} escrows`);
      }
      if (failed.length > 0) {
        toast.error(`Failed to process ${failed.length} escrows`);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to perform bulk action');
    },
  });
}

// Dispute mutations temporarily disabled - backend endpoints not available
// export function useCreateDispute() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: CreateDisputeRequest) => escrowService.createDispute(data),
//     onSuccess: (data) => {
//       toast.success('Dispute created successfully');
      
//       // Invalidate relevant queries
//       queryClient.invalidateQueries({ queryKey: escrowKeys.disputes() });
//       queryClient.invalidateQueries({ queryKey: escrowKeys.detail(data.escrowId) });
//     },
//     onError: (error: any) => {
//       toast.error(error?.message || 'Failed to create dispute');
//     },
//   });
// }

// export function useUpdateDispute() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ disputeId, data }: { 
//       disputeId: string; 
//       data: {
//         status?: string;
//         assignedTo?: string;
//         adminNotes?: string;
//         resolution?: string;
//         resolutionNotes?: string;
//       }
//     }) => escrowService.updateDispute(disputeId, data),
//     onSuccess: (data, variables) => {
//       toast.success('Dispute updated successfully');
      
//       // Invalidate relevant queries
//       queryClient.invalidateQueries({ queryKey: escrowKeys.dispute(variables.disputeId) });
//       queryClient.invalidateQueries({ queryKey: escrowKeys.disputes() });
//     },
//     onError: (error: any) => {
//       toast.error(error?.message || 'Failed to update dispute');
//     },
//   });
// }

// export function useResolveDispute() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ disputeId, data }: { 
//       disputeId: string; 
//       data: {
//         resolution: string;
//         resolutionNotes: string;
//         escrowAction?: EscrowActionRequest;
//       }
//     }) => escrowService.resolveDispute(disputeId, data),
//     onSuccess: (data, variables) => {
//       toast.success('Dispute resolved successfully');
      
//       // Invalidate relevant queries
//       queryClient.invalidateQueries({ queryKey: escrowKeys.dispute(variables.disputeId) });
//       queryClient.invalidateQueries({ queryKey: escrowKeys.disputes() });
//       if (data.escrowId) {
//         queryClient.invalidateQueries({ queryKey: escrowKeys.detail(data.escrowId) });
//       }
//     },
//     onError: (error: any) => {
//       toast.error(error?.message || 'Failed to resolve dispute');
//     },
//   });
// }

// ===== QUICK ACTION MUTATIONS =====

export function useReleaseEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrowId, reason }: { escrowId: string; reason?: string }) =>
      escrowService.releaseEscrow(escrowId, reason),
    onSuccess: (data, variables) => {
      toast.success('Escrow released successfully');
      
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(variables.escrowId) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.statistics() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to release escrow');
    },
  });
}

export function useRefundEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrowId, reason, amount }: { 
      escrowId: string; 
      reason?: string; 
      amount?: number 
    }) => escrowService.refundEscrow(escrowId, reason, amount),
    onSuccess: (data, variables) => {
      toast.success(variables.amount ? 'Partial refund completed' : 'Full refund completed');
      
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(variables.escrowId) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.statistics() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to refund escrow');
    },
  });
}

export function useExtendEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrowId, days, reason }: { 
      escrowId: string; 
      days: number; 
      reason?: string 
    }) => escrowService.extendEscrow(escrowId, days, reason),
    onSuccess: (data, variables) => {
      toast.success(`Escrow extended by ${variables.days} days`);
      
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(variables.escrowId) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to extend escrow');
    },
  });
}

export function useCancelEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrowId, reason }: { escrowId: string; reason?: string }) =>
      escrowService.cancelEscrow(escrowId, reason),
    onSuccess: (data, variables) => {
      toast.success('Escrow cancelled successfully');
      
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(variables.escrowId) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.statistics() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel escrow');
    },
  });
}

export function useForceReleaseEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrowId, reason }: { escrowId: string; reason: string }) =>
      escrowService.forceReleaseEscrow(escrowId, reason),
    onSuccess: (data, variables) => {
      toast.success('Escrow force released successfully');
      
      queryClient.invalidateQueries({ queryKey: escrowKeys.detail(variables.escrowId) });
      queryClient.invalidateQueries({ queryKey: escrowKeys.lists() });
      queryClient.invalidateQueries({ queryKey: escrowKeys.statistics() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to force release escrow');
    },
  });
}

// ===== COMPOSITE HOOKS =====

export function useEscrowManagement(escrowId: string) {
  const escrowQuery = useEscrow(escrowId);
  const actionMutation = useEscrowAction();
  const releaseMutation = useReleaseEscrow();
  const refundMutation = useRefundEscrow();
  const extendMutation = useExtendEscrow();
  const cancelMutation = useCancelEscrow();
  const forceReleaseMutation = useForceReleaseEscrow();

  const isLoading = escrowQuery.isLoading || 
    actionMutation.isPending ||
    releaseMutation.isPending ||
    refundMutation.isPending ||
    extendMutation.isPending ||
    cancelMutation.isPending ||
    forceReleaseMutation.isPending;

  const validateAction = (action: string) => {
    if (!escrowQuery.data) return { valid: false, reason: 'Escrow data not loaded' };
    return escrowService.validateEscrowAction(escrowQuery.data, action);
  };

  return {
    escrow: escrowQuery.data,
    isLoading,
    error: escrowQuery.error,
    refetch: escrowQuery.refetch,
    
    // Actions
    performAction: actionMutation.mutate,
    release: releaseMutation.mutate,
    refund: refundMutation.mutate,
    extend: extendMutation.mutate,
    cancel: cancelMutation.mutate,
    forceRelease: forceReleaseMutation.mutate,
    
    // Validation
    validateAction,
    
    // Utility methods
    formatAmount: (amount: number) => escrowService.formatEscrowAmount(amount, escrowQuery.data?.currency),
    calculateAge: () => escrowQuery.data ? escrowService.calculateEscrowAge(escrowQuery.data.createdAt) : null,
    calculateTimeToExpiry: () => escrowQuery.data?.expiresAt ? escrowService.calculateTimeToExpiry(escrowQuery.data.expiresAt) : null,
  };
}

export function useEscrowDashboardData() {
  const dashboardQuery = useEscrowDashboard();
  const statisticsQuery = useEscrowStatistics();
  const expiringQuery = useExpiringSoonEscrows();
  // const disputesQuery removed - endpoint not available in backend

  return {
    dashboard: dashboardQuery.data,
    statistics: statisticsQuery.data,
    expiringSoon: expiringQuery.data,
    activeDisputes: [], // Temporarily empty - disputes endpoint not available
    
    isLoading: dashboardQuery.isLoading || 
      statisticsQuery.isLoading || 
      expiringQuery.isLoading,
      
    error: dashboardQuery.error || 
      statisticsQuery.error || 
      expiringQuery.error,
      
    refetch: () => {
      dashboardQuery.refetch();
      statisticsQuery.refetch();
      expiringQuery.refetch();
    },
  };
}

export function useEscrowAnalyticsData(params: {
  startDate: string;
  endDate: string;
  granularity?: 'day' | 'week' | 'month';
}) {
  const performanceQuery = useEscrowPerformanceAnalytics(params);
  const disputeQuery = useEscrowDisputeAnalytics(params);
  const timeoutQuery = useEscrowTimeoutAnalytics(params);

  return {
    performance: performanceQuery.data,
    disputes: disputeQuery.data,
    timeouts: timeoutQuery.data,
    
    isLoading: performanceQuery.isLoading || 
      disputeQuery.isLoading || 
      timeoutQuery.isLoading,
      
    error: performanceQuery.error || 
      disputeQuery.error || 
      timeoutQuery.error,
      
    refetch: () => {
      performanceQuery.refetch();
      disputeQuery.refetch();
      timeoutQuery.refetch();
    },
  };
}

// ===== ANALYTICS HOOK =====

export function useEscrowAnalytics(options?: {
  timeRange?: string;
  includeCharts?: boolean;
  includeComparisons?: boolean;
}) {
  return useQuery({
    queryKey: [...escrowKeys.analytics(), options],
    queryFn: () => escrowService.getAnalytics(options),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
}