import { useState } from 'react';
import { useSupportAgents, useUpdateAgentStatus } from '@/lib/hooks/use-support';
import { AgentFilters, AgentStatus } from '@/lib/api/types';
import { AgentCard, StatusBadge } from './atoms';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Users,
  UserCheck,
  Clock,
  Target,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AgentListProps {
  onAgentSelect?: (agentId: string) => void;
  showWorkloadView?: boolean;
  className?: string;
}

export function AgentList({
  onAgentSelect,
  showWorkloadView = true,
  className
}: AgentListProps) {
  const [filters, setFilters] = useState<AgentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const {
    data: agentsData,
    isLoading,
    error,
    refetch
  } = useSupportAgents({
    ...filters,
    search: searchTerm || undefined,
  });

  const updateStatusMutation = useUpdateAgentStatus();

  const agents = agentsData?.data || [];
  const pagination = agentsData?.pagination;

  const handleFilterChange = (key: keyof AgentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (agentId: string, status: AgentStatus, reason?: string) => {
    await updateStatusMutation.mutateAsync({
      agentId,
      status,
      reason,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Calculate summary stats
  const totalAgents = agents.length;
  const availableAgents = agents.filter(a => a.status === AgentStatus.AVAILABLE).length;
  const busyAgents = agents.filter(a => a.status === AgentStatus.BUSY).length;
  const avgWorkload = agents.reduce((sum, agent) => sum + (agent.currentWorkload / agent.maxWorkload * 100), 0) / totalAgents || 0;
  const avgSatisfaction = agents.reduce((sum, agent) => sum + agent.customerSatisfactionRating, 0) / totalAgents || 0;

  const statusFilters = [
    { label: 'All', value: 'all', count: totalAgents },
    { label: 'Available', value: AgentStatus.AVAILABLE, count: availableAgents },
    { label: 'Busy', value: AgentStatus.BUSY, count: busyAgents },
    { label: 'Away', value: AgentStatus.AWAY, count: agents.filter(a => a.status === AgentStatus.AWAY).length },
    { label: 'Offline', value: AgentStatus.OFFLINE, count: agents.filter(a => a.status === AgentStatus.OFFLINE).length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load agents"
        message="There was an error loading the support agents. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Support Agents</h2>
          <p className="text-sm text-gray-600">
            {totalAgents} total agents • {availableAgents} available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {showWorkloadView && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableAgents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Workload</p>
                <p className="text-2xl font-bold text-gray-900">{avgWorkload.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{avgSatisfaction.toFixed(1)}/5</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((filter) => {
          const isActive = filters.status === filter.value || (filter.value === 'all' && !filters.status);
          
          return (
            <button
              key={filter.label}
              onClick={() => {
                if (filter.value === 'all') {
                  handleFilterChange('status', undefined);
                } else {
                  handleFilterChange('status', filter.value);
                }
              }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {filter.label}
              <span className="ml-1.5 bg-white bg-opacity-50 rounded px-1.5 py-0.5 text-xs">
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search agents by name or email..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            showFilters
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <select
                value={filters.teamId || 'all'}
                onChange={(e) => handleFilterChange('teamId', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Teams</option>
                <option value="team1">Technical Support</option>
                <option value="team2">Customer Success</option>
                <option value="team3">General Support</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <select
                onChange={(e) => {
                  const skills = e.target.value ? [e.target.value] : undefined;
                  handleFilterChange('skills', skills);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Skills</option>
                <option value="payments">Payments</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.availableOnly || false}
                  onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm">Available only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasCapacity || false}
                  onChange={(e) => handleFilterChange('hasCapacity', e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm">Has capacity</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Agents List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => onAgentSelect?.(agent.id)}
              delay={index * 100}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satisfaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => {
                  const workloadPercentage = (agent.currentWorkload / agent.maxWorkload) * 100;
                  
                  return (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {agent.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={agent.status} type="agent" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={cn(
                                'h-2 rounded-full',
                                workloadPercentage >= 100
                                  ? 'bg-red-500'
                                  : workloadPercentage >= 80
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              )}
                              style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">
                            {agent.currentWorkload}/{agent.maxWorkload}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {agent.totalTicketsResolved} resolved
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.averageResolutionTime}h avg
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-gray-900">
                            {agent.customerSatisfactionRating.toFixed(1)}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAgentSelect?.(agent.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-600">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters to find agents.'
              : 'No support agents are available.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      'px-3 py-1 text-sm border rounded',
                      pagination.currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}