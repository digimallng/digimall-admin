'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Server,
  Settings,
  Monitor,
  Activity,
  HardDrive,
  Archive,
  FileText,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Database,
  Wifi,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { SystemHealthMonitor } from '@/components/system/SystemHealthMonitor';
import { SystemMetricsChart } from '@/components/system/SystemMetricsChart';
import { SystemConfigManager } from '@/components/system/SystemConfigManager';
import { MaintenanceModeToggle } from '@/components/system/MaintenanceModeToggle';
import { CacheManager } from '@/components/system/CacheManager';
import { BackupManager } from '@/components/system/BackupManager';
import { SystemLogsViewer } from '@/components/system/SystemLogsViewer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { systemService } from '@/lib/api/services/system.service';

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'maintenance' | 'cache' | 'backup' | 'logs'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch system status for the overview stats
  const {
    data: systemStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['system', 'status'],
    queryFn: () => systemService.getSystemStatus(),
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 3,
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Monitor, description: 'System health and metrics' },
    { id: 'config', label: 'Configuration', icon: Settings, description: 'System settings' },
    { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle, description: 'Maintenance mode' },
    { id: 'cache', label: 'Cache', icon: HardDrive, description: 'Cache management' },
    { id: 'backup', label: 'Backup', icon: Archive, description: 'System backups' },
    { id: 'logs', label: 'Logs', icon: FileText, description: 'System logs' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'critical':
      case 'error':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
      case 'error':
        return XCircle;
      default:
        return Clock;
    }
  };

  // Mock service data - in real implementation, this would come from systemStatus
  const services = [
    { name: 'API Server', status: 'healthy', uptime: 99.9, responseTime: 45 },
    { name: 'Database', status: 'healthy', uptime: 99.8, responseTime: 12 },
    { name: 'Redis Cache', status: 'healthy', uptime: 100, responseTime: 2 },
    { name: 'Message Queue', status: 'healthy', uptime: 99.5, responseTime: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Management</h1>
          <p className="text-muted-foreground">
            Comprehensive system monitoring and administration tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchStatus()}
            disabled={isLoadingStatus}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoadingStatus && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(systemStatus?.status || 'unknown')}>
                      {systemStatus?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">All systems operational</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {systemStatus?.cpu?.usage || 0}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">2.5% lower</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {systemStatus?.memory?.percentage || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemStatus?.memory?.used || '0 GB'} / {systemStatus?.memory?.total || '0 GB'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingStatus ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {systemStatus?.uptime?.days || 0}d {systemStatus?.uptime?.hours || 0}h
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    99.9% availability
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Service Status Cards - Only on Overview Tab */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Services Status</CardTitle>
            <p className="text-sm text-muted-foreground">Monitor the health of all system services</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const StatusIcon = getStatusIcon(service.status);

                return (
                  <Card key={service.name} className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <StatusIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{service.name}</p>
                              <Badge className={cn("text-xs", getStatusColor(service.status))}>
                                {service.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Uptime</span>
                            <span className="font-medium">{service.uptime}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Response Time</span>
                            <span className="font-medium">{service.responseTime}ms</span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${service.uptime}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <SystemHealthMonitor />
          <SystemMetricsChart />
        </TabsContent>

        <TabsContent value="config">
          <SystemConfigManager />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceModeToggle />
        </TabsContent>

        <TabsContent value="cache">
          <CacheManager />
        </TabsContent>

        <TabsContent value="backup">
          <BackupManager />
        </TabsContent>

        <TabsContent value="logs">
          <SystemLogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
