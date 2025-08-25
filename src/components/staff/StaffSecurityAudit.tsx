'use client';

import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Clock,
  User,
  Lock,
  Eye,
  Filter,
  Download,
  ChevronDown,
  CheckCircle,
  XCircle,
  Activity,
  Globe,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useStaffSecurityAudit, useStaffActivity, useStaffStats } from '@/lib/hooks/use-staff';

interface StaffSecurityAuditProps {
  className?: string;
}

export function StaffSecurityAudit({ className = '' }: StaffSecurityAuditProps) {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate date range based on selection
  const getDateRange = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '24h':
        startDate.setHours(endDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = getDateRange(timeRange);

  // Fetch real data from API
  const { data: securityAuditData, isLoading: auditLoading } = useStaffSecurityAudit({
    startDate,
    endDate
  });
  
  const { data: staffStats, isLoading: statsLoading } = useStaffStats({
    startDate,
    endDate,
    includeSecurityEvents: true
  });

  const isLoading = auditLoading || statsLoading;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Use real data or fallback to sensible defaults
  const overview = {
    totalEvents: securityAuditData?.totalEvents || staffStats?.securityMetrics?.totalEvents || 0,
    criticalEvents: securityAuditData?.criticalEvents || staffStats?.securityMetrics?.criticalEvents || 0,
    warnings: securityAuditData?.warnings || staffStats?.securityMetrics?.warnings || 0,
    successfulLogins: securityAuditData?.successfulLogins || staffStats?.securityMetrics?.successfulLogins || 0,
    failedLogins: securityAuditData?.failedLogins || staffStats?.securityMetrics?.failedLogins || 0,
    securityScore: Math.round((securityAuditData?.securityScore || staffStats?.securityMetrics?.securityCompliance || 100))
  };

  const recentEvents = securityAuditData?.recentEvents || staffStats?.securityEvents || [];
  const riskAnalysis = securityAuditData?.riskAnalysis || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">Security Audit</h2>
            <p className="text-sm text-muted-foreground">
              Monitor staff security events and access patterns
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.securityScore}%</div>
            <p className="text-xs text-muted-foreground">
              Overall security compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Logins</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.successfulLogins}</div>
            <p className="text-xs text-muted-foreground">
              Selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.failedLogins}</div>
            <p className="text-xs text-muted-foreground">
              Selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overview.warnings}</div>
            <p className="text-xs text-muted-foreground">
              Selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Selected period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="login_success">Successful Logins</SelectItem>
                    <SelectItem value="login_failed">Failed Logins</SelectItem>
                    <SelectItem value="permission_change">Permission Changes</SelectItem>
                    <SelectItem value="password_change">Password Changes</SelectItem>
                    <SelectItem value="session_timeout">Session Timeouts</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="error">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Security Events</CardTitle>
              <CardDescription>Chronological list of security-related events</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.length > 0 ? recentEvents
                    .filter(event => 
                      filter === 'all' || event.type === filter || event.eventType === filter
                    )
                    .filter(event => 
                      !searchTerm || 
                      (event.user && event.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (event.staffName && event.staffName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (event.action && event.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .slice(0, 20)
                    .map((event, index) => (
                    <TableRow key={event.id || `event-${index}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatTimestamp(event.timestamp || event.createdAt || new Date().toISOString())}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(event.severity || event.level || 'info')}
                          <Badge variant={getSeverityColor(event.severity || event.level || 'info') as any}>
                            {event.severity || event.level || 'info'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{event.user || event.staffName || 'Unknown User'}</div>
                          <div className="text-xs text-muted-foreground">{event.email || event.staffEmail || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event.action || event.eventType || 'Unknown Action'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{event.location || 'Unknown'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{event.ipAddress || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm">{event.details || event.description || 'No details available'}</div>
                          <div className="text-xs text-muted-foreground mt-1">{event.userAgent || 'N/A'}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No security events found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Analysis</CardTitle>
              <CardDescription>Security risk assessment by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAnalysis.length > 0 ? riskAnalysis.map((risk, index) => (
                  <div key={risk.category || `risk-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{risk.category || risk.name || 'Unknown Category'}</div>
                        <div className="text-sm text-muted-foreground">{risk.description || 'No description available'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">{risk.issues || risk.count || 0} issues</div>
                        <div className="text-xs text-muted-foreground">detected</div>
                      </div>
                      <Badge variant={getRiskColor(risk.risk || risk.level || 'Low') as any}>
                        {risk.risk || risk.level || 'Low'} Risk
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted-foreground py-8">
                    No risk analysis data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Recommendations</CardTitle>
              <CardDescription>Automated security recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">High Priority</div>
                    <div className="text-sm text-red-700">Review unusual data access patterns from staff members</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Medium Priority</div>
                    <div className="text-sm text-yellow-700">Implement additional authentication for permission changes</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-800">Low Priority</div>
                    <div className="text-sm text-blue-700">Monitor session timeouts and implement automatic logout policies</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}