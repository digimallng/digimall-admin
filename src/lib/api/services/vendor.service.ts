import { apiClient } from '../client';
import { Vendor, VendorFilters, VendorDocument, VendorsPaginatedResponse } from '../types';

export class VendorService {
  // List vendors with filters and pagination
  async getVendors(filters?: VendorFilters): Promise<VendorsPaginatedResponse> {
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

    const response = await apiClient.get<any>(`/api/proxy/admin/vendors?${params.toString()}`);
    return {
      vendors: response.data || response.vendors || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || Math.ceil((response.total || 0) / (filters?.limit || 20)),
    };
  }

  // Get single vendor by ID
  async getVendor(id: string): Promise<Vendor> {
    return apiClient.get<Vendor>(`/api/proxy/admin/vendors/${id}`);
  }

  // Update vendor
  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    return apiClient.put<Vendor>(`/api/proxy/admin/vendors/${id}`, data);
  }

  // Approve vendor
  async approveVendor(id: string, data?: {
    notes?: string;
    conditions?: string[];
  }): Promise<Vendor> {
    return apiClient.post<Vendor>(`/api/proxy/admin/vendors/${id}/approve`, {
      decision: 'approve',
      ...data
    });
  }

  // Reject vendor
  async rejectVendor(id: string, data: {
    reason: string;
    feedback?: string;
    blockedFields?: string[];
  }): Promise<Vendor> {
    return apiClient.post<Vendor>(`/api/proxy/admin/vendors/${id}/approve`, {
      decision: 'reject',
      ...data
    });
  }

  // Suspend vendor
  async suspendVendor(id: string, data: {
    reason: string;
    duration?: number; // in days
    notifyCustomers?: boolean;
  }): Promise<Vendor> {
    return apiClient.post<Vendor>(`/api/proxy/admin/vendors/${id}/suspend`, data);
  }

  // Reactivate vendor
  async reactivateVendor(id: string, notes?: string): Promise<Vendor> {
    return apiClient.post<Vendor>(`/api/proxy/admin/vendors/${id}/reactivate`, { notes });
  }

  // Get vendor documents
  async getVendorDocuments(vendorId: string): Promise<VendorDocument[]> {
    return apiClient.get<VendorDocument[]>(`/api/proxy/admin/vendors/${vendorId}/documents`);
  }

  // Approve document
  async approveDocument(vendorId: string, documentId: string, notes?: string): Promise<VendorDocument> {
    return apiClient.post<VendorDocument>(
      `/api/proxy/admin/vendors/${vendorId}/documents/${documentId}/approve`,
      { notes }
    );
  }

  // Reject document
  async rejectDocument(vendorId: string, documentId: string, reason: string): Promise<VendorDocument> {
    return apiClient.post<VendorDocument>(
      `/api/proxy/admin/vendors/${vendorId}/documents/${documentId}/reject`,
      { reason }
    );
  }

  // Request additional documents
  async requestDocuments(vendorId: string, data: {
    documentTypes: string[];
    message: string;
    deadline?: string;
  }): Promise<void> {
    return apiClient.post(`/api/proxy/admin/vendors/${vendorId}/request-documents`, data);
  }

  // Get vendor performance
  async getVendorPerformance(vendorId: string, params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }) {
    return apiClient.get(`/api/proxy/admin/vendors/${vendorId}/performance`, params);
  }

  // Get vendor orders
  async getVendorOrders(vendorId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get(`/api/proxy/admin/vendors/${vendorId}/orders`, params);
  }

  // Get vendor products
  async getVendorProducts(vendorId: string, params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get(`/api/proxy/admin/vendors/${vendorId}/products`, params);
  }

  // Get vendor reviews
  async getVendorReviews(vendorId: string, params?: {
    rating?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get(`/api/proxy/admin/vendors/${vendorId}/reviews`, params);
  }

  // Bulk operations
  async bulkUpdateVendors(data: {
    vendorIds: string[];
    action: 'approve' | 'reject' | 'suspend' | 'reactivate';
    reason?: string;
    notes?: string;
  }): Promise<{ success: number; failed: number; errors: any[] }> {
    return apiClient.post('/api/proxy/admin/vendors/bulk-update', data);
  }

  // Export vendors
  async exportVendors(filters?: VendorFilters & { format: 'csv' | 'excel' }): Promise<Blob> {
    return apiClient.get('/api/proxy/admin/vendors/export', filters);
  }

  // Get vendor statistics
  async getVendorStats() {
    try {
      // Get stats from admin service
      const [stats, vendorCount] = await Promise.all([
        apiClient.get('/api/proxy/admin/vendors/statistics'),
        apiClient.get('/api/proxy/admin/vendors/analytics/count')
      ]);

      return {
        totalVendors: vendorCount.count || 0,
        approvedVendors: stats.approvedVendors || 0,
        pendingVendors: stats.pendingVendors || 0,
        suspendedVendors: stats.suspendedVendors || 0,
        rejectedVendors: stats.rejectedVendors || 0,
        basicTierVendors: stats.basicTierVendors || 0,
        premiumTierVendors: stats.premiumTierVendors || 0,
        enterpriseTierVendors: stats.enterpriseTierVendors || 0,
        totalVendorRevenue: stats.totalVendorRevenue || 0,
        averageCommissionRate: stats.averageCommissionRate || 0,
        topVendors: stats.topVendors || [],
        recentVendors: stats.recentVendors || [],
        // Calculate growth percentages (use 0 as fallback)
        vendorGrowth: 0,
        approvedGrowth: 0,
        pendingGrowth: 0,
        suspendedGrowth: 0,
      };
    } catch (error) {
      console.error('Failed to fetch vendor statistics:', error);
      return {
        totalVendors: 0,
        approvedVendors: 0,
        pendingVendors: 0,
        suspendedVendors: 0,
        rejectedVendors: 0,
        basicTierVendors: 0,
        premiumTierVendors: 0,
        enterpriseTierVendors: 0,
        totalVendorRevenue: 0,
        averageCommissionRate: 0,
        topVendors: [],
        recentVendors: [],
        vendorGrowth: 0,
        approvedGrowth: 0,
        pendingGrowth: 0,
        suspendedGrowth: 0,
      };
    }
  }

  // Search vendors
  async searchVendors(query: string, filters?: {
    status?: 'pending' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'suspended';
    businessType?: string;
    limit?: number;
  }): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>('/api/proxy/admin/vendors/search', {
      q: query,
      ...filters
    });
  }

  // Send message to vendor
  async sendMessage(vendorId: string, data: {
    subject: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT';
    channels: ('EMAIL' | 'SMS' | 'IN_APP')[];
  }): Promise<void> {
    return apiClient.post(`/api/proxy/admin/vendors/${vendorId}/message`, data);
  }

  // Get vendor verification history
  async getVerificationHistory(vendorId: string) {
    return apiClient.get(`/api/proxy/admin/vendors/${vendorId}/verification-history`);
  }

  // Update vendor commission
  async updateCommission(vendorId: string, data: {
    commissionRate: number;
    effectiveDate?: string;
    reason?: string;
  }): Promise<void> {
    return apiClient.post(`/api/proxy/admin/vendors/${vendorId}/commission`, data);
  }

  // Get pending vendors (specific endpoint from backend)
  async getPendingVendors() {
    return apiClient.get('/api/proxy/admin/vendors/pending');
  }

  // Get pending approvals
  async getPendingApprovals(params?: {
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    documentType?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get('/api/proxy/admin/vendors/pending-approvals', params);
  }

  // Get all vendors performance data for performance dashboard
  async getAllVendorsPerformance(params?: {
    status?: string;
    category?: string;
    sortBy?: 'sales' | 'orders' | 'rating' | 'growth';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    page?: number;
  }) {
    try {
      const [vendorsResponse, analyticsResponse] = await Promise.all([
        this.getVendors({
          status: params?.status as any,
          limit: params?.limit || 100,
          page: params?.page || 1,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder
        }),
        apiClient.get('/api/proxy/admin/analytics/vendors')
      ]);

      // Get individual performance data for each vendor
      const vendorsWithPerformance = await Promise.all(
        vendorsResponse.vendors.map(async (vendor: any) => {
          try {
            const performance = await this.getVendorPerformance(vendor.id);
            return this.transformVendorPerformanceData(vendor, performance);
          } catch (error) {
            console.warn(`Failed to fetch performance for vendor ${vendor.id}:`, error);
            return this.transformVendorPerformanceData(vendor, null);
          }
        })
      );

      return {
        vendors: vendorsWithPerformance,
        total: vendorsResponse.total,
        page: vendorsResponse.page,
        pages: vendorsResponse.pages
      };
    } catch (error) {
      console.error('Failed to fetch vendors performance data:', error);
      return {
        vendors: [],
        total: 0,
        page: 1,
        pages: 0
      };
    }
  }

  // Get platform-wide vendor metrics for dashboard
  async getPlatformVendorMetrics() {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        this.getVendorStats(),
        apiClient.get('/api/proxy/admin/analytics/vendors')
      ]);

      return {
        totalVendors: statsResponse.totalVendors || 0,
        activeVendors: statsResponse.approvedVendors || 0,
        totalSales: analyticsResponse.totalRevenue || statsResponse.totalVendorRevenue || 0,
        avgRating: analyticsResponse.averageRating || 0,
        totalOrders: analyticsResponse.totalOrders || 0,
        avgFulfillmentRate: analyticsResponse.avgFulfillmentRate || 0,
        vendorGrowth: statsResponse.vendorGrowth || 0,
        salesGrowth: analyticsResponse.growthRate || 0
      };
    } catch (error) {
      console.error('Failed to fetch platform vendor metrics:', error);
      return {
        totalVendors: 0,
        activeVendors: 0,
        totalSales: 0,
        avgRating: 0,
        totalOrders: 0,
        avgFulfillmentRate: 0,
        vendorGrowth: 0,
        salesGrowth: 0
      };
    }
  }

  // Transform vendor and performance data to match the expected interface
  private transformVendorPerformanceData(vendor: any, performance: any) {
    return {
      id: vendor.id || vendor._id || '',
      vendorId: vendor.vendorId || vendor.id || '',
      vendorName: vendor.ownerName || vendor.contactPerson || vendor.name || 'Unknown',
      businessName: vendor.businessName || vendor.name || 'Unknown Business',
      category: vendor.category || vendor.businessCategory || 'General',
      joinDate: vendor.createdAt ? new Date(vendor.createdAt) : new Date(),
      lastActive: vendor.lastLogin ? new Date(vendor.lastLogin) : new Date(),
      status: this.mapVendorStatus(vendor.status),
      
      // Performance Metrics from performance API or vendor data
      totalSales: performance?.totalRevenue || vendor.totalRevenue || 0,
      totalOrders: performance?.totalOrders || vendor.totalOrders || 0,
      totalProducts: performance?.totalProducts || vendor.totalProducts || 0,
      avgOrderValue: performance?.avgOrderValue || (performance?.totalRevenue / (performance?.totalOrders || 1)) || 0,
      conversionRate: performance?.conversionRate || vendor.conversionRate || 0,
      customerRating: performance?.averageRating || vendor.rating || 0,
      totalReviews: performance?.totalReviews || vendor.totalReviews || 0,
      responseTime: performance?.avgResponseTime || vendor.responseTime || 0,
      fulfillmentRate: performance?.fulfillmentRate || vendor.fulfillmentRate || 0,
      returnRate: performance?.returnRate || vendor.returnRate || 0,

      // Growth Metrics
      salesGrowth: performance?.salesGrowth || vendor.salesGrowth || 0,
      orderGrowth: performance?.orderGrowth || vendor.orderGrowth || 0,
      ratingTrend: this.calculateRatingTrend(performance?.ratingTrend || vendor.ratingTrend || 0),

      // Compliance
      policyViolations: performance?.policyViolations || vendor.policyViolations || 0,
      disputeCount: performance?.disputeCount || vendor.disputeCount || 0,
      onTimeDelivery: performance?.onTimeDeliveryRate || vendor.onTimeDeliveryRate || 0,

      // Financial
      commissionEarned: performance?.commissionEarned || vendor.commissionEarned || 0,
      pendingPayouts: performance?.pendingPayouts || vendor.pendingPayouts || 0,

      // Contact
      email: vendor.email || vendor.contactEmail || '',
      phone: vendor.phone || vendor.contactPhone || '',
      location: vendor.address?.city || vendor.location || vendor.city || ''
    };
  }

  // Map backend status to expected status values
  private mapVendorStatus(status: string): 'active' | 'inactive' | 'suspended' | 'pending' {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
      case 'verified':
        return 'active';
      case 'suspended':
      case 'blocked':
        return 'suspended';
      case 'pending':
      case 'under_review':
        return 'pending';
      default:
        return 'inactive';
    }
  }

  // Calculate rating trend from numeric value
  private calculateRatingTrend(trend: number | string): 'up' | 'down' | 'stable' {
    if (typeof trend === 'string') return trend as any;
    if (trend > 0) return 'up';
    if (trend < 0) return 'down';
    return 'stable';
  }
}

export const vendorService = new VendorService();