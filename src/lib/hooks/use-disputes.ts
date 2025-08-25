import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { disputeService } from '../api/services/dispute.service';
import type {
  Dispute,
  DisputesResponse,
  DisputeFilter,
  CreateDisputeRequest,
  UpdateDisputeRequest,
  ResolveDisputeRequest,
  DisputeResponseRequest,
  EscalateDisputeRequest,
  BulkDisputeActionRequest,
  DisputeStatsRequest,
  DisputeStats,
  DisputeAnalytics,
  DisputeSettings,
  UpdateDisputeSettingsRequest,
  UseDisputesResult,
  UseDisputeResult,
  UseDisputeMutationResult,
} from '../api/types/dispute.types';

// Query Keys
export const disputeKeys = {
  all: ['disputes'] as const,
  lists: () => [...disputeKeys.all, 'list'] as const,
  list: (filters: DisputeFilter) => [...disputeKeys.lists(), filters] as const,
  details: () => [...disputeKeys.all, 'detail'] as const,
  detail: (id: string) => [...disputeKeys.details(), id] as const,
  stats: () => [...disputeKeys.all, 'stats'] as const,
  stat: (params: DisputeStatsRequest) => [...disputeKeys.stats(), params] as const,
  analytics: () => [...disputeKeys.all, 'analytics'] as const,
  analytic: (params: DisputeStatsRequest) => [...disputeKeys.analytics(), params] as const,
  settings: () => [...disputeKeys.all, 'settings'] as const,
  counts: () => [...disputeKeys.all, 'counts'] as const,
  search: (term: string) => [...disputeKeys.all, 'search', term] as const,
};

// Hook for getting paginated disputes with filters
export function useDisputes(filter: DisputeFilter = {}): UseDisputesResult {
  const queryResult = useQuery({
    queryKey: disputeKeys.list(filter),
    queryFn: () => disputeService.getDisputes(filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    disputes: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    hasNextPage: queryResult.data?.hasNext || false,
    fetchNextPage: () => {
      // For regular pagination, we handle this differently than infinite queries
      if (queryResult.data?.hasNext) {
        // You would typically update the filter with the next page
      }
    },
    isFetchingNextPage: false,
  };
}

// Hook for infinite scrolling disputes
export function useInfiniteDisputes(filter: Omit<DisputeFilter, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...disputeKeys.lists(), 'infinite', filter],
    queryFn: ({ pageParam = 1 }) =>
      disputeService.getDisputes({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

// Hook for getting a single dispute
export function useDispute(disputeId: string | undefined): UseDisputeResult {
  const queryResult = useQuery({
    queryKey: disputeKeys.detail(disputeId!),
    queryFn: () => disputeService.getDisputeById(disputeId!),
    enabled: !!disputeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    dispute: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// Hook for getting dispute statistics
export function useDisputeStats(params: DisputeStatsRequest) {
  return useQuery({
    queryKey: disputeKeys.stat(params),
    queryFn: () => disputeService.getDisputeStats(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook for getting dispute analytics
export function useDisputeAnalytics(params: DisputeStatsRequest) {
  return useQuery({
    queryKey: disputeKeys.analytic(params),
    queryFn: () => disputeService.getAnalytics(params),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Hook for getting dispute settings
export function useDisputeSettings() {
  return useQuery({
    queryKey: disputeKeys.settings(),
    queryFn: () => disputeService.getDisputeSettings(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}

// Hook for getting dispute counts
export function useDisputeCounts() {
  return useQuery({
    queryKey: disputeKeys.counts(),
    queryFn: () => disputeService.getDisputeCounts(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for searching disputes
export function useSearchDisputes(searchTerm: string, limit = 10) {
  return useQuery({
    queryKey: disputeKeys.search(searchTerm),
    queryFn: () => disputeService.searchDisputes(searchTerm, limit),
    enabled: searchTerm.length >= 2, // Only search with 2+ characters
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Resolution trend analytics hook
export function useResolutionTrends(params: DisputeStatsRequest) {
  return useQuery({
    queryKey: [...disputeKeys.analytics(), 'resolution-trends', params],
    queryFn: () => disputeService.getResolutionTrends(params),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

// Vendor performance analytics hook
export function useVendorPerformance(params: DisputeStatsRequest) {
  return useQuery({
    queryKey: [...disputeKeys.analytics(), 'vendor-performance', params],
    queryFn: () => disputeService.getVendorDisputePerformance(params),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

// Common issues analytics hook
export function useCommonIssues(params: DisputeStatsRequest) {
  return useQuery({
    queryKey: [...disputeKeys.analytics(), 'common-issues', params],
    queryFn: () => disputeService.getCommonIssues(params),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

// Resolution performance analytics hook
export function useResolutionPerformance(params: DisputeStatsRequest) {
  return useQuery({
    queryKey: [...disputeKeys.analytics(), 'resolution-performance', params],
    queryFn: () => disputeService.getResolutionPerformance(params),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

// MUTATION HOOKS

// Hook for creating a new dispute
export function useCreateDispute(): UseDisputeMutationResult<CreateDisputeRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisputeRequest) => disputeService.createDispute(data),
    onSuccess: (result) => {
      // Invalidate and refetch disputes lists
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.counts() });
      
      toast.success('Dispute created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create dispute:', error);
      toast.error(error.message || 'Failed to create dispute');
    },
  });
}

// Hook for updating dispute
export function useUpdateDispute(): UseDisputeMutationResult<{
  disputeId: string;
  data: UpdateDisputeRequest;
}> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }) => disputeService.updateDispute(disputeId, data),
    onSuccess: (result, variables) => {
      // Invalidate specific dispute and lists
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.disputeId) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.counts() });
      
      toast.success('Dispute updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update dispute:', error);
      toast.error(error.message || 'Failed to update dispute');
    },
  });
}

// Hook for resolving dispute
export function useResolveDispute(): UseDisputeMutationResult<{
  disputeId: string;
  data: ResolveDisputeRequest;
}> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }) => disputeService.resolveDispute(disputeId, data),
    onSuccess: (result, variables) => {
      // Invalidate specific dispute and lists
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.disputeId) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.counts() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.stats() });
      
      toast.success('Dispute resolved successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to resolve dispute:', error);
      toast.error(error.message || 'Failed to resolve dispute');
    },
  });
}

// Hook for adding dispute response
export function useAddDisputeResponse(): UseDisputeMutationResult<{
  disputeId: string;
  data: DisputeResponseRequest;
}> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }) => disputeService.addDisputeResponse(disputeId, data),
    onSuccess: (result, variables) => {
      // Invalidate specific dispute to refetch timeline
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.disputeId) });
      
      toast.success('Response added successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to add dispute response:', error);
      toast.error(error.message || 'Failed to add response');
    },
  });
}

// Hook for escalating dispute
export function useEscalateDispute(): UseDisputeMutationResult<{
  disputeId: string;
  data: EscalateDisputeRequest;
}> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, data }) => disputeService.escalateDispute(disputeId, data),
    onSuccess: (result, variables) => {
      // Invalidate specific dispute and lists
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.disputeId) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.counts() });
      
      toast.success('Dispute escalated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to escalate dispute:', error);
      toast.error(error.message || 'Failed to escalate dispute');
    },
  });
}

// Hook for bulk dispute actions
export function useBulkDisputeAction(): UseDisputeMutationResult<BulkDisputeActionRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDisputeActionRequest) => disputeService.bulkDisputeAction(data),
    onSuccess: (result) => {
      // Invalidate all dispute-related queries
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      
      const { successful, failed, totalProcessed } = result;
      toast.success(`Bulk action completed: ${successful}/${totalProcessed} successful`);
      
      if (failed > 0) {
        toast.warning(`${failed} actions failed`);
      }
    },
    onError: (error: Error) => {
      console.error('Failed to perform bulk action:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    },
  });
}

// Hook for updating dispute settings
export function useUpdateDisputeSettings(): UseDisputeMutationResult<UpdateDisputeSettingsRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDisputeSettingsRequest) => 
      disputeService.updateDisputeSettings(data),
    onSuccess: () => {
      // Invalidate settings
      queryClient.invalidateQueries({ queryKey: disputeKeys.settings() });
      
      toast.success('Dispute settings updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update dispute settings:', error);
      toast.error(error.message || 'Failed to update settings');
    },
  });
}

// Hook for file uploads
export function useUploadEvidence(): UseDisputeMutationResult<{
  disputeId: string;
  file: File;
}> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, file }) => disputeService.uploadEvidenceFile(disputeId, file),
    onSuccess: (result, variables) => {
      // Invalidate specific dispute to refetch with new evidence
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.disputeId) });
      
      toast.success('Evidence uploaded successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to upload evidence:', error);
      toast.error(error.message || 'Failed to upload file');
    },
  });
}

// Hook for deleting evidence files
export function useDeleteEvidence(): UseDisputeMutationResult<{
  disputeId: string;
  fileId: string;
}> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, fileId }) => 
      disputeService.deleteEvidenceFile(disputeId, fileId),
    onSuccess: (result, variables) => {
      // Invalidate specific dispute to refetch without deleted evidence
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.disputeId) });
      
      toast.success('Evidence deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete evidence:', error);
      toast.error(error.message || 'Failed to delete file');
    },
  });
}

// Hook for exporting disputes
export function useExportDisputes() {
  return useMutation({
    mutationFn: ({ filter, format }: { 
      filter: DisputeFilter; 
      format: 'csv' | 'xlsx' | 'pdf' 
    }) => disputeService.exportDisputes(filter, format),
    onSuccess: (blob, variables) => {
      // Download the file
      const filename = `disputes-export-${new Date().toISOString().split('T')[0]}.${variables.format}`;
      disputeService.downloadFile(blob, filename);
      
      toast.success('Disputes exported successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to export disputes:', error);
      toast.error(error.message || 'Failed to export disputes');
    },
  });
}

// Hook for exporting analytics report
export function useExportAnalytics() {
  return useMutation({
    mutationFn: ({ params, format }: { 
      params: DisputeStatsRequest; 
      format: 'csv' | 'xlsx' | 'pdf' 
    }) => disputeService.exportAnalyticsReport(params, format),
    onSuccess: (blob, variables) => {
      // Download the file
      const filename = `dispute-analytics-${new Date().toISOString().split('T')[0]}.${variables.format}`;
      disputeService.downloadFile(blob, filename);
      
      toast.success('Analytics report exported successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to export analytics:', error);
      toast.error(error.message || 'Failed to export report');
    },
  });
}

// Utility hook for optimistic updates
export function useOptimisticDisputeUpdate() {
  const queryClient = useQueryClient();

  const updateDisputeOptimistically = (disputeId: string, updates: Partial<Dispute>) => {
    queryClient.setQueryData(
      disputeKeys.detail(disputeId),
      (oldData: Dispute | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    );
  };

  return { updateDisputeOptimistically };
}

// Hook for real-time dispute updates (WebSocket)
export function useDisputeRealTimeUpdates(disputeId: string | undefined) {
  const queryClient = useQueryClient();

  // This would typically connect to a WebSocket
  // For now, we'll just provide a manual refresh mechanism
  const refreshDispute = () => {
    if (disputeId) {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    }
  };

  return { refreshDispute };
}