'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  User,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  Activity,
  Server
} from 'lucide-react';
import { systemService } from '@/lib/api/services/system.service';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import { cn } from '@/lib/utils/cn';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  action: string;
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  metadata?: any;
}

interface LogFilters {
  level?: string;
  search?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit: number;
  offset: number;
}

export function SystemLogsViewer() {
  const [filters, setFilters] = useState<LogFilters>({
    limit: 50,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['system', 'logs', filters],
    queryFn: async () => {
      try {
        const result = await systemService.getSystemLogs(filters.limit, filters.offset);
        console.log('Raw logs response:', result);
        return result;
      } catch (err) {
        console.error('Error fetching logs:', err);
        // Return fallback data instead of throwing
        return {
          logs: [],
          total: 0,
          page: 1,
          pages: 1,
          limit: filters.limit,
          error: err?.message || 'Failed to fetch logs',
        };
      }
    },
    refetchInterval: autoRefresh ? 30000 : false,
    retry: false, // Disable retry to avoid infinite loops
    onError: (error) => {
      console.error('Failed to fetch system logs:', error);
    },
  });

  // More defensive data extraction
  let logs: LogEntry[] = [];
  let totalLogs = 0;
  let currentPage = 1;
  let totalPages = 1;
  
  try {
    if (logsData) {
      console.log('Processing logs data:', logsData);
      
      // Handle different response structures
      if (Array.isArray(logsData)) {
        logs = logsData;
        totalLogs = logsData.length;
      } else if (logsData && typeof logsData === 'object') {
        logs = Array.isArray(logsData.logs) ? logsData.logs : [];
        totalLogs = logsData.total || logs.length;
      }
      
      currentPage = Math.floor(filters.offset / filters.limit) + 1;
      totalPages = Math.ceil(totalLogs / filters.limit) || 1;
    }
  } catch (dataError) {
    console.error('Error processing logs data:', dataError);
    logs = [];
    totalLogs = 0;
    currentPage = 1;
    totalPages = 1;
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'fatal':
        return XCircle;
      case 'warn':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'debug':
        return Activity;
      default:
        return Clock;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
      case 'fatal':
        return 'text-red-600 bg-red-50';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'debug':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const handleFilterChange = (key: keyof LogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 50,
      offset: 0,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-green-600';
    if (action.includes('UPDATE')) return 'text-blue-600';
    if (action.includes('DELETE')) return 'text-red-600';
    if (action.includes('LOGIN')) return 'text-purple-600';
    if (action.includes('ERROR') || action.includes('FAILED')) return 'text-red-600';
    return 'text-gray-600';
  };

  const logLevels = [
    { value: '', label: 'All Levels' },
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'fatal', label: 'Fatal' },
  ];

  if (isLoading && !logs.length) {
    return (
      <AnimatedCard>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard>
        <div className="p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Logs</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <GlowingButton onClick={() => refetch()} variant="secondary">
            Try Again
          </GlowingButton>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
          <p className="text-gray-600 mt-1">Monitor system activities and events</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Auto-refresh</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                autoRefresh ? 'bg-primary' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  autoRefresh ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
          <GlowingButton
            size="sm"
            variant="secondary"
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </GlowingButton>
          <GlowingButton
            size="sm"
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => refetch()}
          >
            Refresh
          </GlowingButton>
        </div>
      </div>

      {/* Filters */}
      <AnimatedCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {(filters.level || filters.search || filters.userId) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Search logs..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={filters.level || ''}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  {logLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-gray-600">
            <div>
              Showing {logs.length} of {totalLogs.toLocaleString()} log entries
            </div>
            <div>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Log Entries */}
      <div ref={logContainerRef} className="space-y-2">
        {logs.map((log) => {
          const LevelIcon = getLevelIcon(log.level);
          const isExpanded = expandedLogs.has(log.id);

          return (
            <AnimatedCard key={log.id}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('rounded-full p-1', getLevelColor(log.level))}>
                    <LevelIcon className="h-3 w-3" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', getLevelColor(log.level))}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {log.userId && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            {log.userId}
                          </span>
                        )}
                        {log.ipAddress && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Globe className="h-3 w-3" />
                            {log.ipAddress}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleLogExpansion(log.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium', getActionColor(log.action))}>
                          {log.action}
                        </span>
                        {log.resource && (
                          <span className="text-xs text-gray-500">
                            on {log.resource}
                            {log.resourceId && ` (${log.resourceId})`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{log.description}</p>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t bg-gray-50 -mx-4 px-4 py-3 rounded-b-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {log.userAgent && (
                            <div>
                              <span className="font-medium text-gray-600">User Agent:</span>
                              <p className="text-gray-800 mt-1 break-all">{log.userAgent}</p>
                            </div>
                          )}
                          {log.metadata && (
                            <div>
                              <span className="font-medium text-gray-600">Metadata:</span>
                              <pre className="text-gray-800 mt-1 bg-white p-2 rounded border text-xs overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlowingButton
              size="sm"
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(0)}
            >
              First
            </GlowingButton>
            <GlowingButton
              size="sm"
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => handlePageChange((currentPage - 2) * filters.limit)}
            >
              Previous
            </GlowingButton>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 
                ? i + 1 
                : currentPage >= totalPages - 2 
                  ? totalPages - 4 + i 
                  : currentPage - 2 + i;
              
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange((pageNum - 1) * filters.limit)}
                  className={cn(
                    'px-3 py-1 text-sm rounded',
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <GlowingButton
              size="sm"
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage * filters.limit)}
            >
              Next
            </GlowingButton>
            <GlowingButton
              size="sm"
              variant="secondary"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange((totalPages - 1) * filters.limit)}
            >
              Last
            </GlowingButton>
          </div>
        </div>
      )}

      {/* Empty state */}
      {logs.length === 0 && !isLoading && (
        <AnimatedCard>
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">
              {filters.search || filters.level || filters.userId
                ? 'Try adjusting your filters to see more results.'
                : 'No system logs are available at this time.'}
            </p>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}