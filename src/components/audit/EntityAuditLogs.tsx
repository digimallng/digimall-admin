'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Package,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  ChevronLeft,
  Eye,
  User,
  ExternalLink,
} from 'lucide-react';
import { auditService, AuditLog, AuditStatus } from '@/services/audit.service';

interface EntityAuditLogsProps {
  entityType: string;
  entityId: string;
  entityName?: string;
  onBack?: () => void;
}

export default function EntityAuditLogs({ 
  entityType, 
  entityId, 
  entityName,
  onBack 
}: EntityAuditLogsProps) {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const limit = 20;

  // Fetch entity audit logs
  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entity-audit-logs', entityType, entityId, page, limit],
    queryFn: () => auditService.getEntityAuditLogs(entityType, entityId, page, limit),
    enabled: !!entityType && !!entityId,
  });

  // Get entity icon based on type
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'product':
      case 'products':
        return Package;
      case 'user':
      case 'users':
        return User;
      case 'order':
      case 'orders':
        return Activity;
      case 'vendor':
      case 'vendors':
        return Shield;
      default:
        return Package;
    }
  };

  const EntityIcon = getEntityIcon(entityType);

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auditData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Failed to load entity audit logs</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { data: logs, meta } = auditData;

  // Group logs by user for timeline visualization
  const logsByUser = logs?.reduce((acc, log) => {
    const userKey = log.user?.email || log.userId || 'system';
    if (!acc[userKey]) {
      acc[userKey] = [];
    }
    acc[userKey].push(log);
    return acc;
  }, {} as Record<string, AuditLog[]>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
            <EntityIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entity Audit Trail</h1>
            <p className="text-gray-600">
              {entityName || `${entityType} ${entityId}`} • {meta?.total || 0} actions recorded
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Changes</dt>
              <dd className="text-2xl font-semibold text-gray-900">{meta?.total || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Contributors</dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {Object.keys(logsByUser).length}
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">High Risk Changes</dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {logs ? logs.filter(log => log.riskScore >= 8).length : 0}
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Last Modified</dt>
              <dd className="text-sm font-semibold text-gray-900">
                {logs && logs.length > 0 
                  ? format(new Date(logs[0].createdAt), 'MMM dd, HH:mm')
                  : 'N/A'
                }
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Information */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <EntityIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Entity Details</h3>
            <div className="text-sm text-blue-800">
              <span className="font-medium">Type:</span> {entityType} •{' '}
              <span className="font-medium">ID:</span> {entityId}
              {entityName && (
                <>
                  {' • '}
                  <span className="font-medium">Name:</span> {entityName}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Change Timeline</h2>
        </div>

        <div className="p-6">
          {logs && logs.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {logs.map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== logs.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            log.status === AuditStatus.SUCCESS ? 'bg-green-500' :
                            log.status === AuditStatus.FAILURE ? 'bg-red-500' :
                            log.status === AuditStatus.WARNING ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            {log.status === AuditStatus.SUCCESS ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : log.status === AuditStatus.FAILURE ? (
                              <XCircle className="w-5 h-5 text-white" />
                            ) : log.status === AuditStatus.WARNING ? (
                              <AlertTriangle className="w-5 h-5 text-white" />
                            ) : (
                              <Clock className="w-5 h-5 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {log.actionDisplayName || log.action.replace(/_/g, ' ')}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                                {log.status}
                              </span>
                              {log.riskScore >= 8 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  High Risk
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              by{' '}
                              <span className="font-medium">
                                {log.user?.email || log.userId || 'System'}
                              </span>
                              {log.ipAddress && (
                                <span className="text-gray-400"> from {log.ipAddress}</span>
                              )}
                            </p>
                            {log.description && (
                              <p className="mt-1 text-sm text-gray-600">{log.description}</p>
                            )}
                            {log.errorMessage && (
                              <div className="mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                                <p className="text-sm text-red-800">
                                  <span className="font-medium">Error:</span> {log.errorMessage}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(log.riskScore)}`}>
                              Risk: {log.riskScore}/10
                            </span>
                            <time dateTime={log.createdAt.toString()}>
                              {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                            </time>
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Recorded</h3>
              <p className="text-gray-500">This entity has no audit trail history.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((meta.page - 1) * meta.limit) + 1} to{' '}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 1}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {meta.page} of {meta.pages}
              </span>
              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page === meta.pages}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contributors Summary */}
      {Object.keys(logsByUser).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contributors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(logsByUser).map(([user, userLogs]) => (
              <div key={user} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate" title={user}>
                      {user === 'system' ? 'System' : user}
                    </p>
                    <p className="text-xs text-gray-500">{userLogs.length} actions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Last: {format(new Date(userLogs[0].createdAt), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Change Details</h3>
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
                      <label className="block text-sm font-medium text-gray-700">Performed By</label>
                      <p className="text-sm text-gray-900">{selectedLog.user?.email || selectedLog.userId || 'System'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Entity</label>
                      <p className="text-sm text-gray-900">{selectedLog.resource}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Entity ID</label>
                      <p className="text-sm text-gray-900">{selectedLog.resourceId}</p>
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
                  {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Change Details</label>
                      <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
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