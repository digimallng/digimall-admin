import { apiClient } from '@/lib/api/client';

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  performedBy?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AuditFilterDto {
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AuditStatistics {
  totalLogs: number;
  actionBreakdown: Record<string, number>;
  resourceBreakdown: Record<string, number>;
  userBreakdown: Record<string, number>;
  timeSeriesData: Array<{
    date: string;
    count: number;
  }>;
}

export class AuditService {
  private readonly basePath = '/audit';

  async getAuditLogs(filter?: AuditFilterDto): Promise<AuditLogsResponse> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = `${this.basePath}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<AuditLogsResponse>(url);
    return response;
  }

  async getAuditActions(): Promise<{ actions: string[] }> {
    const response = await apiClient.get<{ actions: string[] }>(`${this.basePath}/actions`);
    return response;
  }

  async getAuditStatistics(startDate?: string, endDate?: string): Promise<AuditStatistics> {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = `${this.basePath}/statistics${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<AuditStatistics>(url);
    return response;
  }

  async getUserAuditLogs(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<AuditLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<AuditLogsResponse>(
      `${this.basePath}/user/${userId}?${params.toString()}`
    );
    return response;
  }

  async getEntityAuditLogs(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<AuditLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get<AuditLogsResponse>(
      `${this.basePath}/entity/${entityType}/${entityId}?${params.toString()}`
    );
    return response;
  }

  async exportAuditLogs(
    filter?: AuditFilterDto,
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> {
    console.log('📊 AuditService: Exporting audit logs');
    console.log('📍 Endpoint:', `${this.basePath}/export`);
    console.log('📦 Filter:', filter);
    console.log('📋 Format:', format);
    
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    try {
      const response = await apiClient.get<Blob>(
        `${this.basePath}/export?${params.toString()}`,
        {
          responseType: 'blob',
        }
      );
      console.log('✅ AuditService: Logs exported successfully');
      return response;
    } catch (error) {
      console.error('❌ AuditService: Failed to export logs');
      console.error('🚨 Export Error:', error);
      throw error;
    }
  }
}

export const auditService = new AuditService();