'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Users,
  Check,
  X,
  Star,
  Crown,
  Zap,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Download,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  usePlans,
  usePlanStats,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useTogglePlanStatus,
  useBulkUpdatePlans,
  useReorderPlans,
} from '@/lib/hooks/use-plans';
import { Plan, PlanFilters } from '@/lib/api/types';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function PlansPage() {
  const { data: session, status } = useSession();

  // Debug session
  console.log('Session status:', status);
  console.log('Session data:', session);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  // Debug modal state
  console.log('Modal state:', { showModal, editingPlan });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    currency: 'NGN',
    isActive: true,
    isFeatured: false,
    isPopular: false,
    sortOrder: 0,
    maxProducts: 100,
    maxOrders: 500,
    commissionRate: 5,
    color: '#3B82F6',
    icon: 'package',
    badge: '',
    maxImages: 10,
    maxVideos: 2,
    maxStorageGB: 1,
    maxSupportTickets: 5,
    hasAnalytics: true,
    hasAPIAccess: false,
    hasPrioritySupport: false,
    hasCustomBranding: false,
    hasAdvancedReporting: false,
  });

  // API filters
  const filters: PlanFilters = useMemo(
    () => ({
      search: searchTerm || undefined,
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      page: currentPage,
      limit: 20,
    }),
    [searchTerm, statusFilter, currentPage]
  );

  // API hooks
  const { data: plansData, isLoading: loadingPlans, error: plansError } = usePlans(filters);
  const { data: statsData, isLoading: loadingStats, error: statsError } = usePlanStats();

  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();
  const toggleStatusMutation = useTogglePlanStatus();
  const bulkUpdateMutation = useBulkUpdatePlans();
  const reorderMutation = useReorderPlans();

  const plans = plansData?.data || [];
  // Handle stats with fallback if there's an error
  const stats = statsData || {
    total: plans.length,
    active: plans.filter((p: Plan) => p.isActive).length,
    inactive: plans.filter((p: Plan) => !p.isActive).length,
    featured: plans.filter((p: Plan) => p.isFeatured).length,
    totalSubscribers: plans.reduce((sum: number, p: Plan) => sum + (p.subscribers || 0), 0),
    totalRevenue: plans.reduce((sum: number, p: Plan) => sum + (p.revenue || 0), 0),
    averagePrice: 0,
    popularBillingCycle: 'monthly',
  };

  const handleAddPlan = () => {
    console.log('Add Plan button clicked');
    console.log('Current modal state before reset:', { showModal, editingPlan });

    // Open modal for new plan
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      currency: 'NGN',
      isActive: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: plans.length + 1,
      maxProducts: 100,
      maxOrders: 500,
      commissionRate: 5,
      color: '#3B82F6',
      icon: 'package',
      badge: '',
      maxImages: 10,
      maxVideos: 2,
      maxStorageGB: 1,
      maxSupportTickets: 5,
      hasAnalytics: true,
      hasAPIAccess: false,
      hasPrioritySupport: false,
      hasCustomBranding: false,
      hasAdvancedReporting: false,
    });

    console.log('Form data reset, setting showModal to true');
    setShowModal(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: plan.billingCycle,
      currency: plan.currency,
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      isPopular: plan.isPopular,
      sortOrder: plan.sortOrder,
      maxProducts: plan.maxProducts,
      maxOrders: plan.maxOrders,
      commissionRate: plan.commissionRate,
      color: plan.color,
      icon: plan.icon,
      badge: plan.badge || '',
      maxImages: plan.maxImages,
      maxVideos: plan.maxVideos,
      maxStorageGB: plan.maxStorageGB,
      maxSupportTickets: plan.maxSupportTickets,
      hasAnalytics: plan.hasAnalytics,
      hasAPIAccess: plan.hasAPIAccess,
      hasPrioritySupport: plan.hasPrioritySupport,
      hasCustomBranding: plan.hasCustomBranding,
      hasAdvancedReporting: plan.hasAdvancedReporting,
    });
    setShowModal(true);
  };

  const handleSavePlan = async () => {
    console.log('=== PLAN SAVE DEBUG ===');
    console.log('Form data:', formData);
    console.log('Editing plan:', editingPlan);
    console.log('Session:', session);
    console.log('Is creating:', !editingPlan);

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    try {
      if (editingPlan) {
        console.log('Updating plan...');
        // Update existing plan
        await updatePlanMutation.mutateAsync({
          id: editingPlan.id,
          data: formData,
        });
      } else {
        console.log('Creating new plan...');
        console.log('Mutation function available:', !!createPlanMutation.mutateAsync);
        console.log('Mutation state:', {
          isPending: createPlanMutation.isPending,
          isError: createPlanMutation.isError,
          error: createPlanMutation.error,
        });

        // Add new plan
        const result = await createPlanMutation.mutateAsync(formData);
        console.log('Plan creation result:', result);
      }
      setShowModal(false);
    } catch (error: any) {
      // Error is handled by the mutation hooks
      console.error('Error saving plan (caught):', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
        response: error?.response,
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlanMutation.mutateAsync(planId);
      } catch (error: any) {
        // Error is handled by the mutation hook
        console.error('Error deleting plan:', error);
      }
    }
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(planId);
    } catch (error: any) {
      // Error is handled by the mutation hook
      console.error('Error toggling plan status:', error);
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

  const formatLimit = (value: number) => {
    return value === -1 ? 'Unlimited' : value?.toLocaleString() || '0';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPlans(plans.map(plan => plan.id));
    } else {
      setSelectedPlans([]);
    }
  };

  const handleSelectPlan = (planId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlans(prev => [...prev, planId]);
    } else {
      setSelectedPlans(prev => prev.filter(id => id !== planId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPlans.length === 0) {
      toast.error('Please select plans and an action');
      return;
    }

    try {
      await bulkUpdateMutation.mutateAsync({
        planIds: selectedPlans,
        action: bulkAction as any,
      });
      setSelectedPlans([]);
      setBulkAction('');
    } catch (error: any) {
      // Error is handled by the mutation hook
      console.error('Error with bulk action:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'package':
        return Package;
      case 'zap':
        return Zap;
      case 'crown':
        return Crown;
      case 'star':
        return Star;
      case 'clock':
        return Calendar;
      default:
        return Package;
    }
  };

  // Show loading state
  if (loadingPlans || loadingStats) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading plans...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (plansError) {
    const isEndpointNotFound =
      (plansError as any)?.response?.status === 404 ||
      (plansError as any)?.message?.includes('404');

    return (
      <div className="space-y-8">
        <PageHeader
          title="Plans Management"
          description="Manage subscription plans and pricing"
          icon={CreditCard}
        />
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {isEndpointNotFound ? 'Plans API Not Available' : 'Failed to load plans'}
            </h3>
            <p className="mb-4 text-gray-600">
              {isEndpointNotFound
                ? 'The plans management API endpoints are not yet deployed. The backend service needs to be updated with the new plan management functionality.'
                : plansError instanceof Error
                  ? plansError.message
                  : 'There was an error loading the plans data.'}
            </p>
            {isEndpointNotFound && (
              <div className="mx-auto mb-4 max-w-lg rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Development Note:</strong> The plan management functionality has been
                  implemented but requires the Docker container to be rebuilt with the latest code
                  changes.
                </p>
              </div>
            )}
            {/* Debug info */}
            <details className="mx-auto mb-4 max-w-md rounded-lg bg-gray-100 p-4 text-left">
              <summary className="cursor-pointer font-medium">Debug Info</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap">
                {JSON.stringify(plansError, null, 2)}
              </pre>
            </details>
            <GlowingButton variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </GlowingButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Plans Management"
        description="Manage subscription plans and pricing"
        icon={CreditCard}
        actions={[
          {
            label: 'Export',
            icon: Download,
            variant: 'secondary',
          },
          {
            label: 'Add Plan',
            icon: Plus,
            variant: 'primary',
            onClick: handleAddPlan,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Plans"
          value={stats.total}
          icon={CreditCard}
          gradient="from-blue-500 to-purple-600"
          delay={0}
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={Check}
          gradient="from-green-500 to-emerald-600"
          delay={100}
        />
        <StatsCard
          title="Inactive"
          value={stats.inactive}
          icon={X}
          gradient="from-red-500 to-pink-600"
          delay={200}
        />
        <StatsCard
          title="Featured"
          value={stats.featured}
          icon={Star}
          gradient="from-yellow-500 to-orange-600"
          delay={300}
        />
        <StatsCard
          title="Subscribers"
          value={stats.totalSubscribers}
          icon={Users}
          gradient="from-purple-500 to-pink-600"
          delay={400}
        />
        <StatsCard
          title="Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-600"
          format="currency"
          delay={500}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => {
          const IconComponent = getIconComponent(plan.icon);
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
                plan.isPopular && 'ring-2 ring-blue-500',
                plan.isFeatured && 'ring-2 ring-purple-500'
              )}
            >
              {plan.badge && (
                <div
                  className={cn(
                    'absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold',
                    plan.isPopular
                      ? 'bg-blue-100 text-blue-800'
                      : plan.isFeatured
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {plan.badge}
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: plan.color || '#3B82F6' }}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && <span className="text-gray-600">/{plan.billingCycle}</span>}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {plan.commissionRate}% commission rate
                  </p>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Products</span>
                    <span className="font-medium">{formatLimit(plan.maxProducts)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-medium">{formatLimit(plan.maxOrders)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage</span>
                    <span className="font-medium">{plan.maxStorageGB}GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Support</span>
                    <span className="font-medium">
                      {formatLimit(plan.maxSupportTickets)} tickets
                    </span>
                  </div>
                </div>

                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {plan.hasAnalytics ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-gray-700">Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {plan.hasAPIAccess ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-gray-700">API Access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {plan.hasPrioritySupport ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-gray-700">Priority Support</span>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{(plan.subscribers || 0).toLocaleString()}</span>{' '}
                    subscribers
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs',
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(plan.id)}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-2 text-sm',
                      plan.isActive
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    )}
                  >
                    {plan.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plans Management Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Plans Management</h2>
            <p className="text-gray-600">Manage and edit subscription plans</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedPlans.length === plans.length && plans.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    <button className="group inline-flex items-center space-x-1">
                      <span>Plan</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    <button className="group inline-flex items-center space-x-1">
                      <span>Price</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Limits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Subscribers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {plans.map((plan: Plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPlans.includes(plan.id)}
                        onChange={e => handleSelectPlan(plan.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: plan.color || '#3B82F6' }}
                        >
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            {plan.name}
                            {plan.badge && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                {plan.badge}
                              </span>
                            )}
                            {plan.isPopular && (
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                                Popular
                              </span>
                            )}
                            {plan.isFeatured && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <div className="text-sm text-gray-500">{plan.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {plan.price === 0 ? (
                          <span className="font-medium text-green-600">Free</span>
                        ) : (
                          <span className="font-medium">{formatCurrency(plan.price)}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{plan.commissionRate}% commission</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{plan.billingCycle}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Products: {formatLimit(plan.maxProducts)}</div>
                        <div>Orders: {formatLimit(plan.maxOrders)}</div>
                        <div>Storage: {plan.maxStorageGB}GB</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {plan.hasAnalytics && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                            Analytics
                          </span>
                        )}
                        {plan.hasAPIAccess && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            API
                          </span>
                        )}
                        {plan.hasPrioritySupport && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                            Priority
                          </span>
                        )}
                        {plan.hasCustomBranding && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                            Branding
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {(plan.subscribers || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="rounded p-1 text-blue-600 hover:text-blue-900"
                          title="Edit Plan"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(plan.id)}
                          className={cn(
                            'rounded p-1',
                            plan.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          )}
                          title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                        >
                          {plan.isActive ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="rounded p-1 text-red-600 hover:text-red-900"
                          title="Delete Plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer - Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!plansData || currentPage >= (plansData.pages || 1)}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {Math.min((currentPage - 1) * 20 + 1, plansData?.total || 0)}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, plansData?.total || 0)}
                  </span>{' '}
                  of <span className="font-medium">{plansData?.total || 0}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {plansData?.pages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!plansData || currentPage >= (plansData.pages || 1)}
                    className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPlans.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-700">
              {selectedPlans.length} plan{selectedPlans.length === 1 ? '' : 's'} selected
            </span>
            <select
              value={bulkAction}
              onChange={e => setBulkAction(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose Action</option>
              <option value="activate">Activate Selected</option>
              <option value="deactivate">Deactivate Selected</option>
              <option value="feature">Feature Selected</option>
              <option value="unfeature">Remove Featured</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || bulkUpdateMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bulkUpdateMutation.isPending ? 'Processing...' : 'Apply'}
            </button>
            <button
              onClick={() => setSelectedPlans([])}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Plan Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPlan ? 'Edit Plan' : 'Add New Plan'}
        size="xl"
      >
        <ModalBody>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Plan Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter plan name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Badge</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Popular, Featured"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter plan description"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.commissionRate}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="5"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium text-gray-900">Limits</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Max Products
                  </label>
                  <input
                    type="number"
                    value={formData.maxProducts}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, maxProducts: parseInt(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Max Orders</label>
                  <input
                    type="number"
                    value={formData.maxOrders}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, maxOrders: parseInt(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Storage (GB)
                  </label>
                  <input
                    type="number"
                    value={formData.maxStorageGB}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, maxStorageGB: parseInt(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Support Tickets
                  </label>
                  <input
                    type="number"
                    value={formData.maxSupportTickets}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        maxSupportTickets: parseInt(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium text-gray-900">Features</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasAnalytics"
                    checked={formData.hasAnalytics}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, hasAnalytics: e.target.checked }))
                    }
                  />
                  <label htmlFor="hasAnalytics" className="text-sm text-gray-700">
                    Analytics
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasAPIAccess"
                    checked={formData.hasAPIAccess}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, hasAPIAccess: e.target.checked }))
                    }
                  />
                  <label htmlFor="hasAPIAccess" className="text-sm text-gray-700">
                    API Access
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasPrioritySupport"
                    checked={formData.hasPrioritySupport}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, hasPrioritySupport: e.target.checked }))
                    }
                  />
                  <label htmlFor="hasPrioritySupport" className="text-sm text-gray-700">
                    Priority Support
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasCustomBranding"
                    checked={formData.hasCustomBranding}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, hasCustomBranding: e.target.checked }))
                    }
                  />
                  <label htmlFor="hasCustomBranding" className="text-sm text-gray-700">
                    Custom Branding
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                />
                <label htmlFor="isFeatured" className="text-sm text-gray-700">
                  Featured
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={e => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                />
                <label htmlFor="isPopular" className="text-sm text-gray-700">
                  Popular
                </label>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <GlowingButton variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </GlowingButton>
          <GlowingButton variant="primary" onClick={handleSavePlan}>
            {editingPlan ? 'Update Plan' : 'Create Plan'}
          </GlowingButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
