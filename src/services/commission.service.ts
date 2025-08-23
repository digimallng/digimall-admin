import { apiClient } from '@/lib/api/client';
import {
  CommissionRule,
  CommissionRulesResponse,
  CommissionFilterDto,
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
  TieredCommissionRuleDto,
  CommissionCalculationDto,
  CommissionCalculationResult,
  CommissionReportDto,
  CommissionReport,
  BulkCommissionUpdateDto,
  CommissionAnalytics,
  CommissionPerformance,
} from '@/types/commission.types';

export class CommissionService {
  private readonly basePath = '/commission';

  async getCommissionRules(filter?: CommissionFilterDto): Promise<CommissionRulesResponse> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = `${this.basePath}/rules${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<CommissionRulesResponse>(url);
    return response;
  }

  async getCommissionRule(ruleId: string): Promise<CommissionRule> {
    const response = await apiClient.get<CommissionRule>(`${this.basePath}/rules/${ruleId}`);
    return response;
  }

  async createCommissionRule(ruleDto: CreateCommissionRuleDto): Promise<CommissionRule> {
    console.log('🌐 CommissionService: Creating rule');
    console.log('📍 Endpoint:', `${this.basePath}/rules`);
    console.log('📦 Payload:', ruleDto);
    
    try {
      const response = await apiClient.post<CommissionRule>(`${this.basePath}/rules`, ruleDto);
      console.log('✅ CommissionService: Rule created successfully');
      console.log('📨 Response:', response);
      return response;
    } catch (error) {
      console.error('❌ CommissionService: Failed to create rule');
      console.error('🚨 Service Error:', error);
      throw error;
    }
  }

  async createTieredCommissionRule(ruleDto: TieredCommissionRuleDto): Promise<CommissionRule> {
    const response = await apiClient.post<CommissionRule>(`${this.basePath}/rules/tiered`, ruleDto);
    return response;
  }

  async updateCommissionRule(
    ruleId: string,
    updateDto: UpdateCommissionRuleDto
  ): Promise<CommissionRule> {
    const response = await apiClient.put<CommissionRule>(`${this.basePath}/rules/${ruleId}`, updateDto);
    return response;
  }

  async deleteCommissionRule(ruleId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `${this.basePath}/rules/${ruleId}`
    );
    return response;
  }

  async calculateCommission(
    calculationDto: CommissionCalculationDto
  ): Promise<CommissionCalculationResult> {
    console.log('🧮 CommissionService: Calculating commission');
    console.log('📍 Endpoint:', `${this.basePath}/calculate`);
    console.log('📦 Calculation data:', calculationDto);
    
    try {
      const response = await apiClient.post<CommissionCalculationResult>(
        `${this.basePath}/calculate`,
        calculationDto
      );
      console.log('✅ CommissionService: Commission calculated successfully');
      console.log('📨 Response:', response);
      return response;
    } catch (error) {
      console.error('❌ CommissionService: Failed to calculate commission');
      console.error('🚨 Service Error:', error);
      throw error;
    }
  }

  async generateCommissionReport(reportDto: CommissionReportDto): Promise<CommissionReport> {
    console.log('📊 CommissionService: Generating report');
    console.log('📍 Endpoint:', `${this.basePath}/reports`);
    console.log('📦 Report data:', reportDto);
    
    try {
      const response = await apiClient.post<CommissionReport>(`${this.basePath}/reports`, reportDto);
      console.log('✅ CommissionService: Report generated successfully');
      console.log('📨 Response:', response);
      return response;
    } catch (error) {
      console.error('❌ CommissionService: Failed to generate report');
      console.error('🚨 Service Error:', error);
      throw error;
    }
  }

  async bulkUpdateCommissionRules(
    bulkDto: BulkCommissionUpdateDto
  ): Promise<{ updatedCount: number; updatedRules: CommissionRule[] }> {
    const response = await apiClient.put<{ updatedCount: number; updatedRules: CommissionRule[] }>(
      `${this.basePath}/rules/bulk`,
      bulkDto
    );
    return response;
  }

  async getCommissionRulesByVendor(vendorId: string): Promise<CommissionRule[]> {
    const response = await apiClient.get<CommissionRule[]>(`${this.basePath}/vendors/${vendorId}/rules`);
    return response;
  }

  async getCommissionRulesByCategory(categoryId: string): Promise<CommissionRule[]> {
    const response = await apiClient.get<CommissionRule[]>(
      `${this.basePath}/categories/${categoryId}/rules`
    );
    return response;
  }

  async getCommissionAnalytics(filter?: CommissionFilterDto): Promise<CommissionAnalytics> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = `${this.basePath}/analytics/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<CommissionAnalytics>(url);
    return response;
  }

  async getCommissionPerformance(reportDto?: Partial<CommissionReportDto>): Promise<CommissionPerformance> {
    const params = new URLSearchParams();
    
    if (reportDto) {
      Object.entries(reportDto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = `${this.basePath}/analytics/performance${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<CommissionPerformance>(url);
    return response;
  }

  async exportCommissionRules(
    filter?: CommissionFilterDto,
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    console.log('📊 CommissionService: Exporting commission rules');
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
      console.log('✅ CommissionService: Rules exported successfully');
      return response;
    } catch (error) {
      console.error('❌ CommissionService: Failed to export rules');
      console.error('🚨 Export Error:', error);
      throw error;
    }
  }

  async exportCommissionReport(
    reportDto: CommissionReportDto,
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    console.log('📊 CommissionService: Exporting commission report');
    console.log('📍 Endpoint:', `${this.basePath}/reports/export`);
    console.log('📦 Report data:', reportDto);
    console.log('📋 Format:', format);
    
    try {
      const response = await apiClient.post<Blob>(
        `${this.basePath}/reports/export`,
        { ...reportDto, format },
        {
          responseType: 'blob',
        }
      );
      console.log('✅ CommissionService: Report exported successfully');
      return response;
    } catch (error) {
      console.error('❌ CommissionService: Failed to export report');
      console.error('🚨 Export Error:', error);
      throw error;
    }
  }
}

export const commissionService = new CommissionService();