/**
 * Reports Management Types
 *
 * Type definitions for report generation, export, and scheduling.
 */

// ===== REPORT TYPES =====

export type ReportType =
  | 'sales'
  | 'products'
  | 'vendors'
  | 'orders'
  | 'users'
  | 'revenue'
  | 'commission'
  | 'analytics'
  | 'custom';

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export type ReportStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'expired';

export type ReportFrequency =
  | 'once'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

// ===== REPORT ENTITIES =====

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  format: ReportFormat;
  status: ReportStatus;
  fileUrl?: string;
  fileSize?: number;
  parameters: ReportParameters;
  generatedBy: {
    id: string;
    name: string;
  };
  generatedAt: string;
  expiresAt?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportParameters {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeCharts?: boolean;
  includeDetails?: boolean;
}

// ===== SCHEDULED REPORTS =====

export interface ScheduledReport {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  format: ReportFormat;
  frequency: ReportFrequency;
  parameters: ReportParameters;
  recipients: string[];
  active: boolean;
  nextRunAt: string;
  lastRunAt?: string;
  lastStatus?: ReportStatus;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ===== REQUEST TYPES =====

export interface GenerateReportRequest {
  type: ReportType;
  title: string;
  description?: string;
  format: ReportFormat;
  parameters: ReportParameters;
}

export interface ExportReportParams {
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  period?: string;
  filters?: Record<string, any>;
}

export interface ScheduleReportRequest {
  type: ReportType;
  title: string;
  description?: string;
  format: ReportFormat;
  frequency: ReportFrequency;
  parameters: ReportParameters;
  recipients: string[];
  active?: boolean;
}

// ===== RESPONSE TYPES =====

export interface ReportListResponse {
  success: boolean;
  data: Report[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportResponse {
  success: boolean;
  data: Report;
}

export interface GenerateReportResponse {
  success: boolean;
  message: string;
  data: Report;
}

export interface ScheduledReportResponse {
  success: boolean;
  message: string;
  data: ScheduledReport;
}

export interface ScheduledReportListResponse {
  success: boolean;
  data: ScheduledReport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== REPORT DATA TYPES =====

export interface SalesReportData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: Array<{
      id: string;
      name: string;
      revenue: number;
      quantity: number;
    }>;
  };
  timeline: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  breakdown: {
    byCategory: Array<{ category: string; revenue: number }>;
    byVendor: Array<{ vendor: string; revenue: number }>;
    byPaymentMethod: Array<{ method: string; revenue: number }>;
  };
}

export interface ProductsReportData {
  summary: {
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    topPerforming: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
  categories: Array<{
    category: string;
    productCount: number;
    averagePrice: number;
  }>;
  inventory: {
    lowStock: number;
    outOfStock: number;
    overstock: number;
  };
}

export interface VendorsReportData {
  summary: {
    totalVendors: number;
    activeVendors: number;
    newVendors: number;
    topPerformers: Array<{
      id: string;
      name: string;
      revenue: number;
      orders: number;
    }>;
  };
  performance: {
    averageRating: number;
    averageResponseTime: string;
    fulfillmentRate: number;
  };
  distribution: {
    byTier: Array<{ tier: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
}

export interface OrdersReportData {
  summary: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  };
  timeline: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  breakdown: {
    byStatus: Array<{ status: string; count: number }>;
    byPaymentMethod: Array<{ method: string; count: number }>;
    byShippingMethod: Array<{ method: string; count: number }>;
  };
}

export interface UsersReportData {
  summary: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    topSpenders: Array<{
      id: string;
      name: string;
      totalSpent: number;
      orderCount: number;
    }>;
  };
  demographics: {
    byAge: Array<{ ageGroup: string; count: number }>;
    byGender: Array<{ gender: string; count: number }>;
    byLocation: Array<{ location: string; count: number }>;
  };
  engagement: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
  };
}
