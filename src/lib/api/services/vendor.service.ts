import { apiClient } from '../client';
import { Vendor, VendorFilters, VendorDocument, VendorsPaginatedResponse } from '../types';

export class VendorService {
  // List vendors with filters and pagination
  async getVendors(filters?: VendorFilters): Promise<VendorsPaginatedResponse> {
    const response = await apiClient.get<any>('/vendors', filters);
    // API client's handleResponse already extracts the data from success responses
    return {
      vendors: response.data || response.vendors || [],
      total: response.total || 0,
      page: response.page || 1,
      pages: response.pages || Math.ceil((response.total || 0) / (filters?.limit || 20)),
    };
  }

  // Get single vendor by ID
  async getVendor(id: string): Promise<Vendor> {
    return apiClient.get<Vendor>(`/vendors/${id}`);
  }

  // Update vendor
  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    return apiClient.put<Vendor>(`/vendors/${id}`, data);
  }

  // Approve vendor
  async approveVendor(id: string, data?: {
    notes?: string;
    conditions?: string[];
  }): Promise<Vendor> {
    return apiClient.post<Vendor>(`/vendors/${id}/approve`, {
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
    return apiClient.post<Vendor>(`/vendors/${id}/approve`, {
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
    return apiClient.post<Vendor>(`/vendors/${id}/suspend`, data);
  }

  // Reactivate vendor
  async reactivateVendor(id: string, notes?: string): Promise<Vendor> {
    return apiClient.post<Vendor>(`/vendors/${id}/reactivate`, { notes });
  }

  // Get vendor documents
  async getVendorDocuments(vendorId: string): Promise<VendorDocument[]> {
    return apiClient.get<VendorDocument[]>(`/vendors/${vendorId}/documents`);
  }

  // Approve document
  async approveDocument(vendorId: string, documentId: string, notes?: string): Promise<VendorDocument> {
    return apiClient.post<VendorDocument>(
      `/vendors/${vendorId}/documents/${documentId}/approve`,
      { notes }
    );
  }

  // Reject document
  async rejectDocument(vendorId: string, documentId: string, reason: string): Promise<VendorDocument> {
    return apiClient.post<VendorDocument>(
      `/vendors/${vendorId}/documents/${documentId}/reject`,
      { reason }
    );
  }

  // Request additional documents
  async requestDocuments(vendorId: string, data: {
    documentTypes: string[];
    message: string;
    deadline?: string;
  }): Promise<void> {
    return apiClient.post(`/vendors/${vendorId}/request-documents`, data);
  }

  // Get vendor performance
  async getVendorPerformance(vendorId: string, params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }) {
    return apiClient.get(`/vendors/${vendorId}/performance`, params);
  }

  // Get vendor orders
  async getVendorOrders(vendorId: string, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get(`/vendors/${vendorId}/orders`, params);
  }

  // Get vendor products
  async getVendorProducts(vendorId: string, params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get(`/vendors/${vendorId}/products`, params);
  }

  // Get vendor reviews
  async getVendorReviews(vendorId: string, params?: {
    rating?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get(`/vendors/${vendorId}/reviews`, params);
  }

  // Bulk operations
  async bulkUpdateVendors(data: {
    vendorIds: string[];
    action: 'approve' | 'reject' | 'suspend' | 'reactivate';
    reason?: string;
    notes?: string;
  }): Promise<{ success: number; failed: number; errors: any[] }> {
    return apiClient.post('/vendors/bulk-update', data);
  }

  // Export vendors
  async exportVendors(filters?: VendorFilters & { format: 'csv' | 'excel' }): Promise<Blob> {
    return apiClient.get('/vendors/export', filters);
  }

  // Get vendor statistics
  async getVendorStats() {
    const response = await apiClient.get<any>('/vendors/statistics');
    // API client's handleResponse already extracts the data from success responses
    
    // Handle both possible response formats
    const data = response.data || response;
    
    // Transform API response to match UI expectations
    return {
      totalVendors: data.total || 0,
      approvedVendors: (data.byStatus?.verified || 0) + (data.byStatus?.approved || 0),
      pendingVendors: (data.byStatus?.pending || 0) + (data.byStatus?.under_review || 0),
      suspendedVendors: (data.byStatus?.suspended || 0) + (data.byStatus?.rejected || 0),
      // Calculate growth percentages (mock for now since API doesn't provide historical data)
      vendorGrowth: data.growth?.total || 0,
      approvedGrowth: data.growth?.approved || 0,
      pendingGrowth: data.growth?.pending || 0,
      suspendedGrowth: data.growth?.suspended || 0,
      recentActivity: data.recentActivity || [],
    };
  }

  // Search vendors
  async searchVendors(query: string, filters?: {
    status?: 'pending' | 'verified' | 'under_review' | 'approved' | 'rejected' | 'suspended';
    businessType?: string;
    limit?: number;
  }): Promise<Vendor[]> {
    return apiClient.get<Vendor[]>('/vendors/search', {
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
    return apiClient.post(`/vendors/${vendorId}/message`, data);
  }

  // Get vendor verification history
  async getVerificationHistory(vendorId: string) {
    return apiClient.get(`/vendors/${vendorId}/verification-history`);
  }

  // Update vendor commission
  async updateCommission(vendorId: string, data: {
    commissionRate: number;
    effectiveDate?: string;
    reason?: string;
  }): Promise<void> {
    return apiClient.post(`/vendors/${vendorId}/commission`, data);
  }

  // Get pending approvals
  async getPendingApprovals(params?: {
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    documentType?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get('/vendors/pending-approvals', params);
  }
}

export const vendorService = new VendorService();