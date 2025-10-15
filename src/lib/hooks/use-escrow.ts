/**
 * Escrow Management Hooks
 *
 * React Query hooks for escrow management operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { escrowService } from '../api/services/escrow.service';
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
} from '../api/types/escrow.types';

// ===== QUERY KEYS =====

export const escrowKeys = {
  all: ['escrow'] as const,
  lists: () => [...escrowKeys.all, 'list'] as const,
  list: (params?: GetAllEscrowsParams) => [...escrowKeys.lists(), params] as const,
  details: () => [...escrowKeys.all, 'detail'] as const,
  detail: (id: string) => [...escrowKeys.details(), id] as const,
  byOrder: (orderId: string) => [...escrowKeys.all, 'order', orderId] as const,
  statistics: (params?: GetEscrowStatisticsParams) => [...escrowKeys.all, 'statistics', params] as const,
  disputed: (params?: { page?: number; limit?: number }) => [...escrowKeys.all, 'disputed', params] as const,
  expiringSoon: (params?: { hours?: number; page?: number; limit?: number }) =>
    [...escrowKeys.all, 'expiring-soon', params] as const,
  auditLog: (params?: GetAuditLogParams) => [...escrowKeys.all, 'audit-log', params] as const,
};

// ===== QUERIES =====

/**
 * Get all escrow accounts
 */
export function useEscrows(params?: GetAllEscrowsParams): UseQueryResult<EscrowListResponse, Error> {
  return useQuery({
    queryKey: escrowKeys.list(params),
    queryFn: () => escrowService.getAll(params),
  });
}

/**
 * Get escrow statistics
 */
export function useEscrowStatistics(
  params?: GetEscrowStatisticsParams
): UseQueryResult<EscrowStatisticsResponse, Error> {
  return useQuery({
    queryKey: escrowKeys.statistics(params),
    queryFn: () => escrowService.getStatistics(params),
  });
}

/**
 * Get escrow account by ID
 */
export function useEscrow(id: string): UseQueryResult<EscrowAccount, Error> {
  return useQuery({
    queryKey: escrowKeys.detail(id),
    queryFn: () => escrowService.getById(id),
    enabled: !!id,
  });
}

/**
 * Get escrow account by order ID
 */
export function useEscrowByOrderId(orderId: string): UseQueryResult<EscrowAccount, Error> {
  return useQuery({
    queryKey: escrowKeys.byOrder(orderId),
    queryFn: () => escrowService.getByOrderId(orderId),
    enabled: !!orderId,
  });
}

/**
 * Get disputed escrow accounts
 */
export function useDisputedEscrows(
  params?: { page?: number; limit?: number }
): UseQueryResult<EscrowListResponse, Error> {
  return useQuery({
    queryKey: escrowKeys.disputed(params),
    queryFn: () => escrowService.getDisputed(params),
  });
}

/**
 * Get escrows expiring soon
 */
export function useExpiringSoonEscrows(params?: {
  hours?: number;
  page?: number;
  limit?: number;
}): UseQueryResult<ExpiringEscrowsResponse, Error> {
  return useQuery({
    queryKey: escrowKeys.expiringSoon(params),
    queryFn: () => escrowService.getExpiringSoon(params),
  });
}

/**
 * Get escrow audit log
 */
export function useEscrowAuditLog(
  params?: GetAuditLogParams
): UseQueryResult<AuditLogResponse, Error> {
  return useQuery({
    queryKey: escrowKeys.auditLog(params),
    queryFn: () => escrowService.getAuditLog(params),
  });
}

// ===== MUTATIONS =====

/**
 * Release escrow funds to vendor
 */
export function useReleaseEscrow(): UseMutationResult<
  EscrowActionResponse,
  Error,
  { id: string; data: ReleaseEscrowRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => escrowService.release(id, data),
    onSuccess: () => {
      // Invalidate all escrow queries
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/**
 * Refund escrow funds to customer
 */
export function useRefundEscrow(): UseMutationResult<
  EscrowActionResponse,
  Error,
  { id: string; data: RefundEscrowRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => escrowService.refund(id, data),
    onSuccess: () => {
      // Invalidate all escrow queries
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}

/**
 * Resolve disputed escrow
 */
export function useResolveDispute(): UseMutationResult<
  EscrowActionResponse,
  Error,
  { id: string; data: ResolveDisputeRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => escrowService.resolveDispute(id, data),
    onSuccess: () => {
      // Invalidate all escrow queries
      queryClient.invalidateQueries({ queryKey: escrowKeys.all });
    },
  });
}
