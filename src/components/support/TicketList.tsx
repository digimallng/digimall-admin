import { useState, useMemo } from 'react';
import { useSupportTickets, useBulkTicketAction } from '@/lib/hooks/use-support';
import { TicketFilters, TicketStatus, TicketPriority, TicketCategory, SupportChannel } from '@/lib/api/types';
import { TicketCard } from './atoms';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Plus,
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TicketListProps {
  initialFilters?: TicketFilters;
  onTicketSelect?: (ticketId: string) => void;
  onCreateTicket?: () => void;
  showBulkActions?: boolean;
  className?: string;
}

export function TicketList({
  initialFilters,
  onTicketSelect,
  onCreateTicket,
  showBulkActions = true,
  className
}: TicketListProps) {
  const [filters, setFilters] = useState<TicketFilters>(initialFilters || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: ticketsData,
    isLoading,
    error,
    refetch
  } = useSupportTickets({
    ...filters,
    search: searchTerm || undefined,
  });

  const bulkActionMutation = useBulkTicketAction();

  const tickets = ticketsData?.data || [];
  const pagination = ticketsData?.pagination;

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleTicketSelect = (ticketId: string) => {
    setSelectedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTickets.size === tickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(tickets.map(t => t.id)));
    }
  };

  const handleBulkAction = async (action: string, params?: any) => {
    if (selectedTickets.size === 0) return;

    await bulkActionMutation.mutateAsync({
      data: {
        ticketIds: Array.from(selectedTickets),
        action: action as any,
        actionParams: params,
        reason: `Bulk ${action} operation`,
      }
    });

    setSelectedTickets(new Set());
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const quickFilters = [
    { label: 'All', value: 'all', count: pagination?.total || 0 },
    { label: 'Open', value: TicketStatus.OPEN, count: 0 },
    { label: 'In Progress', value: TicketStatus.IN_PROGRESS, count: 0 },
    { label: 'Escalated', value: TicketStatus.ESCALATED, count: 0 },
    { label: 'Unassigned', key: 'unassignedOnly', value: true, count: 0 },
    { label: 'Overdue', key: 'overdueOnly', value: true, count: 0 },
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
        title="Failed to load tickets"
        message="There was an error loading the support tickets. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-600">
            {pagination?.total || 0} total tickets
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
          <button
            onClick={() => {}}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {quickFilters.map((filter) => {
          const isActive = filter.key 
            ? filters[filter.key as keyof TicketFilters] === filter.value
            : filters.status === filter.value || (filter.value === 'all' && !filters.status);
          
          return (
            <button
              key={filter.label}
              onClick={() => {
                if (filter.key) {
                  handleFilterChange(filter.key as keyof TicketFilters, filter.value);
                } else if (filter.value === 'all') {
                  setFilters(prev => ({ ...prev, status: undefined }));
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
              {filter.count > 0 && (
                <span className="ml-1.5 bg-white bg-opacity-50 rounded px-1.5 py-0.5 text-xs">
                  {filter.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search tickets by subject, customer, or ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Advanced Filters Toggle */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value={TicketPriority.CRITICAL}>Critical</option>
                <option value={TicketPriority.URGENT}>Urgent</option>
                <option value={TicketPriority.HIGH}>High</option>
                <option value={TicketPriority.MEDIUM}>Medium</option>
                <option value={TicketPriority.LOW}>Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value={TicketCategory.ACCOUNT_ISSUES}>Account Issues</option>
                <option value={TicketCategory.ORDER_PROBLEMS}>Order Problems</option>
                <option value={TicketCategory.PAYMENT_ISSUES}>Payment Issues</option>
                <option value={TicketCategory.TECHNICAL_SUPPORT}>Technical Support</option>
                <option value={TicketCategory.REFUND_REQUEST}>Refund Request</option>
                <option value={TicketCategory.GENERAL_INQUIRY}>General Inquiry</option>
              </select>
            </div>

            {/* Channel Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel
              </label>
              <select
                value={filters.channel || 'all'}
                onChange={(e) => handleFilterChange('channel', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Channels</option>
                <option value={SupportChannel.EMAIL}>Email</option>
                <option value={SupportChannel.CHAT}>Chat</option>
                <option value={SupportChannel.PHONE}>Phone</option>
                <option value={SupportChannel.WEB_FORM}>Web Form</option>
                <option value={SupportChannel.IN_APP}>In-App</option>
              </select>
            </div>

            {/* Agent Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Agent
              </label>
              <select
                value={filters.assignedAgentId || 'all'}
                onChange={(e) => handleFilterChange('assignedAgentId', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Agents</option>
                <option value="">Unassigned</option>
                {/* TODO: Add agent options from API */}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created After
              </label>
              <input
                type="date"
                value={filters.createdAfter || ''}
                onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created Before
              </label>
              <input
                type="date"
                value={filters.createdBefore || ''}
                onChange={(e) => handleFilterChange('createdBefore', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
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

      {/* Bulk Actions */}
      {showBulkActions && selectedTickets.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedTickets.size} ticket{selectedTickets.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('assign')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Assign
              </button>
              <button
                onClick={() => handleBulkAction('update_priority', { priority: TicketPriority.HIGH })}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
              >
                Set Priority
              </button>
              <button
                onClick={() => handleBulkAction('close')}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All */}
      {showBulkActions && tickets.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {selectedTickets.size === tickets.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedTickets.size === tickets.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}

      {/* Tickets Grid */}
      <div className="space-y-4">
        {tickets.map((ticket, index) => (
          <div key={ticket.id} className="relative">
            {showBulkActions && (
              <div className="absolute left-4 top-6 z-10">
                <button
                  onClick={() => handleTicketSelect(ticket.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {selectedTickets.has(ticket.id) ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
            <TicketCard
              ticket={ticket}
              onClick={() => onTicketSelect?.(ticket.id)}
              delay={index * 50}
              className={cn(
                showBulkActions && 'ml-8',
                selectedTickets.has(ticket.id) && 'ring-2 ring-blue-500'
              )}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tickets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters to find tickets.'
              : 'No support tickets have been created yet.'}
          </p>
          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Ticket
            </button>
          )}
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