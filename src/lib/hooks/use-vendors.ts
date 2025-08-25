import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { vendorService } from '../api/services';
import { Vendor, VendorFilters, VendorDocument, PaginatedResponse } from '../api/types';

// Query keys
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters?: VendorFilters) => [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  stats: () => [...vendorKeys.all, 'stats'] as const,
  documents: (id: string) => [...vendorKeys.all, 'documents', id] as const,
  performance: (id: string, params?: any) => [...vendorKeys.all, 'performance', id, params] as const,
  orders: (id: string, params?: any) => [...vendorKeys.all, 'orders', id, params] as const,
  products: (id: string, params?: any) => [...vendorKeys.all, 'products', id, params] as const,
  reviews: (id: string, params?: any) => [...vendorKeys.all, 'reviews', id, params] as const,
  search: (query: string, filters?: any) => [...vendorKeys.all, 'search', query, filters] as const,
  pendingApprovals: (params?: any) => [...vendorKeys.all, 'pending-approvals', params] as const,
  verificationHistory: (id: string) => [...vendorKeys.all, 'verification-history', id] as const,
  allPerformance: (params?: any) => [...vendorKeys.all, 'all-performance', params] as const,
  platformMetrics: () => [...vendorKeys.all, 'platform-metrics'] as const,
};

// Get vendors list with filters
export function useVendors(
  filters?: VendorFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Vendor>, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: () => vendorService.getVendors(filters),
    ...options,
  });
}

// Get single vendor
export function useVendor(
  id: string,
  options?: UseQueryOptions<Vendor, Error>
) {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorService.getVendor(id),
    enabled: !!id,
    ...options,
  });
}

// Get vendor statistics
export function useVendorStats(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: vendorKeys.stats(),
    queryFn: () => vendorService.getVendorStats(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get vendor documents
export function useVendorDocuments(
  vendorId: string,
  options?: UseQueryOptions<VendorDocument[], Error>
) {
  return useQuery({
    queryKey: vendorKeys.documents(vendorId),
    queryFn: () => vendorService.getVendorDocuments(vendorId),
    enabled: !!vendorId,
    ...options,
  });
}

// Get vendor performance
export function useVendorPerformance(
  vendorId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: vendorKeys.performance(vendorId, params),
    queryFn: () => vendorService.getVendorPerformance(vendorId, params),
    enabled: !!vendorId,
    ...options,
  });
}

// Get vendor orders
export function useVendorOrders(
  vendorId: string,
  params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: vendorKeys.orders(vendorId, params),
    queryFn: () => vendorService.getVendorOrders(vendorId, params),
    enabled: !!vendorId,
    ...options,
  });
}

// Get vendor products
export function useVendorProducts(
  vendorId: string,
  params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: vendorKeys.products(vendorId, params),
    queryFn: () => vendorService.getVendorProducts(vendorId, params),
    enabled: !!vendorId,
    ...options,
  });
}

// Get vendor reviews
export function useVendorReviews(
  vendorId: string,
  params?: {
    rating?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: vendorKeys.reviews(vendorId, params),
    queryFn: () => vendorService.getVendorReviews(vendorId, params),
    enabled: !!vendorId,
    ...options,
  });
}

// Search vendors
export function useSearchVendors(
  query: string,
  filters?: {
    status?: 'pending' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'suspended';
    businessType?: string;
    limit?: number;
  },
  options?: UseQueryOptions<Vendor[], Error>
) {
  return useQuery({
    queryKey: vendorKeys.search(query, filters),
    queryFn: () => vendorService.searchVendors(query, filters),
    enabled: !!query && query.length >= 2,
    ...options,
  });
}

// Get pending approvals
export function usePendingApprovals(
  params?: {
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    documentType?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: vendorKeys.pendingApprovals(params),
    queryFn: () => vendorService.getPendingApprovals(params),
    ...options,
  });
}

// Get vendor verification history
export function useVendorVerificationHistory(
  vendorId: string,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: vendorKeys.verificationHistory(vendorId),
    queryFn: () => vendorService.getVerificationHistory(vendorId),
    enabled: !!vendorId,
    ...options,
  });
}

// Mutations
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
      vendorService.updateVendor(id, data),
    onSuccess: (data, { id }) => {
      // Update the vendor detail cache
      queryClient.setQueryData(vendorKeys.detail(id), data);
      // Invalidate the vendors list to refresh it
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
    },
  });
}

export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string; conditions?: string[] } }) =>
      vendorService.approveVendor(id, data),
    onSuccess: (data, { id }) => {
      // Update the vendor detail cache
      queryClient.setQueryData(vendorKeys.detail(id), data);
      // Invalidate the vendors list to refresh it
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: vendorKeys.pendingApprovals() });
    },
  });
}

export function useRejectVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { 
        reason: string; 
        feedback?: string; 
        blockedFields?: string[] 
      } 
    }) => vendorService.rejectVendor(id, data),
    onSuccess: (data, { id }) => {
      // Update the vendor detail cache
      queryClient.setQueryData(vendorKeys.detail(id), data);
      // Invalidate the vendors list to refresh it
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: vendorKeys.pendingApprovals() });
    },
  });
}

export function useSuspendVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { 
        reason: string; 
        duration?: number; 
        notifyCustomers?: boolean 
      } 
    }) => vendorService.suspendVendor(id, data),
    onSuccess: (data, { id }) => {
      // Update the vendor detail cache
      queryClient.setQueryData(vendorKeys.detail(id), data);
      // Invalidate the vendors list to refresh it
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
    },
  });
}

export function useReactivateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      vendorService.reactivateVendor(id, notes),
    onSuccess: (data, { id }) => {
      // Update the vendor detail cache
      queryClient.setQueryData(vendorKeys.detail(id), data);
      // Invalidate the vendors list to refresh it
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
    },
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, documentId, notes }: { 
      vendorId: string; 
      documentId: string; 
      notes?: string 
    }) => vendorService.approveDocument(vendorId, documentId, notes),
    onSuccess: (_, { vendorId }) => {
      // Invalidate vendor documents
      queryClient.invalidateQueries({ queryKey: vendorKeys.documents(vendorId) });
      // Invalidate vendor detail
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) });
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: vendorKeys.pendingApprovals() });
    },
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, documentId, reason }: { 
      vendorId: string; 
      documentId: string; 
      reason: string 
    }) => vendorService.rejectDocument(vendorId, documentId, reason),
    onSuccess: (_, { vendorId }) => {
      // Invalidate vendor documents
      queryClient.invalidateQueries({ queryKey: vendorKeys.documents(vendorId) });
      // Invalidate vendor detail
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) });
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: vendorKeys.pendingApprovals() });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, documentId, approved, reason }: { 
      vendorId: string; 
      documentId: string; 
      approved: boolean;
      reason?: string 
    }) => {
      if (approved) {
        return vendorService.approveDocument(vendorId, documentId, reason);
      } else {
        return vendorService.rejectDocument(vendorId, documentId, reason || 'Document rejected');
      }
    },
    onSuccess: (_, { vendorId }) => {
      // Invalidate vendor documents
      queryClient.invalidateQueries({ queryKey: vendorKeys.documents(vendorId) });
      // Invalidate vendor detail
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) });
      // Invalidate pending approvals
      queryClient.invalidateQueries({ queryKey: vendorKeys.pendingApprovals() });
    },
  });
}

export function useRequestDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, data }: { 
      vendorId: string; 
      data: { 
        documentTypes: string[]; 
        message: string; 
        deadline?: string 
      } 
    }) => vendorService.requestDocuments(vendorId, data),
    onSuccess: (_, { vendorId }) => {
      // Invalidate vendor documents
      queryClient.invalidateQueries({ queryKey: vendorKeys.documents(vendorId) });
      // Invalidate vendor detail
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) });
    },
  });
}

export function useBulkUpdateVendors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      vendorIds: string[];
      action: 'approve' | 'reject' | 'suspend' | 'reactivate';
      reason?: string;
      notes?: string;
    }) => vendorService.bulkUpdateVendors(data),
    onSuccess: () => {
      // Invalidate all vendor-related queries
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ vendorId, data }: { 
      vendorId: string; 
      data: { 
        subject: string; 
        message: string; 
        type: 'INFO' | 'WARNING' | 'URGENT';
        channels: ('EMAIL' | 'SMS' | 'IN_APP')[];
      } 
    }) => vendorService.sendMessage(vendorId, data),
  });
}

export function useUpdateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, data }: { 
      vendorId: string; 
      data: { 
        commissionRate: number; 
        effectiveDate?: string; 
        reason?: string 
      } 
    }) => vendorService.updateCommission(vendorId, data),
    onSuccess: (_, { vendorId }) => {
      // Invalidate vendor detail
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(vendorId) });
      // Invalidate vendors list
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

export function useExportVendors() {
  return useMutation({
    mutationFn: (filters?: VendorFilters & { format: 'csv' | 'excel' }) =>
      vendorService.exportVendors(filters),
  });
}

// Get all vendors performance data for performance dashboard
export function useVendorsPerformance(
  params?: {
    status?: string;
    category?: string;
    sortBy?: 'sales' | 'orders' | 'rating' | 'growth';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    page?: number;
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: vendorKeys.allPerformance(params),
    queryFn: () => vendorService.getAllVendorsPerformance(params),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get platform-wide vendor metrics for dashboard
export function usePlatformVendorMetrics(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: vendorKeys.platformMetrics(),
    queryFn: () => vendorService.getPlatformVendorMetrics(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}