'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import {
  Send,
  Users,
  UserCheck,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Shield,
  Gift,
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  Loader2,
  Search,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  notificationsService, 
  BulkNotificationData,
  NotificationTemplate 
} from '@/lib/api/services/notifications.service';

interface BulkNotificationFormData {
  title: string;
  message: string;
  type: BulkNotificationData['type'];
  channels: string[];
  priority: BulkNotificationData['priority'];
  scheduledFor?: string;
  actionUrl?: string;
  actionLabel?: string;
  
  // Recipients
  allUsers: boolean;
  allVendors: boolean;
  userIds: string[];
  vendorIds: string[];
  
  // Template
  useTemplate: boolean;
  selectedTemplate?: NotificationTemplate;
}

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Info', icon: Info, color: 'blue' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'green' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'yellow' },
  { value: 'error', label: 'Error', icon: XCircle, color: 'red' },
  { value: 'system', label: 'System', icon: Settings, color: 'gray' },
  { value: 'order', label: 'Order', icon: ShoppingCart, color: 'blue' },
  { value: 'payment', label: 'Payment', icon: DollarSign, color: 'green' },
  { value: 'vendor', label: 'Vendor', icon: Users, color: 'purple' },
  { value: 'security', label: 'Security', icon: Shield, color: 'red' },
  { value: 'promotion', label: 'Promotion', icon: Gift, color: 'pink' },
];

const NOTIFICATION_CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Send to email addresses' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, description: 'Send to phone numbers' },
  { value: 'push', label: 'Push', icon: Smartphone, description: 'Send push notifications' },
  { value: 'in_app', label: 'In-App', icon: Globe, description: 'Show in application' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

export default function SendNotificationPage() {
  const [formData, setFormData] = useState<BulkNotificationFormData>({
    title: '',
    message: '',
    type: 'info',
    channels: ['in_app'],
    priority: 'medium',
    allUsers: false,
    allVendors: false,
    userIds: [],
    vendorIds: [],
    useTemplate: false,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch templates for template selection
  const { data: templates = [] } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationsService.getNotificationTemplates(),
  });

  // Send bulk notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (data: BulkNotificationData) => notificationsService.sendBulkNotification(data),
    onSuccess: (result) => {
      if (result) {
        toast.success(`Notification sent to ${result.sent} out of ${result.total} recipients`);
        resetForm();
      }
    },
    onError: () => {
      toast.error('Failed to send bulk notification');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      channels: ['in_app'],
      priority: 'medium',
      allUsers: false,
      allVendors: false,
      userIds: [],
      vendorIds: [],
      useTemplate: false,
    });
    setCurrentStep(1);
    setPreviewMode(false);
  };

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      message: template.template,
      type: template.type,
      channels: template.channels || ['in_app'],
      selectedTemplate: template,
      useTemplate: true,
    }));
  };

  const calculateRecipientCount = () => {
    let count = 0;
    if (formData.allUsers) count += 10000; // Estimated user count
    if (formData.allVendors) count += 500; // Estimated vendor count
    count += formData.userIds.length + formData.vendorIds.length;
    return count;
  };

  const handleSendNotification = () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in title and message');
      return;
    }

    if (!formData.allUsers && !formData.allVendors && formData.userIds.length === 0 && formData.vendorIds.length === 0) {
      toast.error('Please select recipients');
      return;
    }

    const sendData: BulkNotificationData = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      channels: formData.channels,
      priority: formData.priority,
      allUsers: formData.allUsers,
      allVendors: formData.allVendors,
      userIds: formData.userIds,
      vendorIds: formData.vendorIds,
      scheduledFor: formData.scheduledFor,
      actionUrl: formData.actionUrl,
      actionLabel: formData.actionLabel,
    };

    sendNotificationMutation.mutate(sendData);
  };

  const getTypeDetails = (type: string) => {
    return NOTIFICATION_TYPES.find(t => t.value === type) || NOTIFICATION_TYPES[0];
  };

  const getPriorityColor = (priority: string) => {
    const level = PRIORITY_LEVELS.find(p => p.value === priority);
    switch (level?.color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'red': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const steps = [
    { number: 1, title: 'Content', description: 'Create your notification content' },
    { number: 2, title: 'Recipients', description: 'Select who receives the notification' },
    { number: 3, title: 'Settings', description: 'Configure delivery settings' },
    { number: 4, title: 'Review', description: 'Review and send' },
  ];

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Send Bulk Notification
              </h1>
              <p className='text-gray-600 mt-2'>
                Send notifications to multiple users and vendors
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <GlowingButton
                size='sm'
                variant='secondary'
                onClick={resetForm}
              >
                <X className='h-4 w-4 mr-2' />
                Reset Form
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className='flex items-center justify-between'>
        {steps.map((step, index) => (
          <div key={step.number} className='flex items-center'>
            <div className='flex items-center'>
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {step.number}
              </div>
              <div className='ml-3'>
                <div className='text-sm font-medium text-gray-900'>{step.title}</div>
                <div className='text-xs text-gray-500'>{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-px mx-4 transition-colors',
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Form */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Step 1: Content */}
          {currentStep === 1 && (
            <AnimatedCard className='p-6'>
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-semibold text-gray-900'>Notification Content</h2>
                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      id='useTemplate'
                      checked={formData.useTemplate}
                      onChange={e => setFormData(prev => ({ ...prev, useTemplate: e.target.checked }))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='useTemplate' className='text-sm text-gray-700'>
                      Use template
                    </label>
                  </div>
                </div>

                {formData.useTemplate && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Select Template
                    </label>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto'>
                      {templates.map(template => {
                        const typeDetails = getTypeDetails(template.type);
                        const TypeIcon = typeDetails.icon;
                        return (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={cn(
                              'p-3 text-left border rounded-lg transition-colors hover:bg-gray-50',
                              formData.selectedTemplate?.id === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200'
                            )}
                          >
                            <div className='flex items-center gap-2'>
                              <TypeIcon className='h-4 w-4 text-gray-600' />
                              <span className='text-sm font-medium text-gray-900'>
                                {template.name}
                              </span>
                            </div>
                            <p className='text-xs text-gray-600 mt-1'>
                              {template.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Title *
                  </label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Notification title'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    rows={4}
                    placeholder='Enter your notification message'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as BulkNotificationData['type'] }))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      {NOTIFICATION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as BulkNotificationData['priority'] }))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      {PRIORITY_LEVELS.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Action URL (Optional)
                  </label>
                  <div className='grid grid-cols-2 gap-4'>
                    <input
                      type='url'
                      value={formData.actionUrl || ''}
                      onChange={e => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                      className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='https://example.com/action'
                    />
                    <input
                      type='text'
                      value={formData.actionLabel || ''}
                      onChange={e => setFormData(prev => ({ ...prev, actionLabel: e.target.value }))}
                      className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Action button label'
                    />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Step 2: Recipients */}
          {currentStep === 2 && (
            <AnimatedCard className='p-6'>
              <div className='space-y-6'>
                <h2 className='text-lg font-semibold text-gray-900'>Select Recipients</h2>

                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='p-4 border rounded-lg'>
                      <div className='flex items-center gap-3 mb-3'>
                        <Users className='h-5 w-5 text-blue-600' />
                        <span className='font-medium text-gray-900'>Users</span>
                      </div>
                      <div className='space-y-3'>
                        <label className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={formData.allUsers}
                            onChange={e => setFormData(prev => ({ ...prev, allUsers: e.target.checked }))}
                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                          <span className='text-sm text-gray-700'>All Users (~10,000)</span>
                        </label>
                        <div className='text-xs text-gray-500'>
                          Send to all registered customers on the platform
                        </div>
                      </div>
                    </div>

                    <div className='p-4 border rounded-lg'>
                      <div className='flex items-center gap-3 mb-3'>
                        <UserCheck className='h-5 w-5 text-purple-600' />
                        <span className='font-medium text-gray-900'>Vendors</span>
                      </div>
                      <div className='space-y-3'>
                        <label className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={formData.allVendors}
                            onChange={e => setFormData(prev => ({ ...prev, allVendors: e.target.checked }))}
                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                          <span className='text-sm text-gray-700'>All Vendors (~500)</span>
                        </label>
                        <div className='text-xs text-gray-500'>
                          Send to all approved vendors on the platform
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='border-t pt-4'>
                    <h3 className='font-medium text-gray-900 mb-3'>Specific Recipients</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          User IDs (comma-separated)
                        </label>
                        <textarea
                          value={formData.userIds.join(', ')}
                          onChange={e => {
                            const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean);
                            setFormData(prev => ({ ...prev, userIds: ids }));
                          }}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          rows={3}
                          placeholder='user1, user2, user3...'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Vendor IDs (comma-separated)
                        </label>
                        <textarea
                          value={formData.vendorIds.join(', ')}
                          onChange={e => {
                            const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean);
                            setFormData(prev => ({ ...prev, vendorIds: ids }));
                          }}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          rows={3}
                          placeholder='vendor1, vendor2, vendor3...'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <AnimatedCard className='p-6'>
              <div className='space-y-6'>
                <h2 className='text-lg font-semibold text-gray-900'>Delivery Settings</h2>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-3'>
                    Channels
                  </label>
                  <div className='space-y-3'>
                    {NOTIFICATION_CHANNELS.map(channel => {
                      const ChannelIcon = channel.icon;
                      return (
                        <label key={channel.value} className='flex items-center gap-3 p-3 border rounded-lg'>
                          <input
                            type='checkbox'
                            checked={formData.channels.includes(channel.value)}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  channels: [...prev.channels, channel.value] 
                                }));
                              } else {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  channels: prev.channels.filter(c => c !== channel.value) 
                                }));
                              }
                            }}
                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                          <ChannelIcon className='h-5 w-5 text-gray-600' />
                          <div className='flex-1'>
                            <div className='font-medium text-gray-900'>{channel.label}</div>
                            <div className='text-sm text-gray-500'>{channel.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Schedule Delivery (Optional)
                  </label>
                  <input
                    type='datetime-local'
                    value={formData.scheduledFor || ''}
                    onChange={e => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Leave empty to send immediately
                  </p>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <AnimatedCard className='p-6'>
              <div className='space-y-6'>
                <h2 className='text-lg font-semibold text-gray-900'>Review & Send</h2>

                <div className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className={cn(
                      'rounded-lg p-2.5 bg-gradient-to-r',
                      getTypeDetails(formData.type).color === 'blue' && 'from-blue-500 to-blue-600',
                      getTypeDetails(formData.type).color === 'green' && 'from-green-500 to-green-600',
                      getTypeDetails(formData.type).color === 'yellow' && 'from-yellow-500 to-yellow-600',
                      getTypeDetails(formData.type).color === 'red' && 'from-red-500 to-red-600',
                      getTypeDetails(formData.type).color === 'gray' && 'from-gray-500 to-gray-600',
                      getTypeDetails(formData.type).color === 'purple' && 'from-purple-500 to-purple-600',
                      getTypeDetails(formData.type).color === 'pink' && 'from-pink-500 to-pink-600'
                    )}>
                      {React.createElement(getTypeDetails(formData.type).icon, {
                        className: 'h-5 w-5 text-white'
                      })}
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900'>{formData.title}</h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          getPriorityColor(formData.priority || 'medium')
                        )}>
                          {formData.priority}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {getTypeDetails(formData.type).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='text-sm text-gray-700 mb-4'>
                    {formData.message}
                  </div>

                  {formData.actionUrl && (
                    <div className='text-sm text-blue-600'>
                      Action: {formData.actionLabel || 'View Details'} → {formData.actionUrl}
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Recipients</h4>
                    <div className='text-sm text-gray-600 space-y-1'>
                      {formData.allUsers && <div>• All Users (~10,000)</div>}
                      {formData.allVendors && <div>• All Vendors (~500)</div>}
                      {formData.userIds.length > 0 && <div>• {formData.userIds.length} specific users</div>}
                      {formData.vendorIds.length > 0 && <div>• {formData.vendorIds.length} specific vendors</div>}
                      <div className='font-medium text-gray-900 mt-2'>
                        Total: ~{calculateRecipientCount().toLocaleString()} recipients
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>Settings</h4>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <div>Channels: {formData.channels.join(', ')}</div>
                      <div>
                        Delivery: {formData.scheduledFor 
                          ? format(new Date(formData.scheduledFor), 'MMM dd, yyyy - hh:mm a')
                          : 'Immediate'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Navigation */}
          <div className='flex items-center justify-between'>
            <div>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className='px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Previous
                </button>
              )}
            </div>
            <div className='flex items-center gap-3'>
              {currentStep < 4 ? (
                <GlowingButton
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  variant='primary'
                >
                  Next Step
                </GlowingButton>
              ) : (
                <GlowingButton
                  onClick={handleSendNotification}
                  disabled={sendNotificationMutation.isPending}
                  variant='primary'
                >
                  {sendNotificationMutation.isPending ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <Send className='h-4 w-4 mr-2' />
                  )}
                  Send Notification
                </GlowingButton>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Quick Stats */}
          <AnimatedCard className='p-6'>
            <h3 className='font-semibold text-gray-900 mb-4'>Quick Stats</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>Estimated Recipients</span>
                <span className='font-medium text-gray-900'>
                  {calculateRecipientCount().toLocaleString()}
                </span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>Selected Channels</span>
                <span className='font-medium text-gray-900'>
                  {formData.channels.length}
                </span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>Priority Level</span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(formData.priority || 'medium')
                )}>
                  {formData.priority}
                </span>
              </div>
            </div>
          </AnimatedCard>

          {/* Tips */}
          <AnimatedCard className='p-6'>
            <h3 className='font-semibold text-gray-900 mb-4'>Tips</h3>
            <div className='space-y-3 text-sm text-gray-600'>
              <div className='flex items-start gap-2'>
                <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                <div>Use clear, actionable language in your notifications</div>
              </div>
              <div className='flex items-start gap-2'>
                <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                <div>Test with a small group before sending to all users</div>
              </div>
              <div className='flex items-start gap-2'>
                <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                <div>Consider time zones when scheduling notifications</div>
              </div>
              <div className='flex items-start gap-2'>
                <CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
                <div>Use appropriate priority levels to avoid notification fatigue</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}