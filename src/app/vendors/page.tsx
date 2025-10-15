'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  useVendors,
  useVendorStatistics,
  useApproveRejectVendor,
  useUpdateVendorTier,
  useSuspendUnsuspendVendor,
  useBulkTierUpdate,
} from '@/lib/api/hooks/use-vendors';
import type { GetAllVendorsParams } from '@/lib/api/types';
import {
  Search,
  Download,
  Store,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Star,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  MoreVertical,
  Award,
  Activity,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function VendorsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Modals state
  const [showBulkTierModal, setShowBulkTierModal] = useState(false);
  const [bulkTier, setBulkTier] = useState('silver');
  const [bulkCommission, setBulkCommission] = useState('15');
  const [bulkReason, setBulkReason] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, tierFilter]);

  // Build query params
  const queryParams: GetAllVendorsParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter as any : undefined,
    tier: tierFilter !== 'all' ? tierFilter as any : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }), [currentPage, pageSize, debouncedSearch, statusFilter, tierFilter]);

  // Queries
  const { data: vendorsData, isLoading, error, refetch } = useVendors(queryParams);
  const { data: stats } = useVendorStatistics();

  // Mutations
  const approveReject = useApproveRejectVendor();
  const updateTier = useUpdateVendorTier();
  const suspendUnsuspend = useSuspendUnsuspendVendor();
  const bulkTierUpdate = useBulkTierUpdate();

  const vendors = vendorsData?.data || [];
  const meta = vendorsData?.meta;

  // Handlers
  const handleApprove = async (vendor: any) => {
    try {
      await approveReject.mutateAsync({
        id: vendor.id,
        data: { approved: true },
      });
      toast.success(`Vendor ${vendor.businessInfo.businessName} approved successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async (vendor: any, reason: string) => {
    try {
      await approveReject.mutateAsync({
        id: vendor.id,
        data: { approved: false, rejectionReason: reason },
      });
      toast.success(`Vendor ${vendor.businessInfo.businessName} rejected`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject vendor');
    }
  };

  const handleSuspend = async (vendorId: string, reason: string) => {
    try {
      await suspendUnsuspend.mutateAsync({
        id: vendorId,
        data: { action: 'suspend', reason },
      });
      toast.success('Vendor suspended successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend vendor');
    }
  };

  const handleUnsuspend = async (vendorId: string) => {
    try {
      await suspendUnsuspend.mutateAsync({
        id: vendorId,
        data: { action: 'unsuspend', reason: 'Unsuspended by admin' },
      });
      toast.success('Vendor unsuspended successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unsuspend vendor');
    }
  };

  const handleBulkTierUpdate = async () => {
    if (selectedVendors.length === 0) {
      toast.error('Please select vendors first');
      return;
    }

    try {
      await bulkTierUpdate.mutateAsync({
        vendorIds: selectedVendors,
        tier: bulkTier as any,
        commission: parseFloat(bulkCommission),
        reason: bulkReason || 'Bulk tier update',
      });
      toast.success(`Updated tier for ${selectedVendors.length} vendors`);
      setSelectedVendors([]);
      setShowBulkTierModal(false);
      setBulkReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tiers');
    }
  };

  const handleExport = async () => {
    try {
      const csvData = vendors.map(v => ({
        'Business Name': v.businessInfo.businessName,
        'Email': v.email || 'N/A',
        'Phone': v.phone || 'N/A',
        'Status': v.status,
        'Tier': v.tier,
        'Rating': v.metrics.averageRating,
        'Products': v.metrics.totalProducts,
        'Orders': v.metrics.totalOrders,
        'Revenue': v.metrics.totalRevenue,
        'Created': format(new Date(v.createdAt), 'yyyy-MM-dd'),
      }));

      const headers = Object.keys(csvData[0]);
      const csv = [
        headers.join(','),
        ...csvData.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendors-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();

      toast.success('Vendors exported to CSV');
    } catch (error) {
      toast.error('Failed to export vendors');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTierFilter('all');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || tierFilter !== 'all';

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle, label: 'Active' },
      pending: { className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', icon: AlertTriangle, label: 'Pending' },
      pending_approval: { className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', icon: AlertTriangle, label: 'Pending Approval' },
      suspended: { className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20', icon: XCircle, label: 'Suspended' },
      inactive: { className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20', icon: XCircle, label: 'Inactive' },
    };

    const config = variants[status as keyof typeof variants] || variants.inactive;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={cn('gap-1.5 font-medium', config.className)}>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      basic: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      silver: 'bg-slate-400/10 text-slate-600 dark:text-slate-300 border-slate-400/20',
      gold: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      platinum: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    };
    return (
      <Badge variant="outline" className={cn('font-medium capitalize', colors[tier as keyof typeof colors] || colors.basic)}>
        {tier}
      </Badge>
    );
  };

  if (isLoading && !vendors.length) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className="text-center">
          <LoadingSpinner size='lg' />
          <p className="mt-4 text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <ErrorMessage
          title='Failed to load vendors'
          message='There was an error loading the vendors list.'
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Vendor Management</h1>
          <p className='text-muted-foreground mt-1.5'>
            Manage vendor accounts, approvals, tiers, and performance metrics
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={handleExport} variant='outline' size="sm">
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button onClick={() => refetch()} variant='outline' size="sm" disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Vendors
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Store className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.totalVendors || 0}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              All registered vendors
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active Vendors
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Activity className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.activeVendors || 0}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              <span className="font-medium">{stats?.totalVendors ? Math.round((stats.activeVendors / stats.totalVendors) * 100) : 0}%</span> of total vendors
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Pending Approval
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.pendingApproval || 0}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Approved Vendors
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.approvedVendors || 0}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Successfully approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Vendor Status Breakdown */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Vendor Status Overview</CardTitle>
            <CardDescription>Distribution of vendors by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats?.activeVendors || 0}</span>
                <span className="text-xs text-muted-foreground">
                  ({stats?.totalVendors ? Math.round((stats.activeVendors / stats.totalVendors) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span className="text-sm text-muted-foreground">Pending Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats?.pendingApproval || 0}</span>
                <span className="text-xs text-muted-foreground">
                  ({stats?.totalVendors ? Math.round((stats.pendingApproval / stats.totalVendors) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats?.approvedVendors || 0}</span>
                <span className="text-xs text-muted-foreground">
                  ({stats?.totalVendors ? Math.round((stats.approvedVendors / stats.totalVendors) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">Suspended</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats?.suspendedVendors || 0}</span>
                <span className="text-xs text-muted-foreground">
                  ({stats?.totalVendors ? Math.round((stats.suspendedVendors / stats.totalVendors) * 100) : 0}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Distribution */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Tier Distribution</CardTitle>
            <CardDescription>Vendors by subscription tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.tierDistribution ? (
              <>
                {Object.entries(stats.tierDistribution).map(([tier, count]) => {
                  const percentage = stats.totalVendors ? Math.round((count / stats.totalVendors) * 100) : 0;
                  const tierColors: Record<string, string> = {
                    basic: 'bg-slate-500',
                    silver: 'bg-slate-400',
                    gold: 'bg-yellow-500',
                    platinum: 'bg-purple-500',
                    unassigned: 'bg-gray-400',
                  };
                  const tierColor = tierColors[tier.toLowerCase()] || 'bg-gray-400';

                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", tierColor)}></div>
                        <span className="text-sm text-muted-foreground capitalize">{tier}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No tier data available
              </div>
            )}

            {stats?.tierDistribution && Object.keys(stats.tierDistribution).length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No tier data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader className="border-b bg-muted/5">
          <div className='flex flex-col gap-4'>
            <div className="flex items-center justify-between">
              <CardTitle>Vendors List</CardTitle>
              {selectedVendors.length > 0 && (
                <Button onClick={() => setShowBulkTierModal(true)} size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  Bulk Update ({selectedVendors.length})
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='relative flex-1 max-w-md'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search by business name, email, or phone...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 pr-9'
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='All Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='suspended'>Suspended</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='All Tiers' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Tiers</SelectItem>
                    <SelectItem value='basic'>Basic</SelectItem>
                    <SelectItem value='silver'>Silver</SelectItem>
                    <SelectItem value='gold'>Gold</SelectItem>
                    <SelectItem value='platinum'>Platinum</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="ghost" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          {isLoading ? (
            <div className='p-12 text-center'>
              <LoadingSpinner />
              <p className='mt-2 text-muted-foreground'>Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className='p-12 text-center text-muted-foreground'>
              <Store className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <p className='font-medium text-lg'>No vendors found</p>
              <p className='text-sm mt-1'>
                {hasActiveFilters ? 'Try adjusting your filters' : 'No vendors have been registered yet'}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" size="sm" className="mt-4">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className='hidden lg:block overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className='w-12'>
                        <Checkbox
                          checked={selectedVendors.length === vendors.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedVendors(vendors.map(v => v.id));
                            } else {
                              setSelectedVendors([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow
                        key={vendor.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/vendors/${vendor.id}`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedVendors.includes(vendor.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedVendors([...selectedVendors, vendor.id]);
                              } else {
                                setSelectedVendors(selectedVendors.filter(id => id !== vendor.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold'>
                                {vendor.businessInfo.businessName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{vendor.businessInfo.businessName}</div>
                              <div className='flex items-center gap-2 mt-1'>
                                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                  <Star className='w-3.5 h-3.5 text-amber-500 fill-amber-500' />
                                  <span className="font-medium">{vendor.metrics.averageRating.toFixed(1) || '0.0'}</span>
                                  <span className="text-xs">({vendor.metrics.reviewCount || 0})</span>
                                </div>
                                {vendor.kyc.status === 'verified' && (
                                  <Badge variant='outline' className='text-xs gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'>
                                    <Award className='h-3 w-3' />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm space-y-1'>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[180px]">{vendor.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{vendor.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                        <TableCell>{getTierBadge(vendor.tier)}</TableCell>
                        <TableCell>
                          <div className='space-y-1.5 text-sm'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <Package className='w-4 h-4' />
                              <span className="font-medium">{vendor.metrics.totalProducts || 0}</span>
                              <span className="text-xs">products</span>
                            </div>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <ShoppingCart className='w-4 h-4' />
                              <span className="font-medium">{vendor.metrics.totalOrders || 0}</span>
                              <span className="text-xs">orders</span>
                            </div>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <DollarSign className='w-4 h-4' />
                              <span className="font-medium">₦{(vendor.metrics.totalRevenue || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(vendor.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon' className="h-8 w-8">
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/vendors/${vendor.id}`)}>
                                <Eye className='h-4 w-4 mr-2' />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {vendor.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(vendor)} className="text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle className='h-4 w-4 mr-2' />
                                    Approve Vendor
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const reason = prompt('Reason for rejection:');
                                      if (reason) handleReject(vendor, reason);
                                    }}
                                    className='text-red-600 dark:text-red-400'
                                  >
                                    <XCircle className='h-4 w-4 mr-2' />
                                    Reject Vendor
                                  </DropdownMenuItem>
                                </>
                              )}
                              {vendor.status === 'active' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const reason = prompt('Reason for suspension:');
                                    if (reason) handleSuspend(vendor.id, reason);
                                  }}
                                  className='text-orange-600 dark:text-orange-400'
                                >
                                  <AlertTriangle className='h-4 w-4 mr-2' />
                                  Suspend Vendor
                                </DropdownMenuItem>
                              )}
                              {vendor.status === 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUnsuspend(vendor.id)} className="text-blue-600 dark:text-blue-400">
                                  <RefreshCw className='h-4 w-4 mr-2' />
                                  Unsuspend Vendor
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className='lg:hidden p-4 space-y-4'>
                {vendors.map((vendor) => (
                  <Card
                    key={vendor.id}
                    className='p-4 hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/20'
                    onClick={() => router.push(`/vendors/${vendor.id}`)}
                  >
                    <div className='flex items-start gap-3'>
                      <Checkbox
                        checked={selectedVendors.includes(vendor.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedVendors([...selectedVendors, vendor.id]);
                          } else {
                            setSelectedVendors(selectedVendors.filter(id => id !== vendor.id));
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg'>
                          {vendor.businessInfo.businessName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='font-medium truncate pr-2'>{vendor.businessInfo.businessName}</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant='ghost' size='icon' className="h-8 w-8">
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/vendors/${vendor.id}`)}>
                                <Eye className='h-4 w-4 mr-2' />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {vendor.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApprove(vendor)}>
                                    <CheckCircle className='h-4 w-4 mr-2' />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const reason = prompt('Reason for rejection:');
                                      if (reason) handleReject(vendor, reason);
                                    }}
                                    className='text-red-600'
                                  >
                                    <XCircle className='h-4 w-4 mr-2' />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {vendor.status === 'active' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const reason = prompt('Reason for suspension:');
                                    if (reason) handleSuspend(vendor.id, reason);
                                  }}
                                  className='text-orange-600'
                                >
                                  <AlertTriangle className='h-4 w-4 mr-2' />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {vendor.status === 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUnsuspend(vendor.id)}>
                                  <RefreshCw className='h-4 w-4 mr-2' />
                                  Unsuspend
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className='space-y-2.5 text-sm'>
                          <div className='flex items-center gap-2'>
                            <Star className='w-4 h-4 text-amber-500 fill-amber-500' />
                            <span className="font-medium">{vendor.metrics.averageRating.toFixed(1) || '0.0'}</span>
                            <span className="text-xs text-muted-foreground">({vendor.metrics.reviewCount || 0} reviews)</span>
                            {vendor.kyc.status === 'verified' && (
                              <Badge variant='outline' className='text-xs gap-1 ml-auto'>
                                <Award className='h-3 w-3' />
                                Verified
                              </Badge>
                            )}
                          </div>

                          <div className='space-y-1 text-muted-foreground text-xs'>
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{vendor.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{vendor.phone || 'N/A'}</span>
                            </div>
                          </div>

                          <div className='flex flex-wrap gap-2 mt-2'>
                            {getStatusBadge(vendor.status)}
                            {getTierBadge(vendor.tier)}
                          </div>

                          <div className='pt-2.5 border-t space-y-1.5'>
                            <div className='flex items-center justify-between text-xs'>
                              <span className='text-muted-foreground flex items-center gap-1.5'>
                                <Package className='w-3.5 h-3.5' />
                                Products
                              </span>
                              <span className="font-medium">{vendor.metrics.totalProducts || 0}</span>
                            </div>
                            <div className='flex items-center justify-between text-xs'>
                              <span className='text-muted-foreground flex items-center gap-1.5'>
                                <ShoppingCart className='w-3.5 h-3.5' />
                                Orders
                              </span>
                              <span className="font-medium">{vendor.metrics.totalOrders || 0}</span>
                            </div>
                            <div className='flex items-center justify-between text-xs'>
                              <span className='text-muted-foreground flex items-center gap-1.5'>
                                <DollarSign className='w-3.5 h-3.5' />
                                Revenue
                              </span>
                              <span className="font-medium">₦{(vendor.metrics.totalRevenue || 0).toLocaleString()}</span>
                            </div>
                            <div className='text-xs text-muted-foreground pt-1 flex items-center gap-1.5'>
                              <Calendar className="h-3.5 w-3.5" />
                              Joined {format(new Date(vendor.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-muted/5'>
                  <div className='text-sm text-muted-foreground'>
                    Showing <span className="font-medium">{((meta.page - 1) * meta.limit) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                    <span className="font-medium">{meta.total}</span> vendors
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage(1)}
                      disabled={meta.page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={meta.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className='text-sm font-medium px-2'>
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                      disabled={meta.page === meta.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setCurrentPage(meta.totalPages)}
                      disabled={meta.page === meta.totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Tier Update Modal */}
      <Dialog open={showBulkTierModal} onOpenChange={setShowBulkTierModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Tier Update</DialogTitle>
            <DialogDescription>
              Update tier and commission for {selectedVendors.length} selected vendors
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>New Tier</label>
              <Select value={bulkTier} onValueChange={setBulkTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='basic'>Basic</SelectItem>
                  <SelectItem value='silver'>Silver</SelectItem>
                  <SelectItem value='gold'>Gold</SelectItem>
                  <SelectItem value='platinum'>Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Commission Rate (%)</label>
              <Input
                type='number'
                min='0'
                max='100'
                step='0.1'
                value={bulkCommission}
                onChange={(e) => setBulkCommission(e.target.value)}
                placeholder='Enter commission rate'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Reason</label>
              <Textarea
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                rows={3}
                placeholder='Enter reason for tier update...'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowBulkTierModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkTierUpdate} disabled={bulkTierUpdate.isPending}>
              {bulkTierUpdate.isPending ? 'Updating...' : 'Update Tiers'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
