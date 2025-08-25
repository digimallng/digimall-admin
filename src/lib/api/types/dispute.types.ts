// Dispute Management Types
export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

export enum DisputeType {
  ORDER_NOT_RECEIVED = 'order_not_received',
  ITEM_NOT_AS_DESCRIBED = 'item_not_as_described',
  DAMAGED_ITEM = 'damaged_item',
  QUALITY_ISSUE = 'quality_issue',
  REFUND_REQUEST = 'refund_request',
  DELIVERY_ISSUE = 'delivery_issue',
  SERVICE_ISSUE = 'service_issue',
  FRAUD_COMPLAINT = 'fraud_complaint',
  OTHER = 'other',
}

export enum DisputePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DisputeResolution {
  FULL_REFUND = 'full_refund',
  PARTIAL_REFUND = 'partial_refund',
  REPLACEMENT = 'replacement',
  STORE_CREDIT = 'store_credit',
  NO_ACTION = 'no_action',
  VENDOR_WARNING = 'vendor_warning',
  VENDOR_PENALTY = 'vendor_penalty',
  ESCALATE_TO_LEGAL = 'escalate_to_legal',
}

export interface DisputeParticipant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface DisputeEvidence {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface DisputeTimelineEntry {
  id: string;
  action: string;
  description: string;
  performedBy?: string;
  performedByName?: string;
  performedByType?: 'customer' | 'vendor' | 'admin' | 'system';
  notes?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Dispute {
  id: string;
  reference: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  productId?: string;
  
  // Participant Details
  customer: DisputeParticipant;
  vendor: DisputeParticipant;
  
  // Dispute Details
  type: DisputeType;
  status: DisputeStatus;
  priority: DisputePriority;
  subject: string;
  description: string;
  amount: number;
  currency: string;
  
  // Evidence and Documentation
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEntry[];
  
  // Resolution Details
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolutionAmount?: number;
  resolutionDate?: string;
  resolvedBy?: string;
  
  // Administrative Data
  assignedTo?: string;
  assignedToName?: string;
  adminNotes?: string;
  internalComments?: string;
  tags?: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Metadata
  metadata?: {
    orderDetails?: any;
    productDetails?: any;
    customerHistory?: any;
    vendorHistory?: any;
  };
}

// Filter and Query Types
export interface DisputeFilter {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  vendorId?: string;
  orderId?: string;
  status?: DisputeStatus | DisputeStatus[];
  type?: DisputeType | DisputeType[];
  priority?: DisputePriority | DisputePriority[];
  searchTerm?: string;
  assignedTo?: string;
  tags?: string[];
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface DisputesResponse {
  disputes: Dispute[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request DTOs
export interface CreateDisputeRequest {
  orderId: string;
  customerId: string;
  vendorId: string;
  type: DisputeType;
  subject: string;
  description: string;
  evidence?: File[];
  priority?: DisputePriority;
  metadata?: Record<string, any>;
}

export interface UpdateDisputeRequest {
  status?: DisputeStatus;
  priority?: DisputePriority;
  assignedTo?: string;
  adminNotes?: string;
  internalComments?: string;
  tags?: string[];
}

export interface ResolveDisputeRequest {
  resolution: DisputeResolution;
  resolutionNotes: string;
  refundAmount?: number;
  compensationDetails?: string;
  notifyCustomer?: boolean;
  notifyVendor?: boolean;
  followUpRequired?: string;
}

export interface DisputeResponseRequest {
  message: string;
  attachments?: File[];
  isPublic?: boolean;
  responseType?: string;
}

export interface EscalateDisputeRequest {
  escalationReason: string;
  escalationNotes: string;
  escalateTo?: string;
  requiresLegalReview?: boolean;
  requiresManagerApproval?: boolean;
}

export interface BulkDisputeActionRequest {
  disputeIds: string[];
  action: 'assign' | 'update_status' | 'update_priority' | 'bulk_resolve';
  assignTo?: string;
  status?: DisputeStatus;
  priority?: DisputePriority;
  resolution?: DisputeResolution;
  reason?: string;
  notes?: string;
}

// Statistics and Analytics Types
export interface DisputeStatsRequest {
  startDate: string;
  endDate: string;
  vendorId?: string;
  type?: DisputeType;
  includeBreakdown?: boolean;
}

export interface DisputeStats {
  period: {
    startDate: string;
    endDate: string;
  };
  totals: {
    totalDisputes: number;
    openDisputes: number;
    resolvedDisputes: number;
    escalatedDisputes: number;
    resolutionRate: number;
    averageResolutionTimeHours: number;
  };
  breakdown?: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    dailyTrend: Array<{
      date: string;
      total: number;
      resolved: number;
      escalated: number;
    }>;
  };
}

export interface DisputeAnalytics {
  resolutionTrends: {
    period: { startDate: string; endDate: string };
    summary: DisputeStats['totals'];
    trends: Array<{
      date: string;
      resolved: number;
      escalated: number;
      averageTime: number;
    }>;
    insights: {
      averageResolutionRate: number;
      totalDisputes: number;
      trendDirection: 'improving' | 'declining' | 'stable';
    };
  };
  
  vendorPerformance: {
    period: DisputeStatsRequest;
    vendors: Array<{
      vendorId: string;
      vendorName: string;
      totalDisputes: number;
      resolvedDisputes: number;
      averageResolutionTime: number;
      resolutionRate: number;
      escalationRate: number;
    }>;
    summary: {
      totalVendorsWithDisputes: number;
      averageResolutionRate: number;
      averageResolutionTime: number;
    };
    topPerformers: Array<{
      vendorId: string;
      vendorName: string;
      resolutionRate: number;
    }>;
    needsAttention: Array<{
      vendorId: string;
      vendorName: string;
      resolutionRate: number;
      escalationRate: number;
    }>;
  };
  
  commonIssues: {
    period: DisputeStatsRequest;
    summary: DisputeStats['totals'];
    commonIssues: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    recommendations: Array<{
      issue: string;
      count: number;
      recommendation: string;
    }>;
    trends: {
      mostCommonIssue: string;
      fastestGrowingIssue: string;
      improvingIssues: string[];
    };
  };
  
  resolutionPerformance: {
    period: DisputeStatsRequest;
    summary: DisputeStats['totals'];
    resolutionMetrics: {
      averageResolutionTime: number;
      medianResolutionTime: number;
      fastest: number;
      slowest: number;
      within24Hours: number;
      within72Hours: number;
      withinWeek: number;
      beyondWeek: number;
    };
    resolutionBreakdown: Record<string, {
      count: number;
      percentage: number;
      avgSatisfaction: number;
    }>;
    performance: {
      resolutionRate: number;
      escalationRate: number;
      customerSatisfaction: number;
      firstContactResolution: number;
    };
    recommendations: string[];
  };
}

// Settings Types
export interface DisputeSettings {
  id: string;
  autoEscalationDays: number;
  responseTimeHours: number;
  enableAutoAssignment: boolean;
  requireManagerApprovalForRefunds: boolean;
  maxRefundAmountWithoutApproval: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    slackEnabled: boolean;
  };
  escalationRules: Array<{
    condition: string;
    action: string;
    threshold: number;
  }>;
  resolutionTemplates: Array<{
    id: string;
    name: string;
    type: DisputeType;
    resolution: DisputeResolution;
    template: string;
    variables: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDisputeSettingsRequest {
  autoEscalationDays?: number;
  responseTimeHours?: number;
  enableAutoAssignment?: boolean;
  requireManagerApprovalForRefunds?: boolean;
  maxRefundAmountWithoutApproval?: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  notificationSettings?: DisputeSettings['notificationSettings'];
  escalationRules?: DisputeSettings['escalationRules'];
  resolutionTemplates?: DisputeSettings['resolutionTemplates'];
}

// Response Types
export interface DisputeActionResponse {
  success: boolean;
  message: string;
  disputeId?: string;
  data?: any;
}

export interface BulkActionResponse {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    disputeId: string;
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

// Hook Return Types
export interface UseDisputesResult {
  disputes: DisputesResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

export interface UseDisputeResult {
  dispute: Dispute | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseDisputeMutationResult<T = any> {
  mutate: (data: T) => void;
  mutateAsync: (data: T) => Promise<any>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: any;
  reset: () => void;
}