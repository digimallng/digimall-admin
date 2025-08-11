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
  Eye,
  Edit,
  Ban,
  Play,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import { useCreateConversation } from '@/hooks/use-chat';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const createConversationMutation = useCreateConversation();
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

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <ErrorMessage message='Failed to load vendor details' onRetry={() => refetch()} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className='p-6'>
        <ErrorMessage message='Vendor not found' />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'under_review':
      case 'pending':
        return <Clock className='h-5 w-5 text-yellow-500' />;
      case 'rejected':
        return <XCircle className='h-5 w-5 text-red-500' />;
      case 'suspended':
        return <Ban className='h-5 w-5 text-red-500' />;
      default:
        return <AlertTriangle className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'under_review':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if vendor is already verified in either status field
  const isVerified = vendor.status === 'verified' || vendor.verificationStatus === 'verified';

  // Can only approve if NOT already verified and in an approvable state
  const canApprove =
    !isVerified &&
    (['unverified', 'under_review', 'pending_verification', 'documents_required'].includes(
      vendor.status
    ) ||
      ['pending', 'unverified'].includes(vendor.verificationStatus));

  const canSuspend = isVerified;
  const canReactivate = vendor.status === 'suspended' || vendor.verificationStatus === 'suspended';

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className='flex items-center gap-4 mb-6'>
        <Button variant='outline' onClick={() => router.back()} className='flex items-center gap-2'>
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>

        <PageHeader title={vendor.businessName} subtitle={`Vendor ID: ${vendor.id}`} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Info */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building className='h-5 w-5' />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Business Name</label>
                  <p className='text-gray-900 font-medium'>{vendor.businessName}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Business Type</label>
                  <p className='text-gray-900'>{vendor.businessType}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Email</label>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-gray-400' />
                    <p className='text-gray-900'>{vendor.email}</p>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Phone</label>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-gray-400' />
                    <p className='text-gray-900'>{vendor.businessPhone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Website</label>
                  <div className='flex items-center gap-2'>
                    <Globe className='h-4 w-4 text-gray-400' />
                    <p className='text-gray-900'>{vendor.businessWebsite || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Registration Number</label>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-gray-400' />
                    <p className='text-gray-900'>{vendor.registrationNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {vendor.businessDescription && (
                <div>
                  <label className='text-sm font-medium text-gray-500'>Description</label>
                  <p className='text-gray-900 mt-1'>{vendor.businessDescription}</p>
                </div>
              )}

              <div>
                <label className='text-sm font-medium text-gray-500'>Address</label>
                <div className='flex items-start gap-2 mt-1'>
                  <MapPin className='h-4 w-4 text-gray-400 mt-0.5' />
                  <div>
                    <p className='text-gray-900'>{vendor.businessAddress}</p>
                    <p className='text-gray-600 text-sm'>
                      {vendor.businessCity}, {vendor.businessState}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Star className='h-5 w-5' />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1 text-2xl font-bold text-gray-900'>
                    <DollarSign className='h-5 w-5' />
                    {vendor.totalSales ? `${vendor.totalSales}` : '0'}
                  </div>
                  <p className='text-sm text-gray-500'>Total Sales</p>
                </div>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1 text-2xl font-bold text-gray-900'>
                    <Package className='h-5 w-5' />
                    {vendor.totalOrders || 0}
                  </div>
                  <p className='text-sm text-gray-500'>Total Orders</p>
                </div>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1 text-2xl font-bold text-gray-900'>
                    <Star className='h-5 w-5 text-yellow-500' />
                    {vendor.averageRating || '0.0'}
                  </div>
                  <p className='text-sm text-gray-500'>Rating</p>
                </div>
                <div className='text-center'>
                  <div className='flex items-center justify-center gap-1 text-2xl font-bold text-gray-900'>
                    <Users className='h-5 w-5' />
                    {vendor.totalReviews || 0}
                  </div>
                  <p className='text-sm text-gray-500'>Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Status & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-500'>Current Status</label>
                <div className='flex items-center gap-2 mt-1'>
                  {getStatusIcon(vendor.status)}
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(vendor.status)
                    )}
                  >
                    {vendor.status}
                  </span>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-500'>Verification Status</label>
                <div className='flex items-center gap-2 mt-1'>
                  {getStatusIcon(vendor.verificationStatus)}
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(vendor.verificationStatus)
                    )}
                  >
                    {vendor.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='pt-4 space-y-2'>
                {/* Chat Button */}
                <Button
                  variant='outline'
                  className='w-full flex items-center justify-center gap-2'
                  onClick={async () => {
                    try {
                      // Create a new conversation with this vendor
                      const conversation = await createConversationMutation.mutateAsync({
                        type: 'support',
                        participants: [vendor.userId],
                        title: `Chat with ${vendor.businessName}`,
                      });

                      // Navigate to messages page with the conversation ID
                      router.push(`/messages?conversationId=${conversation.id}`);
                      toast.success('Chat created successfully');
                    } catch (error) {
                      console.error('Failed to create conversation:', error);
                      toast.error('Failed to create chat');
                    }
                  }}
                  disabled={createConversationMutation.isPending}
                >
                  <MessageCircle className='h-4 w-4' />
                  {createConversationMutation.isPending ? 'Creating...' : 'Start Chat with Vendor'}
                </Button>

                {canApprove && (
                  <div className='flex gap-2'>
                    <Button
                      className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                      onClick={() => handleApprovalAction('approve')}
                      disabled={approveVendor.isPending}
                    >
                      <CheckCircle className='h-4 w-4 mr-2' />
                      Approve
                    </Button>
                    <Button
                      className='flex-1 bg-red-600 hover:bg-red-700 text-white'
                      onClick={() => handleApprovalAction('reject')}
                      disabled={rejectVendor.isPending}
                    >
                      <XCircle className='h-4 w-4 mr-2' />
                      Reject
                    </Button>
                  </div>
                )}

                {canSuspend && (
                  <Button
                    className='w-full bg-orange-600 hover:bg-orange-700 text-white'
                    onClick={handleSuspend}
                    disabled={suspendVendor.isPending}
                  >
                    <Ban className='h-4 w-4 mr-2' />
                    Suspend
                  </Button>
                )}

                {canReactivate && (
                  <Button
                    className='w-full bg-primary hover:bg-primary/90 text-white'
                    onClick={handleReactivate}
                    disabled={reactivateVendor.isPending}
                  >
                    <Play className='h-4 w-4 mr-2' />
                    Reactivate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4 text-gray-400' />
                <span className='text-gray-500'>Created:</span>
                <span className='text-gray-900'>
                  {format(new Date(vendor.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              {vendor.submissionDate && (
                <div className='flex items-center gap-2 text-sm'>
                  <FileText className='h-4 w-4 text-gray-400' />
                  <span className='text-gray-500'>Submitted:</span>
                  <span className='text-gray-900'>
                    {format(new Date(vendor.submissionDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {vendor.verifiedAt && (
                <div className='flex items-center gap-2 text-sm'>
                  <CheckCircle className='h-4 w-4 text-green-400' />
                  <span className='text-gray-500'>Verified:</span>
                  <span className='text-gray-900'>
                    {format(new Date(vendor.verifiedAt), 'MMM dd, yyyy')}
                  </span>
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
