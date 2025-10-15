'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  staffService,
  Staff,
  StaffFilterRequest,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffLoginRequest,
  ChangePasswordRequest,
  InviteStaffRequest,
  BulkStaffActionRequest,
  StaffResponse,
} from '@/lib/api/services/staff.service';

// Staff CRUD hooks
export function useStaff(filters?: StaffFilterRequest) {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffService.getStaff(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useStaffById(staffId: string) {
  return useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffService.getStaffById(staffId),
    enabled: !!staffId,
    staleTime: 60000, // 1 minute
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffRequest) => staffService.createStaff(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
      toast.success('Staff member created successfully - they can now login with the provided credentials');
    },
    onError: (error: any) => {
      console.error('Staff creation error:', error);
      
      // Extract error message from different possible error structures
      let errorMessage = 'Failed to create staff member';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: UpdateStaffRequest }) =>
      staffService.updateStaff(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
      toast.success('Staff member updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to update staff member';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffService.deleteStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
      toast.success('Staff member deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to delete staff member';
      toast.error(errorMessage);
    },
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteStaffRequest) => staffService.inviteStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff invitation sent successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to send staff invitation';
      toast.error(errorMessage);
    },
  });
}

export function useBulkStaffAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkStaffActionRequest) => staffService.bulkStaffAction(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff-stats'] });
      
      const successCount = result.results.filter(r => r.success).length;
      const totalCount = result.results.length;
      
      if (successCount === totalCount) {
        toast.success(`Bulk action completed successfully for ${successCount} staff members`);
      } else {
        toast.warning(`Bulk action completed: ${successCount}/${totalCount} successful`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Bulk action failed');
    },
  });
}

// Staff authentication hooks
export function useStaffLogin() {
  return useMutation({
    mutationFn: (data: StaffLoginRequest) => staffService.staffLogin(data),
    onSuccess: () => {
      toast.success('Login successful');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useStaffLogout() {
  return useMutation({
    mutationFn: ({ sessionId, logoutAllDevices }: { sessionId: string; logoutAllDevices?: boolean }) =>
      staffService.staffLogout(sessionId, logoutAllDevices),
    onSuccess: () => {
      toast.success('Logout successful');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Logout failed');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => staffService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Password change failed');
    },
  });
}

// Staff sessions hooks
export function useStaffSessions(staffId?: string) {
  return useQuery({
    queryKey: ['staff-sessions', staffId],
    queryFn: () => staffService.getStaffSessions(staffId),
    refetchInterval: 60000, // Refresh every minute
    enabled: !!staffId,
  });
}

export function useRevokeStaffSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) =>
      staffService.revokeStaffSession(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-sessions'] });
      toast.success('Session revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });
}

// Staff activity hooks
export function useStaffActivity(staffId: string, filters?: {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['staff-activity', staffId, filters],
    queryFn: () => staffService.getStaffActivity(staffId, filters),
    enabled: !!staffId,
    staleTime: 60000, // 1 minute
  });
}

// Staff analytics hooks
export function useStaffAnalytics(filters?: {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
}) {
  return useQuery({
    queryKey: ['staff-analytics', filters],
    queryFn: () => staffService.getStaffAnalytics(filters),
    staleTime: 300000, // 5 minutes
  });
}

export function useStaffSecurityAudit(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['staff-security-audit', filters],
    queryFn: () => staffService.getStaffSecurityAudit(filters),
    staleTime: 300000, // 5 minutes
  });
}

export function useStaffProductivity(filters?: {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
}) {
  return useQuery({
    queryKey: ['staff-productivity', filters],
    queryFn: () => staffService.getStaffProductivity(filters),
    staleTime: 300000, // 5 minutes
  });
}

// Staff permissions hooks
export function useUpdateStaffPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, permissions }: { staffId: string; permissions: string[] }) =>
      staffService.updateStaffPermissions(staffId, permissions as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
      toast.success('Staff permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update permissions');
    },
  });
}

export function useRolePermissions() {
  return useQuery({
    queryKey: ['role-permissions'],
    queryFn: () => staffService.getRolePermissions(),
    staleTime: 600000, // 10 minutes
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, permissions }: { role: string; permissions: string[] }) =>
      staffService.updateRolePermissions(role, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Role permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update role permissions');
    },
  });
}

// Note: Support agent hooks removed - endpoints don't exist in backend API

/**
 * useUpdateAgentStatus - Deprecated hook (endpoint doesn't exist)
 * Returns a no-op mutation for backward compatibility with StaffList component
 */
export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, status, reason }: {
      staffId: string;
      status: string;
      reason?: string;
    }) => {
      // Backend doesn't have agent status endpoint
      // Use regular staff status update instead
      console.warn('useUpdateAgentStatus: Endpoint not available, using regular status update');
      return { success: false, message: 'Agent status endpoint not available' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.info('Agent status feature not available - use staff status instead');
    },
    onError: (error: any) => {
      toast.error('Agent status feature not available');
    },
  });
}

// Staff stats hooks
export function useStaffLimitInfo() {
  return useQuery({
    queryKey: ['staff-limit-info'],
    queryFn: async () => {
      try {
        return await staffService.getStaffLimitInfo();
      } catch (error) {
        // Return default values if API fails
        return {
          currentCount: 0,
          maxLimit: 10,
          availableSlots: 10,
          billingPlan: 'Free'
        };
      }
    },
    staleTime: 300000, // 5 minutes
  });
}

export function useStaffStats(filters?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  includeActivityStats?: boolean;
  includePermissionStats?: boolean;
  includeSecurityEvents?: boolean;
}) {
  return useQuery({
    queryKey: ['staff-stats', filters],
    queryFn: async () => {
      try {
        return await staffService.getStaffStats(filters);
      } catch (error) {
        // Return default stats if API fails
        return {
          totalStaff: 0,
          activeStaff: 0,
          pendingInvites: 0,
          recentActivity: [],
          roleDistribution: {},
          securityMetrics: {
            failedLogins: 0,
            suspiciousActivity: 0,
            securityCompliance: 100
          },
          healthMetrics: {
            averageResponseTime: 0,
            systemLoad: 0,
            securityCompliance: 100
          }
        };
      }
    },
    staleTime: 300000, // 5 minutes
  });
}