'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useSystemHealth, 
  useSystemMetrics, 
  useQueueStatus, 
  useSystemStatusSummary 
} from '@/lib/hooks/useSystem';
import { formatDate, formatNumber, formatBytes } from '@/lib/utils/formatters';
import { 
  Server, 
  Activity, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  RefreshCw, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  Settings,
  PlayCircle,
  PauseCircle,
  Trash2
} from 'lucide-react';
import { SystemHealthChart } from './system-health-chart';
import { QueueManagement } from './queue-management';
import { SystemLogs } from './system-logs';
import { SystemSettings } from './system-settings';

export function SystemDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'queues' | 'logs' | 'settings'>('overview');
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealth();
  const { data: metrics, isLoading: metricsLoading } = useSystemMetrics(timeRange);
  const { data: queueStatus, isLoading: queueLoading } = useQueueStatus();
  const { data: statusSummary, isLoading: summaryLoading } = useSystemStatusSummary();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      healthy: { variant: 'outline', className: 'border-green-300 text-green-700 bg-green-50' },
      warning: { variant: 'outline', className: 'border-yellow-300 text-yellow-700 bg-yellow-50' },
      critical: { variant: 'outline', className: 'border-red-300 text-red-700 bg-red-50' },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.critical;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <p className="text-gray-600">Current system health and performance</p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetchHealth()}
            disabled={healthLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {health && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  health.status === 'healthy' ? 'bg-green-500' :
                  health.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className={`text-lg font-semibold ${getStatusColor(health.status)}`}>
                  System {health.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Uptime</span>
                  <div className="font-medium">{formatUptime(health.uptime)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Version</span>
                  <div className="font-medium">{health.version}</div>
                </div>
                <div>
                  <span className="text-gray-600">Environment</span>
                  <div className="font-medium capitalize">{health.environment}</div>
                </div>
                <div>
                  <span className="text-gray-600">Last Restart</span>
                  <div className="font-medium">{formatDate(health.lastRestart)}</div>
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="space-y-3">
              <h4 className="font-medium">Services</h4>
              {Object.entries(health.services).map(([service, data]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      data.status === 'healthy' ? 'bg-green-500' :
                      data.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium capitalize">{service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {data.responseTime && (
                      <span className="text-xs text-gray-600">{data.responseTime}ms</span>
                    )}
                    {getStatusBadge(data.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {health && (
          <>
            <StatsCard
              title="CPU Usage"
              value={`${health.performance.cpuUsage.toFixed(1)}%`}
              icon={Cpu}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
            />
            <StatsCard
              title="Memory Usage"
              value={`${health.performance.memoryUsage.toFixed(1)}%`}
              icon={MemoryStick}
              className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200"
            />
            <StatsCard
              title="Disk Usage"
              value={`${health.performance.diskUsage.toFixed(1)}%`}
              icon={HardDrive}
              className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200"
            />
            <StatsCard
              title="Requests/min"
              value={formatNumber(health.performance.requestsPerMinute)}
              icon={Activity}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            />
          </>
        )}
      </div>

      {/* System Metrics Chart */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Performance Trends</h3>
          <div className="flex gap-2">
            {(['hour', 'day', 'week', 'month'] as const).map((period) => (
              <Button
                key={period}
                variant={timeRange === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
        {metrics && <SystemHealthChart data={metrics} />}
      </Card>

      {/* Queue Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Queue Status</h3>
        {queueLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : queueStatus ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Total Jobs</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(queueStatus.summary.totalJobs)}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Active</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(queueStatus.summary.activeJobs)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">Completed</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {formatNumber(queueStatus.summary.completedJobs)}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Failed</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(queueStatus.summary.failedJobs)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {queueStatus.queues.slice(0, 5).map((queue) => (
                <div key={queue.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${queue.paused ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div>
                      <div className="font-medium">{queue.displayName}</div>
                      <div className="text-sm text-gray-600">
                        {queue.active} active • {queue.waiting} waiting • {queue.failed} failed
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {queue.throughput.toFixed(1)} jobs/min
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className={queue.paused ? 'text-green-600' : 'text-orange-600'}
                    >
                      {queue.paused ? <PlayCircle className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Queue status unavailable
          </div>
        )}
      </Card>

      {/* System Alerts */}
      {health?.alerts && health.alerts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
          <div className="space-y-3">
            {health.alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                alert.level === 'error' ? 'bg-red-50 border-red-200' :
                alert.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-3">
                  {alert.level === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : alert.level === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Activity className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <div className={`font-medium ${
                      alert.level === 'error' ? 'text-red-900' :
                      alert.level === 'warning' ? 'text-yellow-900' :
                      'text-blue-900'
                    }`}>
                      {alert.message}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(alert.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'health', label: 'Health Monitoring', count: null },
    { id: 'queues', label: 'Queue Management', count: queueStatus?.summary.totalQueues },
    { id: 'logs', label: 'System Logs', count: null },
    { id: 'settings', label: 'Settings', count: null },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
          <p className="text-gray-600">Monitor system health, queues, and configuration</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetchHealth()}
            disabled={healthLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {formatNumber(tab.count)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'health' && metrics && <SystemHealthChart data={metrics} />}
        {activeTab === 'queues' && <QueueManagement />}
        {activeTab === 'logs' && <SystemLogs />}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
    </div>
  );
}