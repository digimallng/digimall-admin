'use client';

import { useState, useEffect } from 'react';
import {
  AnimatedCard,
  GlowingButton,
  AnimatedNumber,
  ProgressRing,
} from '@/components/ui/AnimatedCard';
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Monitor,
  Wifi,
  Zap,
  CloudRain,
  Shield,
  Globe,
  BarChart3,
  FileText,
  Bell,
  Power,
  Gauge,
  ThermometerSun,
  Signal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils/cn';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  url?: string;
}

const mockSystemMetrics: SystemMetric[] = [
  {
    name: 'CPU Usage',
    value: 65,
    unit: '%',
    status: 'healthy',
    trend: 'stable',
    lastUpdated: new Date(),
  },
  {
    name: 'Memory Usage',
    value: 78,
    unit: '%',
    status: 'warning',
    trend: 'up',
    lastUpdated: new Date(),
  },
  {
    name: 'Disk Usage',
    value: 45,
    unit: '%',
    status: 'healthy',
    trend: 'stable',
    lastUpdated: new Date(),
  },
  {
    name: 'Network Latency',
    value: 23,
    unit: 'ms',
    status: 'healthy',
    trend: 'down',
    lastUpdated: new Date(),
  },
  {
    name: 'Database Load',
    value: 82,
    unit: '%',
    status: 'warning',
    trend: 'up',
    lastUpdated: new Date(),
  },
  {
    name: 'API Response Time',
    value: 156,
    unit: 'ms',
    status: 'healthy',
    trend: 'stable',
    lastUpdated: new Date(),
  },
];

const mockServiceStatus: ServiceStatus[] = [
  {
    name: 'Web Application',
    status: 'online',
    uptime: 99.9,
    responseTime: 145,
    lastCheck: new Date(),
    url: 'https://digimall.ng',
  },
  {
    name: 'API Gateway',
    status: 'online',
    uptime: 99.8,
    responseTime: 89,
    lastCheck: new Date(),
    url: 'https://api.digimall.ng',
  },
  {
    name: 'Database',
    status: 'online',
    uptime: 99.95,
    responseTime: 12,
    lastCheck: new Date(),
  },
  {
    name: 'Payment Service',
    status: 'online',
    uptime: 99.7,
    responseTime: 234,
    lastCheck: new Date(),
    url: 'https://payments.digimall.ng',
  },
  {
    name: 'File Storage',
    status: 'online',
    uptime: 99.99,
    responseTime: 67,
    lastCheck: new Date(),
    url: 'https://cdn.digimall.ng',
  },
  {
    name: 'Email Service',
    status: 'maintenance',
    uptime: 98.5,
    responseTime: 0,
    lastCheck: new Date(),
  },
];

export default function SystemPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockSystemMetrics);
  const [services, setServices] = useState<ServiceStatus[]>(mockServiceStatus);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const performanceData = [
    { time: '00:00', cpu: 45, memory: 62, requests: 1200 },
    { time: '04:00', cpu: 32, memory: 58, requests: 800 },
    { time: '08:00', cpu: 68, memory: 74, requests: 2100 },
    { time: '12:00', cpu: 85, memory: 82, requests: 3400 },
    { time: '16:00', cpu: 78, memory: 79, requests: 2800 },
    { time: '20:00', cpu: 65, memory: 71, requests: 2200 },
  ];

  const trafficData = [
    { hour: '00', requests: 1200, errors: 5, bandwidth: 45 },
    { hour: '04', requests: 800, errors: 2, bandwidth: 32 },
    { hour: '08', requests: 2100, errors: 8, bandwidth: 78 },
    { hour: '12', requests: 3400, errors: 12, bandwidth: 125 },
    { hour: '16', requests: 2800, errors: 7, bandwidth: 98 },
    { hour: '20', requests: 2200, errors: 4, bandwidth: 67 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'offline':
        return 'text-red-600';
      case 'maintenance':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
      case 'offline':
        return XCircle;
      case 'maintenance':
        return Settings;
      default:
        return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'cpu usage':
        return Cpu;
      case 'memory usage':
        return HardDrive;
      case 'disk usage':
        return Database;
      case 'network latency':
        return Network;
      case 'database load':
        return Database;
      case 'api response time':
        return Zap;
      default:
        return Activity;
    }
  };

  const overallHealth =
    (services.filter(s => s.status === 'online').length / services.length) * 100;
  const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
  const warningMetrics = metrics.filter(m => m.status === 'warning').length;

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setMetrics(prev =>
          prev.map(metric => ({
            ...metric,
            value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
            lastUpdated: new Date(),
          }))
        );
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                System Monitoring
              </h1>
              <p className='text-gray-600 mt-2 flex items-center gap-2'>
                <Monitor className='h-4 w-4' />
                Real-time platform health and performance monitoring
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <label className='text-sm text-gray-600'>Auto-refresh</label>
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
              <GlowingButton size='sm' variant='secondary' icon={<Download className='h-4 w-4' />}>
                Export Logs
              </GlowingButton>
              <GlowingButton size='sm' variant='primary' icon={<RefreshCw className='h-4 w-4' />}>
                Refresh
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <AnimatedCard delay={0}>
          <div className='p-6 text-center'>
            <div className='mx-auto mb-4'>
              <ProgressRing
                progress={overallHealth}
                size={100}
                strokeWidth={6}
                color={overallHealth > 90 ? '#10B981' : overallHealth > 70 ? '#F59E0B' : '#EF4444'}
              />
            </div>
            <h3 className='text-lg font-semibold text-gray-900'>System Health</h3>
            <p className='text-sm text-gray-600'>Overall platform status</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-green-500 to-emerald-600'>
                <CheckCircle className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Services Online</p>
              <p className='text-3xl font-bold text-gray-900'>
                {services.filter(s => s.status === 'online').length}/{services.length}
              </p>
              <p className='text-xs text-gray-500'>Active services</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-yellow-500 to-orange-600'>
                <AlertTriangle className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Warnings</p>
              <p className='text-3xl font-bold text-gray-900'>{warningMetrics}</p>
              <p className='text-xs text-gray-500'>Metrics need attention</p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='rounded-xl p-3 bg-gradient-to-r from-red-500 to-pink-600'>
                <XCircle className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-gray-600'>Critical Issues</p>
              <p className='text-3xl font-bold text-gray-900'>{criticalMetrics}</p>
              <p className='text-xs text-gray-500'>Require immediate action</p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* System Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {metrics.map((metric, index) => {
          const Icon = getMetricIcon(metric.name);
          const StatusIcon = getStatusIcon(metric.status);
          const TrendIcon = getTrendIcon(metric.trend);

          return (
            <AnimatedCard key={metric.name} delay={index * 100}>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-gray-100 p-2'>
                      <Icon className='h-5 w-5 text-gray-600' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>{metric.name}</h3>
                      <p className='text-xs text-gray-500'>
                        Updated: {metric.lastUpdated.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <StatusIcon className={cn('h-4 w-4', getStatusColor(metric.status))} />
                    <TrendIcon
                      className={cn(
                        'h-4 w-4',
                        metric.trend === 'up'
                          ? 'text-red-500'
                          : metric.trend === 'down'
                            ? 'text-green-500'
                            : 'text-gray-500'
                      )}
                    />
                  </div>
                </div>

                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-2xl font-bold text-gray-900'>
                      {metric.value}
                      {metric.unit}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        metric.status === 'healthy'
                          ? 'text-green-600'
                          : metric.status === 'warning'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      )}
                    >
                      {metric.status}
                    </span>
                  </div>

                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        metric.status === 'healthy'
                          ? 'bg-green-500'
                          : metric.status === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(metric.value, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <AnimatedCard delay={400}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>System Performance</h3>
                <p className='text-sm text-gray-600'>CPU and memory usage over time</p>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id='colorCpu' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3B82F6' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#3B82F6' stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id='colorMemory' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10B981' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#10B981' stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='time' axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type='monotone'
                  dataKey='cpu'
                  stroke='#3B82F6'
                  fill='url(#colorCpu)'
                  strokeWidth={2}
                />
                <Area
                  type='monotone'
                  dataKey='memory'
                  stroke='#10B981'
                  fill='url(#colorMemory)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>Traffic & Errors</h3>
                <p className='text-sm text-gray-600'>Request volume and error rates</p>
              </div>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='hour' axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey='requests' fill='#3B82F6' />
                <Bar dataKey='errors' fill='#EF4444' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnimatedCard>
      </div>

      {/* Service Status */}
      <AnimatedCard delay={600}>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Service Status</h3>
              <p className='text-sm text-gray-600'>Monitor all platform services</p>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='pb-3 text-left font-medium text-gray-600'>Service</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Uptime</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Response Time</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Last Check</th>
                  <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {services.map(service => {
                  const StatusIcon = getStatusIcon(service.status);

                  return (
                    <tr key={service.name} className='hover:bg-gray-50'>
                      <td className='py-4 font-medium text-gray-900'>{service.name}</td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <StatusIcon className={cn('h-4 w-4', getStatusColor(service.status))} />
                          <span className={cn('capitalize', getStatusColor(service.status))}>
                            {service.status}
                          </span>
                        </div>
                      </td>
                      <td className='py-4'>
                        <span
                          className={cn(
                            'font-medium',
                            service.uptime >= 99.9
                              ? 'text-green-600'
                              : service.uptime >= 99.5
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          )}
                        >
                          {service.uptime}%
                        </span>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                      </td>
                      <td className='py-4 text-gray-600'>
                        {service.lastCheck.toLocaleTimeString()}
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <button className='text-blue-600 hover:text-blue-800 font-medium'>
                            Monitor
                          </button>
                          <button className='text-green-600 hover:text-green-800 font-medium'>
                            Restart
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
