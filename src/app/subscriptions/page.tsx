'use client';

import { useState } from 'react';
import {
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Check,
  X,
  DollarSign,
  Package,
  Search,
  MoreVertical,
  Star,
  Tag,
  Settings,
  Eye,
  AlertCircle,
  Info,
  Sparkles,
  Crown,
  ShoppingCart,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useSubscriptionPlans,
  useSubscriptionPlanStatistics,
  useVendorSubscriptions,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useArchiveSubscriptionPlan,
  useSyncPlanWithPaystack,
  useCancelVendorSubscription,
} from '@/lib/api/hooks/use-subscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  PlanLimitations,
  PlanDuration,
  PlanStatus,
} from '@/lib/api/types/subscription.types';
import { Textarea } from '@/components/ui/textarea';

// Helper function to convert kobo to Naira
const koboToNaira = (kobo: number): number => kobo / 100;

// Helper function to convert Naira to kobo
const nairaToKobo = (naira: number): number => Math.round(naira * 100);

// Helper function to format currency
const formatCurrency = (kobo: number): string => {
  return `₦${koboToNaira(kobo).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planStatusFilter, setPlanStatusFilter] = useState<string>('all');

  // Plan Dialog States
  const [planDialog, setPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planDetailsDialog, setPlanDetailsDialog] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<SubscriptionPlan | null>(null);

  // Plan Form State (with all required fields)
  const [planForm, setPlanForm] = useState<CreateSubscriptionPlanRequest>({
    planName: '',
    displayName: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    currency: 'NGN',
    duration: 'monthly',
    durationDays: undefined,
    features: [],
    limitations: {
      maxProducts: 50,
      maxOrdersPerMonth: 200,
      maxStorageMB: 5000,
      maxImagesPerProduct: 5,
      canUsePremiumThemes: false,
      canCreateCoupons: false,
      canAccessAnalytics: true,
      prioritySupport: false,
      canBeFeatured: false,
    },
    sortOrder: 0,
    isRecommended: false,
    isFree: false,
    badge: undefined,
    iconUrl: undefined,
    colorTheme: '#007bff',
  });

  // Feature input for adding features
  const [featureInput, setFeatureInput] = useState('');

  // Price display helpers (convert between Naira and kobo for user input)
  const [priceInNaira, setPriceInNaira] = useState<string>('0');
  const [originalPriceInNaira, setOriginalPriceInNaira] = useState<string>('');

  // Cancel Subscription Dialog States
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState<string>('');
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    issueRefund: false,
    cancelAtPeriodEnd: false,
  });

  // API Hooks
  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useSubscriptionPlans();
  const { data: statsData, isLoading: statsLoading } = useSubscriptionPlanStatistics();
  const {
    data: vendorSubsData,
    isLoading: vendorSubsLoading,
    refetch: refetchVendorSubs,
  } = useVendorSubscriptions({
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
  });

  const createPlanMutation = useCreateSubscriptionPlan();
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const archivePlanMutation = useArchiveSubscriptionPlan();
  const syncPaystackMutation = useSyncPlanWithPaystack();
  const cancelSubscriptionMutation = useCancelVendorSubscription();

  // Extract data safely - plansData has nested structure: { data: { success: true, data: [...] } }
  const plans = Array.isArray(plansData?.data?.data) ? plansData.data.data : [];
  const vendorSubscriptions = Array.isArray(vendorSubsData?.subscriptions)
    ? vendorSubsData.subscriptions
    : [];
  const stats = statsData?.data?.overview ? statsData.data : null;

  // Filter plans by status
  const filteredPlans = plans
    .filter((plan) => {
      const matchesSearch = plan.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.planName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = planStatusFilter === 'all' || plan.status === planStatusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const handleOpenPlanDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        planName: plan.planName,
        displayName: plan.displayName,
        description: plan.description,
        price: plan.price,
        originalPrice: plan.originalPrice || undefined,
        currency: plan.currency,
        duration: plan.duration,
        durationDays: plan.durationDays,
        features: plan.features,
        limitations: plan.limitations,
        sortOrder: plan.sortOrder,
        isRecommended: plan.isRecommended,
        isFree: plan.isFree,
        badge: plan.badge || undefined,
        iconUrl: plan.iconUrl || undefined,
        colorTheme: plan.colorTheme,
      });
      setPriceInNaira(koboToNaira(plan.price).toString());
      setOriginalPriceInNaira(plan.originalPrice ? koboToNaira(plan.originalPrice).toString() : '');
    } else {
      setEditingPlan(null);
      setPlanForm({
        planName: '',
        displayName: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        currency: 'NGN',
        duration: 'monthly',
        durationDays: undefined,
        features: [],
        limitations: {
          maxProducts: 50,
          maxOrdersPerMonth: 200,
          maxStorageMB: 5000,
          maxImagesPerProduct: 5,
          canUsePremiumThemes: false,
          canCreateCoupons: false,
          canAccessAnalytics: true,
          prioritySupport: false,
          canBeFeatured: false,
        },
        sortOrder: 0,
        isRecommended: false,
        isFree: false,
        badge: undefined,
        iconUrl: undefined,
        colorTheme: '#007bff',
      });
      setPriceInNaira('0');
      setOriginalPriceInNaira('');
    }
    setPlanDialog(true);
  };

  const handleSavePlan = () => {
    // Validation
    if (!planForm.planName || !planForm.displayName || !planForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (planForm.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (planForm.features.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }

    // Validate limitations
    if (
      planForm.limitations.maxProducts < 1 ||
      planForm.limitations.maxOrdersPerMonth < 1 ||
      planForm.limitations.maxStorageMB < 1 ||
      planForm.limitations.maxImagesPerProduct < 1 ||
      planForm.limitations.maxImagesPerProduct > 50
    ) {
      toast.error('Please check limitation values');
      return;
    }

    if (editingPlan) {
      // For update, we need to exclude immutable fields
      const updateData: any = {
        displayName: planForm.displayName,
        description: planForm.description,
        price: planForm.price,
        originalPrice: planForm.originalPrice,
        features: planForm.features,
        limitations: planForm.limitations,
        sortOrder: planForm.sortOrder,
        isRecommended: planForm.isRecommended,
        badge: planForm.badge,
        iconUrl: planForm.iconUrl,
        colorTheme: planForm.colorTheme,
      };

      updatePlanMutation.mutate(
        { id: editingPlan.id, data: updateData },
        {
          onSuccess: () => {
            toast.success('Plan updated successfully');
            setPlanDialog(false);
            refetchPlans();
          },
          onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update plan');
          },
        }
      );
    } else {
      createPlanMutation.mutate(planForm, {
        onSuccess: async (response) => {
          toast.success('Plan created successfully');
          setPlanDialog(false);

          // Force refetch immediately
          await refetchPlans();

          console.log('Plan created, refetched. Response:', response);

          // Optionally prompt to sync with Paystack
          if (response.data?.id) {
            setTimeout(() => {
              if (confirm('Would you like to sync this plan with Paystack now?')) {
                handleSyncPaystack(response.data.id);
              }
            }, 500);
          }
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to create plan');
        },
      });
    }
  };

  const handleArchivePlan = (id: string) => {
    if (confirm('Are you sure you want to archive this plan? Plans with active subscriptions cannot be archived.')) {
      archivePlanMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Plan archived successfully');
          refetchPlans();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to archive plan. It may have active subscriptions.');
        },
      });
    }
  };

  const handleSyncPaystack = (id: string) => {
    syncPaystackMutation.mutate(id, {
      onSuccess: (response) => {
        toast.success(response.message || 'Plan synced with Paystack successfully');
        refetchPlans();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to sync with Paystack');
      },
    });
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setPlanForm({
        ...planForm,
        features: [...planForm.features, featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setPlanForm({
      ...planForm,
      features: planForm.features.filter((_, i) => i !== index),
    });
  };

  const handlePriceChange = (value: string, isOriginalPrice: boolean = false) => {
    const numValue = parseFloat(value) || 0;
    const koboValue = nairaToKobo(numValue);

    if (isOriginalPrice) {
      setOriginalPriceInNaira(value);
      setPlanForm({ ...planForm, originalPrice: value ? koboValue : undefined });
    } else {
      setPriceInNaira(value);
      setPlanForm({ ...planForm, price: koboValue });
    }
  };

  const handleOpenCancelDialog = (subscriptionId: string) => {
    setCancellingSubscriptionId(subscriptionId);
    setCancelForm({
      reason: '',
      issueRefund: false,
      cancelAtPeriodEnd: false,
    });
    setCancelDialog(true);
  };

  const handleCancelSubscription = () => {
    if (!cancelForm.reason) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    cancelSubscriptionMutation.mutate(
      { id: cancellingSubscriptionId, data: cancelForm },
      {
        onSuccess: () => {
          toast.success('Subscription cancelled successfully');
          setCancelDialog(false);
          refetchVendorSubs();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to cancel subscription');
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'expired':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'trial':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
      case 'deprecated':
        return 'bg-red-50 text-red-700 hover:bg-red-50';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const handleViewPlanDetails = (plan: SubscriptionPlan) => {
    setViewingPlan(plan);
    setPlanDetailsDialog(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Subscription Management</h2>
      </div>

      {/* Statistics */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.activeSubscriptions} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.overview.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.overview.monthlyRecurringRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">MRR from active subscriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <X className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.cancelledSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.expiredSubscriptions} expired
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {statsLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">
            <Package className="mr-2 h-4 w-4" />
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="vendor-subscriptions">
            <Users className="mr-2 h-4 w-4" />
            Vendor Subscriptions
          </TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={planStatusFilter} onValueChange={setPlanStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenPlanDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {plansLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading subscription plans...</p>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No subscription plans found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || planStatusFilter !== 'all'
                      ? 'No plans match your current filters. Try adjusting your search or filters.'
                      : 'Create your first subscription plan to get started'}
                  </p>
                  {!searchTerm && planStatusFilter === 'all' && (
                    <Button onClick={() => handleOpenPlanDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Plan
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className="relative overflow-hidden hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{plan.displayName}</h3>
                              {plan.isRecommended && (
                                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              )}
                              {plan.isPopular && (
                                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{plan.planName}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewPlanDetails(plan)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenPlanDialog(plan)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSyncPaystack(plan.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sync Paystack
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleArchivePlan(plan.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {plan.badge && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none w-fit mt-2">
                            <Star className="w-3 h-3 mr-1" />
                            {plan.badge}
                          </Badge>
                        )}

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{plan.description}</p>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Pricing */}
                        <div className="pb-3 border-b">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {plan.hasDiscount && plan.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatCurrency(plan.originalPrice)}
                              </span>
                            )}
                            <div className="text-2xl font-bold" style={{ color: plan.colorTheme }}>
                              {plan.formattedPrice || formatCurrency(plan.price)}
                            </div>
                            {plan.hasDiscount && plan.discountPercentage && (
                              <Badge variant="destructive" className="text-xs">
                                -{plan.discountPercentage}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            per {plan.duration} • {plan.durationDays} days
                          </p>
                          {plan.isFree && (
                            <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">Free Plan</Badge>
                          )}
                        </div>

                        {/* Key Features - Compact */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Features</p>
                          <ul className="space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-start text-xs">
                                <Check className="mr-1.5 h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-xs text-muted-foreground pl-4.5">
                                +{plan.features.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Limitations Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 ">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{plan.limitations.maxProducts} products</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{plan.limitations.maxOrdersPerMonth}/mo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{(plan.limitations.maxStorageMB / 1000).toFixed(1)}GB storage</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{plan.limitations.maxImagesPerProduct} images</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex gap-1 flex-wrap">
                            <Badge className={getStatusColor(plan.status)} variant="outline">
                              {plan.status}
                            </Badge>
                            {plan.paystackPlanCode && (
                              <Badge variant="outline" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Synced
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            <span className="font-semibold">{plan.activeSubscriptions || 0}</span>
                            <span className="mx-0.5">/</span>
                            <span>{plan.totalSubscriptions || 0}</span>
                            <span className="ml-1">subs</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Subscriptions Tab */}
        <TabsContent value="vendor-subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {vendorSubsLoading ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {vendorSubscriptions
                    .filter((sub) =>
                      sub.vendorId.businessName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((subscription) => (
                      <div key={subscription.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{subscription.vendorId.businessName}</h3>
                              <Badge className={getStatusColor(subscription.status)}>
                                {subscription.status}
                              </Badge>
                              <Badge className={getPaymentStatusColor(subscription.paymentStatus)}>
                                {subscription.paymentStatus}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Plan</p>
                                <p className="font-medium">{subscription.planId.displayName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Start Date</p>
                                <p className="font-medium">
                                  {format(new Date(subscription.startDate), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">End Date</p>
                                <p className="font-medium">
                                  {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            {subscription.metadata?.scheduledCancellation && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Scheduled for cancellation
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {subscription.autoRenew && (
                              <Badge variant="outline" className="text-xs">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Auto-renew
                              </Badge>
                            )}
                            {subscription.status === 'active' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleOpenCancelDialog(subscription.id)}
                              >
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!vendorSubsLoading && vendorSubscriptions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vendor subscriptions</h3>
                <p className="text-sm text-muted-foreground">
                  Vendor subscriptions will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Plan Dialog - PART 1 (continues below) */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan
                ? 'Update the subscription plan details. Note: Some fields like planName, duration, and currency cannot be changed.'
                : 'Create a new subscription plan for vendors. All prices are in Naira and will be converted to kobo automatically.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                <Info className="w-4 h-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">
                    Plan Name (Identifier) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="planName"
                    value={planForm.planName}
                    onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                    placeholder="e.g., starter, professional"
                    disabled={!!editingPlan}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase, no spaces. Cannot be changed after creation.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    Display Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="displayName"
                    value={planForm.displayName}
                    onChange={(e) => setPlanForm({ ...planForm, displayName: e.target.value })}
                    placeholder="e.g., Professional Plan"
                  />
                  <p className="text-xs text-muted-foreground">User-facing plan name</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Perfect for growing businesses with advanced features..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={planForm.duration}
                    onValueChange={(value: PlanDuration) =>
                      setPlanForm({ ...planForm, duration: value })
                    }
                    disabled={!!editingPlan}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                      <SelectItem value="quarterly">Quarterly (90 days)</SelectItem>
                      <SelectItem value="yearly">Yearly (365 days)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Cannot be changed after creation</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (₦) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={priceInNaira}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="5000.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    In Naira (₦{priceInNaira} = {nairaToKobo(parseFloat(priceInNaira) || 0)} kobo)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (₦)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={originalPriceInNaira}
                    onChange={(e) => handlePriceChange(e.target.value, true)}
                    placeholder="7500.00"
                  />
                  <p className="text-xs text-muted-foreground">For showing discounts (optional)</p>
                </div>
              </div>

              {parseFloat(originalPriceInNaira) > parseFloat(priceInNaira) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Discount:{' '}
                    {Math.round(
                      ((parseFloat(originalPriceInNaira) - parseFloat(priceInNaira)) /
                        parseFloat(originalPriceInNaira)) *
                        100
                    )}
                    % off
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                <Sparkles className="w-4 h-4" />
                Features <span className="text-red-500">*</span>
              </h3>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Enter a feature (e.g., Unlimited products)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddFeature}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                {planForm.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded group hover:bg-muted/70"
                  >
                    <span className="text-sm flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-600" />
                      {feature}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {planForm.features.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No features added yet. Add at least one feature.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Limitations */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                <Settings className="w-4 h-4" />
                Plan Limitations <span className="text-red-500">*</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxProducts">
                    Max Products <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxProducts"
                    type="number"
                    min="1"
                    value={planForm.limitations.maxProducts}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        limitations: {
                          ...planForm.limitations,
                          maxProducts: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOrdersPerMonth">
                    Max Orders/Month <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxOrdersPerMonth"
                    type="number"
                    min="1"
                    value={planForm.limitations.maxOrdersPerMonth}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        limitations: {
                          ...planForm.limitations,
                          maxOrdersPerMonth: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStorageMB">
                    Max Storage (MB) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxStorageMB"
                    type="number"
                    min="1"
                    value={planForm.limitations.maxStorageMB}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        limitations: {
                          ...planForm.limitations,
                          maxStorageMB: parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {(planForm.limitations.maxStorageMB / 1000).toFixed(2)} GB
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxImagesPerProduct">
                    Max Images/Product <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="maxImagesPerProduct"
                    type="number"
                    min="1"
                    max="50"
                    value={planForm.limitations.maxImagesPerProduct}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        limitations: {
                          ...planForm.limitations,
                          maxImagesPerProduct: Math.min(
                            50,
                            Math.max(1, parseInt(e.target.value) || 1)
                          ),
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Min: 1, Max: 50</p>
                </div>
              </div>

              {/* Boolean Limitations */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <Label htmlFor="canUsePremiumThemes" className="cursor-pointer">
                    Premium Themes Access
                  </Label>
                  <Switch
                    id="canUsePremiumThemes"
                    checked={planForm.limitations.canUsePremiumThemes}
                    onCheckedChange={(checked) =>
                      setPlanForm({
                        ...planForm,
                        limitations: { ...planForm.limitations, canUsePremiumThemes: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <Label htmlFor="canCreateCoupons" className="cursor-pointer">
                    Create Discount Coupons
                  </Label>
                  <Switch
                    id="canCreateCoupons"
                    checked={planForm.limitations.canCreateCoupons}
                    onCheckedChange={(checked) =>
                      setPlanForm({
                        ...planForm,
                        limitations: { ...planForm.limitations, canCreateCoupons: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <Label htmlFor="canAccessAnalytics" className="cursor-pointer">
                    Advanced Analytics Access
                  </Label>
                  <Switch
                    id="canAccessAnalytics"
                    checked={planForm.limitations.canAccessAnalytics}
                    onCheckedChange={(checked) =>
                      setPlanForm({
                        ...planForm,
                        limitations: { ...planForm.limitations, canAccessAnalytics: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <Label htmlFor="prioritySupport" className="cursor-pointer">
                    Priority Customer Support
                  </Label>
                  <Switch
                    id="prioritySupport"
                    checked={planForm.limitations.prioritySupport}
                    onCheckedChange={(checked) =>
                      setPlanForm({
                        ...planForm,
                        limitations: { ...planForm.limitations, prioritySupport: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded col-span-2">
                  <Label htmlFor="canBeFeatured" className="cursor-pointer">
                    Featured Store Listings Eligibility
                  </Label>
                  <Switch
                    id="canBeFeatured"
                    checked={planForm.limitations.canBeFeatured}
                    onCheckedChange={(checked) =>
                      setPlanForm({
                        ...planForm,
                        limitations: { ...planForm.limitations, canBeFeatured: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                <Star className="w-4 h-4" />
                Display Settings
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={planForm.sortOrder}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, sortOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="badge">Badge Text</Label>
                  <Input
                    id="badge"
                    value={planForm.badge || ''}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value || undefined })}
                    placeholder="e.g., Most Popular"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorTheme">Color Theme</Label>
                  <div className="flex gap-2">
                    <Input
                      id="colorTheme"
                      type="color"
                      value={planForm.colorTheme}
                      onChange={(e) => setPlanForm({ ...planForm, colorTheme: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={planForm.colorTheme}
                      onChange={(e) => setPlanForm({ ...planForm, colorTheme: e.target.value })}
                      placeholder="#007bff"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iconUrl">Icon URL (Optional)</Label>
                <Input
                  id="iconUrl"
                  value={planForm.iconUrl || ''}
                  onChange={(e) => setPlanForm({ ...planForm, iconUrl: e.target.value || undefined })}
                  placeholder="https://example.com/icon.svg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <Label htmlFor="isRecommended" className="cursor-pointer flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Mark as Recommended
                  </Label>
                  <Switch
                    id="isRecommended"
                    checked={planForm.isRecommended}
                    onCheckedChange={(checked) =>
                      setPlanForm({ ...planForm, isRecommended: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <Label htmlFor="isFree" className="cursor-pointer">
                    Free Plan
                  </Label>
                  <Switch
                    id="isFree"
                    checked={planForm.isFree}
                    onCheckedChange={(checked) => setPlanForm({ ...planForm, isFree: checked })}
                    disabled={!!editingPlan}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePlan}
              disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
            >
              {createPlanMutation.isPending || updatePlanMutation.isPending
                ? 'Saving...'
                : editingPlan
                ? 'Update Plan'
                : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Details Dialog */}
      <Dialog open={planDetailsDialog} onOpenChange={setPlanDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan Details: {viewingPlan?.displayName}</DialogTitle>
            <DialogDescription>Complete subscription plan information</DialogDescription>
          </DialogHeader>

          {viewingPlan && (
            <div className="space-y-6 py-4">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Plan Name</Label>
                  <p className="font-mono text-sm">{viewingPlan.planName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Display Name</Label>
                  <p>{viewingPlan.displayName}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Description</Label>
                  <p>{viewingPlan.description}</p>
                </div>
              </div>

              <Separator />

              {/* Pricing Details */}
              <div>
                <h4 className="font-semibold mb-3">Pricing</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Price</Label>
                    <p className="text-lg font-bold">
                      {viewingPlan.formattedPrice || formatCurrency(viewingPlan.price)}
                    </p>
                  </div>
                  {viewingPlan.originalPrice && (
                    <div>
                      <Label className="text-muted-foreground">Original Price</Label>
                      <p className="text-lg">
                        <span className="line-through">{formatCurrency(viewingPlan.originalPrice)}</span>
                        {viewingPlan.discountPercentage && (
                          <Badge variant="destructive" className="ml-2">
                            -{viewingPlan.discountPercentage}%
                          </Badge>
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p>
                      {viewingPlan.duration} ({viewingPlan.durationDays} days)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2">
                  {viewingPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Limitations */}
              <div>
                <h4 className="font-semibold mb-3">Plan Limitations</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <Label className="text-muted-foreground text-xs">Max Products</Label>
                    <p className="text-lg font-semibold">{viewingPlan.limitations.maxProducts}</p>
                  </div>
                  <div className="p-3 border rounded">
                    <Label className="text-muted-foreground text-xs">Max Orders/Month</Label>
                    <p className="text-lg font-semibold">
                      {viewingPlan.limitations.maxOrdersPerMonth}
                    </p>
                  </div>
                  <div className="p-3 border rounded">
                    <Label className="text-muted-foreground text-xs">Storage</Label>
                    <p className="text-lg font-semibold">
                      {(viewingPlan.limitations.maxStorageMB / 1000).toFixed(1)} GB
                    </p>
                  </div>
                  <div className="p-3 border rounded">
                    <Label className="text-muted-foreground text-xs">Images/Product</Label>
                    <p className="text-lg font-semibold">
                      {viewingPlan.limitations.maxImagesPerProduct}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    {
                      label: 'Premium Themes',
                      value: viewingPlan.limitations.canUsePremiumThemes,
                    },
                    {
                      label: 'Create Coupons',
                      value: viewingPlan.limitations.canCreateCoupons,
                    },
                    {
                      label: 'Advanced Analytics',
                      value: viewingPlan.limitations.canAccessAnalytics,
                    },
                    { label: 'Priority Support', value: viewingPlan.limitations.prioritySupport },
                    { label: 'Featured Listings', value: viewingPlan.limitations.canBeFeatured },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.value ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className={item.value ? '' : 'text-muted-foreground'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status & Metadata */}
              <div>
                <h4 className="font-semibold mb-3">Status & Metadata</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge className={getStatusColor(viewingPlan.status)}>{viewingPlan.status}</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Active Subscriptions</Label>
                    <p className="font-semibold">{viewingPlan.activeSubscriptions}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Subscriptions</Label>
                    <p className="font-semibold">{viewingPlan.totalSubscriptions}</p>
                  </div>
                  {viewingPlan.paystackPlanCode && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Paystack Plan Code</Label>
                      <p className="font-mono text-sm">{viewingPlan.paystackPlanCode}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Sort Order</Label>
                    <p>{viewingPlan.sortOrder}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {viewingPlan.isRecommended && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                  {viewingPlan.isPopular && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {viewingPlan.isFree && (
                    <Badge className="bg-green-100 text-green-800">Free Plan</Badge>
                  )}
                  {viewingPlan.badge && <Badge variant="outline">{viewingPlan.badge}</Badge>}
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{format(new Date(viewingPlan.createdAt), 'PPpp')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p>{format(new Date(viewingPlan.updatedAt), 'PPpp')}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setPlanDetailsDialog(false);
              if (viewingPlan) handleOpenPlanDialog(viewingPlan);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Specify the cancellation details for this subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                value={cancelForm.reason}
                onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                placeholder="Enter reason for cancellation..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cancelAtPeriodEnd"
                checked={cancelForm.cancelAtPeriodEnd}
                onChange={(e) =>
                  setCancelForm({ ...cancelForm, cancelAtPeriodEnd: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="cancelAtPeriodEnd" className="cursor-pointer">
                Cancel at end of period (keep active until end date)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="issueRefund"
                checked={cancelForm.issueRefund}
                onChange={(e) => setCancelForm({ ...cancelForm, issueRefund: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="issueRefund" className="cursor-pointer">
                Issue refund
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
