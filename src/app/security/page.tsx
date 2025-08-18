'use client';

import { useState, useEffect } from 'react';
import { AnimatedCard, GlowingButton, AnimatedNumber } from '@/components/ui/AnimatedCard';
import {
  Shield,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  User,
  Users,
  CreditCard,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  Flag,
  Ban,
  Activity,
  FileText,
  Download,
  RefreshCw,
  Zap,
  Target,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
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
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface SecurityAlert {
  id: string;
  type:
    | 'fraud'
    | 'suspicious_activity'
    | 'policy_violation'
    | 'security_breach'
    | 'ddos'
    | 'malware';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  title: string;
  description: string;
  userId?: string;
  vendorId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
}

interface FraudPattern {
  id: string;
  name: string;
  description: string;
  riskScore: number;
  detectionCount: number;
  successRate: number;
  lastTriggered: Date;
  active: boolean;
}

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: 'SEC-001',
    type: 'fraud',
    severity: 'high',
    status: 'investigating',
    title: 'Multiple Failed Payment Attempts',
    description: 'User attempting multiple payments with different cards from same IP',
    userId: 'USER-12345',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Lagos, Nigeria',
    metadata: {
      attemptCount: 15,
      cardsUsed: 5,
      timeSpan: '30 minutes',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    assignedTo: 'Security Team',
  },
  {
    id: 'SEC-002',
    type: 'suspicious_activity',
    severity: 'medium',
    status: 'active',
    title: 'Unusual Login Pattern',
    description: 'Vendor account accessed from multiple countries within 1 hour',
    vendorId: 'VEND-67890',
    ipAddress: '203.0.113.45',
    location: 'London, UK',
    metadata: {
      loginCount: 8,
      countries: ['Nigeria', 'UK', 'US', 'Germany'],
      timeSpan: '45 minutes',
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'SEC-003',
    type: 'policy_violation',
    severity: 'medium',
    status: 'resolved',
    title: 'Fake Product Listings',
    description: 'Vendor posting counterfeit products detected by AI system',
    vendorId: 'VEND-11111',
    metadata: {
      productsDetected: 12,
      categories: ['Electronics', 'Fashion'],
      confidenceScore: 0.95,
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    assignedTo: 'Content Team',
  },
  {
    id: 'SEC-004',
    type: 'ddos',
    severity: 'critical',
    status: 'resolved',
    title: 'DDoS Attack Detected',
    description: 'Massive traffic spike from bot network targeting payment system',
    ipAddress: 'Multiple IPs',
    metadata: {
      requestCount: 50000,
      duration: '15 minutes',
      targetEndpoint: '/api/payment',
      mitigationStatus: 'Active',
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    assignedTo: 'DevOps Team',
  },
];

const mockFraudPatterns: FraudPattern[] = [
  {
    id: 'FP-001',
    name: 'Card Testing',
    description: 'Multiple small transactions with different cards',
    riskScore: 8.5,
    detectionCount: 45,
    successRate: 92.3,
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    active: true,
  },
  {
    id: 'FP-002',
    name: 'Account Takeover',
    description: 'Unusual login patterns and password changes',
    riskScore: 9.1,
    detectionCount: 23,
    successRate: 87.8,
    lastTriggered: new Date(Date.now() - 5 * 60 * 60 * 1000),
    active: true,
  },
  {
    id: 'FP-003',
    name: 'Fake Reviews',
    description: 'Coordinated review manipulation',
    riskScore: 6.8,
    detectionCount: 78,
    successRate: 94.1,
    lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000),
    active: true,
  },
  {
    id: 'FP-004',
    name: 'Price Manipulation',
    description: 'Artificial price inflation schemes',
    riskScore: 7.2,
    detectionCount: 34,
    successRate: 89.5,
    lastTriggered: new Date(Date.now() - 8 * 60 * 60 * 1000),
    active: true,
  },
];

export default function SecurityPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  const [patterns, setPatterns] = useState<FraudPattern[]>(mockFraudPatterns);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'alerts' | 'patterns' | 'monitoring'>('alerts');

  const securityMetrics = [
    { name: 'Jan', threats: 45, blocked: 42, false_positives: 3 },
    { name: 'Feb', threats: 52, blocked: 49, false_positives: 3 },
    { name: 'Mar', threats: 38, blocked: 36, false_positives: 2 },
    { name: 'Apr', threats: 67, blocked: 63, false_positives: 4 },
    { name: 'May', threats: 59, blocked: 55, false_positives: 4 },
    { name: 'Jun', threats: 71, blocked: 68, false_positives: 3 },
  ];

  const threatTypeData = [
    { type: 'Fraud', count: 45, percentage: 35 },
    { type: 'Suspicious Activity', count: 32, percentage: 25 },
    { type: 'Policy Violation', count: 28, percentage: 22 },
    { type: 'Security Breach', count: 15, percentage: 12 },
    { type: 'DDoS', count: 8, percentage: 6 },
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const stats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    avgResponseTime: 2.4, // hours
    detectionRate: 94.8, // percentage
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
      case 'false_positive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud':
        return CreditCard;
      case 'suspicious_activity':
        return Eye;
      case 'policy_violation':
        return Flag;
      case 'security_breach':
        return Shield;
      case 'ddos':
        return Zap;
      case 'malware':
        return AlertTriangle;
      default:
        return AlertCircle;
    }
  };

  const handleStatusChange = (alertId: string, newStatus: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: newStatus as any,
              updatedAt: new Date(),
              resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
            }
          : alert
      )
    );
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Security & Fraud Detection
              </h1>
              <p className='text-gray-600 mt-2 flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                Platform security monitoring and threat detection
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <GlowingButton size='sm' variant='secondary'>
                <Download className='h-4 w-4 mr-2' />
                Export Logs
              </GlowingButton>
              <GlowingButton size='sm' variant='primary'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Refresh
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        <AnimatedCard delay={0}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-red-500 to-pink-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <AlertTriangle className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.totalAlerts}</p>
            <p className='text-sm text-gray-600'>Total Alerts</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={100}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-orange-500 to-red-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Activity className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.activeAlerts}</p>
            <p className='text-sm text-gray-600'>Active</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={200}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <CheckCircle className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.resolvedAlerts}</p>
            <p className='text-sm text-gray-600'>Resolved</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={300}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-red-500 to-pink-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Flag className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.criticalAlerts}</p>
            <p className='text-sm text-gray-600'>Critical</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={400}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Clock className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.avgResponseTime}</p>
            <p className='text-sm text-gray-600'>Avg Hours</p>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={500}>
          <div className='p-4 text-center'>
            <div className='rounded-lg bg-gradient-to-r from-green-500 to-teal-600 w-12 h-12 flex items-center justify-center mx-auto mb-3'>
              <Target className='h-6 w-6 text-white' />
            </div>
            <p className='text-2xl font-bold text-gray-900'>{stats.detectionRate}%</p>
            <p className='text-sm text-gray-600'>Detection Rate</p>
          </div>
        </AnimatedCard>
      </div>

      {/* Tab Navigation */}
      <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit'>
        <button
          onClick={() => setActiveTab('alerts')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'alerts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Security Alerts
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'patterns'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Fraud Patterns
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'monitoring'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Real-time Monitoring
        </button>
      </div>

      {/* Security Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className='space-y-6'>
          {/* Filters */}
          <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4 text-gray-500' />
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Types</option>
                  <option value='fraud'>Fraud</option>
                  <option value='suspicious_activity'>Suspicious Activity</option>
                  <option value='policy_violation'>Policy Violation</option>
                  <option value='security_breach'>Security Breach</option>
                  <option value='ddos'>DDoS</option>
                  <option value='malware'>Malware</option>
                </select>
              </div>

              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Severities</option>
                <option value='critical'>Critical</option>
                <option value='high'>High</option>
                <option value='medium'>Medium</option>
                <option value='low'>Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Status</option>
                <option value='open'>Open</option>
                <option value='investigating'>Investigating</option>
                <option value='resolved'>Resolved</option>
                <option value='dismissed'>Dismissed</option>
              </select>
            </div>

            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <input
                type='search'
                placeholder='Search alerts...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Alerts List */}
          <div className='space-y-4'>
            {filteredAlerts.map((alert, index) => {
              const TypeIcon = getTypeIcon(alert.type);

              return (
                <AnimatedCard key={alert.id} delay={index * 50}>
                  <div className='p-6'>
                    <div className='flex items-start gap-4'>
                      <div
                        className={cn(
                          'rounded-xl p-3 bg-gradient-to-r',
                          alert.severity === 'critical'
                            ? 'from-red-500 to-pink-600'
                            : alert.severity === 'high'
                              ? 'from-orange-500 to-red-600'
                              : alert.severity === 'medium'
                                ? 'from-yellow-500 to-orange-600'
                                : 'from-green-500 to-emerald-600'
                        )}
                      >
                        <TypeIcon className='h-5 w-5 text-white' />
                      </div>

                      <div className='flex-1'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <div className='flex items-center gap-2 mb-1'>
                              <h3 className='font-semibold text-gray-900'>{alert.title}</h3>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                                  getSeverityColor(alert.severity)
                                )}
                              >
                                {alert.severity}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                                  getStatusColor(alert.status)
                                )}
                              >
                                {alert.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className='text-sm text-gray-600 mb-2'>{alert.description}</p>
                            <div className='flex items-center gap-4 text-xs text-gray-500'>
                              <span>ID: {alert.id}</span>
                              {alert.ipAddress && <span>IP: {alert.ipAddress}</span>}
                              {alert.location && <span>Location: {alert.location}</span>}
                              <span>Created: {format(alert.createdAt, 'MMM dd, HH:mm')}</span>
                            </div>
                          </div>

                          <div className='flex items-center gap-2'>
                            <button className='text-blue-600 hover:text-blue-800 font-medium'>
                              View Details
                            </button>
                            {alert.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(alert.id, 'investigating')}
                                className='text-yellow-600 hover:text-yellow-800 font-medium'
                              >
                                Investigate
                              </button>
                            )}
                            {alert.status === 'investigating' && (
                              <button
                                onClick={() => handleStatusChange(alert.id, 'resolved')}
                                className='text-green-600 hover:text-green-800 font-medium'
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Fraud Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {patterns.map((pattern, index) => (
              <AnimatedCard key={pattern.id} delay={index * 100}>
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                      <h3 className='font-semibold text-gray-900'>{pattern.name}</h3>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                        pattern.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {pattern.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className='space-y-3'>
                    <p className='text-sm text-gray-600'>{pattern.description}</p>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-xs text-gray-500'>Risk Score</p>
                        <p className='text-lg font-bold text-red-600'>{pattern.riskScore}/10</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Success Rate</p>
                        <p className='text-lg font-bold text-green-600'>{pattern.successRate}%</p>
                      </div>
                    </div>

                    <div>
                      <p className='text-xs text-gray-500'>Detections</p>
                      <p className='text-sm font-medium text-gray-900'>
                        {pattern.detectionCount} times
                      </p>
                    </div>

                    <div>
                      <p className='text-xs text-gray-500'>Last Triggered</p>
                      <p className='text-sm font-medium text-gray-900'>
                        {format(pattern.lastTriggered, 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className='space-y-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <AnimatedCard delay={0}>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Threat Detection Trends</h3>
                    <p className='text-sm text-gray-600'>Monthly security metrics</p>
                  </div>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={securityMetrics}>
                    <defs>
                      <linearGradient id='colorThreats' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#EF4444' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#EF4444' stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id='colorBlocked' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#10B981' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#10B981' stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='name' axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='threats'
                      stroke='#EF4444'
                      fill='url(#colorThreats)'
                      strokeWidth={2}
                    />
                    <Area
                      type='monotone'
                      dataKey='blocked'
                      stroke='#10B981'
                      fill='url(#colorBlocked)'
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Threat Types</h3>
                    <p className='text-sm text-gray-600'>Distribution by category</p>
                  </div>
                </div>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={threatTypeData}
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'
                      label={entry => `${entry.type}: ${entry.percentage}%`}
                    >
                      {threatTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>
          </div>

          {/* Real-time Status */}
          <AnimatedCard delay={400}>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>System Status</h3>
                  <p className='text-sm text-gray-600'>Real-time security monitoring</p>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-sm font-medium text-green-600'>
                    All Systems Operational
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Shield className='h-5 w-5 text-green-600' />
                    <span className='font-medium text-green-900'>Firewall</span>
                  </div>
                  <p className='text-sm text-green-700'>Active & Monitoring</p>
                </div>

                <div className='bg-blue-50 p-4 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Eye className='h-5 w-5 text-blue-600' />
                    <span className='font-medium text-blue-900'>Threat Detection</span>
                  </div>
                  <p className='text-sm text-blue-700'>Scanning Traffic</p>
                </div>

                <div className='bg-yellow-50 p-4 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Zap className='h-5 w-5 text-yellow-600' />
                    <span className='font-medium text-yellow-900'>DDoS Protection</span>
                  </div>
                  <p className='text-sm text-yellow-700'>Standby Mode</p>
                </div>

                <div className='bg-purple-50 p-4 rounded-lg'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Activity className='h-5 w-5 text-purple-600' />
                    <span className='font-medium text-purple-900'>API Monitoring</span>
                  </div>
                  <p className='text-sm text-purple-700'>Healthy</p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
}
