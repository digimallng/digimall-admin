/**
 * Users React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services';
import type {
  GetAllUsersParams,
  GetUserStatisticsParams,
  UpdateUserRequest,
  UserSuspensionRequest,
} from '../types';

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params?: GetAllUsersParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  statistics: (params?: GetUserStatisticsParams) => [...usersKeys.all, 'statistics', params] as const,
};

export function useUsers(params?: GetAllUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: async () => {
      try {
        const data = await usersService.getAll(params);
        return data;
      } catch (error) {
        console.error('Users fetch error:', error);
        // Return empty response on error
        return {
          data: [],
          meta: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: 0,
            totalPages: 0,
          },
        };
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

export function useUserById(id: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserStatistics(params?: GetUserStatisticsParams) {
  return useQuery({
    queryKey: usersKeys.statistics(params),
    queryFn: async () => {
      try {
        const data = await usersService.getStatistics(params);
        return data;
      } catch (error) {
        console.error('User statistics fetch error:', error);
        // Return default statistics on error
        return {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          suspendedUsers: 0,
          deletedUsers: 0,
          verifiedUsers: 0,
          unverifiedUsers: 0,
          byRole: [],
          growth: {
            current: 0,
            previous: 0,
            growthRate: 0,
            trend: [],
          },
          engagement: {
            dailyActive: 0,
            weeklyActive: 0,
            monthlyActive: 0,
          },
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// Note: General user update is not supported by the API
// Admins can only update user status via updateStatus() or suspend/unsuspend

export function useSuspendUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserSuspensionRequest }) =>
      usersService.suspendUnsuspend(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id, { reason: 'Deleted by admin', deleteData: false }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
    },
  });
}

// Additional hooks for user management actions
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      usersService.updateStatus(id, 'active'),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      usersService.updateStatus(id, 'inactive'),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      usersService.suspendUnsuspend(id, { action: 'suspend', reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      usersService.suspendUnsuspend(id, { action: 'unsuspend', reason: 'Unsuspended by admin' }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
    },
  });
}

// Note: Email and phone verification are only available through bulk actions
// Individual verification has been removed as there's no standalone backend endpoint

export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userIds: string[];
      action: 'activate' | 'deactivate' | 'suspend' | 'delete';
      reason?: string;
    }) => {
      // Execute bulk actions sequentially
      const results = await Promise.allSettled(
        data.userIds.map(async (id) => {
          switch (data.action) {
            case 'activate':
              return usersService.updateStatus(id, 'active');
            case 'deactivate':
              return usersService.updateStatus(id, 'inactive');
            case 'suspend':
              return usersService.suspendUnsuspend(id, {
                action: 'suspend',
                reason: data.reason || 'Bulk suspension',
              });
            case 'delete':
              return usersService.delete(id, { reason: data.reason || 'Bulk deletion', deleteData: false });
            default:
              throw new Error(`Unknown action: ${data.action}`);
          }
        })
      );
      return {
        success: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
        results,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.statistics() });
    },
  });
}

export function useUserStats() {
  return useUserStatistics();
}
