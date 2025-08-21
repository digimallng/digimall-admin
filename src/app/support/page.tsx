'use client';

import { useState } from 'react';
import { useSupportDashboard } from '@/lib/hooks/use-support';
import { MetricCard } from '@/components/support/atoms';
import { TicketList } from '@/components/support/TicketList';
import { TicketDetails } from '@/components/support/TicketDetails';
import { AgentList } from '@/components/support/AgentList';
import { CreateTicketModal } from '@/components/support/CreateTicketModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  MessageCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Star,
  Timer,
  TrendingUp,
  Download,
  Plus,
  Headphones,
  BarChart3,
  Settings,
  BookOpen,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ActiveTab = 'overview' | 'tickets' | 'agents' | 'analytics' | 'knowledge-base' | 'settings';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useSupportDashboard();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tickets', label: 'Tickets', icon: MessageCircle },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleCreateTicket = () => {
    setShowCreateTicketModal(true);
  };

  const handleTicketCreated = (ticketId: string) => {
    // Switch to tickets tab and select the new ticket
    setActiveTab('tickets');
    setSelectedTicketId(ticketId);
    refetchDashboard();
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <ErrorMessage
        title="Failed to load support dashboard"
        message="There was an error loading the support dashboard. Please try again."
        onRetry={() => refetchDashboard()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-8">
          <PageHeader
            title="Customer Support"
            description="Comprehensive support management and customer service tools"
            icon={Headphones}
            actions={[
              {
                label: 'Export Report',
                icon: Download,
                variant: 'secondary',
                onClick: () => console.log('Export report'),
              },
              {
                label: 'New Ticket',
                icon: Plus,
                variant: 'primary',
                onClick: handleCreateTicket,
              },
            ]}
          />
        </div>

        {/* Tab Navigation */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={cn(
                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Tickets"
                value={dashboard?.overview?.totalTickets || 0}
                icon={MessageCircle}
                color="blue"
                trend={{
                  value: 5.2,
                  isPositive: true,
                  period: 'vs last week',
                }}
                delay={0}
              />
              <MetricCard
                title="Open Tickets"
                value={dashboard?.overview?.openTickets || 0}
                icon={Clock}
                color="yellow"
                description="Awaiting response"
                delay={100}
              />
              <MetricCard
                title="Resolved Today"
                value={dashboard?.overview?.resolvedTickets || 0}
                icon={CheckCircle}
                color="green"
                description="Successfully closed"
                delay={200}
              />
              <MetricCard
                title="Avg Response Time"
                value={dashboard?.overview?.avgResponseTime || 0}
                icon={Timer}
                color="purple"
                suffix="m"
                decimals={1}
                description="Minutes"
                delay={300}
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Avg Resolution Time"
                value={dashboard?.overview?.avgResolutionTime || 0}
                icon={Timer}
                color="indigo"
                suffix="h"
                decimals={1}
                description="Hours to resolve"
                delay={400}
              />
              <MetricCard
                title="Customer Satisfaction"
                value={dashboard?.overview?.customerSatisfactionScore || 0}
                icon={Star}
                color="pink"
                suffix="/5"
                decimals={1}
                description="Average rating"
                delay={500}
              />
              <MetricCard
                title="Agents Online"
                value={dashboard?.teamMetrics?.agentsOnline || 0}
                icon={Users}
                color="green"
                description="Currently available"
                delay={600}
              />
            </div>

            {/* Quick Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Urgent Tickets */}
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Urgent Tickets</h3>
                    <button
                      onClick={() => setActiveTab('tickets')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {dashboard?.recentActivity?.urgentTickets?.length ? (
                    <div className="space-y-3">
                      {dashboard.recentActivity.urgentTickets.slice(0, 5).map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                          onClick={() => handleTicketSelect(ticket.id)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                            <p className="text-sm text-gray-600">{ticket.customerName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-xs font-medium text-red-800">Urgent</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No urgent tickets</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Performing Agents */}
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                    <button
                      onClick={() => setActiveTab('agents')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {dashboard?.teamMetrics?.topPerformingAgents?.length ? (
                    <div className="space-y-3">
                      {dashboard.teamMetrics.topPerformingAgents.slice(0, 5).map((agent, index) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                          onClick={() => handleAgentSelect(agent.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {agent.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{agent.name}</p>
                              <p className="text-sm text-gray-600">
                                {agent.totalTicketsResolved} resolved
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-900">
                              {agent.customerSatisfactionRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No agent data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="flex gap-8">
            <div className={cn('flex-1', selectedTicketId && 'lg:w-1/2')}>
              <TicketList
                onTicketSelect={handleTicketSelect}
                onCreateTicket={handleCreateTicket}
                showBulkActions={true}
              />
            </div>
            {selectedTicketId && (
              <div className="lg:w-1/2 bg-white rounded-lg border">
                <TicketDetails
                  ticketId={selectedTicketId}
                  onClose={() => setSelectedTicketId(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="flex gap-8">
            <div className={cn('flex-1', selectedAgentId && 'lg:w-2/3')}>
              <AgentList
                onAgentSelect={handleAgentSelect}
                showWorkloadView={true}
              />
            </div>
            {selectedAgentId && (
              <div className="lg:w-1/3 bg-white rounded-lg border p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h3>
                  <p className="text-gray-600">Agent ID: {selectedAgentId}</p>
                  <button
                    onClick={() => setSelectedAgentId(null)}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive analytics and reporting for support operations
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge-base' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Base</h3>
              <p className="text-gray-600 mb-4">
                Manage articles, FAQs, and support documentation
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Settings</h3>
              <p className="text-gray-600 mb-4">
                Configure SLA rules, auto-assignment, and notification preferences
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">SLA Configuration</h4>
                    <p className="text-sm text-gray-600">Set response and resolution time targets</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Auto Assignment</h4>
                    <p className="text-sm text-gray-600">Configure automatic ticket routing</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">Notifications</h4>
                    <p className="text-sm text-gray-600">Manage alert preferences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        onSuccess={handleTicketCreated}
      />
    </div>
  );
}