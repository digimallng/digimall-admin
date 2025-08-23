'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Server, 
  Database, 
  Wifi, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Zap,
  HardDrive,
  Cpu
} from 'lucide-react';
import { systemService } from '@/lib/api/services/system.service';
import { AnimatedCard, GlowingButton, ProgressRing } from '@/components/ui/AnimatedCard';
import { cn } from '@/lib/utils/cn';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
  cpu: {
    user: number;
    system: number;
  };
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime?: number;
  lastCheck: string;
}

export function SystemHealthMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data: systemStatus,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['system', 'status'],
    queryFn: () => systemService.getSystemStatus(),
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 3,
  });

  const {
    data: healthCheck,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => systemService.getDetailedHealth(),
    refetchInterval: autoRefresh ? 30000 : false,
    retry: 3,
  });

  const {
    data: dbHealth,
    isLoading: isLoadingDb,
    error: dbError,
  } = useQuery({
    queryKey: ['system', 'database-health'],
    queryFn: () => systemService.getDatabaseHealth(),
    refetchInterval: autoRefresh ? 60000 : false,
    retry: 3,
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMemoryUsagePercentage = (used: string, total: string): number => {
    const usedBytes = parseFloat(used.replace(/[^\d.]/g, ''));
    const totalBytes = parseFloat(total.replace(/[^\d.]/g, ''));
    return totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;
  };

  const handleRefresh = () => {
    refetchStatus();
    refetchHealth();
  };

  if (isLoadingStatus || isLoadingHealth) {
    return (
      <AnimatedCard>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  const overallStatus = systemStatus?.status || 'unknown';
  const StatusIcon = getStatusIcon(overallStatus);
  const memoryUsage = systemStatus?.memory ? getMemoryUsagePercentage(
    systemStatus.memory.heapUsed,
    systemStatus.memory.heapTotal
  ) : 0;

  const services: ServiceHealth[] = [
    {
      name: 'System',
      status: systemStatus ? 'healthy' : 'unknown',
      responseTime: healthCheck?.responseTime ? parseInt(healthCheck.responseTime) : undefined,
      lastCheck: systemStatus?.timestamp || new Date().toISOString(),
    },
    {
      name: 'Database',
      status: dbHealth?.status === 'healthy' ? 'healthy' : 'critical',
      responseTime: dbHealth?.responseTime ? parseInt(dbHealth.responseTime) : undefined,
      lastCheck: dbHealth?.timestamp || new Date().toISOString(),
    },
    {
      name: 'API',
      status: healthCheck?.status === 'ok' ? 'healthy' : 'unknown',
      responseTime: healthCheck?.responseTime ? parseInt(healthCheck.responseTime) : undefined,
      lastCheck: healthCheck?.timestamp || new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Monitor</h2>
          <p className="text-gray-600 mt-1">Real-time system status and performance</p>
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
            onClick={handleRefresh}
          >
            Refresh
          </GlowingButton>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard delay={0}>
          <div className="p-6 text-center">
            <div className="mx-auto mb-4">
              <ProgressRing
                progress={overallStatus === 'operational' ? 100 : overallStatus === 'warning' ? 75 : 25}
                size={100}
                strokeWidth={6}
                color={overallStatus === 'operational' ? '#10B981' : overallStatus === 'warning' ? '#F59E0B' : '#EF4444'}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <p className={cn("text-sm font-medium capitalize", getStatusColor(overallStatus))}>
              {overallStatus}
            </p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-blue-500 to-cyan-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemStatus?.uptime?.formatted || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {systemStatus?.uptime?.seconds 
                  ? `${Math.floor(systemStatus.uptime.seconds / 3600)} hours` 
                  : 'Unknown'
                }
              </p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl p-3 bg-gradient-to-r from-purple-500 to-pink-600">
                <HardDrive className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">{memoryUsage}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500"
                  style={{ width: `${memoryUsage}%` }}
                />
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Service Status */}
      <AnimatedCard delay={300}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Service Health</h3>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => {
              const ServiceIcon = getStatusIcon(service.status);
              
              return (
                <div
                  key={service.name}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                    <ServiceIcon className={cn('h-5 w-5', getStatusColor(service.status))} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={cn('capitalize font-medium', getStatusColor(service.status))}>
                        {service.status}
                      </span>
                    </div>
                    
                    {service.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response:</span>
                        <span className="text-gray-900">{service.responseTime}ms</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Check:</span>
                      <span className="text-gray-900">
                        {new Date(service.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedCard>

      {/* System Resources */}
      {systemStatus?.memory && (
        <AnimatedCard delay={400}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Resources</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="rounded-lg p-3 bg-blue-50 mb-2 inline-block">
                  <HardDrive className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">RSS Memory</p>
                <p className="font-semibold text-gray-900">{systemStatus.memory.rss}</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-lg p-3 bg-green-50 mb-2 inline-block">
                  <Cpu className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Heap Total</p>
                <p className="font-semibold text-gray-900">{systemStatus.memory.heapTotal}</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-lg p-3 bg-purple-50 mb-2 inline-block">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Heap Used</p>
                <p className="font-semibold text-gray-900">{systemStatus.memory.heapUsed}</p>
              </div>
              
              <div className="text-center">
                <div className="rounded-lg p-3 bg-orange-50 mb-2 inline-block">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">External</p>
                <p className="font-semibold text-gray-900">{systemStatus.memory.external}</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      )}

      {/* Error States */}
      {(statusError || healthError || dbError) && (
        <AnimatedCard delay={500}>
          <div className="p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <XCircle className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Connection Issues</h3>
            </div>
            <div className="space-y-2 text-sm">
              {statusError && (
                <p className="text-red-600">System Status: {statusError.message}</p>
              )}
              {healthError && (
                <p className="text-red-600">Health Check: {healthError.message}</p>
              )}
              {dbError && (
                <p className="text-red-600">Database: {dbError.message}</p>
              )}
            </div>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}