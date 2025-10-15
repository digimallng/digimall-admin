'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Eye,
  Search,
  Calendar,
  User,
  Activity,
  Clock,
} from 'lucide-react';
import {
  useAuditLogs,
  useAuditLogStatistics,
  useCriticalAuditLogs,
  useFailedAuditLogs,
} from '@/lib/api/hooks/use-audit';
import type { AuditLog, ActionType, SeverityLevel } from '@/lib/api/types/audit.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function AuditPage() {
  // State management
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'critical' | 'failed'>('all');

  // Filter states
  const [staffId, setStaffId] = useState<string>('');
  const [actionType, setActionType] = useState<ActionType | 'all'>('all');
  const [resource, setResource] = useState<string>('');
  const [severity, setSeverity] = useState<SeverityLevel | 'all'>('all');
  const [success, setSuccess] = useState<'all' | 'true' | 'false'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');

  // Build query params
  const buildQueryParams = () => {
    const params: any = { page, limit };
    if (staffId) params.staffId = staffId;
    if (actionType !== 'all') params.actionType = actionType;
    if (resource) params.resource = resource;
    if (severity !== 'all') params.severity = severity;
    if (success !== 'all') params.success = success === 'true';
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (search) params.search = search;
    if (ipAddress) params.ipAddress = ipAddress;
    return params;
  };

  // API queries
  const {
    data: auditData,
    isLoading,
    refetch,
  } = useAuditLogs(viewMode === 'all' ? buildQueryParams() : undefined);

  const { data: criticalData, isLoading: criticalLoading } = useCriticalAuditLogs(
    page,
    limit
  );

  const { data: failedData, isLoading: failedLoading } = useFailedAuditLogs(page, limit);

  const { data: statsData, isLoading: statsLoading } = useAuditLogStatistics();

  // Get current data based on view mode
  const getCurrentData = () => {
    if (viewMode === 'critical') return criticalData;
    if (viewMode === 'failed') return failedData;
    return auditData;
  };

  const getCurrentLoading = () => {
    if (viewMode === 'critical') return criticalLoading;
    if (viewMode === 'failed') return failedLoading;
    return isLoading;
  };

  const currentData = getCurrentData();
  const currentLoading = getCurrentLoading();
  const stats = statsData?.data?.data;

  // Helper functions
  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'high':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getActionTypeColor = (actionType: ActionType) => {
    switch (actionType) {
      case 'create':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'update':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'delete':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'login':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'logout':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const handleClearFilters = () => {
    setStaffId('');
    setActionType('all');
    setResource('');
    setSeverity('all');
    setSuccess('all');
    setStartDate('');
    setEndDate('');
    setSearch('');
    setIpAddress('');
    setPage(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and track all administrative actions and system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={currentLoading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', currentLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.totalLogs.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All activity records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.successRate}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.totalSuccess.toLocaleString()} successful operations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Operations</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.totalFailure.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Actions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.bySeverity.critical.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">High-risk operations</p>
            </CardContent>
          </Card>
        </div>
      )}

      {statsLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'all' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('all');
            setPage(1);
          }}
        >
          <Activity className="w-4 h-4 mr-2" />
          All Logs
        </Button>
        <Button
          variant={viewMode === 'critical' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('critical');
            setPage(1);
          }}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Critical
        </Button>
        <Button
          variant={viewMode === 'failed' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('failed');
            setPage(1);
          }}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Failed
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && viewMode === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions, resources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Action Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Action Type</label>
                <Select
                  value={actionType}
                  onValueChange={(value) => setActionType(value as ActionType | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select
                  value={severity}
                  onValueChange={(value) => setSeverity(value as SeverityLevel | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Success Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={success} onValueChange={(value) => setSuccess(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Success</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resource */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource</label>
                <Input
                  placeholder="product, user, order..."
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                />
              </div>

              {/* Staff ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Staff ID</label>
                <Input
                  placeholder="Filter by staff member..."
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* IP Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium">IP Address</label>
                <Input
                  placeholder="Filter by IP..."
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button onClick={() => refetch()}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {viewMode === 'all' && 'All Audit Logs'}
            {viewMode === 'critical' && 'Critical Audit Logs'}
            {viewMode === 'failed' && 'Failed Audit Logs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : currentData?.data?.data && currentData.data.data.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.data.data.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {log.staffId ? (
                            <div>
                              <div className="font-medium">
                                {log.staffId.firstName} {log.staffId.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.staffId.email}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">System</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{log.action}</div>
                          <Badge variant="outline" className={getActionTypeColor(log.actionType)}>
                            {log.actionType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{log.resource}</div>
                          {log.resourceId && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {log.resourceId.slice(0, 10)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            log.success
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          {log.success ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Success
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Failed
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
              <p className="text-sm text-muted-foreground">
                No activity records match your current filters
              </p>
            </div>
          )}

          {/* Pagination */}
          {currentData?.data?.pagination && currentData.data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing{' '}
                {(currentData.data.pagination.page - 1) * currentData.data.pagination.limit + 1} to{' '}
                {Math.min(
                  currentData.data.pagination.page * currentData.data.pagination.limit,
                  currentData.data.pagination.total
                )}{' '}
                of {currentData.data.pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground flex items-center px-3">
                  Page {page} of {currentData.data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === currentData.data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>Complete information about this audit entry</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Timestamp
                  </label>
                  <p className="text-sm">
                    {format(new Date(selectedLog.createdAt), 'PPP pp')}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <p className="text-sm font-medium">{selectedLog.action}</p>
                </div>
              </div>

              <Separator />

              {/* Staff Info */}
              {selectedLog.staffId ? (
                <div>
                  <h4 className="font-semibold mb-3">Staff Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm">
                        {selectedLog.staffId.firstName} {selectedLog.staffId.lastName}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{selectedLog.staffId.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <Badge>{selectedLog.staffId.role}</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold mb-3">Staff Information</h4>
                  <p className="text-sm text-muted-foreground italic">
                    System-generated action (no staff member associated)
                  </p>
                </div>
              )}

              <Separator />

              {/* Action Details */}
              <div>
                <h4 className="font-semibold mb-3">Action Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Action Type
                    </label>
                    <Badge className={getActionTypeColor(selectedLog.actionType)}>
                      {selectedLog.actionType}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Severity
                    </label>
                    <Badge className={getSeverityColor(selectedLog.severity)}>
                      {selectedLog.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Resource
                    </label>
                    <p className="text-sm font-mono">{selectedLog.resource}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Resource ID
                    </label>
                    <p className="text-sm font-mono">
                      {selectedLog.resourceId || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge
                      className={
                        selectedLog.success
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      {selectedLog.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {selectedLog.errorMessage && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">Error Message</h4>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                </>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Metadata</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLog.metadata.ipAddress && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            IP Address
                          </label>
                          <p className="text-sm font-mono">
                            {selectedLog.metadata.ipAddress}
                          </p>
                        </div>
                      )}
                      {selectedLog.metadata.userAgent && (
                        <div className="space-y-2 col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            User Agent
                          </label>
                          <p className="text-xs font-mono text-muted-foreground">
                            {selectedLog.metadata.userAgent}
                          </p>
                        </div>
                      )}
                      {selectedLog.metadata.endpoint && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Endpoint
                          </label>
                          <p className="text-sm font-mono">{selectedLog.metadata.endpoint}</p>
                        </div>
                      )}
                      {selectedLog.metadata.method && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            HTTP Method
                          </label>
                          <Badge>{selectedLog.metadata.method}</Badge>
                        </div>
                      )}
                      {selectedLog.metadata.duration && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Duration
                          </label>
                          <p className="text-sm">{selectedLog.metadata.duration}ms</p>
                        </div>
                      )}
                      {selectedLog.metadata.responseCode && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Response Code
                          </label>
                          <Badge
                            className={
                              selectedLog.metadata.responseCode < 400
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {selectedLog.metadata.responseCode}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {selectedLog.metadata.changes && (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Changes
                        </label>
                        <div className="bg-muted p-3 rounded text-xs font-mono">
                          <pre>{JSON.stringify(selectedLog.metadata.changes, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
