import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityService } from '@/lib/api/services/security.service';
import { toast } from 'sonner';

// Query keys
export const securityKeys = {
  all: ['security'] as const,
  dashboard: () => [...securityKeys.all, 'dashboard'] as const,
  alerts: (filters?: any) => [...securityKeys.all, 'alerts', filters] as const,
  sessions: (filters?: any) => [...securityKeys.all, 'sessions', filters] as const,
  auditLogs: (filters?: any) => [...securityKeys.all, 'audit-logs', filters] as const,
  settings: () => [...securityKeys.all, 'settings'] as const,
  fraudRules: () => [...securityKeys.all, 'fraud-rules'] as const,
  threats: (filters?: any) => [...securityKeys.all, 'threats', filters] as const,
  vulnerabilities: () => [...securityKeys.all, 'vulnerabilities'] as const,
};

// Security dashboard hook
export function useSecurityDashboard() {
  return useQuery({
    queryKey: securityKeys.dashboard(),
    queryFn: () => securityService.getSecurityDashboard(),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 15 * 1000, // Consider stale after 15 seconds
  });
}

// Security alerts hook
export function useSecurityAlerts(filters?: any) {
  return useQuery({
    queryKey: securityKeys.alerts(filters),
    queryFn: () => securityService.getSecurityAlerts(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// User sessions hook
export function useUserSessions(filters?: any) {
  return useQuery({
    queryKey: securityKeys.sessions(filters),
    queryFn: () => securityService.getUserSessions(filters),
    staleTime: 1 * 60 * 1000,
  });
}

// Audit logs hook
export function useAuditLogs(filters?: any) {
  return useQuery({
    queryKey: securityKeys.auditLogs(filters),
    queryFn: () => securityService.getAuditLogs(filters),
    staleTime: 1 * 60 * 1000,
  });
}

// Security settings hook
export function useSecuritySettings() {
  return useQuery({
    queryKey: securityKeys.settings(),
    queryFn: () => securityService.getSecuritySettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fraud rules hook
export function useFraudRules() {
  return useQuery({
    queryKey: securityKeys.fraudRules(),
    queryFn: () => securityService.getFraudRules(),
    staleTime: 5 * 60 * 1000,
  });
}

// Security threats hook
export function useSecurityThreats(filters?: any) {
  return useQuery({
    queryKey: securityKeys.threats(filters),
    queryFn: () => securityService.getThreats(filters),
    staleTime: 2 * 60 * 1000,
  });
}

// Vulnerabilities hook
export function useSecurityVulnerabilities() {
  return useQuery({
    queryKey: securityKeys.vulnerabilities(),
    queryFn: () => securityService.getVulnerabilities(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Security score hook
export function useSecurityScore() {
  return useQuery({
    queryKey: [...securityKeys.all, 'score'],
    queryFn: () => securityService.getSecurityScore(),
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations
export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: any) => securityService.updateSecuritySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.settings() });
      toast.success('Security settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update security settings: ${error.message}`);
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => securityService.dismissAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: securityKeys.dashboard() });
      toast.success('Alert dismissed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to dismiss alert: ${error.message}`);
    },
  });
}

export function useTerminateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => securityService.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.sessions() });
      toast.success('Session terminated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to terminate session: ${error.message}`);
    },
  });
}

export function useBlockIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ipAddress: string) => securityService.blockIP(ipAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.threats() });
      queryClient.invalidateQueries({ queryKey: securityKeys.dashboard() });
      toast.success('IP address blocked successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to block IP address: ${error.message}`);
    },
  });
}

// Alias for backward compatibility
export const useRecentSecurityEvents = useSecurityAlerts;