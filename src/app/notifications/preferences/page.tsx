'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import {
  Settings,
  Users,
  UserCheck,
  Search,
  Filter,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Clock,
  Shield,
  Bell,
  BellOff,
  Save,
  RefreshCw,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  Gift,
  ShoppingCart,
  DollarSign,
  Package,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { 
  notificationsService, 
  NotificationPreferences,
  NotificationItem 
} from '@/lib/api/services/notifications.service';

interface PreferencesFormData {
  userId?: string;
  vendorId?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  allowedTypes: NotificationItem['type'][];
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Information', icon: Info, description: 'General information and updates' },
  { value: 'success', label: 'Success', icon: CheckCircle, description: 'Success confirmations and achievements' },
  { value: 'warning', label: 'Warnings', icon: AlertTriangle, description: 'Important warnings and alerts' },
  { value: 'error', label: 'Errors', icon: XCircle, description: 'Error notifications and failures' },
  { value: 'system', label: 'System', icon: Settings, description: 'System maintenance and updates' },
  { value: 'order', label: 'Orders', icon: ShoppingCart, description: 'Order status and updates' },
  { value: 'payment', label: 'Payments', icon: DollarSign, description: 'Payment confirmations and receipts' },
  { value: 'vendor', label: 'Vendor', icon: Users, description: 'Vendor-related notifications' },
  { value: 'security', label: 'Security', icon: Shield, description: 'Security alerts and login notifications' },
  { value: 'promotion', label: 'Promotions', icon: Gift, description: 'Marketing and promotional offers' },
] as const;

const NOTIFICATION_CHANNELS = [
  { 
    key: 'emailEnabled' as const,
    value: 'email', 
    label: 'Email', 
    icon: Mail, 
    description: 'Receive notifications via email' 
  },
  { 
    key: 'smsEnabled' as const,
    value: 'sms', 
    label: 'SMS', 
    icon: MessageSquare, 
    description: 'Receive notifications via SMS' 
  },
  { 
    key: 'pushEnabled' as const,
    value: 'push', 
    label: 'Push Notifications', 
    icon: Smartphone, 
    description: 'Receive push notifications on mobile devices' 
  },
  { 
    key: 'inAppEnabled' as const,
    value: 'in_app', 
    label: 'In-App', 
    icon: Globe, 
    description: 'Show notifications within the application' 
  },
];

const QUIET_HOURS_PRESETS = [
  { label: 'No quiet hours', start: '', end: '' },
  { label: 'Night (10 PM - 8 AM)', start: '22:00', end: '08:00' },
  { label: 'Night (11 PM - 7 AM)', start: '23:00', end: '07:00' },
  { label: 'Sleep (12 AM - 6 AM)', start: '00:00', end: '06:00' },
  { label: 'Custom', start: 'custom', end: 'custom' },
];

export default function NotificationPreferencesPage() {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState<'user' | 'vendor'>('user');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PreferencesFormData>({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    allowedTypes: ['info', 'success', 'warning', 'error', 'system', 'order', 'payment', 'vendor', 'security'],
  });

  // Fetch preferences for selected user/vendor
  const { data: preferences, isLoading, error, refetch } = useQuery({
    queryKey: ['notification-preferences', selectedUserId, selectedVendorId],
    queryFn: () => {
      if (!selectedUserId && !selectedVendorId) return null;
      return notificationsService.getNotificationPreferences(
        selectedUserId || undefined, 
        selectedVendorId || undefined
      );
    },
    enabled: !!(selectedUserId || selectedVendorId),
    staleTime: 30000,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      notificationsService.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update preferences');
    },
  });

  // Update form data when preferences change
  useState(() => {
    if (preferences) {
      setFormData({
        userId: preferences.userId,
        vendorId: preferences.vendorId,
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        pushEnabled: preferences.pushEnabled,
        inAppEnabled: preferences.inAppEnabled,
        allowedTypes: preferences.allowedTypes,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
      });
    }
  });

  const handleSavePreferences = () => {
    const updateData: Partial<NotificationPreferences> = {
      ...formData,
      userId: selectedUserId || undefined,
      vendorId: selectedVendorId || undefined,
    };

    updatePreferencesMutation.mutate(updateData);
  };

  const handleChannelToggle = (channelKey: typeof NOTIFICATION_CHANNELS[0]['key']) => {
    setFormData(prev => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const handleTypeToggle = (type: NotificationItem['type']) => {
    setFormData(prev => ({
      ...prev,
      allowedTypes: prev.allowedTypes.includes(type)
        ? prev.allowedTypes.filter(t => t !== type)
        : [...prev.allowedTypes, type],
    }));
  };

  const handleQuietHoursPreset = (preset: typeof QUIET_HOURS_PRESETS[0]) => {
    if (preset.start === 'custom') return;
    
    setFormData(prev => ({
      ...prev,
      quietHoursStart: preset.start,
      quietHoursEnd: preset.end,
    }));
  };

  const resetToDefaults = () => {
    setFormData({
      userId: selectedUserId,
      vendorId: selectedVendorId,
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      allowedTypes: ['info', 'success', 'warning', 'error', 'system', 'order', 'payment', 'vendor', 'security'],
      quietHoursStart: '',
      quietHoursEnd: '',
    });
  };

  const isAllChannelsDisabled = !formData.emailEnabled && !formData.smsEnabled && 
                               !formData.pushEnabled && !formData.inAppEnabled;

  const enabledChannelsCount = [
    formData.emailEnabled,
    formData.smsEnabled,
    formData.pushEnabled,
    formData.inAppEnabled,
  ].filter(Boolean).length;

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Notification Preferences
              </h1>
              <p className='text-gray-600 mt-2'>
                Manage notification preferences for users and vendors
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <GlowingButton
                size='sm'
                variant='secondary'
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                Refresh
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* User/Vendor Selection */}
        <div className='space-y-6'>
          <AnimatedCard className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Select User/Vendor</h2>
            
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setUserType('user')}
                  className={cn(
                    'flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                    userType === 'user'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Users className='h-4 w-4' />
                  Users
                </button>
                <button
                  onClick={() => setUserType('vendor')}
                  className={cn(
                    'flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                    userType === 'vendor'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <UserCheck className='h-4 w-4' />
                  Vendors
                </button>
              </div>

              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  type='search'
                  placeholder={`Search ${userType}s...`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  {userType === 'user' ? 'User ID' : 'Vendor ID'}
                </label>
                <input
                  type='text'
                  value={userType === 'user' ? selectedUserId : selectedVendorId}
                  onChange={e => {
                    if (userType === 'user') {
                      setSelectedUserId(e.target.value);
                      setSelectedVendorId('');
                    } else {
                      setSelectedVendorId(e.target.value);
                      setSelectedUserId('');
                    }
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder={`Enter ${userType} ID`}
                />
              </div>

              {(selectedUserId || selectedVendorId) && !isLoading && (
                <div className='text-sm'>
                  {preferences ? (
                    <div className='flex items-center gap-2 text-green-600'>
                      <CheckCircle className='h-4 w-4' />
                      Preferences loaded
                    </div>
                  ) : (
                    <div className='flex items-center gap-2 text-yellow-600'>
                      <AlertTriangle className='h-4 w-4' />
                      Using default preferences
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Quick Stats */}
          <AnimatedCard className='p-6'>
            <h3 className='font-semibold text-gray-900 mb-4'>Preference Summary</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>Channels Enabled</span>
                <span className='font-medium text-gray-900'>
                  {enabledChannelsCount}/4
                </span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>Types Allowed</span>
                <span className='font-medium text-gray-900'>
                  {formData.allowedTypes.length}/{NOTIFICATION_TYPES.length}
                </span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>Quiet Hours</span>
                <span className='font-medium text-gray-900'>
                  {formData.quietHoursStart && formData.quietHoursEnd ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {isAllChannelsDisabled && (
                <div className='flex items-center gap-2 text-red-600 text-sm p-2 bg-red-50 rounded-lg'>
                  <BellOff className='h-4 w-4' />
                  All channels disabled
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>

        {/* Preferences Configuration */}
        <div className='lg:col-span-2 space-y-6'>
          {(selectedUserId || selectedVendorId) ? (
            <>
              {/* Notification Channels */}
              <AnimatedCard className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-lg font-semibold text-gray-900'>Notification Channels</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className='flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors'
                  >
                    <Edit className='h-4 w-4' />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {NOTIFICATION_CHANNELS.map(channel => {
                    const ChannelIcon = channel.icon;
                    const isEnabled = formData[channel.key];

                    return (
                      <div
                        key={channel.key}
                        className={cn(
                          'p-4 border rounded-lg transition-all duration-200',
                          isEnabled
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50',
                          isEditing && 'cursor-pointer hover:shadow-md'
                        )}
                        onClick={() => isEditing && handleChannelToggle(channel.key)}
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-3'>
                            <div className={cn(
                              'p-2 rounded-lg',
                              isEnabled
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400'
                            )}>
                              <ChannelIcon className='h-4 w-4' />
                            </div>
                            <span className='font-medium text-gray-900'>{channel.label}</span>
                          </div>
                          <div className={cn(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                            isEnabled
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          )}>
                            {isEnabled && <CheckCircle className='h-3 w-3 text-white' />}
                          </div>
                        </div>
                        <p className='text-sm text-gray-600'>{channel.description}</p>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>

              {/* Notification Types */}
              <AnimatedCard className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-lg font-semibold text-gray-900'>Allowed Notification Types</h2>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        allowedTypes: NOTIFICATION_TYPES.map(t => t.value) 
                      }))}
                      className='text-sm text-blue-600 hover:text-blue-800 transition-colors'
                      disabled={!isEditing}
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, allowedTypes: [] }))}
                      className='text-sm text-red-600 hover:text-red-800 transition-colors'
                      disabled={!isEditing}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {NOTIFICATION_TYPES.map(type => {
                    const TypeIcon = type.icon;
                    const isAllowed = formData.allowedTypes.includes(type.value);

                    return (
                      <div
                        key={type.value}
                        className={cn(
                          'p-3 border rounded-lg transition-all duration-200',
                          isAllowed
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-gray-200',
                          isEditing && 'cursor-pointer hover:shadow-sm'
                        )}
                        onClick={() => isEditing && handleTypeToggle(type.value)}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className={cn(
                              'p-1.5 rounded',
                              isAllowed
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'
                            )}>
                              <TypeIcon className='h-4 w-4' />
                            </div>
                            <div>
                              <div className='font-medium text-gray-900 text-sm'>{type.label}</div>
                              <div className='text-xs text-gray-500'>{type.description}</div>
                            </div>
                          </div>
                          <div className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center',
                            isAllowed
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          )}>
                            {isAllowed && <CheckCircle className='h-3 w-3 text-white' />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>

              {/* Quiet Hours */}
              <AnimatedCard className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-lg font-semibold text-gray-900'>Quiet Hours</h2>
                    <Clock className='h-5 w-5 text-gray-400' />
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {QUIET_HOURS_PRESETS.slice(0, -1).map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => isEditing && handleQuietHoursPreset(preset)}
                        disabled={!isEditing}
                        className={cn(
                          'p-3 text-left border rounded-lg transition-colors',
                          formData.quietHoursStart === preset.start && formData.quietHoursEnd === preset.end
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50',
                          !isEditing && 'cursor-not-allowed opacity-50'
                        )}
                      >
                        <div className='font-medium text-sm'>{preset.label}</div>
                        {preset.start && preset.end && (
                          <div className='text-xs text-gray-600 mt-1'>
                            {preset.start} - {preset.end}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Start Time
                      </label>
                      <input
                        type='time'
                        value={formData.quietHoursStart || ''}
                        onChange={e => setFormData(prev => ({ 
                          ...prev, 
                          quietHoursStart: e.target.value 
                        }))}
                        disabled={!isEditing}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        End Time
                      </label>
                      <input
                        type='time'
                        value={formData.quietHoursEnd || ''}
                        onChange={e => setFormData(prev => ({ 
                          ...prev, 
                          quietHoursEnd: e.target.value 
                        }))}
                        disabled={!isEditing}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
                      />
                    </div>
                  </div>

                  {formData.quietHoursStart && formData.quietHoursEnd && (
                    <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                      <div className='flex items-center gap-2 text-blue-700 text-sm'>
                        <Bell className='h-4 w-4' />
                        Notifications will be silenced from {formData.quietHoursStart} to {formData.quietHoursEnd}
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>

              {/* Actions */}
              {isEditing && (
                <div className='flex items-center justify-between'>
                  <GlowingButton
                    variant='secondary'
                    onClick={resetToDefaults}
                  >
                    Reset to Defaults
                  </GlowingButton>
                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => setIsEditing(false)}
                      className='px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors'
                    >
                      Cancel
                    </button>
                    <GlowingButton
                      onClick={handleSavePreferences}
                      disabled={updatePreferencesMutation.isPending}
                      variant='primary'
                    >
                      {updatePreferencesMutation.isPending ? (
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      ) : (
                        <Save className='h-4 w-4 mr-2' />
                      )}
                      Save Preferences
                    </GlowingButton>
                  </div>
                </div>
              )}
            </>
          ) : (
            <AnimatedCard className='p-12 text-center'>
              <div className='flex flex-col items-center gap-4'>
                <div className='rounded-full bg-gray-100 p-4'>
                  <Settings className='h-8 w-8 text-gray-400' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>Select a User or Vendor</h3>
                  <p className='text-gray-600'>
                    Enter a user ID or vendor ID to view and manage their notification preferences
                  </p>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  );
}