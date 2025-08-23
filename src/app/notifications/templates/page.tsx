'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatedCard, GlowingButton } from '@/components/ui/AnimatedCard';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  Eye,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Bell,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Shield,
  Gift,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  RefreshCw,
  Loader2,
  Code,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  notificationsService, 
  NotificationTemplate 
} from '@/lib/api/services/notifications.service';

interface CreateTemplateFormData {
  name: string;
  title: string;
  template: string;
  type: NotificationTemplate['type'];
  description: string;
  channels: string[];
  variables: string[];
  isActive: boolean;
}

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Info', icon: Info, color: 'blue' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'green' },
  { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'yellow' },
  { value: 'error', label: 'Error', icon: XCircle, color: 'red' },
  { value: 'system', label: 'System', icon: Settings, color: 'gray' },
  { value: 'order', label: 'Order', icon: ShoppingCart, color: 'blue' },
  { value: 'payment', label: 'Payment', icon: DollarSign, color: 'green' },
  { value: 'vendor', label: 'Vendor', icon: Users, color: 'purple' },
  { value: 'security', label: 'Security', icon: Shield, color: 'red' },
  { value: 'promotion', label: 'Promotion', icon: Gift, color: 'pink' },
];

const NOTIFICATION_CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'push', label: 'Push', icon: Smartphone },
  { value: 'in_app', label: 'In-App', icon: Globe },
];

const COMMON_VARIABLES = [
  'userName', 'userEmail', 'orderNumber', 'orderTotal', 'productName', 
  'vendorName', 'amount', 'date', 'time', 'actionUrl', 'supportEmail'
];

export default function NotificationTemplatesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<CreateTemplateFormData>({
    name: '',
    title: '',
    template: '',
    type: 'info',
    description: '',
    channels: ['in_app'],
    variables: [],
    isActive: true,
  });

  // Fetch templates
  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationsService.getNotificationTemplates(),
    staleTime: 30000,
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: (data: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
      notificationsService.createNotificationTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template created successfully');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotificationTemplate> }) =>
      notificationsService.updateNotificationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template updated successfully');
      setSelectedTemplate(null);
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: string) => notificationsService.deleteNotificationTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesChannel = filterChannel === 'all' || 
      (template.channels && template.channels.includes(filterChannel));
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && template.isActive) ||
      (filterActive === 'inactive' && !template.isActive);

    return matchesSearch && matchesType && matchesChannel && matchesActive;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      template: '',
      type: 'info',
      description: '',
      channels: ['in_app'],
      variables: [],
      isActive: true,
    });
    setIsCreateModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.title || !formData.template) {
      toast.error('Please fill in all required fields');
      return;
    }

    createTemplateMutation.mutate(formData);
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;

    updateTemplateMutation.mutate({
      id: selectedTemplate.id,
      data: formData,
    });
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      template: template.template,
      type: template.type,
      description: template.description || '',
      channels: template.channels || [],
      variables: template.variables || [],
      isActive: template.isActive,
    });
    setIsCreateModalOpen(true);
  };

  const handleDuplicateTemplate = (template: NotificationTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      title: template.title,
      template: template.template,
      type: template.type,
      description: template.description || '',
      channels: template.channels || [],
      variables: template.variables || [],
      isActive: true,
    });
    setSelectedTemplate(null);
    setIsCreateModalOpen(true);
  };

  const handleDeleteTemplate = (template: NotificationTemplate) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const extractVariables = (templateText: string) => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    while ((match = variableRegex.exec(templateText)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const handleTemplateChange = (template: string) => {
    const extractedVariables = extractVariables(template);
    setFormData(prev => ({
      ...prev,
      template,
      variables: extractedVariables,
    }));
  };

  const previewTemplate = (template: string, variables: string[]) => {
    let preview = template;
    variables.forEach(variable => {
      const value = previewData[variable] || `{{${variable}}}`;
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
    });
    return preview;
  };

  const getTypeDetails = (type: string) => {
    return NOTIFICATION_TYPES.find(t => t.value === type) || NOTIFICATION_TYPES[0];
  };

  const getChannelIcon = (channel: string) => {
    const channelData = NOTIFICATION_CHANNELS.find(c => c.value === channel);
    return channelData?.icon || Globe;
  };

  if (error) {
    return (
      <div className='space-y-8'>
        <AnimatedCard className='text-center py-12'>
          <div className='flex flex-col items-center gap-4'>
            <div className='rounded-full bg-red-100 p-4'>
              <XCircle className='h-8 w-8 text-red-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Error Loading Templates</h3>
              <p className='text-gray-600 mb-4'>Failed to connect to notification service</p>
              <GlowingButton onClick={() => refetch()} variant='primary'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Retry
              </GlowingButton>
            </div>
          </div>
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='relative'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-indigo-600/5 rounded-3xl' />
        <div className='p-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                Notification Templates
              </h1>
              <p className='text-gray-600 mt-2'>
                Create and manage reusable notification templates
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
              <GlowingButton
                size='sm'
                variant='primary'
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className='h-4 w-4 mr-2' />
                Create Template
              </GlowingButton>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-gray-500' />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value='all'>All Types</option>
              {NOTIFICATION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterChannel}
            onChange={e => setFilterChannel(e.target.value)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Channels</option>
            {NOTIFICATION_CHANNELS.map(channel => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>

          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </select>
        </div>

        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='search'
            placeholder='Search templates...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-64 rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <AnimatedCard key={i} className='p-6'>
              <div className='animate-pulse space-y-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-lg bg-gray-200 h-10 w-10' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-3/4' />
                    <div className='h-3 bg-gray-200 rounded w-1/2' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='h-3 bg-gray-200 rounded' />
                  <div className='h-3 bg-gray-200 rounded w-5/6' />
                </div>
              </div>
            </AnimatedCard>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className='col-span-full'>
            <AnimatedCard className='text-center py-12'>
              <div className='flex flex-col items-center gap-4'>
                <div className='rounded-full bg-gray-100 p-4'>
                  <Bell className='h-8 w-8 text-gray-400' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>No templates found</h3>
                  <p className='text-gray-600'>Try adjusting your filters or create a new template</p>
                </div>
              </div>
            </AnimatedCard>
          </div>
        ) : (
          filteredTemplates.map((template, index) => {
            const typeDetails = getTypeDetails(template.type);
            const TypeIcon = typeDetails.icon;

            return (
              <AnimatedCard
                key={template.id}
                delay={index * 100}
                className='p-6 hover:shadow-lg transition-all duration-200'
              >
                <div className='space-y-4'>
                  {/* Header */}
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className={cn(
                        'rounded-lg p-2.5 bg-gradient-to-r',
                        typeDetails.color === 'blue' && 'from-blue-500 to-blue-600',
                        typeDetails.color === 'green' && 'from-green-500 to-green-600',
                        typeDetails.color === 'yellow' && 'from-yellow-500 to-yellow-600',
                        typeDetails.color === 'red' && 'from-red-500 to-red-600',
                        typeDetails.color === 'gray' && 'from-gray-500 to-gray-600',
                        typeDetails.color === 'purple' && 'from-purple-500 to-purple-600',
                        typeDetails.color === 'pink' && 'from-pink-500 to-pink-600'
                      )}>
                        <TypeIcon className='h-5 w-5 text-white' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-900 truncate'>
                          {template.name}
                        </h3>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-xs text-gray-500 capitalize'>
                            {template.type}
                          </span>
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            template.isActive ? 'bg-green-500' : 'bg-gray-400'
                          )} />
                          <span className='text-xs text-gray-500'>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                        title='Edit template'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className='p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                        title='Duplicate template'
                      >
                        <Copy className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete template'
                        disabled={deleteTemplateMutation.isPending}
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className='text-sm font-medium text-gray-800'>
                      {template.title}
                    </h4>
                  </div>

                  {/* Template Preview */}
                  <div className='bg-gray-50 rounded-lg p-3 text-xs text-gray-700'>
                    <p className='line-clamp-3'>
                      {previewTemplate(template.template, template.variables || [])}
                    </p>
                  </div>

                  {/* Channels */}
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500'>Channels:</span>
                    <div className='flex items-center gap-1'>
                      {(template.channels || []).map(channel => {
                        const ChannelIcon = getChannelIcon(channel);
                        return (
                          <div
                            key={channel}
                            className='p-1 bg-gray-100 rounded'
                            title={channel}
                          >
                            <ChannelIcon className='h-3 w-3 text-gray-600' />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Variables */}
                  {template.variables && template.variables.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {template.variables.map(variable => (
                        <span
                          key={variable}
                          className='inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700'
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Usage Stats */}
                  <div className='flex items-center justify-between text-xs text-gray-500 pt-2 border-t'>
                    <span>
                      Used: {template.usageCount || 0} times
                    </span>
                    {template.lastUsed && (
                      <span>
                        Last: {format(new Date(template.lastUsed), 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            );
          })
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {isCreateModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
          <div className='bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  {selectedTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <button
                  onClick={resetForm}
                  className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>
            </div>

            <div className='p-6 space-y-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Form */}
                <div className='space-y-4'>
                  {/* Basic Info */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Template Name *
                    </label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter template name'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Title *
                    </label>
                    <input
                      type='text'
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Notification title (supports variables)'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as NotificationTemplate['type'] }))}
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
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      rows={3}
                      placeholder='Template description'
                    />
                  </div>

                  {/* Channels */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Channels
                    </label>
                    <div className='space-y-2'>
                      {NOTIFICATION_CHANNELS.map(channel => {
                        const ChannelIcon = channel.icon;
                        return (
                          <label key={channel.value} className='flex items-center gap-2'>
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
                            <ChannelIcon className='h-4 w-4 text-gray-600' />
                            <span className='text-sm text-gray-700'>{channel.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      id='isActive'
                      checked={formData.isActive}
                      onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <label htmlFor='isActive' className='text-sm text-gray-700'>
                      Active template
                    </label>
                  </div>
                </div>

                {/* Template Editor & Preview */}
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Template Content *
                    </label>
                    <textarea
                      value={formData.template}
                      onChange={e => handleTemplateChange(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
                      rows={8}
                      placeholder='Enter your notification template. Use {{variableName}} for variables.'
                    />
                  </div>

                  {/* Variables */}
                  {formData.variables.length > 0 && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Variables Found
                      </label>
                      <div className='grid grid-cols-2 gap-2'>
                        {formData.variables.map(variable => (
                          <input
                            key={variable}
                            type='text'
                            placeholder={`{{${variable}}}`}
                            value={previewData[variable] || ''}
                            onChange={e => setPreviewData(prev => ({ 
                              ...prev, 
                              [variable]: e.target.value 
                            }))}
                            className='px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                          />
                        ))}
                      </div>
                      <p className='text-xs text-gray-500 mt-1'>
                        Enter test values to preview the template
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Preview
                    </label>
                    <div className='p-4 bg-gray-50 rounded-lg border'>
                      <div className='text-sm font-medium text-gray-900 mb-2'>
                        {previewTemplate(formData.title, formData.variables)}
                      </div>
                      <div className='text-sm text-gray-700'>
                        {previewTemplate(formData.template, formData.variables)}
                      </div>
                    </div>
                  </div>

                  {/* Common Variables */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Common Variables
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {COMMON_VARIABLES.map(variable => (
                        <button
                          key={variable}
                          onClick={() => {
                            const newTemplate = formData.template + `{{${variable}}}`;
                            handleTemplateChange(newTemplate);
                          }}
                          className='px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex items-center justify-end gap-3 pt-4 border-t'>
                <button
                  onClick={resetForm}
                  className='px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors'
                >
                  Cancel
                </button>
                <GlowingButton
                  onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                  variant='primary'
                >
                  {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <Save className='h-4 w-4 mr-2' />
                  )}
                  {selectedTemplate ? 'Update Template' : 'Create Template'}
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}