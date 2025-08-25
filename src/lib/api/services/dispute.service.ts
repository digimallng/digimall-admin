import { apiClient } from '../client';
import type {
  Dispute,
  DisputesResponse,
  DisputeFilter,
  CreateDisputeRequest,
  UpdateDisputeRequest,
  ResolveDisputeRequest,
  DisputeResponseRequest,
  EscalateDisputeRequest,
  BulkDisputeActionRequest,
  DisputeStatsRequest,
  DisputeStats,
  DisputeAnalytics,
  DisputeSettings,
  UpdateDisputeSettingsRequest,
  DisputeActionResponse,
  BulkActionResponse,
  FileUploadResponse,
} from '../types/dispute.types';

export class DisputeService {
  private readonly basePath = '/disputes';

  // Get disputes with filters and pagination
  async getDisputes(filter: DisputeFilter = {}): Promise<DisputesResponse> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());
      
      // Add date filters
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      
      // Add ID filters
      if (filter.customerId) params.append('customerId', filter.customerId);
      if (filter.vendorId) params.append('vendorId', filter.vendorId);
      if (filter.orderId) params.append('orderId', filter.orderId);
      if (filter.assignedTo) params.append('assignedTo', filter.assignedTo);
      
      // Add enum filters (handle arrays)
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        statuses.forEach(status => params.append('status', status));
      }
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type : [filter.type];
        types.forEach(type => params.append('type', type));
      }
      if (filter.priority) {
        const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
        priorities.forEach(priority => params.append('priority', priority));
      }
      
      // Add search and other filters
      if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
      if (filter.tags?.length) {
        filter.tags.forEach(tag => params.append('tags', tag));
      }
      if (filter.minAmount) params.append('minAmount', filter.minAmount.toString());
      if (filter.maxAmount) params.append('maxAmount', filter.maxAmount.toString());
      
      // Add sorting
      if (filter.sortBy) params.append('sortBy', filter.sortBy);
      if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

      const response = await apiClient.get<DisputesResponse>(
        `${this.basePath}?${params.toString()}`
      );

      return {
        disputes: response.disputes || [],
        total: response.total || 0,
        page: response.page || filter.page || 1,
        limit: response.limit || filter.limit || 20,
        totalPages: response.totalPages || 0,
        hasNext: response.hasNext || false,
        hasPrev: response.hasPrev || false,
      };
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      throw error;
    }
  }

  // Get single dispute by ID with timeline
  async getDisputeById(disputeId: string): Promise<Dispute> {
    try {
      return await apiClient.get<Dispute>(`${this.basePath}/${disputeId}`);
    } catch (error) {
      console.error(`Failed to fetch dispute ${disputeId}:`, error);
      throw error;
    }
  }

  // Create new dispute
  async createDispute(data: CreateDisputeRequest): Promise<DisputeActionResponse> {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('orderId', data.orderId);
      formData.append('customerId', data.customerId);
      formData.append('vendorId', data.vendorId);
      formData.append('type', data.type);
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      
      if (data.priority) formData.append('priority', data.priority);
      if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
      
      // Add files
      if (data.evidence?.length) {
        data.evidence.forEach((file, index) => {
          formData.append(`evidence[${index}]`, file);
        });
      }

      return await apiClient.post<DisputeActionResponse>(this.basePath, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.error('Failed to create dispute:', error);
      throw error;
    }
  }

  // Update dispute details
  async updateDispute(
    disputeId: string, 
    data: UpdateDisputeRequest
  ): Promise<DisputeActionResponse> {
    try {
      return await apiClient.put<DisputeActionResponse>(
        `${this.basePath}/${disputeId}`, 
        data
      );
    } catch (error) {
      console.error(`Failed to update dispute ${disputeId}:`, error);
      throw error;
    }
  }

  // Resolve dispute with specified resolution
  async resolveDispute(
    disputeId: string, 
    data: ResolveDisputeRequest
  ): Promise<DisputeActionResponse> {
    try {
      return await apiClient.post<DisputeActionResponse>(
        `${this.basePath}/${disputeId}/resolve`, 
        data
      );
    } catch (error) {
      console.error(`Failed to resolve dispute ${disputeId}:`, error);
      throw error;
    }
  }

  // Add response to dispute
  async addDisputeResponse(
    disputeId: string, 
    data: DisputeResponseRequest
  ): Promise<DisputeActionResponse> {
    try {
      const formData = new FormData();
      formData.append('message', data.message);
      if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());
      if (data.responseType) formData.append('responseType', data.responseType);
      
      if (data.attachments?.length) {
        data.attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      return await apiClient.post<DisputeActionResponse>(
        `${this.basePath}/${disputeId}/response`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    } catch (error) {
      console.error(`Failed to add response to dispute ${disputeId}:`, error);
      throw error;
    }
  }

  // Escalate dispute to higher level
  async escalateDispute(
    disputeId: string, 
    data: EscalateDisputeRequest
  ): Promise<DisputeActionResponse> {
    try {
      return await apiClient.post<DisputeActionResponse>(
        `${this.basePath}/${disputeId}/escalate`, 
        data
      );
    } catch (error) {
      console.error(`Failed to escalate dispute ${disputeId}:`, error);
      throw error;
    }
  }

  // Perform bulk action on disputes
  async bulkDisputeAction(data: BulkDisputeActionRequest): Promise<BulkActionResponse> {
    try {
      return await apiClient.put<BulkActionResponse>(
        `${this.basePath}/bulk-action`, 
        data
      );
    } catch (error) {
      console.error('Failed to perform bulk dispute action:', error);
      throw error;
    }
  }

  // Get dispute statistics
  async getDisputeStats(data: DisputeStatsRequest): Promise<DisputeStats> {
    try {
      return await apiClient.post<DisputeStats>(`${this.basePath}/stats`, data);
    } catch (error) {
      console.error('Failed to fetch dispute stats:', error);
      throw error;
    }
  }

  // Get current dispute settings
  async getDisputeSettings(): Promise<DisputeSettings> {
    try {
      const response = await apiClient.get<{ settings: DisputeSettings }>(
        `${this.basePath}/settings/current`
      );
      return response.settings;
    } catch (error) {
      console.error('Failed to fetch dispute settings:', error);
      throw error;
    }
  }

  // Update dispute settings
  async updateDisputeSettings(data: UpdateDisputeSettingsRequest): Promise<DisputeActionResponse> {
    try {
      return await apiClient.put<DisputeActionResponse>(
        `${this.basePath}/settings`, 
        data
      );
    } catch (error) {
      console.error('Failed to update dispute settings:', error);
      throw error;
    }
  }

  // Analytics Methods

  // Get dispute resolution trend analytics
  async getResolutionTrends(data: DisputeStatsRequest): Promise<DisputeAnalytics['resolutionTrends']> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', data.startDate);
      params.append('endDate', data.endDate);
      if (data.vendorId) params.append('vendorId', data.vendorId);
      if (data.type) params.append('type', data.type);

      return await apiClient.get<DisputeAnalytics['resolutionTrends']>(
        `${this.basePath}/analytics/resolution-trends?${params.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch resolution trends:', error);
      throw error;
    }
  }

  // Get vendor dispute performance analytics
  async getVendorDisputePerformance(data: DisputeStatsRequest): Promise<DisputeAnalytics['vendorPerformance']> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', data.startDate);
      params.append('endDate', data.endDate);
      if (data.vendorId) params.append('vendorId', data.vendorId);
      if (data.type) params.append('type', data.type);

      return await apiClient.get<DisputeAnalytics['vendorPerformance']>(
        `${this.basePath}/analytics/vendor-performance?${params.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch vendor dispute performance:', error);
      throw error;
    }
  }

  // Get common dispute issues analytics
  async getCommonIssues(data: DisputeStatsRequest): Promise<DisputeAnalytics['commonIssues']> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', data.startDate);
      params.append('endDate', data.endDate);
      if (data.vendorId) params.append('vendorId', data.vendorId);
      if (data.type) params.append('type', data.type);

      return await apiClient.get<DisputeAnalytics['commonIssues']>(
        `${this.basePath}/analytics/common-issues?${params.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch common issues:', error);
      throw error;
    }
  }

  // Get resolution performance metrics
  async getResolutionPerformance(data: DisputeStatsRequest): Promise<DisputeAnalytics['resolutionPerformance']> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', data.startDate);
      params.append('endDate', data.endDate);
      if (data.vendorId) params.append('vendorId', data.vendorId);
      if (data.type) params.append('type', data.type);

      return await apiClient.get<DisputeAnalytics['resolutionPerformance']>(
        `${this.basePath}/analytics/resolution-performance?${params.toString()}`
      );
    } catch (error) {
      console.error('Failed to fetch resolution performance:', error);
      throw error;
    }
  }

  // Get complete analytics dashboard data
  async getAnalytics(data: DisputeStatsRequest): Promise<DisputeAnalytics> {
    try {
      const [resolutionTrends, vendorPerformance, commonIssues, resolutionPerformance] = 
        await Promise.all([
          this.getResolutionTrends(data),
          this.getVendorDisputePerformance(data),
          this.getCommonIssues(data),
          this.getResolutionPerformance(data),
        ]);

      return {
        resolutionTrends,
        vendorPerformance,
        commonIssues,
        resolutionPerformance,
      };
    } catch (error) {
      console.error('Failed to fetch dispute analytics:', error);
      throw error;
    }
  }

  // File upload methods
  async uploadEvidenceFile(disputeId: string, file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('disputeId', disputeId);

      return await apiClient.post<FileUploadResponse>(
        `${this.basePath}/${disputeId}/files/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    } catch (error) {
      console.error('Failed to upload evidence file:', error);
      throw error;
    }
  }

  // Delete evidence file
  async deleteEvidenceFile(disputeId: string, fileId: string): Promise<DisputeActionResponse> {
    try {
      return await apiClient.delete<DisputeActionResponse>(
        `${this.basePath}/${disputeId}/files/${fileId}`
      );
    } catch (error) {
      console.error('Failed to delete evidence file:', error);
      throw error;
    }
  }

  // Export methods
  async exportDisputes(filter: DisputeFilter, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      // Add filter parameters
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      return await apiClient.get(
        `${this.basePath}/export?${params.toString()}`,
        { responseType: 'blob' }
      );
    } catch (error) {
      console.error('Failed to export disputes:', error);
      throw error;
    }
  }

  async exportAnalyticsReport(
    data: DisputeStatsRequest, 
    format: 'csv' | 'xlsx' | 'pdf' = 'pdf'
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('startDate', data.startDate);
      params.append('endDate', data.endDate);
      params.append('format', format);
      if (data.vendorId) params.append('vendorId', data.vendorId);
      if (data.type) params.append('type', data.type);

      return await apiClient.get(
        `${this.basePath}/analytics/export?${params.toString()}`,
        { responseType: 'blob' }
      );
    } catch (error) {
      console.error('Failed to export analytics report:', error);
      throw error;
    }
  }

  // Utility methods
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get dispute status history
  async getDisputeStatusHistory(disputeId: string): Promise<DisputeTimelineEntry[]> {
    try {
      const dispute = await this.getDisputeById(disputeId);
      return dispute.timeline || [];
    } catch (error) {
      console.error(`Failed to fetch status history for dispute ${disputeId}:`, error);
      throw error;
    }
  }

  // Search disputes by text
  async searchDisputes(searchTerm: string, limit: number = 10): Promise<Dispute[]> {
    try {
      const response = await this.getDisputes({ 
        searchTerm, 
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });
      return response.disputes;
    } catch (error) {
      console.error('Failed to search disputes:', error);
      throw error;
    }
  }

  // Get dispute counts by status
  async getDisputeCounts(): Promise<Record<string, number>> {
    try {
      const response = await this.getDisputes({ limit: 1 });
      
      // Get counts for each status
      const statusCounts = await Promise.all([
        this.getDisputes({ status: 'open' as any, limit: 1 }),
        this.getDisputes({ status: 'investigating' as any, limit: 1 }),
        this.getDisputes({ status: 'resolved' as any, limit: 1 }),
        this.getDisputes({ status: 'escalated' as any, limit: 1 }),
      ]);

      return {
        total: response.total,
        open: statusCounts[0].total,
        investigating: statusCounts[1].total,
        resolved: statusCounts[2].total,
        escalated: statusCounts[3].total,
      };
    } catch (error) {
      console.error('Failed to fetch dispute counts:', error);
      return {
        total: 0,
        open: 0,
        investigating: 0,
        resolved: 0,
        escalated: 0,
      };
    }
  }
}

// Create and export singleton instance
export const disputeService = new DisputeService();