import { apiClient } from '../client';
import {
  SupportTicket,
  SupportAgent,
  SupportTeam,
  SupportDashboard,
  SupportAnalytics,
  KnowledgeBaseArticle,
  SLAConfiguration,
  CustomerSatisfactionRating,
  ResponseTemplate,
  TicketFilters,
  AgentFilters,
  SupportAnalyticsQuery,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketResponseRequest,
  EscalateTicketRequest,
  BulkTicketActionRequest,
  PaginatedResponse,
} from '../types';

export class SupportService {
  // ===== DASHBOARD =====
  
  async getDashboard(adminId?: string): Promise<SupportDashboard> {
    const params = adminId ? { adminId } : {};
    return apiClient.get<SupportDashboard>('/customer-support/dashboard', params);
  }

  // ===== TICKET MANAGEMENT =====

  async getTickets(filters?: TicketFilters): Promise<PaginatedResponse<SupportTicket>> {
    return apiClient.get<PaginatedResponse<SupportTicket>>('/customer-support/tickets', filters);
  }

  async getTicketDetails(ticketId: string): Promise<SupportTicket> {
    return apiClient.get<SupportTicket>(`/customer-support/tickets/${ticketId}`);
  }

  async createTicket(data: CreateTicketRequest, createdBy?: string): Promise<SupportTicket> {
    const params = createdBy ? { createdBy } : {};
    return apiClient.post<SupportTicket>('/customer-support/tickets', data, params);
  }

  async updateTicket(
    ticketId: string, 
    data: UpdateTicketRequest, 
    updatedBy?: string
  ): Promise<SupportTicket> {
    const params = updatedBy ? { updatedBy } : {};
    return apiClient.put<SupportTicket>(`/customer-support/tickets/${ticketId}`, data, params);
  }

  async addTicketResponse(
    ticketId: string,
    data: TicketResponseRequest,
    agentId?: string
  ): Promise<SupportTicket> {
    const params = agentId ? { agentId } : {};
    return apiClient.post<SupportTicket>(
      `/customer-support/tickets/${ticketId}/responses`,
      data,
      params
    );
  }

  async escalateTicket(
    ticketId: string,
    data: EscalateTicketRequest,
    escalatedBy?: string
  ): Promise<SupportTicket> {
    const params = escalatedBy ? { escalatedBy } : {};
    return apiClient.post<SupportTicket>(
      `/customer-support/tickets/${ticketId}/escalate`,
      data,
      params
    );
  }

  async assignTicket(
    ticketId: string,
    data: { assignedAgentId?: string; teamId?: string },
    assignedBy?: string
  ): Promise<SupportTicket> {
    const params = assignedBy ? { assignedBy } : {};
    return apiClient.post<SupportTicket>(
      `/customer-support/tickets/${ticketId}/assign`,
      data,
      params
    );
  }

  async mergeTickets(
    ticketId: string,
    data: { targetTicketId: string; reason: string },
    mergedBy?: string
  ): Promise<SupportTicket> {
    const params = mergedBy ? { mergedBy } : {};
    return apiClient.post<SupportTicket>(
      `/customer-support/tickets/${ticketId}/merge`,
      data,
      params
    );
  }

  async splitTicket(
    ticketId: string,
    data: { newTickets: CreateTicketRequest[]; reason: string },
    splitBy?: string
  ): Promise<SupportTicket[]> {
    const params = splitBy ? { splitBy } : {};
    return apiClient.post<SupportTicket[]>(
      `/customer-support/tickets/${ticketId}/split`,
      data,
      params
    );
  }

  async performBulkAction(
    data: BulkTicketActionRequest,
    performedBy?: string
  ): Promise<{ success: boolean; affectedTickets: string[]; errors?: string[] }> {
    const params = performedBy ? { performedBy } : {};
    return apiClient.post(
      '/customer-support/tickets/bulk-action',
      data,
      params
    );
  }

  // ===== AGENT MANAGEMENT =====

  async getAgents(filters?: AgentFilters): Promise<PaginatedResponse<SupportAgent>> {
    return apiClient.get<PaginatedResponse<SupportAgent>>('/customer-support/agents', filters);
  }

  async getAgentDetails(agentId: string): Promise<SupportAgent> {
    return apiClient.get<SupportAgent>(`/customer-support/agents/${agentId}`);
  }

  async getAgentWorkload(agentId: string): Promise<{
    agent: SupportAgent;
    activeTickets: SupportTicket[];
    workloadMetrics: {
      currentLoad: number;
      maxCapacity: number;
      utilizationRate: number;
      avgResponseTime: number;
      ticketsToday: number;
      ticketsThisWeek: number;
    };
  }> {
    return apiClient.get(`/customer-support/agents/${agentId}/workload`);
  }

  async updateAgentStatus(
    agentId: string,
    status: string,
    updatedBy?: string,
    reason?: string
  ): Promise<SupportAgent> {
    const params = updatedBy ? { updatedBy } : {};
    const data = { status, reason };
    return apiClient.put<SupportAgent>(
      `/customer-support/agents/${agentId}/status`,
      data,
      params
    );
  }

  // ===== TEAM MANAGEMENT =====

  async getTeams(query?: Record<string, any>): Promise<PaginatedResponse<SupportTeam>> {
    return apiClient.get<PaginatedResponse<SupportTeam>>('/customer-support/teams', query);
  }

  async getTeamDetails(teamId: string): Promise<SupportTeam> {
    return apiClient.get<SupportTeam>(`/customer-support/teams/${teamId}`);
  }

  async getTeamWorkload(teamId: string): Promise<{
    team: SupportTeam;
    agents: SupportAgent[];
    workloadDistribution: Array<{
      agentId: string;
      agentName: string;
      activeTickets: number;
      workloadPercentage: number;
    }>;
    teamMetrics: {
      totalActiveTickets: number;
      avgResponseTime: number;
      avgResolutionTime: number;
      satisfactionRating: number;
    };
  }> {
    return apiClient.get(`/customer-support/teams/${teamId}/workload`);
  }

  // ===== ANALYTICS =====

  async getAnalyticsOverview(query?: SupportAnalyticsQuery): Promise<SupportAnalytics> {
    return apiClient.get<SupportAnalytics>('/customer-support/analytics/overview', query);
  }

  async getTicketAnalytics(query?: SupportAnalyticsQuery): Promise<{
    ticketTrends: Array<{
      date: string;
      totalTickets: number;
      resolvedTickets: number;
      avgResponseTime: number;
      avgResolutionTime: number;
    }>;
    categoryDistribution: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    priorityDistribution: Array<{
      priority: string;
      count: number;
      percentage: number;
    }>;
    channelDistribution: Array<{
      channel: string;
      count: number;
      percentage: number;
    }>;
  }> {
    return apiClient.get('/customer-support/analytics/tickets', query);
  }

  async getPerformanceAnalytics(query?: SupportAnalyticsQuery): Promise<{
    agentPerformance: Array<{
      agentId: string;
      agentName: string;
      ticketsResolved: number;
      avgResponseTime: number;
      avgResolutionTime: number;
      satisfactionRating: number;
      firstContactResolutionRate: number;
    }>;
    teamPerformance: Array<{
      teamId: string;
      teamName: string;
      ticketsResolved: number;
      avgResponseTime: number;
      avgResolutionTime: number;
      satisfactionRating: number;
    }>;
    overallMetrics: {
      totalTicketsResolved: number;
      avgResponseTime: number;
      avgResolutionTime: number;
      firstContactResolutionRate: number;
      escalationRate: number;
      customerSatisfactionScore: number;
    };
  }> {
    return apiClient.get('/customer-support/analytics/performance', query);
  }

  async getSatisfactionAnalytics(query?: SupportAnalyticsQuery): Promise<{
    overallSatisfaction: {
      avgRating: number;
      totalRatings: number;
      ratingDistribution: Record<number, number>;
    };
    satisfactionTrends: Array<{
      date: string;
      avgRating: number;
      totalRatings: number;
    }>;
    agentSatisfaction: Array<{
      agentId: string;
      agentName: string;
      avgRating: number;
      totalRatings: number;
    }>;
    categorySatisfaction: Array<{
      category: string;
      avgRating: number;
      totalRatings: number;
    }>;
  }> {
    return apiClient.get('/customer-support/analytics/satisfaction', query);
  }

  async getSLAAnalytics(query?: SupportAnalyticsQuery): Promise<{
    overallCompliance: {
      slaComplianceRate: number;
      avgResponseTime: number;
      avgResolutionTime: number;
      breachedTickets: number;
    };
    complianceByPriority: Record<string, {
      complianceRate: number;
      avgResponseTime: number;
      avgResolutionTime: number;
    }>;
    complianceByCategory: Record<string, {
      complianceRate: number;
      avgResponseTime: number;
      avgResolutionTime: number;
    }>;
    complianceTrends: Array<{
      date: string;
      complianceRate: number;
      avgResponseTime: number;
      avgResolutionTime: number;
    }>;
  }> {
    return apiClient.get('/customer-support/analytics/sla', query);
  }

  async getChannelAnalytics(query?: SupportAnalyticsQuery): Promise<{
    channelVolume: Array<{
      channel: string;
      ticketCount: number;
      percentage: number;
      avgResponseTime: number;
      avgResolutionTime: number;
      satisfactionRating: number;
    }>;
    channelTrends: Array<{
      date: string;
      channels: Record<string, number>;
    }>;
    channelPerformance: Record<string, {
      avgResponseTime: number;
      avgResolutionTime: number;
      firstContactResolutionRate: number;
      satisfactionRating: number;
    }>;
  }> {
    return apiClient.get('/customer-support/analytics/channels', query);
  }

  // ===== KNOWLEDGE BASE =====

  async getKnowledgeBaseArticles(query?: {
    search?: string;
    category?: string;
    audience?: 'customer' | 'agent' | 'both';
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<KnowledgeBaseArticle>> {
    return apiClient.get<PaginatedResponse<KnowledgeBaseArticle>>(
      '/customer-support/knowledge-base',
      query
    );
  }

  async createKnowledgeBaseArticle(data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    isPublished?: boolean;
    priority?: number;
    relatedFAQs?: string[];
    audience?: 'customer' | 'agent' | 'both';
  }): Promise<KnowledgeBaseArticle> {
    return apiClient.post<KnowledgeBaseArticle>('/customer-support/knowledge-base', data);
  }

  async updateKnowledgeBaseArticle(
    articleId: string,
    data: Partial<KnowledgeBaseArticle>
  ): Promise<KnowledgeBaseArticle> {
    return apiClient.put<KnowledgeBaseArticle>(
      `/customer-support/knowledge-base/${articleId}`,
      data
    );
  }

  async deleteKnowledgeBaseArticle(articleId: string): Promise<void> {
    return apiClient.delete(`/customer-support/knowledge-base/${articleId}`);
  }

  async searchKnowledgeBase(query: {
    search: string;
    category?: string;
    audience?: 'customer' | 'agent' | 'both';
    limit?: number;
  }): Promise<KnowledgeBaseArticle[]> {
    return apiClient.get<KnowledgeBaseArticle[]>(
      '/customer-support/knowledge-base/search',
      query
    );
  }

  // ===== SLA CONFIGURATION =====

  async getSLAConfigurations(query?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SLAConfiguration>> {
    return apiClient.get<PaginatedResponse<SLAConfiguration>>(
      '/customer-support/sla-configurations',
      query
    );
  }

  async createSLAConfiguration(data: {
    name: string;
    description: string;
    firstResponseTimeHours: number;
    resolutionTimeHours: number;
    escalationTimeHours?: number;
    applicablePriorities: string[];
    applicableCategories: string[];
    customerTiers?: string[];
    isActive?: boolean;
    businessHoursOnly?: boolean;
  }): Promise<SLAConfiguration> {
    return apiClient.post<SLAConfiguration>('/customer-support/sla-configurations', data);
  }

  async updateSLAConfiguration(
    slaId: string,
    data: Partial<SLAConfiguration>
  ): Promise<SLAConfiguration> {
    return apiClient.put<SLAConfiguration>(
      `/customer-support/sla-configurations/${slaId}`,
      data
    );
  }

  async deleteSLAConfiguration(slaId: string): Promise<void> {
    return apiClient.delete(`/customer-support/sla-configurations/${slaId}`);
  }

  // ===== SATISFACTION RATINGS =====

  async getSatisfactionRatings(query?: {
    ticketId?: string;
    agentId?: string;
    customerId?: string;
    ratingMin?: number;
    ratingMax?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CustomerSatisfactionRating>> {
    return apiClient.get<PaginatedResponse<CustomerSatisfactionRating>>(
      '/customer-support/satisfaction-ratings',
      query
    );
  }

  async submitSatisfactionRating(data: {
    ticketId: string;
    rating: number;
    feedback?: string;
    agentRating?: number;
    responseTimeRating?: number;
    resolutionQualityRating?: number;
    wouldRecommend?: boolean;
  }): Promise<CustomerSatisfactionRating> {
    return apiClient.post<CustomerSatisfactionRating>(
      '/customer-support/satisfaction-ratings',
      data
    );
  }

  // ===== RESPONSE TEMPLATES =====

  async getResponseTemplates(query?: {
    category?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ResponseTemplate>> {
    return apiClient.get<PaginatedResponse<ResponseTemplate>>(
      '/customer-support/templates',
      query
    );
  }

  async createResponseTemplate(data: {
    name: string;
    subject?: string;
    content: string;
    category: string;
    isActive?: boolean;
    variables?: string[];
    tags?: string[];
  }): Promise<ResponseTemplate> {
    return apiClient.post<ResponseTemplate>('/customer-support/templates', data);
  }

  async updateResponseTemplate(
    templateId: string,
    data: Partial<ResponseTemplate>
  ): Promise<ResponseTemplate> {
    return apiClient.put<ResponseTemplate>(`/customer-support/templates/${templateId}`, data);
  }

  async deleteResponseTemplate(templateId: string): Promise<void> {
    return apiClient.delete(`/customer-support/templates/${templateId}`);
  }

  // ===== CUSTOMER HISTORY =====

  async getCustomerSupportHistory(customerId: string, query?: {
    includeResolved?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    customer: {
      id: string;
      name: string;
      email: string;
      totalTickets: number;
      avgSatisfactionRating: number;
    };
    tickets: PaginatedResponse<SupportTicket>;
    summary: {
      totalTickets: number;
      resolvedTickets: number;
      avgResolutionTime: number;
      avgSatisfactionRating: number;
      preferredChannel: string;
    };
  }> {
    return apiClient.get(`/customer-support/customers/${customerId}/history`, query);
  }

  async getCustomerSatisfactionHistory(customerId: string, query?: {
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CustomerSatisfactionRating>> {
    return apiClient.get<PaginatedResponse<CustomerSatisfactionRating>>(
      `/customer-support/customers/${customerId}/satisfaction`,
      query
    );
  }

  // ===== QUEUE MANAGEMENT =====

  async getUnassignedTickets(query?: {
    priority?: string;
    category?: string;
    channel?: string;
    age?: 'new' | 'old';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SupportTicket>> {
    return apiClient.get<PaginatedResponse<SupportTicket>>(
      '/customer-support/queue/unassigned',
      query
    );
  }

  async getEscalatedTickets(query?: {
    escalationLevel?: number;
    reason?: string;
    agentId?: string;
    teamId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SupportTicket>> {
    return apiClient.get<PaginatedResponse<SupportTicket>>(
      '/customer-support/queue/escalated',
      query
    );
  }

  async getOverdueTickets(query?: {
    priority?: string;
    category?: string;
    agentId?: string;
    teamId?: string;
    overdueBy?: 'hours' | 'days';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SupportTicket>> {
    return apiClient.get<PaginatedResponse<SupportTicket>>(
      '/customer-support/queue/overdue',
      query
    );
  }

  // ===== AUTO-ASSIGNMENT =====

  async configureAutoAssignment(data: {
    isEnabled: boolean;
    rules: Array<{
      priority?: string[];
      category?: string[];
      channel?: string[];
      teamId?: string;
      agentIds?: string[];
      maxWorkload?: number;
      businessHoursOnly?: boolean;
    }>;
  }): Promise<{ success: boolean; configuration: any }> {
    return apiClient.post('/customer-support/auto-assignment/configure', data);
  }

  // ===== REPORTS & EXPORTS =====

  async generateTicketSummaryReport(query?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'xlsx' | 'pdf';
    includeDetails?: boolean;
  }): Promise<{ reportUrl: string; expiresAt: string }> {
    return apiClient.get('/customer-support/reports/ticket-summary', query);
  }

  async generateAgentPerformanceReport(query?: {
    agentIds?: string[];
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'xlsx' | 'pdf';
  }): Promise<{ reportUrl: string; expiresAt: string }> {
    return apiClient.get('/customer-support/reports/agent-performance', query);
  }

  async generateSLAComplianceReport(query?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'xlsx' | 'pdf';
  }): Promise<{ reportUrl: string; expiresAt: string }> {
    return apiClient.get('/customer-support/reports/sla-compliance', query);
  }

  async generateCustomerSatisfactionReport(query?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'xlsx' | 'pdf';
  }): Promise<{ reportUrl: string; expiresAt: string }> {
    return apiClient.get('/customer-support/reports/customer-satisfaction', query);
  }

  async exportTicketsData(query?: {
    filters?: TicketFilters;
    format?: 'csv' | 'xlsx';
    includeResponses?: boolean;
  }): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.get('/customer-support/export/tickets', query);
  }

  async exportAnalyticsData(query?: {
    analyticsType: 'tickets' | 'performance' | 'satisfaction' | 'sla';
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'xlsx';
  }): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.get('/customer-support/export/analytics', query);
  }

  // ===== NOTIFICATIONS =====

  async configureNotifications(data: {
    ticketCreated: {
      enabled: boolean;
      recipients: string[];
      template?: string;
    };
    ticketEscalated: {
      enabled: boolean;
      recipients: string[];
      template?: string;
    };
    slaBreached: {
      enabled: boolean;
      recipients: string[];
      template?: string;
    };
    ticketResolved: {
      enabled: boolean;
      recipients: string[];
      template?: string;
    };
    agentAssigned: {
      enabled: boolean;
      notifyAgent: boolean;
      notifyTeam: boolean;
    };
  }): Promise<{ success: boolean; configuration: any }> {
    return apiClient.post('/customer-support/notifications/configure', data);
  }

  // ===== INTEGRATIONS =====

  async getIntegrationsStatus(): Promise<{
    integrations: Array<{
      name: string;
      type: string;
      status: 'connected' | 'disconnected' | 'error';
      lastSync?: string;
      configuration?: Record<string, any>;
    }>;
    overall: 'healthy' | 'degraded' | 'down';
  }> {
    return apiClient.get('/customer-support/integrations/status');
  }

  async syncIntegrations(data?: {
    integrationNames?: string[];
    forceSync?: boolean;
  }): Promise<{
    success: boolean;
    syncResults: Array<{
      integration: string;
      status: 'success' | 'failed';
      message?: string;
      syncedAt: string;
    }>;
  }> {
    return apiClient.post('/customer-support/integrations/sync', data);
  }
}

// Export singleton instance
export const supportService = new SupportService();