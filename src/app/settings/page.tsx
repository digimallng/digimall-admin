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
  Smartphone,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';

// Types are now imported from use-settings hook


export default function SettingsPage() {
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

  // Fetch real data from APIs
  const {
    data: configs,
    isLoading: configsLoading,
    error: configsError,
  } = usePlatformConfig();

  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useSystemNotifications();

  const {
    data: notificationServices,
    isLoading: servicesLoading,
    error: servicesError,
  } = useNotificationServices();

  const {
    data: systemStatus,
    isLoading: systemStatusLoading,
  } = useSystemStatus();

  const updateConfigMutation = useUpdatePlatformConfig();

  // Loading states
  if (configsLoading || notificationsLoading || servicesLoading || systemStatusLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error states - show error but continue with available data
  const hasErrors = configsError || notificationsError || servicesError;
  if (hasErrors && !configs && !notifications && !notificationServices) {
    const error = configsError || notificationsError || servicesError;
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorMessage 
          title="Failed to load settings" 
          message={error?.message || 'Unable to connect to admin services'} 
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
    // { id: 'commission', label: 'Commission', icon: DollarSign },
    // { id: 'security', label: 'Security', icon: Shield },
    // { id: 'vendor', label: 'Vendor', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'payments', label: 'Payments', icon: CreditCard },
    // { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'system', label: 'System', icon: Server },
  ];

  const filteredConfigs = (configs || []).filter(config => {
    const matchesCategory = activeTab === 'system' || config.category === activeTab;
    const matchesSearch =
      config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConfigUpdate = (configId: string, newValue: any) => {
    setHasUnsavedChanges(true);
    updateConfigMutation.mutate(
      { id: configId, value: newValue },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          console.log('Configuration updated successfully');
        },
        onError: (error) => {
          console.error('Failed to update config:', error);
          setHasUnsavedChanges(false);
          // In a real app, show toast notification here
          alert('Failed to update configuration: ' + (error.message || 'Unknown error'));
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
      // In a real implementation, this would update the services via API
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

        {/* Error Indicators for Partial Failures */}
        {hasErrors && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <div className='flex items-center gap-2 text-yellow-600'>
              <AlertTriangle className='h-4 w-4' />
              <span className='text-sm font-medium'>
                Some settings data could not be loaded
              </span>
            </div>
            <div className='text-sm text-yellow-600 mt-1'>
              {configsError && <div>• Configuration settings: {configsError.message}</div>}
              {notificationsError && <div>• System notifications: {notificationsError.message}</div>}
              {servicesError && <div>• Notification services: {servicesError.message}</div>}
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
                {(notificationServices || []).map((service, index) => {
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
                        <div className='flex-1 max-w-md'>
                          {renderConfigInput(config)}
                          {updateConfigMutation.isPending && hasUnsavedChanges && (
                            <div className='text-xs text-blue-600 mt-1 flex items-center gap-1'>
                              <RefreshCw className='h-3 w-3 animate-spin' />
                              Saving...
                            </div>
                          )}
                        </div>
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
              {(notifications || []).map((notification, index) => (
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
