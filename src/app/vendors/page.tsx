'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorApprovalModal } from '@/components/modals/VendorApprovalModal';
import {
  useVendors,
  useVendorStats,
  useApproveVendor,
  useRejectVendor,
  useSuspendVendor,
  useReactivateVendor,
  useBulkUpdateVendors,
  useExportVendors,
} from '@/lib/hooks/use-vendors';
import { Vendor, VendorFilters } from '@/lib/api/types';
import {
  Search,
  Filter,
  MoreVertical,
  Store,
  Download,
  Star,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { ExportService } from '@/services/export.service';
import { toast } from 'react-hot-toast';

export default function VendorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerificationStatus, setFilterVerificationStatus] = useState<string>('all');
  const [filterBusinessType, setFilterBusinessType] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [vendorToApprove, setVendorToApprove] = useState<Vendor | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build filters
  const filters: VendorFilters = useMemo(
    () => ({
      search: debouncedSearchTerm || undefined,
      status: filterStatus !== 'all' ? (filterStatus as VendorFilters['status']) : undefined,
      verificationStatus:
        filterVerificationStatus !== 'all'
          ? (filterVerificationStatus as VendorFilters['verificationStatus'])
          : undefined,
      businessType: filterBusinessType !== 'all' ? filterBusinessType : undefined,
      tier: filterTier !== 'all' ? (filterTier as VendorFilters['tier']) : undefined,
      page: currentPage,
      limit: pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }),
    [debouncedSearchTerm, filterStatus, filterVerificationStatus, filterBusinessType, filterTier, currentPage, pageSize]
  );

  // Fetch data
  const {
    data: vendorsResponse,
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useVendors(filters, {
    enabled: !!session?.accessToken,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useVendorStats({
    enabled: !!session?.accessToken,
  });

  // Mutations
  const approveVendor = useApproveVendor();
  const rejectVendor = useRejectVendor();
  const suspendVendor = useSuspendVendor();
  const reactivateVendor = useReactivateVendor();
  const bulkUpdate = useBulkUpdateVendors();
  const exportVendors = useExportVendors();

  // Handle loading state
  if (vendorsLoading && !vendorsResponse) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // Handle error state
  if (vendorsError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Failed to load vendors'
          message={vendorsError.message}
          onRetry={() => refetchVendors()}
        />
      </div>
    );
  }

  const vendors = vendorsResponse?.vendors || [];
  const pagination = {
    page: vendorsResponse?.page || 1,
    totalPages: vendorsResponse?.pages || 1,
    total: vendorsResponse?.total || 0,
    limit: pageSize,
  };

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newSize: string) => {
    const newPageSize = parseInt(newSize);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Vendor action handlers
  const handleVendorAction = (action: string, vendor: Vendor) => {
    if (action === 'approve' || action === 'reject') {
      setVendorToApprove(vendor);
      setApprovalAction(action);
      setApprovalModalOpen(true);
    }
  };

  const handleApproval = async (data: { notes?: string; conditions?: string[] }) => {
    if (!vendorToApprove) return;

    try {
      await approveVendor.mutateAsync({
        id: vendorToApprove.id,
        data: { decision: 'approve', ...data },
      });
      setApprovalModalOpen(false);
      setVendorToApprove(null);
      setApprovalAction(null);
    } catch (error) {
      console.error('Vendor approval failed:', error);
    }
  };

  const handleRejection = async (data: {
    reason: string;
    feedback?: string;
    blockedFields?: string[];
  }) => {
    if (!vendorToApprove) return;

    try {
      await rejectVendor.mutateAsync({
        id: vendorToApprove.id,
        data: { decision: 'reject', ...data },
      });
      setApprovalModalOpen(false);
      setVendorToApprove(null);
      setApprovalAction(null);
    } catch (error) {
      console.error('Vendor rejection failed:', error);
    }
  };

  const handleSuspendVendor = async (vendor: Vendor, reason: string) => {
    try {
      await suspendVendor.mutateAsync({
        id: vendor.id,
        data: { reason },
      });
    } catch (error) {
      console.error('Vendor suspension failed:', error);
    }
  };

  const handleReactivateVendor = async (vendor: Vendor) => {
    try {
      await reactivateVendor.mutateAsync({ id: vendor.id });
    } catch (error) {
      console.error('Vendor reactivation failed:', error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
    if (selectedVendors.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({
        vendorIds: selectedVendors,
        action,
        reason: action === 'suspend' ? 'Bulk suspension by admin' : undefined,
      });
      setSelectedVendors([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      if (!vendorsResponse?.vendors || vendorsResponse.vendors.length === 0) {
        toast.error('No vendor data to export');
        return;
      }

      const vendors = vendorsResponse.vendors;
      
      if (format === 'csv') {
        ExportService.exportVendorsToCSV(vendors, {
          filename: `vendors-${searchTerm ? 'filtered-' : ''}export`,
          includeTimestamp: true
        });
      } else {
        ExportService.exportVendorsToExcel(vendors, {
          filename: `vendors-${searchTerm ? 'filtered-' : ''}export`,
          sheetName: 'Vendors',
          includeTimestamp: true
        });
      }

      toast.success(`Exported ${vendors.length} vendors to ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'active':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'pending':
      case 'under_review':
        return <AlertTriangle className='w-4 h-4 text-yellow-500' />;
      case 'rejected':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'suspended':
        return <XCircle className='w-4 h-4 text-orange-500' />;
      case 'inactive':
        return <XCircle className='w-4 h-4 text-gray-500' />;
      default:
        return <AlertTriangle className='w-4 h-4 text-gray-400' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'active':
        return 'bg-green-50 text-green-800 ring-green-600/20';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'rejected':
        return 'bg-red-50 text-red-800 ring-red-600/20';
      case 'suspended':
        return 'bg-orange-50 text-orange-800 ring-orange-600/20';
      case 'inactive':
        return 'bg-gray-50 text-gray-800 ring-gray-600/20';
      default:
        return 'bg-gray-50 text-gray-800 ring-gray-600/20';
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-50 text-green-800 ring-green-600/20';
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'rejected':
        return 'bg-red-50 text-red-800 ring-red-600/20';
      case 'suspended':
        return 'bg-orange-50 text-orange-800 ring-orange-600/20';
      case 'unverified':
        return 'bg-gray-50 text-gray-800 ring-gray-600/20';
      default:
        return 'bg-gray-50 text-gray-800 ring-gray-600/20';
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

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Vendors Management'
        description='Manage vendor accounts and monitor performance'
        icon={Store}
        actions={[
          {
            label: 'Export CSV',
            icon: Download,
            variant: 'secondary',
            onClick: () => handleExport('csv'),
          },
          {
            label: 'Export Excel',
            icon: Download,
            variant: 'secondary',
            onClick: () => handleExport('excel'),
          },
          {
            label: 'Add Vendor',
            icon: Plus,
            variant: 'primary',
          },
          {
            label: 'Refresh',
            icon: RefreshCw,
            variant: 'secondary',
            onClick: () => refetchVendors(),
          },
        ]}
      />

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <StatsCard
          title='Total Vendors'
          value={stats?.totalVendors || 0}
          change={stats?.vendorGrowth || 0}
          icon={Store}
          isLoading={statsLoading}
        />
        <StatsCard
          title='Approved'
          value={stats?.approvedVendors || 0}
          change={stats?.approvedGrowth || 0}
          icon={CheckCircle}
          isLoading={statsLoading}
        />
        <StatsCard
          title='Pending Approval'
          value={stats?.pendingVendors || 0}
          change={stats?.pendingGrowth || 0}
          icon={AlertTriangle}
          isLoading={statsLoading}
        />
        <StatsCard
          title='Suspended'
          value={stats?.suspendedVendors || 0}
          change={stats?.suspendedGrowth || 0}
          icon={XCircle}
          isLoading={statsLoading}
        />
      </div>

      {/* Loading indicator when refetching */}
      {vendorsLoading && vendors.length > 0 && (
        <div className='fixed top-4 right-4 z-50'>
          <div className='bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'>
            <LoadingSpinner size='sm' />
            <span className='text-sm'>Refreshing...</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-1 items-center gap-4'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  placeholder='Search vendors...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 pr-10'
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 hover:text-gray-600'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='under_review'>Under Review</SelectItem>
                  <SelectItem value='approved'>Approved</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                  <SelectItem value='suspended'>Suspended</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterVerificationStatus} onValueChange={setFilterVerificationStatus}>
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='All Verification' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Verification</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                  <SelectItem value='suspended'>Suspended</SelectItem>
                  <SelectItem value='unverified'>Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBusinessType} onValueChange={setFilterBusinessType}>
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='Business Type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='sole_proprietorship'>Sole Proprietorship</SelectItem>
                  <SelectItem value='limited_liability'>Limited Liability</SelectItem>
                  <SelectItem value='partnership'>Partnership</SelectItem>
                  <SelectItem value='corporation'>Corporation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='All Tiers' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Tiers</SelectItem>
                  <SelectItem value='basic'>Basic</SelectItem>
                  <SelectItem value='premium'>Premium</SelectItem>
                  <SelectItem value='enterprise'>Enterprise</SelectItem>
                  <SelectItem value='vip'>VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2 mr-4'>
                <span className='text-sm text-gray-600'>Show:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className='w-[80px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                    <SelectItem value='100'>100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedVendors.length > 0 && (
                <div className='flex items-center gap-2 mr-4'>
                  <span className='text-sm text-gray-600'>{selectedVendors.length} selected</span>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleBulkAction('approve')}
                    disabled={bulkUpdate.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleBulkAction('suspend')}
                    disabled={bulkUpdate.isPending}
                  >
                    Suspend
                  </Button>
                </div>
              )}
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleExport('csv')}
                disabled={exportVendors.isPending || vendors.length === 0}
              >
                <Download className='w-4 h-4 mr-2' />
                {exportVendors.isPending ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {vendorsLoading && vendors.length === 0 ? (
            <div className='p-8 text-center'>
              <LoadingSpinner />
              <p className='mt-2 text-gray-600'>Loading vendors...</p>
            </div>
          ) : vendorsError ? (
            <div className='p-8 text-center'>
              <XCircle className='w-12 h-12 mx-auto mb-4 text-red-500 opacity-50' />
              <p className='text-red-600 mb-4'>Failed to load vendors</p>
              <Button variant='outline' onClick={() => refetchVendors()} disabled={vendorsLoading}>
                <RefreshCw className='w-4 h-4 mr-2' />
                Try Again
              </Button>
            </div>
          ) : vendors.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>
              <Store className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <p>No vendors found{debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}</p>
              {debouncedSearchTerm && (
                <Button variant='outline' className='mt-4' onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left'>
                      <input
                        type='checkbox'
                        checked={selectedVendors.length === vendors.length}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedVendors(vendors.map(v => v.id));
                          } else {
                            setSelectedVendors([]);
                          }
                        }}
                        className='rounded'
                      />
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Business
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Owner
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Verification
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Commission
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Total Sales
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Rating
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Products
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Joined
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {vendors.map(vendor => (
                    <tr
                      key={vendor.id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        selectedVendors.includes(vendor.id) && 'bg-orange-50'
                      )}
                    >
                      <td className='px-6 py-4'>
                        <input
                          type='checkbox'
                          checked={selectedVendors.includes(vendor.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedVendors([...selectedVendors, vendor.id]);
                            } else {
                              setSelectedVendors(selectedVendors.filter(id => id !== vendor.id));
                            }
                          }}
                          className='rounded'
                        />
                      </td>
                      <td className='px-6 py-4'>
                        <div
                          className='flex items-center cursor-pointer'
                          onClick={() => router.push(`/vendors/${vendor.id}`)}
                        >
                          <div className='h-10 w-10 flex-shrink-0'>
                            <div className='h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center'>
                              <span className='text-white text-sm font-medium'>
                                {vendor.businessName?.charAt(0) || vendor.name?.charAt(0) || 'V'}
                              </span>
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {vendor.businessName || vendor.name || 'No business name'}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.businessType || vendor.category || 'General'}
                            </div>
                            {vendor.website && (
                              <div className='text-xs text-blue-600 hover:underline truncate max-w-[200px]'>
                                {vendor.website}
                              </div>
                            )}
                            {vendor.address?.city && (
                              <div className='text-xs text-gray-400 flex items-center mt-1'>
                                <MapPin className='w-3 h-3 mr-1' />
                                {vendor.address.city}, {vendor.address.state || vendor.address.country}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {vendor.user?.firstName && vendor.user?.lastName
                            ? `${vendor.user.firstName} ${vendor.user.lastName}`
                            : vendor.ownerName || vendor.contactPerson || 'No name provided'}
                        </div>
                        <div className='text-sm text-gray-500 flex items-center'>
                          <Mail className='w-3 h-3 mr-1' />
                          {vendor.user?.email || vendor.email || 'No email'}
                        </div>
                        {(vendor.user?.phone || vendor.phone) && (
                          <div className='text-xs text-gray-400 flex items-center mt-1'>
                            <Phone className='w-3 h-3 mr-1' />
                            {vendor.user?.phone || vendor.phone}
                          </div>
                        )}
                        {vendor.tier && (
                          <div className='text-xs text-primary font-medium mt-1 inline-flex items-center'>
                            <Star className='w-3 h-3 mr-1' />
                            {vendor.tier.charAt(0).toUpperCase() + vendor.tier.slice(1)} Tier
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(vendor.status)}
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                              getStatusColor(vendor.status)
                            )}
                          >
                            {vendor.status === 'under_review'
                              ? 'Under Review'
                              : vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                            getVerificationStatusColor(vendor.verificationStatus)
                          )}
                        >
                          {vendor.verificationStatus === 'suspended'
                            ? 'Suspended (KYC)'
                            : vendor.verificationStatus.charAt(0).toUpperCase() + vendor.verificationStatus.slice(1)}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>{vendor.businessType}</td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {vendor.commissionRate ? `${vendor.commissionRate}%` : 'N/A'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {vendor.totalRevenue || vendor.totalSales ? 
                          `₦${(vendor.totalRevenue || vendor.totalSales || 0).toLocaleString()}` : 
                          '₦0'}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        <div className='flex items-center'>
                          {vendor.rating || vendor.averageRating ? (
                            <>
                              <span className='text-yellow-400 mr-1'>★</span>
                              {(vendor.rating || vendor.averageRating || 0).toFixed(1)}
                            </>
                          ) : (
                            'No ratings'
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {vendor.totalProducts || vendor.productCount || 0}
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>
                        {format(new Date(vendor.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={e => {
                              e.stopPropagation();
                              router.push(`/vendors/${vendor.id}`);
                            }}
                          >
                            <Eye className='w-4 h-4' />
                          </Button>

                          {/* Show Approve/Reject for pending business status */}
                          {(vendor.status === 'pending' || vendor.status === 'under_review') && (
                            <>
                              <Button
                                size='sm'
                                className='text-green-600 border-green-600 hover:bg-green-50'
                                variant='outline'
                                onClick={e => {
                                  e.stopPropagation();
                                  handleVendorAction('approve', vendor);
                                }}
                                disabled={approveVendor.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                size='sm'
                                className='text-red-600 border-red-600 hover:bg-red-50'
                                variant='outline'
                                onClick={e => {
                                  e.stopPropagation();
                                  handleVendorAction('reject', vendor);
                                }}
                                disabled={rejectVendor.isPending}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {/* Show Suspend for verified/approved vendors */}
                          {(vendor.status === 'verified' || vendor.status === 'approved') &&
                            vendor.verificationStatus !== 'suspended' && (
                              <Button
                                size='sm'
                                className='text-orange-600 border-orange-600 hover:bg-orange-50'
                                variant='outline'
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSuspendVendor(vendor, 'Policy violation');
                                }}
                                disabled={suspendVendor.isPending}
                              >
                                Suspend
                              </Button>
                            )}

                          {/* Show Reactivate for suspended vendors */}
                          {(vendor.status === 'suspended' ||
                            vendor.verificationStatus === 'suspended') && (
                            <Button
                              size='sm'
                              className='text-primary border-primary hover:bg-orange-50'
                              variant='outline'
                              onClick={e => {
                                e.stopPropagation();
                                handleReactivateVendor(vendor);
                              }}
                              disabled={reactivateVendor.isPending}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200'>
              <div className='flex items-center gap-4 text-sm text-gray-700'>
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} vendors
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(1)}
                  disabled={pagination.page <= 1}
                >
                  First
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <div className='flex items-center gap-1'>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          'w-8 h-8 p-0',
                          pagination.page === pageNum && 'bg-primary text-white'
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Approval Modal */}
      <VendorApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setVendorToApprove(null);
          setApprovalAction(null);
        }}
        onApprove={handleApproval}
        onReject={handleRejection}
        vendor={vendorToApprove}
        action={approvalAction}
        isLoading={approveVendor.isPending || rejectVendor.isPending}
      />
    </div>
  );
}
