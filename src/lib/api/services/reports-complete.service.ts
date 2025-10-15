/**
 * Reports Management Service (Complete)
 *
 * Comprehensive service for report generation, export, and scheduling.
 * Based on ADMIN_API_DOCUMENTATION.md - Reports Management section
 */

import { apiClient } from '../core';
import { API_ENDPOINTS } from '../core/api-config';
import type {
  Report,
  ReportListResponse,
  ReportResponse,
  GenerateReportRequest,
  GenerateReportResponse,
  ExportReportParams,
  ScheduleReportRequest,
  ScheduledReportResponse,
  ScheduledReportListResponse,
} from '../types/reports.types';

/**
 * Reports Service Class
 */
class ReportsCompleteService {
  /**
   * Get all reports
   * GET /admin/reports
   * @role ADMIN, SUPER_ADMIN
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ReportListResponse> {
    const response = await apiClient.get<ReportListResponse>(
      API_ENDPOINTS.REPORTS.GET_ALL,
      { params }
    );
    return response.data!;
  }

  /**
   * Get report by ID
   * GET /admin/reports/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async getById(id: string): Promise<ReportResponse> {
    const response = await apiClient.get<ReportResponse>(
      API_ENDPOINTS.REPORTS.GET_BY_ID(id)
    );
    return response.data!;
  }

  /**
   * Generate new report
   * POST /admin/reports/generate
   * @role ADMIN, SUPER_ADMIN
   */
  async generate(data: GenerateReportRequest): Promise<GenerateReportResponse> {
    const response = await apiClient.post<GenerateReportResponse>(
      API_ENDPOINTS.REPORTS.GENERATE,
      data
    );
    return response.data!;
  }

  /**
   * Export sales report
   * GET /admin/reports/export/sales
   * @role ADMIN, SUPER_ADMIN
   */
  async exportSales(params: ExportReportParams): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.REPORTS.EXPORT_SALES,
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data!;
  }

  /**
   * Export products report
   * GET /admin/reports/export/products
   * @role ADMIN, SUPER_ADMIN
   */
  async exportProducts(params: ExportReportParams): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.REPORTS.EXPORT_PRODUCTS,
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data!;
  }

  /**
   * Export vendors report
   * GET /admin/reports/export/vendors
   * @role ADMIN, SUPER_ADMIN
   */
  async exportVendors(params: ExportReportParams): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.REPORTS.EXPORT_VENDORS,
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data!;
  }

  /**
   * Export orders report
   * GET /admin/reports/export/orders
   * @role ADMIN, SUPER_ADMIN
   */
  async exportOrders(params: ExportReportParams): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.REPORTS.EXPORT_ORDERS,
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data!;
  }

  /**
   * Export users report
   * GET /admin/reports/export/users
   * @role ADMIN, SUPER_ADMIN
   */
  async exportUsers(params: ExportReportParams): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.REPORTS.EXPORT_USERS,
      {
        params,
        responseType: 'blob',
      }
    );
    return response.data!;
  }

  /**
   * Schedule report
   * POST /admin/reports/schedule
   * @role ADMIN, SUPER_ADMIN
   */
  async scheduleReport(data: ScheduleReportRequest): Promise<ScheduledReportResponse> {
    const response = await apiClient.post<ScheduledReportResponse>(
      API_ENDPOINTS.REPORTS.SCHEDULE_REPORT,
      data
    );
    return response.data!;
  }

  /**
   * Get scheduled reports
   * GET /admin/reports/scheduled
   * @role ADMIN, SUPER_ADMIN
   */
  async getScheduled(params?: {
    page?: number;
    limit?: number;
    active?: boolean;
  }): Promise<ScheduledReportListResponse> {
    const response = await apiClient.get<ScheduledReportListResponse>(
      API_ENDPOINTS.REPORTS.GET_SCHEDULED,
      { params }
    );
    return response.data!;
  }

  /**
   * Delete scheduled report
   * DELETE /admin/reports/scheduled/:id
   * @role ADMIN, SUPER_ADMIN
   */
  async deleteScheduled(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REPORTS.DELETE_SCHEDULED(id));
  }

  /**
   * Download report blob as file
   */
  downloadReport(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate filename for export
   */
  generateFilename(type: string, format: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `${type}_report_${date}.${format}`;
  }

  /**
   * Validate report parameters
   */
  validateReportParams(params: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params.startDate && params.endDate) {
      const start = new Date(params.startDate);
      const end = new Date(params.endDate);

      if (start > end) {
        errors.push('Start date must be before end date');
      }

      const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year
      if (end.getTime() - start.getTime() > maxRange) {
        errors.push('Date range cannot exceed 1 year');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const reportsCompleteService = new ReportsCompleteService();

// Export class for testing
export { ReportsCompleteService };
