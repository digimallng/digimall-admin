import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { userService } from '../api/services';
import { User, UserFilters, PaginatedResponse } from '../api/types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  activity: (id: string, params?: any) => [...userKeys.all, 'activity', id, params] as const,
  sessions: (id: string) => [...userKeys.all, 'sessions', id] as const,
  search: (query: string, filters?: any) => [...userKeys.all, 'search', query, filters] as const,
};

// Get users list with filters
export function useUsers(
  filters?: UserFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<User>, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const result = await userService.getUsers(filters);
      return result;
    },
    enabled: true,
    retry: 1,
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    ...options,
  });

  return query;
}

// Get single user
export function useUser(
  id: string,
  options?: UseQueryOptions<User, Error>
) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    ...options,
  });
}

// Get user statistics
export function useUserStats(
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      console.log('🔥 useUserStats queryFn called - about to call userService.getUserStats()');
      const response = await userService.getUserStats();
      console.log('🔥 useUserStats got response from getUserStats:', response);
      // Transform the API response to match expected format
      const data = (response as any)?.data || response;
      const result = {
        totalUsers: data.total || 0,
        activeUsers: data.active || 0,
        totalVendors: data.vendors || 0,
        totalCustomers: data.customers || 0,
        // Add growth calculations if needed
        userGrowth: 0,
        activeUserGrowth: 0,
        vendorGrowth: 0,
        customerGrowth: 0,
        ...data
      };
      console.log('🔥 useUserStats returning result:', result);
      return result;
    },
    staleTime: 0, // Always consider data stale to force refresh
    cacheTime: 0, // Don't cache results
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get user activity
export function useUserActivity(
  id: string,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: userKeys.activity(id, params),
    queryFn: () => userService.getUserActivity(id, params),
    enabled: !!id,
    ...options,
  });
}

// Get user sessions
export function useUserSessions(
  id: string,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: userKeys.sessions(id),
    queryFn: () => userService.getUserSessions(id),
    enabled: !!id,
    ...options,
  });
}

// Search users
export function useSearchUsers(
  query: string,
  filters?: {
    role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    limit?: number;
  },
  options?: UseQueryOptions<User[], Error>
) {
  return useQuery({
    queryKey: userKeys.search(query, filters),
    queryFn: () => userService.searchUsers(query, filters),
    enabled: !!query && query.length >= 2,
    ...options,
  });
}

// Mutations
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      role: 'admin' | 'super_admin';
      password: string;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      pushNotifications?: boolean;
    }) => userService.createUser(data),
    onSuccess: () => {
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (data, { id }) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(id), data);
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}


export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: (data, id) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(id), data);
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      userService.deactivateUser(id, reason),
    onSuccess: (data, { id }) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(id), data);
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, duration }: { id: string; reason: string; duration?: number }) =>
      userService.suspendUser(id, reason, duration),
    onSuccess: (data, { id }) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(id), data);
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.unsuspendUser(id),
    onSuccess: (data, id) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(id), data);
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useVerifyUserEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.verifyEmail(id),
    onSuccess: (data, id) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(id), data);
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useVerifyUserPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.verifyPhone(id),
    onSuccess: (data, id) => {
      // Update the user detail cache
      queryClient.setQueryData(userKeys.detail(id), data);
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => userService.resetPassword(id),
  });
}

export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userIds: string[];
      action: 'activate' | 'deactivate' | 'suspend' | 'delete';
      reason?: string;
      duration?: number;
    }) => userService.bulkUpdateUsers(data),
    onSuccess: () => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      // Remove the user from all caches
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.removeQueries({ queryKey: userKeys.sessions(id) });
      // Invalidate the users list to refresh it
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: string }) =>
      userService.revokeUserSession(userId, sessionId),
    onSuccess: (_, { userId }) => {
      // Invalidate user sessions
      queryClient.invalidateQueries({ queryKey: userKeys.sessions(userId) });
    },
  });
}