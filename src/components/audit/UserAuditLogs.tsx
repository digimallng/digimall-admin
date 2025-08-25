'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  User,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  ChevronLeft,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { auditService, AuditLog, AuditStatus } from '@/services/audit.service';
import { toast } from 'sonner';

interface UserAuditLogsProps {
  userId: string;
  userEmail?: string;
  onBack?: () => void;
}

export default function UserAuditLogs({ userId, userEmail, onBack }: UserAuditLogsProps) {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const limit = 20;

  // Fetch user audit logs
  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-audit-logs', userId, page, limit],
    queryFn: () => auditService.getUserAuditLogs(userId, page, limit),
    enabled: !!userId,
  });

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
          <p>Failed to load user audit logs</p>
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
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Audit Trail</h1>
            <p className="text-gray-600">
              {userEmail || userId} • {meta?.total || 0} total actions
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
              <dt className="text-sm font-medium text-gray-500 truncate">Total Actions</dt>
              <dd className="text-2xl font-semibold text-gray-900">{meta?.total || 0}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {logs && logs.length > 0 
                  ? Math.round((logs.filter(log => log.status === AuditStatus.SUCCESS).length / logs.length) * 100)
                  : 0}%
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
              <dt className="text-sm font-medium text-gray-500 truncate">High Risk Actions</dt>
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
              <dt className="text-sm font-medium text-gray-500 truncate">Last Activity</dt>
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

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Activity Timeline</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        log.status === AuditStatus.SUCCESS ? 'bg-green-100' :
                        log.status === AuditStatus.FAILURE ? 'bg-red-100' :
                        log.status === AuditStatus.WARNING ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        {log.status === AuditStatus.SUCCESS ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : log.status === AuditStatus.FAILURE ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : log.status === AuditStatus.WARNING ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
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
                        {log.requiresReview && !log.isReviewed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Needs Review
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{format(new Date(log.createdAt), 'PPP pp')}</span>
                        {log.resource && (
                          <>
                            <span>•</span>
                            <span>{log.resource}{log.resourceId && ` (${log.resourceId})`}</span>
                          </>
                        )}
                        {log.ipAddress && (
                          <>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                          </>
                        )}
                      </div>
                      {log.description && (
                        <p className="mt-2 text-sm text-gray-600">{log.description}</p>
                      )}
                      {log.errorMessage && (
                        <div className="mt-2 p-3 bg-red-50 rounded-md">
                          <p className="text-sm text-red-800 font-medium">Error:</p>
                          <p className="text-sm text-red-700">{log.errorMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(log.riskScore)}`}>
                      Risk: {log.riskScore}/10
                    </span>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No audit logs found for this user</p>
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
                  <h3 className="text-lg font-medium text-gray-900">Action Details</h3>
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
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Risk Score</label>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(selectedLog.riskScore)}`}>
                        {selectedLog.riskScore}/10
                      </span>
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
                  {selectedLog.userAgent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User Agent</label>
                      <p className="text-sm text-gray-900 break-all">{selectedLog.userAgent}</p>
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
                      <label className="block text-sm font-medium text-gray-700">Additional Details</label>
                      <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
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