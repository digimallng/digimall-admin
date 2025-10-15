'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  User,
  CreditCard,
  Flag,
  Ban,
  Activity,
  RefreshCw,
  AlertCircle,
  MoreVertical,
  Globe,
  MapPin,
  Monitor,
  TrendingUp,
  FileText,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { securityService } from '@/lib/api/services/security.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function SecurityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('events');
  const [blockIPDialog, setBlockIPDialog] = useState(false);
  const [blockIPForm, setBlockIPForm] = useState({
    ipAddress: '',
    reason: '',
  });

  const queryClient = useQueryClient();

  // 1. Security Events
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['security-events', typeFilter, severityFilter],
    queryFn: () => securityService.getEvents({
      type: typeFilter !== 'all' ? typeFilter as any : undefined,
      severity: severityFilter !== 'all' ? severityFilter as any : undefined,
      page: 1,
      limit: 20,
    }),
  });

  // 2. Security Alerts
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: () => securityService.getAlerts(),
  });

  // 3. Audit Log
  const { data: auditLogData, isLoading: auditLogLoading } = useQuery({
    queryKey: ['audit-log'],
    queryFn: () => securityService.getAuditLog({ days: 30 }),
  });

  // 4. Fraud Detection
  const { data: fraudData, isLoading: fraudLoading } = useQuery({
    queryKey: ['fraud-detection'],
    queryFn: () => securityService.getFraudDetection(),
  });

  // 5. Threat Intelligence
  const { data: threatData, isLoading: threatLoading } = useQuery({
    queryKey: ['threat-intelligence'],
    queryFn: () => securityService.getThreatIntelligence(),
  });

  // 6. Login Analytics
  const { data: loginAnalytics, isLoading: loginLoading } = useQuery({
    queryKey: ['login-analytics'],
    queryFn: () => securityService.getLoginAnalytics({ days: 30 }),
  });

  // 7. Blocked IPs
  const { data: blockedIPsData, isLoading: blockedIPsLoading, refetch: refetchBlockedIPs } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: () => securityService.getBlockedIPs(),
  });

  // 8. Block IP Mutation
  const blockIPMutation = useMutation({
    mutationFn: (data: { ipAddress: string; reason: string }) =>
      securityService.blockIP(data),
    onSuccess: () => {
      toast.success('IP address blocked successfully');
      setBlockIPDialog(false);
      setBlockIPForm({ ipAddress: '', reason: '' });
      refetchBlockedIPs();
      refetchEvents();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to block IP address');
    },
  });

  // 9. Unblock IP Mutation
  const unblockIPMutation = useMutation({
    mutationFn: (ipAddress: string) => securityService.unblockIP(ipAddress),
    onSuccess: () => {
      toast.success('IP address unblocked successfully');
      refetchBlockedIPs();
      refetchEvents();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unblock IP address');
    },
  });

  const handleBlockIP = () => {
    if (!blockIPForm.ipAddress || !blockIPForm.reason) {
      toast.error('IP address and reason are required');
      return;
    }
    blockIPMutation.mutate(blockIPForm);
  };

  const handleUnblockIP = (ipAddress: string) => {
    if (confirm(`Are you sure you want to unblock ${ipAddress}?`)) {
      unblockIPMutation.mutate(ipAddress);
    }
  };

  const events = eventsData?.data || [];
  const alerts = alertsData?.alerts || [];
  const auditLogs = auditLogData?.logs || [];
  const blockedIPs = blockedIPsData?.blocked || [];

  // Statistics
  const stats = {
    totalEvents: events.length,
    totalAlerts: alerts.length,
    activeAlerts: alertsData?.summary?.active || 0,
    resolvedAlerts: alertsData?.summary?.resolved || 0,
    criticalAlerts: alerts.filter((a: any) => a.severity === 'critical').length,
    blockedIPs: blockedIPs.length,
    suspiciousOrders: fraudData?.suspicious?.orders || 0,
    suspiciousUsers: fraudData?.suspicious?.users || 0,
    successRate: loginAnalytics?.successRate || 0,
    failedLogins: loginAnalytics?.failed || 0,
  };

  const getSeverityColor = (severity: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'resolved':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  const isLoading = eventsLoading || alertsLoading || auditLogLoading || fraudLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Audit</h1>
          <p className="text-muted-foreground">
            Platform security monitoring, threat detection, and audit logging
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            refetchEvents();
            refetchAlerts();
            refetchBlockedIPs();
          }} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setBlockIPDialog(true)}>
            <Ban className="w-4 h-4 mr-2" />
            Block IP
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">Security events tracked</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">{stats.activeAlerts}</div>
                <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {blockedIPsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.blockedIPs}</div>
                <p className="text-xs text-muted-foreground mt-1">Addresses blocked</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Login Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loginLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Authentication rate</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="ips">Blocked IPs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filter Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="failed_login">Failed Login</SelectItem>
                      <SelectItem value="permission_change">Permission Change</SelectItem>
                      <SelectItem value="ip_blocked">IP Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {eventsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event: any) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                        <p className="text-sm">{event.details?.reason || 'Security event detected'}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {event.email && <span>User: {event.email}</span>}
                          {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                          <span>{format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No events found</h3>
                <p className="text-sm text-muted-foreground">
                  No security events match your filters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAlerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.activeAlerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolvedAlerts}</div>
              </CardContent>
            </Card>
          </div>

          {alertsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <Card key={alert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{alert.type.replace(/_/g, ' ')}</h3>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.details}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                          <span>{format(new Date(alert.createdAt), 'MMM dd, HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No alerts</h3>
                <p className="text-sm text-muted-foreground">
                  All security alerts have been resolved
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Suspicious Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {fraudData?.suspicious?.orders || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Flagged Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {fraudData?.suspicious?.users || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Suspicious Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {fraudData?.suspicious?.transactions || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {fraudData?.flaggedOrders && fraudData.flaggedOrders.length > 0 ? (
                  <div className="space-y-3">
                    {fraudData.flaggedOrders.map((order: any) => (
                      <div key={order.orderId} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Order #{order.orderId}</p>
                          <p className="text-xs text-muted-foreground">{order.reason}</p>
                        </div>
                        <Badge variant="destructive">Risk: {order.riskScore}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No flagged orders</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flagged Users</CardTitle>
              </CardHeader>
              <CardContent>
                {fraudData?.flaggedUsers && fraudData.flaggedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {fraudData.flaggedUsers.map((user: any) => (
                      <div key={user.userId} className="flex items-start justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.reason}</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                          Risk: {user.riskScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No flagged users</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Activity Log
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Last 30 days - {auditLogData?.meta?.total || 0} total actions
              </p>
            </CardHeader>
            <CardContent>
              {auditLogLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.slice(0, 10).map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          By: {log.performedBy.staffName} ({log.performedBy.role})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: {log.target.type} #{log.target.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No audit logs available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked IPs Tab */}
        <TabsContent value="ips" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Blocked IP Addresses
                </CardTitle>
                <Button onClick={() => setBlockIPDialog(true)} size="sm">
                  <Ban className="h-4 w-4 mr-2" />
                  Block New IP
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {blockedIPsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : blockedIPs.length > 0 ? (
                <div className="space-y-3">
                  {blockedIPs.map((ip: any) => (
                    <div key={ip.ip} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium font-mono">{ip.ip}</p>
                        <p className="text-xs text-muted-foreground">{ip.reason}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Blocked: {format(new Date(ip.blockedAt), 'MMM dd, HH:mm')}</span>
                          {ip.expiresAt && (
                            <span>Expires: {format(new Date(ip.expiresAt), 'MMM dd, HH:mm')}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockIP(ip.ip)}
                        disabled={unblockIPMutation.isPending}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No blocked IP addresses</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Login Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">{loginAnalytics?.period || 'Last 30 days'}</p>
              </CardHeader>
              <CardContent>
                {loginLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : loginAnalytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Successful</p>
                        <p className="text-2xl font-bold text-green-600">{loginAnalytics.successful}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{loginAnalytics.failed}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-3xl font-bold text-blue-600">{loginAnalytics.successRate}%</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Intelligence</CardTitle>
                <p className="text-sm text-muted-foreground">Known threats overview</p>
              </CardHeader>
              <CardContent>
                {threatLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : threatData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Known Threats</p>
                        <p className="text-2xl font-bold">{threatData.knownThreats}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Blocked IPs</p>
                        <p className="text-2xl font-bold">{threatData.blockedIPs}</p>
                      </div>
                    </div>
                    {threatData.recentThreats && threatData.recentThreats.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recent Threats</p>
                        {threatData.recentThreats.slice(0, 3).map((threat: any, idx: number) => (
                          <div key={idx} className="p-2 bg-red-50 rounded text-xs">
                            <p className="font-medium">{threat.type.replace(/_/g, ' ')}</p>
                            <p className="text-muted-foreground">{threat.source} - {threat.attempts} attempts</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {loginAnalytics?.byCountry && loginAnalytics.byCountry.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Logins by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loginAnalytics.byCountry.slice(0, 5).map((country: any) => (
                    <div key={country.country} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{country.country}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{country.count} logins</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Block IP Dialog */}
      <Dialog open={blockIPDialog} onOpenChange={setBlockIPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block IP Address</DialogTitle>
            <DialogDescription>
              Block an IP address from accessing the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                placeholder="192.168.1.100"
                value={blockIPForm.ipAddress}
                onChange={(e) => setBlockIPForm({ ...blockIPForm, ipAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Reason for blocking this IP..."
                value={blockIPForm.reason}
                onChange={(e) => setBlockIPForm({ ...blockIPForm, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockIPDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockIP} disabled={blockIPMutation.isPending}>
              {blockIPMutation.isPending ? 'Blocking...' : 'Block IP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
