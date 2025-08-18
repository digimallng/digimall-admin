'use client';

import { useState, useEffect } from 'react';
import { AnimatedCard, GlowingButton, AnimatedNumber } from '@/components/ui/AnimatedCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  usePlatformConfig,
  useSystemNotifications,
  useNotificationServices,
  useSystemStatus,
  useUpdatePlatformConfig,
  useCreateSystemNotification,
  useUpdateSystemNotification,
  useTestNotificationService,
  useUpdateMaintenanceMode,
  type PlatformConfig,
  type SystemNotification,
  type NotificationService,
} from '@/lib/hooks/use-settings';
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Users,
  Truck,
  Bell,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  DollarSign,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Smartphone,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';

// Types are now imported from use-settings hook

const mockPlatformConfig: PlatformConfig[] = [
  // General Settings
  {
    id: '1',
    key: 'platform_name',
    label: 'Platform Name',
    value: 'digiMall',
    type: 'string',
    category: 'general',
    description: 'The name of your e-commerce platform',
    required: true,
    editable: true,
  },
  {
    id: '2',
    key: 'platform_description',
    label: 'Platform Description',
    value: "Nigeria's leading multi-vendor e-commerce platform",
    type: 'textarea',
    category: 'general',
    description: 'Brief description of your platform',
    required: true,
    editable: true,
  },
  {
    id: '3',
    key: 'default_currency',
    label: 'Default Currency',
    value: 'NGN',
    type: 'select',
    category: 'general',
    options: ['NGN', 'USD', 'EUR', 'GBP'],
    description: 'Default currency for transactions',
    required: true,
    editable: true,
  },
  {
    id: '4',
    key: 'platform_timezone',
    label: 'Platform Timezone',
    value: 'Africa/Lagos',
    type: 'select',
    category: 'general',
    options: ['Africa/Lagos', 'UTC', 'America/New_York', 'Europe/London'],
    description: 'Default timezone for the platform',
    required: true,
    editable: true,
  },
  {
    id: '5',
    key: 'maintenance_mode',
    label: 'Maintenance Mode',
    value: false,
    type: 'boolean',
    category: 'general',
    description: 'Enable maintenance mode to restrict access',
    required: false,
    editable: true,
  },
  // Commission Settings
  {
    id: '6',
    key: 'default_commission_rate',
    label: 'Default Commission Rate',
    value: 5.0,
    type: 'number',
    category: 'commission',
    description: 'Default commission rate percentage for new vendors',
    required: true,
    editable: true,
  },
  {
    id: '7',
    key: 'minimum_payout_amount',
    label: 'Minimum Payout Amount',
    value: 10000,
    type: 'number',
    category: 'commission',
    description: 'Minimum amount required for vendor payouts',
    required: true,
    editable: true,
  },
  {
    id: '8',
    key: 'payout_schedule',
    label: 'Payout Schedule',
    value: 'weekly',
    type: 'select',
    category: 'commission',
    options: ['daily', 'weekly', 'monthly'],
    description: 'How often to process vendor payouts',
    required: true,
    editable: true,
  },
  // Security Settings
  {
    id: '9',
    key: 'two_factor_required',
    label: 'Require Two-Factor Authentication',
    value: true,
    type: 'boolean',
    category: 'security',
    description: 'Require 2FA for all admin accounts',
    required: false,
    editable: true,
  },
  {
    id: '10',
    key: 'session_timeout',
    label: 'Session Timeout (minutes)',
    value: 30,
    type: 'number',
    category: 'security',
    description: 'Auto-logout users after inactivity',
    required: true,
    editable: true,
  },
  {
    id: '11',
    key: 'max_login_attempts',
    label: 'Max Login Attempts',
    value: 3,
    type: 'number',
    category: 'security',
    description: 'Maximum failed login attempts before account lock',
    required: true,
    editable: true,
  },
  // Vendor Settings
  {
    id: '12',
    key: 'vendor_approval_required',
    label: 'Vendor Approval Required',
    value: true,
    type: 'boolean',
    category: 'vendor',
    description: 'Require admin approval for new vendors',
    required: false,
    editable: true,
  },
  {
    id: '13',
    key: 'max_products_per_vendor',
    label: 'Max Products per Vendor',
    value: 1000,
    type: 'number',
    category: 'vendor',
    description: 'Maximum number of products per vendor',
    required: true,
    editable: true,
  },
  // Notification Settings
  {
    id: '14',
    key: 'email_notifications',
    label: 'Email Notifications',
    value: true,
    type: 'boolean',
    category: 'notifications',
    description: 'Enable email notifications',
    required: false,
    editable: true,
  },
  {
    id: '15',
    key: 'sms_notifications',
    label: 'SMS Notifications',
    value: false,
    type: 'boolean',
    category: 'notifications',
    description: 'Enable SMS notifications',
    required: false,
    editable: true,
  },
  // Payment Settings
  {
    id: '16',
    key: 'payment_gateway',
    label: 'Primary Payment Gateway',
    value: 'paystack',
    type: 'select',
    category: 'payments',
    options: ['paystack', 'flutterwave', 'interswitch'],
    description: 'Primary payment gateway for transactions',
    required: true,
    editable: true,
  },
  {
    id: '17',
    key: 'transaction_fee',
    label: 'Transaction Fee (%)',
    value: 2.5,
    type: 'number',
    category: 'payments',
    description: 'Platform transaction fee percentage',
    required: true,
    editable: true,
  },
  {
    id: '18',
    key: 'minimum_order_amount',
    label: 'Minimum Order Amount',
    value: 1000,
    type: 'number',
    category: 'payments',
    description: 'Minimum order amount for transactions',
    required: true,
    editable: true,
  },
  // Shipping Settings
  {
    id: '19',
    key: 'default_shipping_provider',
    label: 'Default Shipping Provider',
    value: 'gig_logistics',
    type: 'select',
    category: 'shipping',
    options: ['fez'],
    description: 'Default shipping provider for orders',
    required: true,
    editable: true,
  },
  {
    id: '20',
    key: 'free_shipping_threshold',
    label: 'Free Shipping Threshold',
    value: 50000,
    type: 'number',
    category: 'shipping',
    description: 'Minimum order amount for free shipping',
    required: true,
    editable: true,
  },
];

const mockSystemNotifications: SystemNotification[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'Scheduled Maintenance',
    message: 'Platform will be under maintenance from 2:00 AM to 4:00 AM WAT',
    active: true,
    priority: 'high',
    targetUsers: 'all',
    startDate: new Date('2024-02-20T02:00:00'),
    endDate: new Date('2024-02-20T04:00:00'),
    createdAt: new Date(),
  },
  {
    id: '2',
    type: 'feature',
    title: 'New Feature: Advanced Analytics',
    message: 'Check out our new advanced analytics dashboard for better insights',
    active: true,
    priority: 'medium',
    targetUsers: 'vendors',
    startDate: new Date(),
    createdAt: new Date(),
  },
];

const mockNotificationServices: NotificationService[] = [
  {
    id: 'email-service',
    name: 'Email Service',
    type: 'email',
    status: 'healthy',
    uptime: 99.8,
    lastCheck: new Date(Date.now() - 30000), // 30 seconds ago
    responseTime: 120,
    version: '1.0.0',
    queues: {
      waiting: 0,
      active: 4,
      completed: 10,
      failed: 10,
      delayed: 0,
      paused: 0,
    },
    stats: {
      sent24h: 1245,
      failed24h: 12,
      successRate: 99.0,
    },
    config: {
      provider: 'SendGrid',
      endpoint: 'https://api.sendgrid.com',
      rateLimit: 1000,
    },
  },
  {
    id: 'sms-service',
    name: 'SMS Service',
    type: 'sms',
    status: 'degraded',
    uptime: 97.2,
    lastCheck: new Date(Date.now() - 45000), // 45 seconds ago
    responseTime: 850,
    version: '1.0.0',
    queues: {
      waiting: 3,
      active: 1,
      completed: 4,
      failed: 2,
      delayed: 1,
      paused: 0,
    },
    stats: {
      sent24h: 234,
      failed24h: 8,
      successRate: 96.6,
    },
    config: {
      provider: 'Twilio',
      endpoint: 'https://api.twilio.com',
      rateLimit: 200,
    },
  },
  {
    id: 'push-service',
    name: 'Push Notifications',
    type: 'push',
    status: 'healthy',
    uptime: 99.9,
    lastCheck: new Date(Date.now() - 15000), // 15 seconds ago
    responseTime: 85,
    version: '1.0.0',
    queues: {
      waiting: 0,
      active: 2,
      completed: 8,
      failed: 0,
      delayed: 0,
      paused: 0,
    },
    stats: {
      sent24h: 2847,
      failed24h: 3,
      successRate: 99.9,
    },
    config: {
      provider: 'Firebase',
      endpoint: 'https://fcm.googleapis.com',
      rateLimit: 5000,
    },
  },
];

export default function SettingsPage() {
  const [configs, setConfigs] = useState<PlatformConfig[]>(mockPlatformConfig);
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockSystemNotifications);
  const [notificationServices, setNotificationServices] =
    useState<NotificationService[]>(mockNotificationServices);
  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'commission'
    | 'security'
    | 'vendor'
    | 'notifications'
    | 'payments'
    | 'shipping'
    | 'system'
  >('general');
  const [editingConfig, setEditingConfig] = useState<PlatformConfig | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [refreshingServices, setRefreshingServices] = useState(false);

  // Get filtered configs for active tab
  const filteredConfigs = (configs || []).filter(config => config.category === activeTab);

  // Loading states
  if (configsLoading || notificationsLoading || servicesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error states
  if (configsError || notificationsError || servicesError) {
    const error = configsError || notificationsError || servicesError;
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorMessage 
          title="Failed to load settings" 
          message={error?.message || 'Unknown error occurred'} 
        />
      </div>
    );
  }

  // Safe fallbacks
  const safeConfigs = configs || [];
  const safeNotifications = notifications || [];
  const safeNotificationServices = notificationServices || [];
  const safeSystemStatus = systemStatus || { overall: 'unknown', services: {}, resources: {}, metrics: {} };

  const categories = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'commission', label: 'Commission', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'vendor', label: 'Vendor', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'system', label: 'System', icon: Server },
  ];

  const filteredConfigs = configs.filter(config => {
    const matchesCategory = activeTab === 'system' || config.category === activeTab;
    const matchesSearch =
      config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConfigUpdate = (configId: string, newValue: any) => {
    updateConfigMutation.mutate(
      { id: configId, value: newValue },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          // Config will be updated via React Query cache
        },
        onError: (error) => {
          console.error('Failed to update config:', error);
          // TODO: Show error toast/notification
        },
      }
    );
  };

  const handleSaveChanges = () => {
    // This is now handled individually by handleConfigUpdate
    setHasUnsavedChanges(false);
  };

  const handleRefreshServices = async () => {
    setRefreshingServices(true);
    // Simulate API call to refresh service status
    setTimeout(() => {
      setNotificationServices(prev =>
        prev.map(service => ({
          ...service,
          lastCheck: new Date(),
          responseTime: Math.floor(Math.random() * 200) + 50,
        }))
      );
      setRefreshingServices(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'degraded':
        return AlertTriangle;
      case 'down':
        return AlertTriangle;
      case 'maintenance':
        return Clock;
      default:
        return Info;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderConfigInput = (config: PlatformConfig) => {
    const baseClasses =
      'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

    switch (config.type) {
      case 'boolean':
        return (
          <div className='flex items-center'>
            <button
              onClick={() => handleConfigUpdate(config.id, !config.value)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                config.value ? 'bg-primary' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                  config.value ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
            <span className='ml-3 text-sm text-gray-900'>
              {config.value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      case 'select':
        return (
          <div className='relative'>
            <select
              value={config.value as string}
              onChange={e => handleConfigUpdate(config.id, e.target.value)}
              className={cn(baseClasses, 'appearance-none pr-10 bg-white')}
            >
              {config.options?.map(option => (
                <option key={option} value={option}>
                  {option === 'NGN'
                    ? 'Nigerian Naira (NGN)'
                    : option === 'USD'
                      ? 'US Dollar (USD)'
                      : option === 'EUR'
                        ? 'Euro (EUR)'
                        : option === 'GBP'
                          ? 'British Pound (GBP)'
                          : option === 'Africa/Lagos'
                            ? 'Africa/Lagos'
                            : option === 'UTC'
                              ? 'UTC'
                              : option === 'America/New_York'
                                ? 'America/New_York'
                                : option === 'Europe/London'
                                  ? 'Europe/London'
                                  : option}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
              <svg
                className='h-4 w-4 text-gray-400'
                fill='none'
                viewBox='0 0 20 20'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            value={config.value as string}
            onChange={e => handleConfigUpdate(config.id, e.target.value)}
            className={cn(baseClasses, 'h-20 resize-none')}
            placeholder={config.description}
          />
        );
      case 'number':
        return (
          <input
            type='number'
            value={config.value as number}
            onChange={e => handleConfigUpdate(config.id, parseFloat(e.target.value) || 0)}
            className={baseClasses}
            placeholder={config.description}
          />
        );
      default:
        return (
          <input
            type='text'
            value={config.value as string}
            onChange={e => handleConfigUpdate(config.id, e.target.value)}
            className={baseClasses}
            placeholder={config.description}
          />
        );
    }
  };

  return (
    <div className='min-h-screen'>
      <div className=' mx-auto p-6 space-y-8'>
        <PageHeader
          title='Platform Settings'
          description='Configure platform settings and system preferences'
          icon={Settings}
          actions={[
            {
              label: 'Export Config',
              icon: Download,
              variant: 'secondary',
            },
            {
              label: 'Save Changes',
              icon: Save,
              variant: 'primary',
              onClick: handleSaveChanges,
            },
          ]}
        />

        {hasUnsavedChanges && (
          <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-orange-600'>
              <AlertTriangle className='h-4 w-4' />
              <span className='text-sm font-medium'>You have unsaved changes</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id as any)}
                  className={cn(
                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === category.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  {category.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div className='relative max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='search'
            placeholder='Search settings...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors'
          />
        </div>

        {/* Notification Service Status */}
        {activeTab === 'notifications' && (
          <div className='space-y-8'>
            {/* Service Status Section */}
            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Notification Services Status
                  </h2>
                  <p className='text-sm text-gray-600'>
                    Monitor the health and performance of notification services
                  </p>
                </div>
                <GlowingButton
                  variant='secondary'
                  icon={
                    <RefreshCw className={cn('h-4 w-4', refreshingServices && 'animate-spin')} />
                  }
                  onClick={handleRefreshServices}
                  disabled={refreshingServices}
                >
                  {refreshingServices ? 'Refreshing...' : 'Refresh Status'}
                </GlowingButton>
              </div>

              {/* Service Status Cards */}
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                {notificationServices.map((service, index) => {
                  const StatusIcon = getStatusIcon(service.status);
                  const ServiceIcon =
                    service.type === 'email'
                      ? Mail
                      : service.type === 'sms'
                        ? Smartphone
                        : service.type === 'push'
                          ? Bell
                          : Server;
                  return (
                    <AnimatedCard key={service.id} delay={index * 100}>
                      <div className='p-6'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 rounded-full bg-gray-100'>
                              <ServiceIcon className='h-5 w-5 text-gray-600' />
                            </div>
                            <div>
                              <h3 className='font-semibold text-gray-900'>{service.name}</h3>
                              <p className='text-sm text-gray-500'>{service.config.provider}</p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                              getStatusColor(service.status)
                            )}
                          >
                            <StatusIcon className='h-3 w-3' />
                            {service.status}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className='space-y-3 mb-4'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Uptime</span>
                            <span className='font-medium'>{service.uptime}%</span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Response Time</span>
                            <span className='font-medium'>{service.responseTime}ms</span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Success Rate</span>
                            <span className='font-medium'>{service.stats.successRate}%</span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Sent (24h)</span>
                            <span className='font-medium'>
                              {service.stats.sent24h.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Queue Status */}
                        <div className='pt-4 border-t border-gray-100'>
                          <h4 className='text-sm font-medium text-gray-900 mb-2'>Queue Status</h4>
                          <div className='grid grid-cols-3 gap-2 text-xs'>
                            <div className='text-center'>
                              <div className='font-medium text-blue-600'>
                                {service.queues.waiting}
                              </div>
                              <div className='text-gray-500'>Waiting</div>
                            </div>
                            <div className='text-center'>
                              <div className='font-medium text-green-600'>
                                {service.queues.active}
                              </div>
                              <div className='text-gray-500'>Active</div>
                            </div>
                            <div className='text-center'>
                              <div className='font-medium text-red-600'>
                                {service.queues.failed}
                              </div>
                              <div className='text-gray-500'>Failed</div>
                            </div>
                          </div>
                        </div>

                        {/* Last Check */}
                        <div className='pt-2'>
                          <p className='text-xs text-gray-500'>
                            Last checked:{' '}
                            {formatDistanceToNow(service.lastCheck, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </AnimatedCard>
                  );
                })}
              </div>
            </div>

            {/* Notification Settings */}
            <div className='space-y-6'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900'>Notification Settings</h2>
                <p className='text-sm text-gray-600'>
                  Configure notification preferences and settings
                </p>
              </div>

              <div className='space-y-1'>
                {filteredConfigs.map((config, index) => (
                  <div
                    key={config.id}
                    className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow'
                  >
                    <div className='space-y-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <h3 className='text-base font-medium text-gray-900'>{config.label}</h3>
                            {config.required && (
                              <span className='text-xs text-red-600 font-medium'>Required</span>
                            )}
                          </div>
                          <p className='text-sm text-gray-600 mb-4'>{config.description}</p>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1 max-w-md'>{renderConfigInput(config)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Configuration Settings */}
        {activeTab !== 'system' && activeTab !== 'notifications' && (
          <div className='space-y-1'>
            {filteredConfigs.map((config, index) => (
              <div
                key={config.id}
                className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow'
              >
                <div className='space-y-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h3 className='text-base font-medium text-gray-900'>{config.label}</h3>
                        {config.required && (
                          <span className='text-xs text-red-600 font-medium'>Required</span>
                        )}
                      </div>
                      <p className='text-sm text-gray-600 mb-4'>{config.description}</p>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1 max-w-md'>{renderConfigInput(config)}</div>
                  </div>
                </div>
              </div>
            ))}

            {filteredConfigs.length === 0 && (
              <div className='text-center py-12'>
                <Settings className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>No settings found</h3>
                <p className='text-gray-600'>Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )}

        {/* System Notifications */}
        {activeTab === 'system' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold text-gray-900'>System Notifications</h2>
                <p className='text-sm text-gray-600'>
                  Manage platform-wide notifications and announcements
                </p>
              </div>
              <GlowingButton variant='primary' icon={<Plus className='h-4 w-4' />}>
                Create Notification
              </GlowingButton>
            </div>

            <div className='space-y-4'>
              {notifications.map((notification, index) => (
                <AnimatedCard key={notification.id} delay={index * 100}>
                  <div className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {notification.title}
                          </h3>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                              notification.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : notification.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            )}
                          >
                            {notification.priority}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
                              notification.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            )}
                          >
                            {notification.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-4'>{notification.message}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-500'>
                          <span>Type: {notification.type}</span>
                          <span>Target: {notification.targetUsers}</span>
                          <span>Created: {notification.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button className='text-blue-600 hover:text-blue-800'>
                          <Edit className='h-4 w-4' />
                        </button>
                        <button className='text-red-600 hover:text-red-800'>
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
