/**
 * Staff Management React Query Hooks
 *
 * Custom hooks for all staff-related operations using React Query.
 * Provides optimistic updates, caching, and automatic refetching.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../services';
import type {
  Staff,
  StaffListResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffLoginRequest,
  ChangePasswordRequest,
  UpdateStaffStatusRequest,
  UpdateStaffPermissionsRequest,
  GetAllStaffParams,
} from '../types';

// ===== QUERY KEYS =====

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (params?: GetAllStaffParams) => [...staffKeys.lists(), params] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  sessions: (id: string) => [...staffKeys.all, 'sessions', id] as const,
  activity: (id: string) => [...staffKeys.all, 'activity', id] as const,
  analytics: () => [...staffKeys.all, 'analytics'] as const,
  productivity: (id: string) => [...staffKeys.all, 'productivity', id] as const,
  securityAudit: () => [...staffKeys.all, 'security-audit'] as const,
  rolePermissions: (role: string) => [...staffKeys.all, 'permissions', role] as const,
};

// ===== QUERY HOOKS =====

/**
 * Get all staff members with optional filtering
 */
export function useStaff(params?: GetAllStaffParams) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get staff member by ID
 */
export function useStaffById(id: string, enabled = true) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => staffService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get staff sessions
 */
export function useStaffSessions(id: string) {
  return useQuery({
    queryKey: staffKeys.sessions(id),
    queryFn: () => staffService.getSessions(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get staff activity
 */
export function useStaffActivity(id: string) {
  return useQuery({
    queryKey: staffKeys.activity(id),
    queryFn: () => staffService.getActivity(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get staff analytics overview
 */
export function useStaffAnalytics() {
  return useQuery({
    queryKey: staffKeys.analytics(),
    queryFn: () => staffService.getAnalytics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get staff productivity
 */
export function useStaffProductivity(id: string) {
  return useQuery({
    queryKey: staffKeys.productivity(id),
    queryFn: () => staffService.getProductivity(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get security audit
 */
export function useStaffSecurityAudit() {
  return useQuery({
    queryKey: staffKeys.securityAudit(),
    queryFn: () => staffService.getSecurityAudit(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get role permissions
 */
export function useRolePermissions(role: string) {
  return useQuery({
    queryKey: staffKeys.rolePermissions(role),
    queryFn: () => staffService.getRolePermissions(role),
    enabled: !!role,
    staleTime: 10 * 60 * 1000,
  });
}

// ===== MUTATION HOOKS =====

/**
 * Create new staff member
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffRequest) => staffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.analytics() });
    },
  });
}

/**
 * Update staff member
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffRequest }) =>
      staffService.update(id, data),
    onSuccess: (updatedStaff) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(updatedStaff.id) });
    },
  });
}

/**
 * Delete staff member
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.analytics() });
    },
  });
}

/**
 * Staff login
 */
export function useStaffLogin() {
  return useMutation({
    mutationFn: (data: StaffLoginRequest) => staffService.login(data),
  });
}

/**
 * Staff logout
 */
export function useStaffLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => staffService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordRequest }) =>
      staffService.changePassword(id, data),
  });
}

/**
 * Update staff status
 */
export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffStatusRequest }) =>
      staffService.updateStatus(id, data),
    onSuccess: (updatedStaff) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(updatedStaff.id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.analytics() });
    },
  });
}

/**
 * Update staff permissions
 */
export function useUpdateStaffPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffPermissionsRequest }) =>
      staffService.updatePermissions(id, data),
    onSuccess: (updatedStaff) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(updatedStaff.id) });
    },
  });
}

/**
 * Revoke staff session
 */
export function useRevokeStaffSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sessionId }: { id: string; sessionId: string }) =>
      staffService.revokeSession(id, sessionId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.sessions(id) });
    },
  });
}
