import { apiClient } from '../client';
import { PaginatedResponse } from '../types';

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contactPerson: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  commissionRate: number;
  documentsUploaded: boolean;
  verificationNotes?: string;
  approvedAt?: string;
  rejectedAt?: string;
  suspendedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional fields from user relation
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLoginAt?: string;
  };
  
  // Analytics fields
  totalSales?: number;
  totalRevenue?: number;
  totalProducts?: number;
  averageRating?: number;
  totalOrders?: number;
}

export interface VendorFilters {
  status?: string;
  tier?: string;
  businessType?: string;
  search?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VendorUpdateData {
  businessName?: string;
  businessType?: string;
  businessAddress?: Partial<Vendor['businessAddress']>;
  contactPerson?: Partial<Vendor['contactPerson']>;
  status?: Vendor['status'];
  tier?: Vendor['tier'];
  commissionRate?: number;
  verificationNotes?: string;
}

export interface VendorStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  basic: number;
  premium: number;
  enterprise: number;
  totalRevenue: number;
  averageCommissionRate: number;
  topVendors: Vendor[];
  recentVendors: Vendor[];
}

export class VendorsService {
  // Get vendors with pagination and filtering
  async getVendors(filters?: VendorFilters): Promise<PaginatedResponse<Vendor>> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.businessType) params.append('businessType', filters.businessType);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.verified !== undefined) params.append('verified', String(filters.verified));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return apiClient.get<PaginatedResponse<Vendor>>(`/vendors?${params.toString()}`);
  }

  // Get vendor by ID
  async getVendorById(id: string): Promise<Vendor> {
    return apiClient.get<Vendor>(`/vendors/${id}`);
  }

  // Update vendor status
  async updateVendorStatus(id: string, status: Vendor['status'], notes?: string): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${id}/status`, { status, notes });
  }

  // Update vendor tier
  async updateVendorTier(id: string, tier: Vendor['tier']): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${id}/tier`, { tier });
  }

  // Update vendor details
  async updateVendor(id: string, data: VendorUpdateData): Promise<Vendor> {
    return apiClient.patch<Vendor>(`/vendors/${id}`, data);
  }

  // Get vendor statistics
  async getVendorStatistics(): Promise<VendorStatistics> {
    try {
      // Get stats from admin service
      const [stats, vendorCount] = await Promise.all([
        apiClient.get('/vendors/analytics/statistics'),
        apiClient.get('/vendors/analytics/count')
      ]);

      return {
        total: vendorCount.count || 0,
        pending: stats.pendingVendors || 0,
        approved: stats.approvedVendors || 0,
        rejected: stats.rejectedVendors || 0,
        suspended: stats.suspendedVendors || 0,
        basic: stats.basicTierVendors || 0,
        premium: stats.premiumTierVendors || 0,
        enterprise: stats.enterpriseTierVendors || 0,
        totalRevenue: stats.totalVendorRevenue || 0,
        averageCommissionRate: stats.averageCommissionRate || 0,
        topVendors: stats.topVendors || [],
        recentVendors: stats.recentVendors || [],
      };
    } catch (error) {
      console.error('Failed to fetch vendor statistics:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
        basic: 0,
        premium: 0,
        enterprise: 0,
        totalRevenue: 0,
        averageCommissionRate: 0,
        topVendors: [],
        recentVendors: [],
      };
    }
  }

  // Get vendors by status
  async getVendorsByStatus(status: Vendor['status'], limit?: number): Promise<Vendor[]> {
    const params = new URLSearchParams();
    params.append('status', status);
    if (limit) params.append('limit', String(limit));

    const response = await this.getVendors({ status, limit });
    return response.data || [];
  }

  // Get top performing vendors
  async getTopVendors(limit: number = 10): Promise<Vendor[]> {
    try {
      const stats = await this.getVendorStatistics();
      return stats.topVendors.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch top vendors:', error);
      return [];
    }
  }

  // Bulk operations
  async bulkUpdateVendorStatus(vendorIds: string[], status: Vendor['status'], notes?: string): Promise<{ updated: number }> {
    return apiClient.patch('/vendors/bulk/status', { vendorIds, status, notes });
  }

  async bulkUpdateVendorTier(vendorIds: string[], tier: Vendor['tier']): Promise<{ updated: number }> {
    return apiClient.patch('/vendors/bulk/tier', { vendorIds, tier });
  }

  // Approve vendor
  async approveVendor(id: string, notes?: string): Promise<Vendor> {
    return this.updateVendorStatus(id, 'APPROVED', notes);
  }

  // Reject vendor
  async rejectVendor(id: string, reason: string): Promise<Vendor> {
    return this.updateVendorStatus(id, 'REJECTED', reason);
  }

  // Suspend vendor
  async suspendVendor(id: string, reason: string): Promise<Vendor> {
    return this.updateVendorStatus(id, 'SUSPENDED', reason);
  }

  // Reactivate vendor
  async reactivateVendor(id: string): Promise<Vendor> {
    return this.updateVendorStatus(id, 'APPROVED', 'Reactivated by admin');
  }
}

export const vendorsService = new VendorsService();