'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  Server,
  Database,
  Activity,
  Wifi,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  HardDrive,
  Globe,
  Monitor,
  Shield
} from 'lucide-react';
import { systemService } from '@/lib/api/services/system.service';
import { AnimatedCard, GlowingButton, ProgressRing } from '@/components/ui/AnimatedCard';
import { cn } from '@/lib/utils/cn';

interface HealthCheckResult {
  status: 'ok' | 'error';
  info?: any;
  error?: any;
  details?: any;
}

interface ServiceHealthData {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  lastCheck: string;
  uptime?: string;
  details?: any;
}

export default function HealthPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data: healthCheck,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['health', 'check'],
    queryFn: () => systemService.getHealthCheck(),
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 3,
  });

  const {
    data: readinessCheck,
    isLoading: isLoadingReadiness,
    error: readinessError,
    refetch: refetchReadiness,
  } = useQuery({
    queryKey: ['health', 'readiness'],
    queryFn: () => systemService.getReadinessCheck(),
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 3,
  });

  const {
    data: livenessCheck,
    isLoading: isLoadingLiveness,
    error: livenessError,
    refetch: refetchLiveness,
  } = useQuery({
    queryKey: ['health', 'liveness'],
    queryFn: () => systemService.getLivenessCheck(),
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 3,
  });

  const {
    data: detailedHealth,
    isLoading: isLoadingDetailed,
    error: detailedError,
    refetch: refetchDetailed,
  } = useQuery({
    queryKey: ['health', 'detailed'],
    queryFn: () => systemService.getDetailedHealth(),
    refetchInterval: autoRefresh ? 60000 : false,
    retry: 3,
  });

  const {
    data: databaseHealth,
    isLoading: isLoadingDatabase,
    error: databaseError,
    refetch: refetchDatabase,
  } = useQuery({
    queryKey: ['health', 'database'],
    queryFn: () => systemService.getDatabaseHealth(),
    refetchInterval: autoRefresh ? 60000 : false,
    retry: 3,
  });

  const handleRefreshAll = () => {
    refetchHealth();
    refetchReadiness();
    refetchLiveness();
    refetchDetailed();
    refetchDatabase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'ready':
      case 'alive':
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'not_ready':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'ready':
      case 'alive':
      case 'healthy':
        return CheckCircle;
      case 'warning':
      case 'not_ready':
        return AlertTriangle;
      case 'error':
      case 'critical':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getOverallHealth = () => {
    const checks = [healthCheck, readinessCheck, livenessCheck, databaseHealth];
    const healthyCount = checks.filter(check => 
      check?.status === 'ok' || check?.status === 'ready' || check?.status === 'alive' || check?.status === 'healthy'
    ).length;
    const totalChecks = checks.filter(check => check).length;
    
    return totalChecks > 0 ? (healthyCount / totalChecks) * 100 : 0;
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const isLoading = isLoadingHealth || isLoadingReadiness || isLoadingLiveness || isLoadingDetailed;
  const overallHealth = getOverallHealth();

  if (isLoading && !healthCheck) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <AnimatedCard key={i}>
            <div className="p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-600/5 via-blue-600/5 to-purple-600/5 rounded-3xl" />
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Health Monitoring
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Real-time system health checks and diagnostics
              </p>
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
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={handleRefreshAll}
              >
                Refresh All
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard delay={0}>
          <div className="p-6 text-center">
            <div className="mx-auto mb-4">
              <ProgressRing
                progress={overallHealth}
                size={100}
                strokeWidth={6}
                color={overallHealth > 90 ? '#10B981' : overallHealth > 70 ? '#F59E0B' : '#EF4444'}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Health</h3>
            <p className="text-sm text-gray-600">System status overview</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-green-500 to-emerald-600">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Service Status</p>
              <p className={cn('text-2xl font-bold', healthCheck?.status === 'ok' ? 'text-green-600' : 'text-red-600')}>
                {healthCheck?.status === 'ok' ? 'Operational' : 'Issues Detected'}
              </p>
              <p className="text-xs text-gray-500">Primary health check</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-blue-500 to-cyan-600">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Readiness</p>
              <p className={cn('text-2xl font-bold', readinessCheck?.status === 'ready' ? 'text-green-600' : 'text-yellow-600')}>
                {readinessCheck?.status === 'ready' ? 'Ready' : 'Not Ready'}
              </p>
              <p className="text-xs text-gray-500">Service readiness</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-purple-500 to-indigo-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Liveness</p>
              <p className={cn('text-2xl font-bold', livenessCheck?.status === 'alive' ? 'text-green-600' : 'text-red-600')}>
                {livenessCheck?.status === 'alive' ? 'Alive' : 'Dead'}
              </p>
              <p className="text-xs text-gray-500">Process status</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Health Check Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comprehensive Health Check */}
        <AnimatedCard delay={400}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-gradient-to-r from-green-500 to-emerald-600">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Health Check</h3>
                  <p className="text-sm text-gray-600">Primary system health assessment</p>
                </div>
              </div>
              {healthCheck?.status && (
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(healthCheck.status))}>
                  {healthCheck.status.toUpperCase()}
                </span>
              )}
            </div>

            {healthCheck ? (
              <div className="space-y-4">
                {healthCheck.info && Object.keys(healthCheck.info).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Components Status</h4>
                    <div className="space-y-2">
                      {Object.entries(healthCheck.info).map(([key, value]: [string, any]) => {
                        const StatusIcon = getStatusIcon(value?.status || 'unknown');
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn('h-4 w-4', getStatusColor(value?.status || 'unknown').split(' ')[0])} />
                              <span className="font-medium">{value?.status || 'Unknown'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {healthError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Health Check Error</p>
                        <p className="text-sm text-red-700 mt-1">{healthError.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <XCircle className="h-12 w-12 mx-auto mb-2" />
                <p>Health check data unavailable</p>
              </div>
            )}
          </div>
        </AnimatedCard>

        {/* Database Health */}
        <AnimatedCard delay={500}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-gradient-to-r from-blue-500 to-cyan-600">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Database Health</h3>
                  <p className="text-sm text-gray-600">Database connection and performance</p>
                </div>
              </div>
              {databaseHealth?.status && (
                <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(databaseHealth.status))}>
                  {databaseHealth.status.toUpperCase()}
                </span>
              )}
            </div>

            {databaseHealth ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={cn('ml-2 font-medium', getStatusColor(databaseHealth.status).split(' ')[0])}>
                      {databaseHealth.status}
                    </span>
                  </div>
                  {databaseHealth.responseTime && (
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <span className="ml-2 font-medium text-gray-900">{databaseHealth.responseTime}</span>
                    </div>
                  )}
                  {databaseHealth.connection && (
                    <>
                      <div>
                        <span className="text-gray-600">Host:</span>
                        <span className="ml-2 font-medium text-gray-900">{databaseHealth.connection.host}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Port:</span>
                        <span className="ml-2 font-medium text-gray-900">{databaseHealth.connection.port}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Database:</span>
                        <span className="ml-2 font-medium text-gray-900">{databaseHealth.connection.database}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium text-gray-900">{databaseHealth.connection.type}</span>
                      </div>
                    </>
                  )}
                </div>

                {databaseError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Database Connection Error</p>
                        <p className="text-sm text-red-700 mt-1">{databaseError.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-2" />
                <p>Database health data unavailable</p>
              </div>
            )}
          </div>
        </AnimatedCard>
      </div>

      {/* Detailed System Information */}
      {detailedHealth && (
        <AnimatedCard delay={600}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Detailed System Information</h3>
              <div className="text-sm text-gray-500">
                Response Time: {detailedHealth.responseTime}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Service Info */}
              <div className="text-center">
                <div className="rounded-lg p-3 bg-blue-50 mb-3 inline-block">
                  <Server className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Service</p>
                <p className="font-semibold text-gray-900">{detailedHealth.service || 'admin-service'}</p>
              </div>

              {/* Environment */}
              <div className="text-center">
                <div className="rounded-lg p-3 bg-green-50 mb-3 inline-block">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Environment</p>
                <p className="font-semibold text-gray-900">{detailedHealth.environment || 'development'}</p>
              </div>

              {/* Version */}
              <div className="text-center">
                <div className="rounded-lg p-3 bg-purple-50 mb-3 inline-block">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Version</p>
                <p className="font-semibold text-gray-900">{detailedHealth.version || '1.0.0'}</p>
              </div>

              {/* Uptime */}
              <div className="text-center">
                <div className="rounded-lg p-3 bg-orange-50 mb-3 inline-block">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Uptime</p>
                <p className="font-semibold text-gray-900">
                  {detailedHealth.metrics?.uptime ? formatUptime(detailedHealth.metrics.uptime) : 'N/A'}
                </p>
              </div>
            </div>

            {/* System Metrics */}
            {detailedHealth.metrics && (
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4">System Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Memory Usage</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">RSS:</span>
                        <span className="font-medium">{formatMemory(detailedHealth.metrics.memoryUsage?.rss || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heap Total:</span>
                        <span className="font-medium">{formatMemory(detailedHealth.metrics.memoryUsage?.heapTotal || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heap Used:</span>
                        <span className="font-medium">{formatMemory(detailedHealth.metrics.memoryUsage?.heapUsed || 0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Process Info</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">PID:</span>
                        <span className="font-medium">{detailedHealth.metrics.pid || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CPU User:</span>
                        <span className="font-medium">{detailedHealth.metrics.cpuUsage?.user || 0}μs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CPU System:</span>
                        <span className="font-medium">{detailedHealth.metrics.cpuUsage?.system || 0}μs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Status */}
            {detailedHealth.features && (
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-4">Feature Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(detailedHealth.features).map(([feature, status]) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className={cn('w-2 h-2 rounded-full', status === 'enabled' ? 'bg-green-500' : 'bg-gray-400')} />
                      <span className="text-gray-700 capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}