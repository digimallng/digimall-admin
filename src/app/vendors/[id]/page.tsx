'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { VendorApprovalModal } from '@/components/modals/VendorApprovalModal';
import {
  useVendor,
  useApproveVendor,
  useRejectVendor,
  useSuspendVendor,
  useReactivateVendor,
} from '@/lib/hooks/use-vendors';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  Package,
  DollarSign,
  Users,
  Shield,
  Edit,
  Ban,
  Play,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const vendorId = params.id as string;

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  const {
    data: vendor,
    isLoading,
    error,
    refetch,
  } = useVendor(vendorId, {
    enabled: !!session?.accessToken && !!vendorId,
  });

  const approveVendor = useApproveVendor();
  const rejectVendor = useRejectVendor();
  const suspendVendor = useSuspendVendor();
  const reactivateVendor = useReactivateVendor();

  // Handlers
  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setApprovalModalOpen(true);
  };

  const handleApproval = async (data: { notes?: string; conditions?: string[] }) => {
    if (!vendor) return;
    try {
      await approveVendor.mutateAsync({
        id: vendor.id,
        data: { decision: 'approve', ...data },
      });
      toast.success('Vendor approved successfully');
      setApprovalModalOpen(false);
      setApprovalAction(null);
      refetch();
    } catch (error: any) {
      console.error('Vendor approval failed:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to approve vendor';
      toast.error(errorMessage);
    }
  };

  const handleRejection = async (data: {
    reason: string;
    feedback?: string;
    blockedFields?: string[];
  }) => {
    if (!vendor) return;
    try {
      await rejectVendor.mutateAsync({
        id: vendor.id,
        data: { decision: 'reject', ...data },
      });
      toast.success('Vendor rejected successfully');
      setApprovalModalOpen(false);
      setApprovalAction(null);
      refetch();
    } catch (error: any) {
      console.error('Vendor rejection failed:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to reject vendor';
      toast.error(errorMessage);
    }
  };

  const handleSuspend = async () => {
    if (!vendor) return;
    try {
      await suspendVendor.mutateAsync({
        id: vendor.id,
        data: { reason: 'Policy violation' },
      });
      toast.success('Vendor suspended successfully');
      refetch();
    } catch (error: any) {
      console.error('Vendor suspension failed:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to suspend vendor';
      toast.error(errorMessage);
    }
  };

  const handleReactivate = async () => {
    if (!vendor) return;
    try {
      await reactivateVendor.mutateAsync({ id: vendor.id });
      toast.success('Vendor reactivated successfully');
      refetch();
    } catch (error: any) {
      console.error('Vendor reactivation failed:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to reactivate vendor';
      toast.error(errorMessage);
    }
  };

  // Status helpers
  const getStatusIcon = (status: string | undefined | null) => {
    if (!status) return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'under_review':
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'suspended':
        return <Ban className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-50 text-gray-800 ring-gray-600/20';
    
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'bg-green-50 text-green-800 ring-green-600/20';
      case 'under_review':
      case 'pending':
        return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'rejected':
        return 'bg-red-50 text-red-800 ring-red-600/20';
      case 'suspended':
        return 'bg-orange-50 text-orange-800 ring-orange-600/20';
      default:
        return 'bg-gray-50 text-gray-800 ring-gray-600/20';
    }
  };

  const getVerificationStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-50 text-gray-800 ring-gray-600/20';
    
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

  // Action conditions
  const canApprove = vendor && (
    vendor.status === 'pending' || 
    vendor.status === 'under_review' || 
    vendor.status === 'pending_verification' ||
    vendor.verificationStatus === 'pending' ||
    vendor.verificationStatus === 'unverified'
  );
  const canSuspend = vendor && (
    vendor.status === 'verified' || 
    vendor.status === 'approved' || 
    vendor.status === 'active' ||
    vendor.verificationStatus === 'verified'
  );
  const canReactivate = vendor && (
    vendor.status === 'suspended' || 
    vendor.verificationStatus === 'suspended'
  );

  // Debug logging for action conditions
  console.log('Vendor status:', vendor?.status, 'Verification:', vendor?.verificationStatus);
  console.log('Action conditions:', { canApprove, canSuspend, canReactivate });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message="Failed to load vendor details" onRetry={() => refetch()} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <ErrorMessage message="Vendor not found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={vendor.businessName || 'Vendor Details'}
        description={`Vendor ID: ${vendor.id}`}
        icon={Building}
        actions={[
          {
            label: 'Back to Vendors',
            icon: ArrowLeft,
            variant: 'secondary',
            onClick: () => router.push('/vendors'),
          },
          {
            label: 'View Profile',
            icon: Eye,
            variant: 'secondary',
          },
        ]}
      />

      {/* Quick Actions & Status - Top Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Actions & Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Status Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Business Status</label>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(vendor.status)}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                      getStatusColor(vendor.status)
                    )}
                  >
                    {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1) || 'Unknown'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Verification</label>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(vendor.verificationStatus)}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                      getVerificationStatusColor(vendor.verificationStatus)
                    )}
                  >
                    {vendor.verificationStatus?.charAt(0).toUpperCase() + vendor.verificationStatus?.slice(1) || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics - 2 columns */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{vendor.totalOrders || 0}</div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₦{(Number(vendor.totalSales) || Number(vendor.totalRevenue) || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {vendor.rating || vendor.averageRating || '0.0'}
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 capitalize">
                    {vendor.tier || 'Basic'}
                  </div>
                  <p className="text-sm text-gray-500">Tier</p>
                </div>
              </div>
            </div>

            {/* Actions Column */}
            <div className="space-y-3">
              {canApprove && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                    onClick={() => handleApprovalAction('approve')}
                    disabled={approveVendor.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                    onClick={() => handleApprovalAction('reject')}
                    disabled={rejectVendor.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              {canSuspend && (
                <Button
                  className="w-full bg-orange-600 text-white hover:bg-orange-700"
                  onClick={handleSuspend}
                  disabled={suspendVendor.isPending}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
              )}

              {canReactivate && (
                <Button
                  className="bg-primary hover:bg-primary/90 w-full text-white"
                  onClick={handleReactivate}
                  disabled={reactivateVendor.isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Reactivate
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/vendors/${vendor.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Name</label>
                  <p className="font-medium text-gray-900">{vendor.businessName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Type</label>
                  <p className="text-gray-900">{vendor.businessType || vendor.businessCategory || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Number</label>
                  <p className="text-gray-900">{vendor.registrationNumber || vendor.cacNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tax ID</label>
                  <p className="text-gray-900">{vendor.taxId || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{vendor.website || vendor.businessWebsite || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Established Year</label>
                  <p className="text-gray-900">{vendor.establishedYear || 'Not provided'}</p>
                </div>
              </div>

              {vendor.businessDescription && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Description</label>
                  <p className="mt-1 text-gray-900">{vendor.businessDescription}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Business Address</label>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-900">
                      {typeof vendor.businessAddress === 'string' 
                        ? vendor.businessAddress 
                        : vendor.businessAddress?.street || 'Not provided'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {vendor.businessCity || (typeof vendor.businessAddress !== 'string' && vendor.businessAddress?.city)}, {' '}
                      {vendor.businessState || (typeof vendor.businessAddress !== 'string' && vendor.businessAddress?.state)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Primary Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{vendor.primaryPhone || vendor.businessPhone || vendor.user?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Alternative Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{vendor.alternativePhone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{vendor.businessEmail || vendor.user?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Support Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{vendor.supportEmail || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-500">Owner Information</label>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {vendor.user?.firstName && vendor.user?.lastName 
                        ? `${vendor.user.firstName} ${vendor.user.lastName}`
                        : 'Not provided'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{vendor.user?.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ₦{(Number(vendor.totalSales) || Number(vendor.totalRevenue) || 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{vendor.totalOrders || 0}</div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-600">
                    <Star className="h-5 w-5" />
                    {vendor.rating || vendor.averageRating || '0.0'}
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{vendor.reviewCount || vendor.totalReviews || 0}</div>
                  <p className="text-sm text-gray-500">Reviews</p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {vendor.commissionRate ? `${vendor.commissionRate}%` : vendor.commission ? `${vendor.commission}%` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tier Level</label>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <p className="font-semibold text-gray-900 capitalize">{vendor.tier || 'Basic'} Tier</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Verification Level</label>
                  <p className="text-lg font-semibold text-gray-900">{vendor.verificationLevel || 0}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">
                  {vendor.createdAt ? format(new Date(vendor.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                </span>
              </div>
              
              {vendor.approvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-500">Approved:</span>
                  <span className="text-gray-900">
                    {format(new Date(vendor.approvedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}

              {vendor.rejectedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-gray-500">Rejected:</span>
                  <span className="text-gray-900">
                    {format(new Date(vendor.rejectedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}

              {vendor.suspendedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Ban className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-500">Suspended:</span>
                  <span className="text-gray-900">
                    {format(new Date(vendor.suspendedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Documents Submitted</span>
                <span className={cn(
                  'text-sm font-medium',
                  vendor.documentsSubmitted ? 'text-green-600' : 'text-red-600'
                )}>
                  {vendor.documentsSubmitted ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Documents Verified</span>
                <span className={cn(
                  'text-sm font-medium',
                  vendor.documentsVerified ? 'text-green-600' : 'text-red-600'
                )}>
                  {vendor.documentsVerified ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Doc Verification Status</span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  vendor.documentVerificationStatus === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : vendor.documentVerificationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                )}>
                  {vendor.documentVerificationStatus || 'Pending'}
                </span>
              </div>

              {vendor.rejectionReason && (
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                  <p className="text-sm text-red-600 mt-1">{vendor.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">User ID</span>
                <span className="text-sm font-mono text-gray-900">{vendor.userId || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Vendor ID</span>
                <span className="text-sm font-mono text-gray-900">{vendor.id}</span>
              </div>

              {vendor.approvedBy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Approved By</span>
                  <span className="text-sm text-gray-900">{vendor.approvedBy}</span>
                </div>
              )}

              {vendor.rejectedBy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Rejected By</span>
                  <span className="text-sm text-gray-900">{vendor.rejectedBy}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vendor Approval Modal */}
      <VendorApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setApprovalAction(null);
        }}
        onApprove={handleApproval}
        onReject={handleRejection}
        vendor={vendor}
        action={approvalAction}
        isLoading={approveVendor.isPending || rejectVendor.isPending}
      />
    </div>
  );
}