import { apiClient } from '../client';
import { Plan, PlanFilters, PaginatedResponse } from '../types';

export interface CreatePlanDto {
  name: string;
  description?: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  currency?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  maxProducts?: number;
  maxOrders?: number;
  commissionRate?: number;
  color?: string;
  icon?: string;
  badge?: string;
  maxImages?: number;
  maxVideos?: number;
  maxStorageGB?: number;
  maxSupportTickets?: number;
  hasAnalytics?: boolean;
  hasAPIAccess?: boolean;
  hasPrioritySupport?: boolean;
  hasCustomBranding?: boolean;
  hasAdvancedReporting?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {
  id?: string;
}

export class PlanService {
  // List plans with filters and pagination
  async getPlans(filters?: PlanFilters): Promise<PaginatedResponse<Plan>> {
    const response = await apiClient.get<any>('/plans', filters);
    // Handle the admin service response format: { success: true, data: [], meta: {} }
    if (response.success && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.meta?.total || response.data.length,
        page: response.meta?.page || 1,
        pages: response.meta?.pages || Math.ceil((response.meta?.total || response.data.length) / 20),
      };
    }
    // Fallback for unexpected response format
    return {
      data: [],
      total: 0,
      page: 1,
      pages: 1,
    };
  }

  // Get single plan by ID
  async getPlan(id: string): Promise<Plan> {
    const response = await apiClient.get<any>(`/plans/${id}`);
    return response.success ? response.data : response;
  }

  // Create new plan
  async createPlan(data: CreatePlanDto): Promise<Plan> {
    const response = await apiClient.post<any>('/plans', data);
    return response.success ? response.data : response;
  }

  // Update plan
  async updatePlan(id: string, data: UpdatePlanDto): Promise<Plan> {
    const response = await apiClient.put<any>(`/plans/${id}`, data);
    return response.success ? response.data : response;
  }

  // Delete plan
  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/plans/${id}`);
  }

  // Toggle plan status
  async togglePlanStatus(id: string): Promise<Plan> {
    const response = await apiClient.patch<any>(`/plans/${id}/toggle-status`);
    return response.success ? response.data : response;
  }

  // Get plan statistics
  async getPlanStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    featured: number;
    totalSubscribers: number;
    totalRevenue: number;
    averagePrice: number;
    popularBillingCycle: string;
  }> {
    const response = await apiClient.get<any>('/plans/statistics');
    return response.success ? response.data : response;
  }

  // Get plans for vendor subscription
  async getPlansForVendors(): Promise<Plan[]> {
    const response = await apiClient.get<any>('/plans/for-vendors');
    return response.success ? response.data : (Array.isArray(response) ? response : []);
  }

  // Bulk operations
  async bulkUpdatePlans(data: {
    planIds: string[];
    action: 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature';
  }): Promise<{ success: number; failed: number; errors: any[] }> {
    const response = await apiClient.post<any>('/plans/bulk-update', data);
    return response.success ? response.data : response;
  }

  // Reorder plans
  async reorderPlans(data: { planId: string; newSortOrder: number }[]): Promise<void> {
    await apiClient.post('/plans/reorder', { plans: data });
  }
}

export const planService = new PlanService();