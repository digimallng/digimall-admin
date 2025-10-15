'use client';

import { useState } from 'react';
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
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useSystemConfig,
  useSystemHealth,
  useSystemMetrics,
  useDatabaseStats,
  useSystemLogs,
  useUpdateSystemConfig,
  useClearCache,
  useSystemBackup,
} from '@/lib/hooks/use-system';

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'actions'>('logs');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [logLimit, setLogLimit] = useState(100);
  const [logLevel, setLogLevel] = useState('');

  // Fetch system data
  const { data: config, isLoading: configLoading, error: configError, refetch: refetchConfig } = useSystemConfig();
  const { data: health, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useSystemHealth();
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useSystemMetrics();
  const { data: dbStats, isLoading: dbStatsLoading, error: dbStatsError, refetch: refetchDbStats } = useDatabaseStats();
  const { data: logs, isLoading: logsLoading, error: logsError, refetch: refetchLogs } = useSystemLogs({
    limit: logLimit,
    level: logLevel || undefined
  });

  // Log data for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('System Data:', { config, health, metrics, dbStats, logs });
    console.log('Errors:', { configError, healthError, metricsError, dbStatsError, logsError });
  }

  // Mutations
  const updateConfig = useUpdateSystemConfig();
  const clearCache = useClearCache();
  const backup = useSystemBackup();

  const handleClearCache = async () => {
    try {
      const result = await clearCache.mutateAsync();
      toast.success(result.message || 'Cache cleared successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cache');
    }
  };

  const handleBackup = async () => {
    try {
      const result = await backup.mutateAsync();
      toast.success(result.message || 'Backup initiated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate backup');
    }
  };

  const handleToggleMaintenanceMode = async (enabled: boolean) => {
    try {
      await updateConfig.mutateAsync({ maintenanceMode: enabled });
      toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
      refetchConfig();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update maintenance mode');
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'up' || status === 'healthy') {
      return 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/10';
    }
    if (status === 'degraded') {
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/10';
    }
    return 'bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/10';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'up' || status === 'healthy') return CheckCircle;
    if (status === 'degraded') return AlertTriangle;
    return XCircle;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Management</h1>
          <p className="text-muted-foreground">
            Monitor system health, configuration, and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchHealth();
              refetchMetrics();
              refetchConfig();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto On' : 'Auto Off'}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : health?.status ? (
              <>
                <Badge className={getStatusColor(health.status)}>
                  {health.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">DB: {(health.database as any)?.status}</p>
              </>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dbStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (dbStats as any)?.users ? (
              <>
                <div className="text-2xl font-bold">{(dbStats as any).users.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{(dbStats as any).users.active || 0} active</p>
              </>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dbStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (dbStats as any)?.vendors ? (
              <>
                <div className="text-2xl font-bold">{(dbStats as any).vendors.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{(dbStats as any).vendors.active || 0} active</p>
              </>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dbStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (dbStats as any)?.products ? (
              <>
                <div className="text-2xl font-bold">{(dbStats as any).products.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{(dbStats as any).products.active || 0} active</p>
              </>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dbStatsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (dbStats as any)?.orders ? (
              <>
                <div className="text-2xl font-bold">{(dbStats as any).orders.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ₦{((dbStats as any).orders.totalRevenue || 0).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">N/A</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Performance */}
      {metricsLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metricsError ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">Error loading metrics: {metricsError.message}</p>
            <Button onClick={() => refetchMetrics()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : metrics ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Today's Orders</span>
                <span className="text-2xl font-bold">{(metrics as any).todayOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Today's Revenue</span>
                <span className="text-2xl font-bold">₦{((metrics as any).todayRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">System Uptime</span>
                <span className="font-medium">
                  {Math.floor(((metrics as any).systemUptime || 0) / 3600)}h {Math.floor((((metrics as any).systemUptime || 0) % 3600) / 60)}m
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Heap Used / Total</span>
                <span className="font-medium">
                  {((metrics as any).memoryUsage?.heapUsed / 1024 / 1024).toFixed(0)} MB / {((metrics as any).memoryUsage?.heapTotal / 1024 / 1024).toFixed(0)} MB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">RSS</span>
                <span className="font-medium">
                  {((metrics as any).memoryUsage?.rss / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">External</span>
                <span className="font-medium">
                  {((metrics as any).memoryUsage?.external / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Configuration */}
      {configLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : configError ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">Error loading configuration: {configError.message}</p>
            <Button onClick={() => refetchConfig()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : config?.platform ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Platform Name</Label>
                <p className="font-medium">{config.platform.name}</p>
              </div>
              <div>
                <Label>Version</Label>
                <p className="font-medium">{config.platform.version}</p>
              </div>
              <div>
                <Label>Environment</Label>
                <Badge>{config.platform.environment}</Badge>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <Switch
                  id="maintenance-mode"
                  checked={config.platform.maintenanceMode}
                  onCheckedChange={handleToggleMaintenanceMode}
                  disabled={updateConfig.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {config.features && (
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(config.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize text-sm">{key}</span>
                    <Badge variant={value ? "default" : "secondary"}>
                      {value ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {config.limits && (
            <Card>
              <CardHeader>
                <CardTitle>System Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Product Images</span>
                  <span className="font-medium">{config.limits.maxProductImages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max File Size</span>
                  <span className="font-medium">{(config.limits.maxFileSize / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Retention Days</span>
                  <span className="font-medium">{config.limits.orderRetentionDays}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* System Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cache Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Clear the system cache to free up memory and force refresh of cached data.
            </p>
            <Button
              onClick={handleClearCache}
              disabled={clearCache.isPending}
              variant="destructive"
              className="w-full"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              {clearCache.isPending ? 'Clearing...' : 'Clear Cache'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Initiate a full system backup. This process may take several minutes.
            </p>
            <Button
              onClick={handleBackup}
              disabled={backup.isPending}
              className="w-full"
            >
              <Archive className="h-4 w-4 mr-2" />
              {backup.isPending ? 'Initiating...' : 'Start Backup'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logs Section with Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted max-w-md">
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="h-4 w-4" />
            System Logs
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <Activity className="h-4 w-4" />
            Recent Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-0">
          <Card className="overflow-hidden">
            <CardHeader className="bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <CardTitle className="text-zinc-100 font-mono text-sm">system@digimall:~/logs</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Limit"
                    value={logLimit}
                    onChange={(e) => setLogLimit(parseInt(e.target.value) || 100)}
                    className="w-24 bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                  <Button onClick={() => refetchLogs()} variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="bg-zinc-950 dark:bg-black p-4 font-mono text-sm space-y-2 min-h-[400px]">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-2 animate-pulse">
                      <span className="text-zinc-600">[...</span>
                      <Skeleton className="h-4 flex-1 bg-zinc-800" />
                    </div>
                  ))}
                </div>
              ) : logs?.logs && logs.logs.length > 0 ? (
                <div className="bg-zinc-950 dark:bg-black p-4 font-mono text-sm space-y-1 max-h-[600px] overflow-y-auto">
                  {logs.logs.map((log, index) => {
                    const timestamp = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false });
                    const levelColor =
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warn' ? 'text-yellow-400' :
                      log.level === 'info' ? 'text-blue-400' :
                      'text-green-400';

                    return (
                      <div key={index} className="group hover:bg-zinc-900/50 px-2 py-1 rounded transition-colors">
                        <div className="flex gap-2 items-start">
                          <span className="text-zinc-500 text-xs select-none">{timestamp}</span>
                          <span className={cn("font-bold uppercase text-xs select-none", levelColor)}>
                            [{log.level}]
                          </span>
                          <span className="text-cyan-400 text-xs select-none">[{log.service}]</span>
                          <span className="text-zinc-300 flex-1">{log.message}</span>
                        </div>
                        {log.error && (
                          <div className="flex gap-2 items-start mt-1 ml-2">
                            <span className="text-red-500 text-xs">└─</span>
                            <span className="text-red-400 text-xs">Error: {log.error}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {logs.meta && (
                    <div className="border-t border-zinc-800 mt-4 pt-2 text-center">
                      <span className="text-zinc-500 text-xs">
                        Showing {logs.logs.length} of {logs.meta.total} logs
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-950 dark:bg-black p-8 font-mono text-sm min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-zinc-600 text-lg mb-2 block">$ tail -f /var/log/system.log</span>
                    <span className="text-zinc-500">No logs available</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-0">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Recent actions tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
