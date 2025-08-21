import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { supportService } from '../api/services';
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
} from '../api/types';

// ===== QUERY KEYS =====
export const supportKeys = {
  all: ['support'] as const,
  dashboard: () => [...supportKeys.all, 'dashboard'] as const,
  tickets: () => [...supportKeys.all, 'tickets'] as const,
  ticket: (id: string) => [...supportKeys.tickets(), id] as const,
  ticketsWithFilters: (filters: TicketFilters) => [...supportKeys.tickets(), { filters }] as const,
  agents: () => [...supportKeys.all, 'agents'] as const,
  agent: (id: string) => [...supportKeys.agents(), id] as const,
  agentWorkload: (id: string) => [...supportKeys.agent(id), 'workload'] as const,
  agentsWithFilters: (filters: AgentFilters) => [...supportKeys.agents(), { filters }] as const,
  teams: () => [...supportKeys.all, 'teams'] as const,
  team: (id: string) => [...supportKeys.teams(), id] as const,
  teamWorkload: (id: string) => [...supportKeys.team(id), 'workload'] as const,
  analytics: () => [...supportKeys.all, 'analytics'] as const,
  analyticsOverview: (query: SupportAnalyticsQuery) => [...supportKeys.analytics(), 'overview', query] as const,
  ticketAnalytics: (query: SupportAnalyticsQuery) => [...supportKeys.analytics(), 'tickets', query] as const,
  performanceAnalytics: (query: SupportAnalyticsQuery) => [...supportKeys.analytics(), 'performance', query] as const,
  satisfactionAnalytics: (query: SupportAnalyticsQuery) => [...supportKeys.analytics(), 'satisfaction', query] as const,
  slaAnalytics: (query: SupportAnalyticsQuery) => [...supportKeys.analytics(), 'sla', query] as const,
  channelAnalytics: (query: SupportAnalyticsQuery) => [...supportKeys.analytics(), 'channels', query] as const,
  knowledgeBase: () => [...supportKeys.all, 'knowledge-base'] as const,
  knowledgeBaseWithQuery: (query: any) => [...supportKeys.knowledgeBase(), query] as const,
  slaConfigurations: () => [...supportKeys.all, 'sla-configurations'] as const,
  satisfactionRatings: () => [...supportKeys.all, 'satisfaction-ratings'] as const,
  responseTemplates: () => [...supportKeys.all, 'response-templates'] as const,
  customerHistory: (customerId: string) => [...supportKeys.all, 'customer-history', customerId] as const,
  queues: () => [...supportKeys.all, 'queues'] as const,
  unassignedQueue: (query: any) => [...supportKeys.queues(), 'unassigned', query] as const,
  escalatedQueue: (query: any) => [...supportKeys.queues(), 'escalated', query] as const,
  overdueQueue: (query: any) => [...supportKeys.queues(), 'overdue', query] as const,
  integrations: () => [...supportKeys.all, 'integrations'] as const,
};

// ===== DASHBOARD HOOKS =====

export function useSupportDashboard(adminId?: string) {
  return useQuery({
    queryKey: supportKeys.dashboard(),
    queryFn: () => supportService.getDashboard(adminId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

// ===== TICKET HOOKS =====

export function useSupportTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: filters ? supportKeys.ticketsWithFilters(filters) : supportKeys.tickets(),
    queryFn: () => supportService.getTickets(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
  });
}

export function useSupportTicket(ticketId: string) {
  return useQuery({
    queryKey: supportKeys.ticket(ticketId),
    queryFn: () => supportService.getTicketDetails(ticketId),
    enabled: !!ticketId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, createdBy }: { data: CreateTicketRequest; createdBy?: string }) =>
      supportService.createTicket(data, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard() });
      toast.success('Support ticket created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create ticket');
    },
  });
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      ticketId, 
      data, 
      updatedBy 
    }: { 
      ticketId: string; 
      data: UpdateTicketRequest; 
      updatedBy?: string;
    }) => supportService.updateTicket(ticketId, data, updatedBy),
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      queryClient.setQueryData(supportKeys.ticket(updatedTicket.id), updatedTicket);
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard() });
      toast.success('Ticket updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update ticket');
    },
  });
}

export function useAddTicketResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      ticketId, 
      data, 
      agentId 
    }: { 
      ticketId: string; 
      data: TicketResponseRequest; 
      agentId?: string;
    }) => supportService.addTicketResponse(ticketId, data, agentId),
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(supportKeys.ticket(updatedTicket.id), updatedTicket);
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      toast.success('Response added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add response');
    },
  });
}

export function useEscalateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      ticketId, 
      data, 
      escalatedBy 
    }: { 
      ticketId: string; 
      data: EscalateTicketRequest; 
      escalatedBy?: string;
    }) => supportService.escalateTicket(ticketId, data, escalatedBy),
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(supportKeys.ticket(updatedTicket.id), updatedTicket);
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard() });
      toast.success('Ticket escalated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to escalate ticket');
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      ticketId, 
      data, 
      assignedBy 
    }: { 
      ticketId: string; 
      data: { assignedAgentId?: string; teamId?: string }; 
      assignedBy?: string;
    }) => supportService.assignTicket(ticketId, data, assignedBy),
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(supportKeys.ticket(updatedTicket.id), updatedTicket);
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: supportKeys.agents() });
      toast.success('Ticket assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to assign ticket');
    },
  });
}

export function useBulkTicketAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      data, 
      performedBy 
    }: { 
      data: BulkTicketActionRequest; 
      performedBy?: string;
    }) => supportService.performBulkAction(data, performedBy),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard() });
      toast.success(`Bulk action completed on ${result.affectedTickets.length} tickets`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to perform bulk action');
    },
  });
}

// ===== AGENT HOOKS =====

export function useSupportAgents(filters?: AgentFilters) {
  return useQuery({
    queryKey: filters ? supportKeys.agentsWithFilters(filters) : supportKeys.agents(),
    queryFn: () => supportService.getAgents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
}

export function useSupportAgent(agentId: string) {
  return useQuery({
    queryKey: supportKeys.agent(agentId),
    queryFn: () => supportService.getAgentDetails(agentId),
    enabled: !!agentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAgentWorkload(agentId: string) {
  return useQuery({
    queryKey: supportKeys.agentWorkload(agentId),
    queryFn: () => supportService.getAgentWorkload(agentId),
    enabled: !!agentId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      agentId, 
      status, 
      updatedBy, 
      reason 
    }: { 
      agentId: string; 
      status: string; 
      updatedBy?: string; 
      reason?: string;
    }) => supportService.updateAgentStatus(agentId, status, updatedBy, reason),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(supportKeys.agent(updatedAgent.id), updatedAgent);
      queryClient.invalidateQueries({ queryKey: supportKeys.agents() });
      queryClient.invalidateQueries({ queryKey: supportKeys.dashboard() });
      toast.success('Agent status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update agent status');
    },
  });
}

// ===== TEAM HOOKS =====

export function useSupportTeams(query?: Record<string, any>) {
  return useQuery({
    queryKey: [...supportKeys.teams(), query],
    queryFn: () => supportService.getTeams(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSupportTeam(teamId: string) {
  return useQuery({
    queryKey: supportKeys.team(teamId),
    queryFn: () => supportService.getTeamDetails(teamId),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTeamWorkload(teamId: string) {
  return useQuery({
    queryKey: supportKeys.teamWorkload(teamId),
    queryFn: () => supportService.getTeamWorkload(teamId),
    enabled: !!teamId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

// ===== ANALYTICS HOOKS =====

export function useSupportAnalyticsOverview(query?: SupportAnalyticsQuery) {
  return useQuery({
    queryKey: supportKeys.analyticsOverview(query || {}),
    queryFn: () => supportService.getAnalyticsOverview(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTicketAnalytics(query?: SupportAnalyticsQuery) {
  return useQuery({
    queryKey: supportKeys.ticketAnalytics(query || {}),
    queryFn: () => supportService.getTicketAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePerformanceAnalytics(query?: SupportAnalyticsQuery) {
  return useQuery({
    queryKey: supportKeys.performanceAnalytics(query || {}),
    queryFn: () => supportService.getPerformanceAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSatisfactionAnalytics(query?: SupportAnalyticsQuery) {
  return useQuery({
    queryKey: supportKeys.satisfactionAnalytics(query || {}),
    queryFn: () => supportService.getSatisfactionAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSLAAnalytics(query?: SupportAnalyticsQuery) {
  return useQuery({
    queryKey: supportKeys.slaAnalytics(query || {}),
    queryFn: () => supportService.getSLAAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useChannelAnalytics(query?: SupportAnalyticsQuery) {
  return useQuery({
    queryKey: supportKeys.channelAnalytics(query || {}),
    queryFn: () => supportService.getChannelAnalytics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ===== KNOWLEDGE BASE HOOKS =====

export function useKnowledgeBaseArticles(query?: any) {
  return useQuery({
    queryKey: supportKeys.knowledgeBaseWithQuery(query || {}),
    queryFn: () => supportService.getKnowledgeBaseArticles(query),
    staleTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  });
}

export function useCreateKnowledgeBaseArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => supportService.createKnowledgeBaseArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.knowledgeBase() });
      toast.success('Knowledge base article created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create article');
    },
  });
}

export function useUpdateKnowledgeBaseArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, data }: { articleId: string; data: Partial<KnowledgeBaseArticle> }) =>
      supportService.updateKnowledgeBaseArticle(articleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.knowledgeBase() });
      toast.success('Article updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update article');
    },
  });
}

export function useDeleteKnowledgeBaseArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => supportService.deleteKnowledgeBaseArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.knowledgeBase() });
      toast.success('Article deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete article');
    },
  });
}

export function useSearchKnowledgeBase(query: any) {
  return useQuery({
    queryKey: [...supportKeys.knowledgeBase(), 'search', query],
    queryFn: () => supportService.searchKnowledgeBase(query),
    enabled: !!(query?.search),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ===== SLA CONFIGURATION HOOKS =====

export function useSLAConfigurations(query?: any) {
  return useQuery({
    queryKey: [...supportKeys.slaConfigurations(), query],
    queryFn: () => supportService.getSLAConfigurations(query),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateSLAConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => supportService.createSLAConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.slaConfigurations() });
      toast.success('SLA configuration created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create SLA configuration');
    },
  });
}

export function useUpdateSLAConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slaId, data }: { slaId: string; data: Partial<SLAConfiguration> }) =>
      supportService.updateSLAConfiguration(slaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.slaConfigurations() });
      toast.success('SLA configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update SLA configuration');
    },
  });
}

export function useDeleteSLAConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slaId: string) => supportService.deleteSLAConfiguration(slaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.slaConfigurations() });
      toast.success('SLA configuration deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete SLA configuration');
    },
  });
}

// ===== QUEUE HOOKS =====

export function useUnassignedTickets(query?: any) {
  return useQuery({
    queryKey: supportKeys.unassignedQueue(query || {}),
    queryFn: () => supportService.getUnassignedTickets(query),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

export function useEscalatedTickets(query?: any) {
  return useQuery({
    queryKey: supportKeys.escalatedQueue(query || {}),
    queryFn: () => supportService.getEscalatedTickets(query),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

export function useOverdueTickets(query?: any) {
  return useQuery({
    queryKey: supportKeys.overdueQueue(query || {}),
    queryFn: () => supportService.getOverdueTickets(query),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

// ===== SATISFACTION HOOKS =====

export function useSatisfactionRatings(query?: any) {
  return useQuery({
    queryKey: [...supportKeys.satisfactionRatings(), query],
    queryFn: () => supportService.getSatisfactionRatings(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
}

export function useSubmitSatisfactionRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => supportService.submitSatisfactionRating(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.satisfactionRatings() });
      queryClient.invalidateQueries({ queryKey: supportKeys.analytics() });
      toast.success('Satisfaction rating submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit rating');
    },
  });
}

// ===== RESPONSE TEMPLATES HOOKS =====

export function useResponseTemplates(query?: any) {
  return useQuery({
    queryKey: [...supportKeys.responseTemplates(), query],
    queryFn: () => supportService.getResponseTemplates(query),
    staleTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  });
}

export function useCreateResponseTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => supportService.createResponseTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.responseTemplates() });
      toast.success('Response template created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create template');
    },
  });
}

export function useUpdateResponseTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<ResponseTemplate> }) =>
      supportService.updateResponseTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.responseTemplates() });
      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update template');
    },
  });
}

export function useDeleteResponseTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => supportService.deleteResponseTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.responseTemplates() });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete template');
    },
  });
}

// ===== CUSTOMER HISTORY HOOKS =====

export function useCustomerSupportHistory(customerId: string, query?: any) {
  return useQuery({
    queryKey: [...supportKeys.customerHistory(customerId), query],
    queryFn: () => supportService.getCustomerSupportHistory(customerId, query),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCustomerSatisfactionHistory(customerId: string, query?: any) {
  return useQuery({
    queryKey: [...supportKeys.customerHistory(customerId), 'satisfaction', query],
    queryFn: () => supportService.getCustomerSatisfactionHistory(customerId, query),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ===== INTEGRATION HOOKS =====

export function useIntegrationsStatus() {
  return useQuery({
    queryKey: supportKeys.integrations(),
    queryFn: () => supportService.getIntegrationsStatus(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
  });
}

export function useSyncIntegrations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: any) => supportService.syncIntegrations(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.integrations() });
      toast.success('Integrations synced successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to sync integrations');
    },
  });
}

// ===== REPORT & EXPORT HOOKS =====

export function useGenerateTicketSummaryReport() {
  return useMutation({
    mutationFn: (query?: any) => supportService.generateTicketSummaryReport(query),
    onSuccess: (result) => {
      toast.success('Report generated successfully');
      // You could open the report URL here
      window.open(result.reportUrl, '_blank');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to generate report');
    },
  });
}

export function useGenerateAgentPerformanceReport() {
  return useMutation({
    mutationFn: (query?: any) => supportService.generateAgentPerformanceReport(query),
    onSuccess: (result) => {
      toast.success('Performance report generated successfully');
      window.open(result.reportUrl, '_blank');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to generate performance report');
    },
  });
}

export function useExportTicketsData() {
  return useMutation({
    mutationFn: (query?: any) => supportService.exportTicketsData(query),
    onSuccess: (result) => {
      toast.success('Data export ready for download');
      window.open(result.downloadUrl, '_blank');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to export data');
    },
  });
}

// ===== CONFIGURATION HOOKS =====

export function useConfigureAutoAssignment() {
  return useMutation({
    mutationFn: (data: any) => supportService.configureAutoAssignment(data),
    onSuccess: () => {
      toast.success('Auto-assignment configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update auto-assignment configuration');
    },
  });
}

export function useConfigureNotifications() {
  return useMutation({
    mutationFn: (data: any) => supportService.configureNotifications(data),
    onSuccess: () => {
      toast.success('Notification configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update notification configuration');
    },
  });
}

// ===== COMPOSITE HOOKS =====

export function useSupportOverview() {
  const dashboard = useSupportDashboard();
  const unassignedTickets = useUnassignedTickets({ limit: 10 });
  const escalatedTickets = useEscalatedTickets({ limit: 10 });
  const overdueTickets = useOverdueTickets({ limit: 10 });

  return {
    dashboard,
    unassignedTickets,
    escalatedTickets,
    overdueTickets,
    isLoading: dashboard.isLoading || unassignedTickets.isLoading || escalatedTickets.isLoading || overdueTickets.isLoading,
    error: dashboard.error || unassignedTickets.error || escalatedTickets.error || overdueTickets.error,
  };
}

export function useTicketManagement(filters?: TicketFilters) {
  const tickets = useSupportTickets(filters);
  const agents = useSupportAgents({ availableOnly: true });
  const teams = useSupportTeams();
  const responseTemplates = useResponseTemplates({ isActive: true });

  return {
    tickets,
    agents,
    teams,
    responseTemplates,
    isLoading: tickets.isLoading || agents.isLoading || teams.isLoading || responseTemplates.isLoading,
  };
}

export function useAnalyticsDashboard(query?: SupportAnalyticsQuery) {
  const overview = useSupportAnalyticsOverview(query);
  const ticketAnalytics = useTicketAnalytics(query);
  const performanceAnalytics = usePerformanceAnalytics(query);
  const satisfactionAnalytics = useSatisfactionAnalytics(query);
  const slaAnalytics = useSLAAnalytics(query);
  const channelAnalytics = useChannelAnalytics(query);

  return {
    overview,
    ticketAnalytics,
    performanceAnalytics,
    satisfactionAnalytics,
    slaAnalytics,
    channelAnalytics,
    isLoading: overview.isLoading || ticketAnalytics.isLoading || performanceAnalytics.isLoading || satisfactionAnalytics.isLoading || slaAnalytics.isLoading || channelAnalytics.isLoading,
  };
}