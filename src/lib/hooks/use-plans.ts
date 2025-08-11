import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  planService, 
  CreatePlanDto, 
  UpdatePlanDto 
} from '@/lib/api/services/plan.service';
import { Plan, PlanFilters } from '@/lib/api/types';

// Query Keys
export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters: PlanFilters) => [...planKeys.lists(), filters] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  stats: () => [...planKeys.all, 'stats'] as const,
  forVendors: () => [...planKeys.all, 'for-vendors'] as const,
};

// Queries
export function usePlans(filters?: PlanFilters, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: planKeys.list(filters || {}),
    queryFn: () => planService.getPlans(filters),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    ...options,
  });
}

export function usePlan(id: string, options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: () => planService.getPlan(id),
    enabled: !!session?.accessToken && !!id && (options?.enabled !== false),
    ...options,
  });
}

export function usePlanStats(options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: planKeys.stats(),
    queryFn: () => planService.getPlanStats(),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    ...options,
  });
}

export function usePlansForVendors(options?: any) {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: planKeys.forVendors(),
    queryFn: () => planService.getPlansForVendors(),
    enabled: !!session?.accessToken && (options?.enabled !== false),
    ...options,
  });
}

// Mutations
export function useCreatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePlanDto) => planService.createPlan(data),
    onSuccess: (newPlan) => {
      // Invalidate plans list
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
      queryClient.invalidateQueries({ queryKey: planKeys.forVendors() });
      
      toast.success('Plan created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create plan';
      toast.error(message);
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) => 
      planService.updatePlan(id, data),
    onSuccess: (updatedPlan, { id }) => {
      // Update specific plan in cache
      queryClient.setQueryData(planKeys.detail(id), updatedPlan);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
      queryClient.invalidateQueries({ queryKey: planKeys.forVendors() });
      
      toast.success('Plan updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update plan';
      toast.error(message);
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => planService.deletePlan(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: planKeys.detail(id) });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
      queryClient.invalidateQueries({ queryKey: planKeys.forVendors() });
      
      toast.success('Plan deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete plan';
      toast.error(message);
    },
  });
}

export function useTogglePlanStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => planService.togglePlanStatus(id),
    onSuccess: (updatedPlan, id) => {
      // Update specific plan in cache
      queryClient.setQueryData(planKeys.detail(id), updatedPlan);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
      queryClient.invalidateQueries({ queryKey: planKeys.forVendors() });
      
      const status = updatedPlan.isActive ? 'activated' : 'deactivated';
      toast.success(`Plan ${status} successfully`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to toggle plan status';
      toast.error(message);
    },
  });
}

export function useBulkUpdatePlans() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { planIds: string[]; action: "delete" | "activate" | "deactivate" | "feature" | "unfeature" }) => 
      planService.bulkUpdatePlans(data),
    onSuccess: (result) => {
      // Invalidate all plan queries
      queryClient.invalidateQueries({ queryKey: planKeys.all });
      
      const { success, failed } = result;
      if (success > 0) {
        toast.success(`${success} plans updated successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} plans failed to update`);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Bulk update failed';
      toast.error(message);
    },
  });
}

export function useReorderPlans() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { planId: string; newSortOrder: number }[]) => 
      planService.reorderPlans(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.forVendors() });
      
      toast.success('Plans reordered successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to reorder plans';
      toast.error(message);
    },
  });
}