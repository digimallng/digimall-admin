export enum CommissionRuleType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  TIERED = 'tiered',
}

export enum CommissionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

export interface CommissionTier {
  minValue: number;
  maxValue: number;
  rate: number;
}

export interface CommissionRule {
  id: string;
  name: string;
  description?: string;
  type: CommissionRuleType;
  value: number;
  vendorId?: string;
  categoryId?: string;
  minOrderValue?: number;
  maxOrderValue?: number;
  validFrom?: Date;
  validUntil?: Date;
  isDefault: boolean;
  status: CommissionStatus;
  tiers?: CommissionTier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionFilterDto {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
  categoryId?: string;
  status?: CommissionStatus;
  ruleType?: CommissionRuleType;
  page?: number;
  limit?: number;
}

export interface CreateCommissionRuleDto {
  name: string;
  description?: string;
  type: CommissionRuleType;
  value: number;
  vendorId?: string;
  categoryId?: string;
  minOrderValue?: number;
  maxOrderValue?: number;
  validFrom?: string;
  validUntil?: string;
  isDefault?: boolean;
}

export interface UpdateCommissionRuleDto {
  name?: string;
  description?: string;
  value?: number;
  status?: CommissionStatus;
  minOrderValue?: number;
  maxOrderValue?: number;
  validFrom?: string;
  validUntil?: string;
  isDefault?: boolean;
}

export interface TieredCommissionRuleDto extends CreateCommissionRuleDto {
  tiers: CommissionTier[];
}

export interface CommissionCalculationDto {
  orderValue: number;
  vendorId?: string;
  categoryId?: string;
}

export interface CommissionCalculationResult {
  orderValue: number;
  commissionAmount: number;
  commissionRate?: number;
  appliedRule: {
    id: string;
    name: string;
    type: CommissionRuleType;
  };
}

export interface CommissionReportDto {
  startDate: string;
  endDate: string;
  vendorId?: string;
  categoryId?: string;
  includeBreakdown?: boolean;
}

export interface CommissionReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalCommissions: number;
    totalOrderValue: number;
    averageCommissionRate: number;
    orderCount: number;
  };
  breakdown?: {
    byRule: Record<string, any>;
    byVendor: Record<string, any>;
  };
}

export interface BulkCommissionUpdateDto {
  ruleIds: string[];
  status: CommissionStatus;
  reason?: string;
}

export interface CommissionRulesResponse {
  rules: CommissionRule[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommissionAnalytics {
  totalRules: number;
  activeRules: number;
  inactiveRules: number;
  ruleTypes: Record<string, number>;
  defaultRule?: CommissionRule;
}

export interface CommissionPerformance {
  summary: {
    totalCommissions: number;
    totalOrderValue: number;
    averageCommissionRate: number;
    orderCount: number;
  };
  topVendors: Array<{
    vendorId: string;
    vendorName: string;
    totalCommissions: number;
    orderCount: number;
    averageCommission: number;
  }>;
  rulePerformance: Array<{
    ruleId: string;
    ruleName: string;
    ruleType: CommissionRuleType;
    totalCommissions: number;
    orderCount: number;
    averageCommission: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}