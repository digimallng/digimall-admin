'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import {
  DollarSign,
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { commissionService } from '@/services/commission.service';
import {
  CommissionRule,
  CommissionFilterDto,
  CommissionRuleType,
  CommissionStatus,
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
} from '@/types/commission.types';
import { useToast } from '@/hooks/use-toast';
import { TieredCommissionModal } from '@/components/commission/TieredCommissionModal';
import { CommissionCalculator } from '@/components/commission/CommissionCalculator';
import { CommissionReports } from '@/components/commission/CommissionReports';
import { BulkUpdateModal } from '@/components/commission/BulkUpdateModal';
import { VendorCommissionView } from '@/components/commission/VendorCommissionView';
import { CategoryCommissionView } from '@/components/commission/CategoryCommissionView';


export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CommissionRuleType | 'all'>('all');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'analytics' | 'calculator' | 'reports' | 'vendors' | 'categories'>('rules');
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showTieredModal, setShowTieredModal] = useState(false);
  const [selectedRules, setSelectedRules] = useState<CommissionRule[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CreateCommissionRuleDto>({
    name: '',
    description: '',
    type: CommissionRuleType.PERCENTAGE,
    value: 0,
    isDefault: false,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Prepare filter for API call
  const filter: CommissionFilterDto = {
    page: currentPage,
    limit: 20,
    ...(statusFilter !== 'all' && { status: statusFilter as CommissionStatus }),
    ...(typeFilter !== 'all' && { ruleType: typeFilter as CommissionRuleType }),
  };

  // Fetch commission rules
  const {
    data: rulesData,
    isLoading: rulesLoading,
    error: rulesError,
  } = useQuery({
    queryKey: ['commission-rules', filter],
    queryFn: () => commissionService.getCommissionRules(filter),
    refetchInterval: 30000,
  });

  // Fetch commission analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['commission-analytics'],
    queryFn: () => commissionService.getCommissionAnalytics(),
    refetchInterval: 60000,
  });

  // Create commission rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (data: CreateCommissionRuleDto) => {
      console.log('=== COMMISSION RULE CREATION DEBUG ===');
      console.log('1. Original form data:', formData);
      console.log('2. Cleaned data being sent:', data);
      console.log('3. API endpoint will be: /commission/rules');
      console.log('4. Method: POST');
      
      try {
        const result = await commissionService.createCommissionRule(data);
        console.log('5. API response received:', result);
        return result;
      } catch (error) {
        console.error('6. API call failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Commission rule created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast({
        title: 'Success',
        description: 'Commission rule created successfully',
        type: 'success',
      });
      setShowRuleModal(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: CommissionRuleType.PERCENTAGE,
        value: 5,
        vendorId: '',
        categoryId: '',
        minOrderValue: undefined,
        maxOrderValue: undefined,
        validFrom: undefined,
        validUntil: undefined,
        isDefault: false,
      });
    },
    onError: (error: any) => {
      console.error('❌ Commission rule creation failed!');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Response data:', error?.response?.data);
      console.error('Response status:', error?.response?.status);
      console.error('Response statusText:', error?.response?.statusText);
      console.error('Response headers:', error?.response?.headers);
      
      let errorMessage = 'Failed to create commission rule';
      
      // Check various error response formats
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Add status code to error message for debugging
      if (error?.response?.status) {
        errorMessage += ` (Status: ${error.response.status})`;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
    },
  });

  // Update commission rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionRuleDto }) =>
      commissionService.updateCommissionRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast({
        title: 'Success',
        description: 'Commission rule updated successfully',
        type: 'success',
      });
      setShowRuleModal(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update commission rule',
        type: 'error',
      });
    },
  });

  // Delete commission rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: commissionService.deleteCommissionRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast({
        title: 'Success',
        description: 'Commission rule deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete commission rule',
        type: 'error',
      });
    },
  });

  // Filter rules based on search term
  const filteredRules = rulesData?.rules?.filter((rule) => {
    if (searchTerm) {
      return (
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  }) || [];

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: CommissionRuleType.PERCENTAGE,
      value: 5, // Default to 5% commission
      vendorId: '',
      categoryId: '',
      minOrderValue: undefined,
      maxOrderValue: undefined,
      validFrom: undefined,
      validUntil: undefined,
      isDefault: false,
    });
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: CommissionRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      value: rule.value,
      vendorId: rule.vendorId,
      categoryId: rule.categoryId,
      minOrderValue: rule.minOrderValue,
      maxOrderValue: rule.maxOrderValue,
      validFrom: rule.validFrom ? new Date(rule.validFrom).toISOString().split('T')[0] : undefined,
      validUntil: rule.validUntil ? new Date(rule.validUntil).toISOString().split('T')[0] : undefined,
      isDefault: rule.isDefault,
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = () => {
    console.log('=== FORM VALIDATION START ===');
    console.log('Current formData:', formData);
    
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      console.log('❌ Validation failed: Rule name is empty');
      toast({
        title: 'Validation Error',
        description: 'Rule name is required',
        type: 'error',
      });
      return;
    }

    if (!formData.value || formData.value <= 0) {
      console.log('❌ Validation failed: Invalid commission value:', formData.value);
      toast({
        title: 'Validation Error',
        description: 'Commission value must be greater than 0',
        type: 'error',
      });
      return;
    }

    if (formData.type === CommissionRuleType.PERCENTAGE && formData.value > 100) {
      console.log('❌ Validation failed: Percentage too high:', formData.value);
      toast({
        title: 'Validation Error',
        description: 'Percentage commission cannot exceed 100%',
        type: 'error',
      });
      return;
    }

    // Additional validation for min/max order values
    if (formData.minOrderValue && formData.maxOrderValue) {
      if (formData.minOrderValue >= formData.maxOrderValue) {
        console.log('❌ Validation failed: Min order value >= Max order value');
        toast({
          title: 'Validation Error',
          description: 'Minimum order value must be less than maximum order value',
          type: 'error',
        });
        return;
      }
    }

    console.log('✅ All validations passed');

    if (editingRule) {
      console.log('📝 Updating existing rule:', editingRule.id);
      // Update existing rule
      const updateData: UpdateCommissionRuleDto = {
        name: formData.name,
        description: formData.description,
        value: formData.value,
        minOrderValue: formData.minOrderValue,
        maxOrderValue: formData.maxOrderValue,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        isDefault: formData.isDefault,
      };
      updateRuleMutation.mutate({ id: editingRule.id, data: updateData });
    } else {
      console.log('➕ Creating new commission rule');
      // Create new rule - clean up the data before sending
      const createData: CreateCommissionRuleDto = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        type: formData.type,
        value: Number(formData.value), // Ensure it's a number
        vendorId: formData.vendorId?.trim() || undefined,
        categoryId: formData.categoryId?.trim() || undefined,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxOrderValue: formData.maxOrderValue ? Number(formData.maxOrderValue) : undefined,
        validFrom: formData.validFrom || undefined,
        validUntil: formData.validUntil || undefined,
        isDefault: Boolean(formData.isDefault),
      };
      
      // Remove undefined values to clean the payload
      Object.keys(createData).forEach(key => {
        if (createData[key as keyof CreateCommissionRuleDto] === undefined) {
          delete createData[key as keyof CreateCommissionRuleDto];
        }
      });
      
      console.log('🚀 Final create data (cleaned):', createData);
      createRuleMutation.mutate(createData);
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this commission rule?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const handleToggleRuleStatus = (rule: CommissionRule) => {
    const newStatus = rule.status === CommissionStatus.ACTIVE 
      ? CommissionStatus.INACTIVE 
      : CommissionStatus.ACTIVE;
    
    updateRuleMutation.mutate({
      id: rule.id,
      data: { status: newStatus }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: CommissionRuleType) => {
    switch (type) {
      case CommissionRuleType.PERCENTAGE:
        return 'bg-blue-100 text-blue-800';
      case CommissionRuleType.FIXED:
        return 'bg-purple-100 text-purple-800';
      case CommissionRuleType.TIERED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalRules: analyticsData?.totalRules || 0,
    activeRules: analyticsData?.activeRules || 0,
    inactiveRules: analyticsData?.inactiveRules || 0,
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <PageHeader
        title='Commission Management'
        description='Manage commission rules and track payments'
        icon={DollarSign}
        actions={[
          {
            label: 'Export',
            icon: Download,
            variant: 'secondary',
          },
          {
            label: 'Tiered Rule',
            icon: Plus,
            variant: 'secondary',
            onClick: () => setShowTieredModal(true),
          },
          {
            label: 'Add Rule',
            icon: Plus,
            variant: 'primary',
            onClick: handleAddRule,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <StatsCard
          title='Total Rules'
          value={stats.totalRules}
          icon={Settings}
          gradient='from-blue-500 to-purple-600'
          delay={0}
        />
        <StatsCard
          title='Active Rules'
          value={stats.activeRules}
          icon={CheckCircle}
          gradient='from-green-500 to-emerald-600'
          delay={100}
        />
        <StatsCard
          title='Inactive Rules'
          value={stats.inactiveRules}
          icon={Clock}
          gradient='from-orange-500 to-red-600'
          delay={200}
        />
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8 overflow-x-auto'>
          {[
            { key: 'rules', label: 'Commission Rules' },
            { key: 'calculator', label: 'Calculator' },
            { key: 'reports', label: 'Reports' },
            { key: 'vendors', label: 'By Vendor' },
            { key: 'categories', label: 'By Category' },
            { key: 'analytics', label: 'Analytics' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <CardTitle>Commission Rules</CardTitle>
              <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='search'
                    placeholder='Search rules...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full sm:w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Status</option>
                  <option value='active'>Active</option>
                  <option value='inactive'>Inactive</option>
                  <option value='expired'>Expired</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value as any)}
                  className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value='all'>All Types</option>
                  <option value='percentage'>Percentage</option>
                  <option value='fixed'>Fixed</option>
                  <option value='tiered'>Tiered</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {rulesLoading ? (
              <div className='flex items-center justify-center h-64'>
                <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
              </div>
            ) : rulesError ? (
              <div className='text-center py-8 text-red-500'>
                Error loading commission rules: {(rulesError as any)?.message}
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b'>
                      <th className='pb-3 text-left font-medium text-gray-600'>Rule</th>
                      <th className='pb-3 text-left font-medium text-gray-600'>Type</th>
                      <th className='pb-3 text-left font-medium text-gray-600'>Value</th>
                      <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                      <th className='pb-3 text-left font-medium text-gray-600'>Created</th>
                      <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {filteredRules.map(rule => (
                      <tr key={rule.id} className='hover:bg-gray-50'>
                        <td className='py-4'>
                          <div>
                            <p className='font-medium text-gray-900'>{rule.name}</p>
                            <p className='text-xs text-gray-500'>{rule.description}</p>
                            {rule.isDefault && (
                              <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1'>
                                Default
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='py-4'>
                          <span
                            className={cn(
                              'px-2 py-1 text-xs rounded-full capitalize',
                              getTypeColor(rule.type)
                            )}
                          >
                            {rule.type}
                          </span>
                        </td>
                        <td className='py-4 text-gray-600'>
                          {rule.type === CommissionRuleType.PERCENTAGE
                            ? `${rule.value}%`
                            : rule.type === CommissionRuleType.FIXED
                            ? formatCurrency(rule.value)
                            : 'Tiered'}
                        </td>
                        <td className='py-4'>
                          <span
                            className={cn(
                              'px-2 py-1 text-xs rounded-full',
                              rule.status === CommissionStatus.ACTIVE
                                ? 'bg-green-100 text-green-800'
                                : rule.status === CommissionStatus.INACTIVE
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            )}
                          >
                            {rule.status}
                          </span>
                        </td>
                        <td className='py-4 text-gray-600'>
                          {format(new Date(rule.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className='py-4'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => handleEditRule(rule)}
                              className='p-1 text-blue-600 hover:bg-blue-50 rounded'
                              disabled={updateRuleMutation.isPending}
                            >
                              <Edit className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => handleToggleRuleStatus(rule)}
                              className={cn(
                                'p-1 rounded',
                                rule.status === CommissionStatus.ACTIVE
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              )}
                              disabled={updateRuleMutation.isPending}
                            >
                              {rule.status === CommissionStatus.ACTIVE ? (
                                <AlertTriangle className='h-4 w-4' />
                              ) : (
                                <CheckCircle className='h-4 w-4' />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className='p-1 text-red-600 hover:bg-red-50 rounded'
                              disabled={deleteRuleMutation.isPending || rule.isDefault}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredRules.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    No commission rules found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {activeTab === 'analytics' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Rule Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className='flex items-center justify-center h-32'>
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Total Rules</span>
                    <span className='font-bold text-lg'>{analyticsData?.totalRules || 0}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Active Rules</span>
                    <span className='font-medium text-green-600'>{analyticsData?.activeRules || 0}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Inactive Rules</span>
                    <span className='font-medium text-red-600'>{analyticsData?.inactiveRules || 0}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Default Rule</span>
                    <span className='font-medium'>
                      {analyticsData?.defaultRule?.name || 'Not set'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rule Types</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className='flex items-center justify-center h-32'>
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                </div>
              ) : (
                <div className='space-y-4'>
                  {Object.entries(analyticsData?.ruleTypes || {}).map(([type, count]) => (
                    <div key={type} className='flex justify-between items-center'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs rounded-full capitalize',
                            getTypeColor(type as CommissionRuleType)
                          )}
                        >
                          {type}
                        </span>
                      </div>
                      <span className='font-medium'>{count}</span>
                    </div>
                  ))}
                  {(!analyticsData?.ruleTypes || Object.keys(analyticsData.ruleTypes).length === 0) && (
                    <div className='text-center text-gray-500 text-sm'>
                      No rule types data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'calculator' && (
        <CommissionCalculator />
      )}

      {activeTab === 'reports' && (
        <CommissionReports />
      )}

      {activeTab === 'vendors' && (
        <VendorCommissionView />
      )}

      {activeTab === 'categories' && (
        <CategoryCommissionView />
      )}

      {/* Commission Rule Modal */}
      <Modal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        title={editingRule ? 'Edit Commission Rule' : 'Add New Commission Rule'}
        size='lg'
      >
        <ModalBody>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Rule Name *</label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='Enter rule name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as CommissionRuleType }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                >
                  <option value={CommissionRuleType.PERCENTAGE}>Percentage</option>
                  <option value={CommissionRuleType.FIXED}>Fixed Amount</option>
                  <option value={CommissionRuleType.TIERED}>Tiered</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                placeholder='Enter rule description'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {formData.type === CommissionRuleType.PERCENTAGE ? 'Rate (%)' : 'Amount'} *
                </label>
                <input
                  type='number'
                  value={formData.value}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder={formData.type === CommissionRuleType.PERCENTAGE ? '5.0' : '1000'}
                  step={formData.type === CommissionRuleType.PERCENTAGE ? '0.01' : '1'}
                  min='0'
                  max={formData.type === CommissionRuleType.PERCENTAGE ? '100' : undefined}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Vendor ID</label>
                <input
                  type='text'
                  value={formData.vendorId || ''}
                  onChange={e => setFormData(prev => ({ ...prev, vendorId: e.target.value || undefined }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='Leave empty for all vendors'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Minimum Order Value
                </label>
                <input
                  type='number'
                  value={formData.minOrderValue || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      minOrderValue: parseFloat(e.target.value) || undefined,
                    }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='0'
                  min='0'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Maximum Order Value</label>
                <input
                  type='number'
                  value={formData.maxOrderValue || ''}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, maxOrderValue: parseFloat(e.target.value) || undefined }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='Leave empty for no limit'
                  min='0'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Valid From</label>
                <input
                  type='date'
                  value={formData.validFrom || ''}
                  onChange={e => setFormData(prev => ({ ...prev, validFrom: e.target.value || undefined }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Valid Until</label>
                <input
                  type='date'
                  value={formData.validUntil || ''}
                  onChange={e => setFormData(prev => ({ ...prev, validUntil: e.target.value || undefined }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='isDefault'
                checked={formData.isDefault}
                onChange={e => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              />
              <label htmlFor='isDefault' className='text-sm text-gray-700'>
                Set as Default Rule
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <GlowingButton variant='secondary' onClick={() => setShowRuleModal(false)}>
            Cancel
          </GlowingButton>
          <GlowingButton 
            variant='primary' 
            onClick={handleSaveRule}
            disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
          >
            {createRuleMutation.isPending || updateRuleMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : null}
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </GlowingButton>
        </ModalFooter>
      </Modal>

      {/* Tiered Commission Modal */}
      <TieredCommissionModal
        isOpen={showTieredModal}
        onClose={() => setShowTieredModal(false)}
      />

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        isOpen={showBulkUpdateModal}
        onClose={() => setShowBulkUpdateModal(false)}
        selectedRules={selectedRules}
      />
    </div>
  );
}
