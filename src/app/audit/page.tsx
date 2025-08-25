'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Shield,
  Filter,
  Eye,
  Download,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { auditService, AuditLog, AuditFilterDto, AuditAction, AuditStatus } from '@/services/audit.service';
import { toast } from 'sonner';
import UserAuditLogs from '@/components/audit/UserAuditLogs';
import EntityAuditLogs from '@/components/audit/EntityAuditLogs';

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditFilterDto>({
    page: 1,
    limit: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'user' | 'entity'>('main');
  const [userView, setUserView] = useState<{ userId: string; userEmail?: string } | null>(null);
  const [entityView, setEntityView] = useState<{ entityType: string; entityId: string; entityName?: string } | null>(null);

  // Fetch audit logs with filters
  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditService.getAuditLogs(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });


  // Handle filter changes
  const handleFilterChange = (key: keyof AuditFilterDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Export functions
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      await auditService.exportAuditLogs(filters, format);

      toast({
        title: 'Export Successful',
        description: `Audit logs exported to ${format.toUpperCase()} successfully`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export audit logs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get status color
  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case AuditStatus.SUCCESS:
      case AuditStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case AuditStatus.FAILURE:
      case AuditStatus.FAILED:
        return 'text-red-600 bg-red-50';
      case AuditStatus.WARNING:
        return 'text-yellow-600 bg-yellow-50';
      case AuditStatus.PENDING:
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get risk color
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 8) return 'text-red-600 bg-red-50';
    if (riskScore >= 5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Handle view navigation
  const handleViewUser = (userId: string, userEmail?: string) => {
    setUserView({ userId, userEmail });
    setCurrentView('user');
  };

  const handleViewEntity = (entityType: string, entityId: string, entityName?: string) => {
    setEntityView({ entityType, entityId, entityName });
    setCurrentView('entity');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setUserView(null);
    setEntityView(null);
  };

  // Render specific views
  if (currentView === 'user' && userView) {
    return (
      <UserAuditLogs
        userId={userView.userId}
        userEmail={userView.userEmail}
        onBack={handleBackToMain}
      />
    );
  }

  if (currentView === 'entity' && entityView) {
    return (
      <EntityAuditLogs
        entityType={entityView.entityType}
        entityId={entityView.entityId}
        entityName={entityView.entityName}
        onBack={handleBackToMain}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600">Monitor and track all system activities</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>


      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                Action
              </label>
              <select
                id="action"
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Actions</option>
                {Object.values(AuditAction).map(action => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Statuses</option>
                {Object.values(AuditStatus).map(status => (
                  <option key={status} value={status}>
                    {status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value || undefined)}
                placeholder="Enter user ID..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="entityType" className="block text-sm font-medium text-gray-700">
                Resource Type
              </label>
              <input
                type="text"
                id="entityType"
                value={filters.entityType || ''}
                onChange={(e) => handleFilterChange('entityType', e.target.value || undefined)}
                placeholder="Enter resource type..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="datetime-local"
                id="startDate"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="requiresReview" className="block text-sm font-medium text-gray-700">
                Requires Review
              </label>
              <select
                id="requiresReview"
                value={filters.requiresReview?.toString() || ''}
                onChange={(e) => handleFilterChange('requiresReview', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All</option>
                <option value="true">Requires Review</option>
                <option value="false">No Review Required</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, limit: 20 })}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Audit Logs</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-red-500">
                    Failed to load audit logs
                  </td>
                </tr>
              ) : auditData?.data && auditData.data.length > 0 ? (
                auditData.data.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {log.actionDisplayName || log.action.replace(/_/g, ' ')}
                      </span>
                      {log.requiresReview && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Review Required
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(log.user?.email || log.userId) && log.userId !== 'system' ? (
                        <button
                          onClick={() => handleViewUser(log.userId!, log.user?.email)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {log.user?.email || log.userId}
                        </button>
                      ) : (
                        <span className="text-gray-500">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>
                        <div className="font-medium">{log.resource}</div>
                        {log.resourceId && (
                          <button
                            onClick={() => handleViewEntity(log.resource, log.resourceId!)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {log.resourceId}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(log.riskScore)}`}>
                        {log.riskScore}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {auditData?.meta && auditData.meta.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((auditData.meta.page - 1) * auditData.meta.limit) + 1} to{' '}
              {Math.min(auditData.meta.page * auditData.meta.limit, auditData.meta.total)} of{' '}
              {auditData.meta.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(auditData.meta.page - 1)}
                disabled={auditData.meta.page === 1}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {auditData.meta.page} of {auditData.meta.pages}
              </span>
              <button
                onClick={() => handlePageChange(auditData.meta.page + 1)}
                disabled={auditData.meta.page === auditData.meta.pages}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                      <p className="text-sm text-gray-900">{format(new Date(selectedLog.createdAt), 'PPP pp')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Action</label>
                      <p className="text-sm text-gray-900">{selectedLog.actionDisplayName || selectedLog.action}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User</label>
                      <p className="text-sm text-gray-900">{selectedLog.user?.email || selectedLog.userId || 'System'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Resource</label>
                      <p className="text-sm text-gray-900">{selectedLog.resource}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                      <p className="text-sm text-gray-900">{selectedLog.resourceId || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedLog.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-900">{selectedLog.description}</p>
                    </div>
                  )}
                  {selectedLog.ipAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IP Address</label>
                      <p className="text-sm text-gray-900">{selectedLog.ipAddress}</p>
                    </div>
                  )}
                  {selectedLog.errorMessage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Error Message</label>
                      <p className="text-sm text-red-600">{selectedLog.errorMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}