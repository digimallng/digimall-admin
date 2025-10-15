/**
 * Security React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { securityService } from '../services';
import type {
  GetSecurityEventsParams,
  GetSecurityAlertsParams,
  GetBlockedIPsParams,
  ResolveSecurityEventRequest,
  UpdateSecurityAlertRequest,
  BlockIPRequest,
} from '../types';

export const securityKeys = {
  all: ['security'] as const,
  events: (params?: GetSecurityEventsParams) => [...securityKeys.all, 'events', params] as const,
  eventDetail: (id: string) => [...securityKeys.all, 'event', id] as const,
  alerts: (params?: GetSecurityAlertsParams) => [...securityKeys.all, 'alerts', params] as const,
  alertDetail: (id: string) => [...securityKeys.all, 'alert', id] as const,
  blockedIPs: (params?: GetBlockedIPsParams) => [...securityKeys.all, 'blocked-ips', params] as const,
  overview: () => [...securityKeys.all, 'overview'] as const,
};

export function useSecurityEvents(params?: GetSecurityEventsParams) {
  return useQuery({
    queryKey: securityKeys.events(params),
    queryFn: () => securityService.getEvents(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useSecurityEventById(id: string, enabled = true) {
  return useQuery({
    queryKey: securityKeys.eventDetail(id),
    queryFn: () => securityService.getEventById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSecurityAlerts(params?: GetSecurityAlertsParams) {
  return useQuery({
    queryKey: securityKeys.alerts(params),
    queryFn: () => securityService.getAlerts(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useSecurityAlertById(id: string, enabled = true) {
  return useQuery({
    queryKey: securityKeys.alertDetail(id),
    queryFn: () => securityService.getAlertById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBlockedIPs(params?: GetBlockedIPsParams) {
  return useQuery({
    queryKey: securityKeys.blockedIPs(params),
    queryFn: () => securityService.getBlockedIPs(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSecurityOverview() {
  return useQuery({
    queryKey: securityKeys.overview(),
    queryFn: () => securityService.getOverview(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useResolveSecurityEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveSecurityEventRequest }) =>
      securityService.resolveEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: securityKeys.eventDetail(id) });
      queryClient.invalidateQueries({ queryKey: securityKeys.events() });
      queryClient.invalidateQueries({ queryKey: securityKeys.overview() });
    },
  });
}

export function useUpdateSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSecurityAlertRequest }) =>
      securityService.updateAlert(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: securityKeys.alertDetail(id) });
      queryClient.invalidateQueries({ queryKey: securityKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: securityKeys.overview() });
    },
  });
}

export function useBlockIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlockIPRequest) => securityService.blockIP(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.blockedIPs() });
      queryClient.invalidateQueries({ queryKey: securityKeys.overview() });
    },
  });
}

export function useUnblockIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => securityService.unblockIP(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.blockedIPs() });
      queryClient.invalidateQueries({ queryKey: securityKeys.overview() });
    },
  });
}
