'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  RefreshCw,
  User,
  CreditCard,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { VendorDocumentViewer, VendorDocument } from '@/components/vendor/VendorDocumentViewer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import {
  useVendor,
  useVendorDocuments,
  useApproveVendor,
  useRejectVendor,
  useSuspendVendor,
  useReactivateVendor,
  useVerifyDocument,
} from '@/lib/hooks/use-vendors';

interface VendorApprovalPageProps {
  vendorId: string;
}

export default function VendorApprovalPage({ vendorId }: VendorApprovalPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch vendor data
  const {
    data: vendor,
    isLoading: vendorLoading,
    error: vendorError,
    refetch: refetchVendor,
  } = useVendor(vendorId);
  const {
    data: documents,
    isLoading: docsLoading,
    refetch: refetchDocs,
  } = useVendorDocuments(vendorId);

  // Mutations
  const approveVendorMutation = useApproveVendor();
  const rejectVendorMutation = useRejectVendor();
  const suspendVendorMutation = useSuspendVendor();
  const reactivateVendorMutation = useReactivateVendor();
  const verifyDocumentMutation = useVerifyDocument();

  // Calculate verification progress
  const requiredDocuments = [
    'business_registration',
    'tax_certificate',
    'bank_statement',
    'id_card',
  ];
  const uploadedDocs = documents?.filter(d => requiredDocuments.includes(d.type)) || [];
  const verifiedDocs = uploadedDocs.filter(d => d.status === 'verified');
  const verificationProgress = (verifiedDocs.length / requiredDocuments.length) * 100;

  const handleApproveVendor = async () => {
    try {
      await approveVendorMutation.mutateAsync({
        id: vendorId,
        data: {
          notes: approvalNotes,
          decision: 'approve',
        },
      });
      toast.success('Vendor approved successfully');
      setShowApprovalModal(false);
      refetchVendor();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve vendor');
    }
  };

  const handleRejectVendor = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectVendorMutation.mutateAsync({
        id: vendorId,
        data: {
          reason: rejectionReason,
          decision: 'reject',
        },
      });
      toast.success('Vendor rejected');
      setShowApprovalModal(false);
      refetchVendor();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject vendor');
    }
  };

  const handleVerifyDocument = async (documentId: string, approved: boolean, reason?: string) => {
    try {
      await verifyDocumentMutation.mutateAsync({
        vendorId,
        documentId,
        approved,
        reason,
      });
      toast.success(`Document ${approved ? 'verified' : 'rejected'} successfully`);
      refetchDocs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify document');
    }
  };

  const handleDownloadDocument = (documentId: string) => {
    const doc = documents?.find(d => d.id === documentId);
    if (doc) {
      window.open(doc.url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (vendorLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Failed to load vendor'
          message={vendorError?.message || 'Vendor not found'}
          onRetry={() => refetchVendor()}
        />
      </div>
    );
  }

  const canApprove = ['pending', 'under_review', 'documents_required'].includes(vendor.status);
  const isApproved = ['verified', 'approved'].includes(vendor.status);
  const isRejected = vendor.status === 'rejected';
  const isSuspended = vendor.status === 'suspended';

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.push('/vendors')}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Vendors
          </Button>
          <h1 className='text-2xl font-bold'>Vendor Approval</h1>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              refetchVendor();
              refetchDocs();
            }}
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Refresh
          </Button>

          {canApprove && (
            <>
              <Button
                variant='outline'
                className='text-green-600 border-green-600 hover:bg-green-50'
                onClick={() => handleApproveVendor()}
                disabled={approveVendorMutation.isPending}
              >
                <CheckCircle className='w-4 h-4 mr-2' />
                Approve Vendor
              </Button>
              <Button
                variant='outline'
                className='text-red-600 border-red-600 hover:bg-red-50'
                onClick={() => setShowApprovalModal(true)}
                disabled={rejectVendorMutation.isPending}
              >
                <XCircle className='w-4 h-4 mr-2' />
                Reject Vendor
              </Button>
            </>
          )}

          {isApproved && !isSuspended && (
            <Button
              variant='outline'
              className='text-orange-600 border-orange-600 hover:bg-orange-50'
              onClick={() =>
                suspendVendorMutation.mutate({ id: vendorId, data: { reason: 'Policy violation' } })
              }
              disabled={suspendVendorMutation.isPending}
            >
              <AlertTriangle className='w-4 h-4 mr-2' />
              Suspend Vendor
            </Button>
          )}

          {isSuspended && (
            <Button
              variant='outline'
              className='text-blue-600 border-blue-600 hover:bg-blue-50'
              onClick={() => reactivateVendorMutation.mutate({ id: vendorId })}
              disabled={reactivateVendorMutation.isPending}
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Reactivate Vendor
            </Button>
          )}
        </div>
      </div>

      {/* Vendor Overview Card */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center'>
                <Building className='w-8 h-8 text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>{vendor.businessName}</h2>
                <p className='text-gray-600'>{vendor.businessType}</p>
                <div className='flex items-center gap-2 mt-2'>
                  <Badge className={cn(getStatusColor(vendor.status))}>{vendor.status}</Badge>
                  <Badge variant='outline'>KYC: {vendor.verificationStatus}</Badge>
                </div>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-600'>Vendor ID</p>
              <p className='font-mono text-sm'>{vendor.id}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Document Verification</span>
              <span className='text-sm text-gray-600'>
                {verifiedDocs.length}/{requiredDocuments.length} verified
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-green-600 h-2 rounded-full transition-all'
                style={{ width: `${verificationProgress}%` }}
              />
            </div>
            {verificationProgress < 100 && (
              <p className='text-sm text-orange-600'>
                <AlertTriangle className='w-4 h-4 inline mr-1' />
                {requiredDocuments.length - verifiedDocs.length} document(s) pending verification
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
          <TabsTrigger value='communication'>Communication</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-600'>Business Name</p>
                  <p className='font-medium'>{vendor.businessName}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Business Type</p>
                  <p className='font-medium'>{vendor.businessType}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Registration Number</p>
                  <p className='font-medium'>{vendor.registrationNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Tax ID</p>
                  <p className='font-medium'>{vendor.taxId || 'Not provided'}</p>
                </div>
                {vendor.website && (
                  <div>
                    <p className='text-sm text-gray-600'>Website</p>
                    <a
                      href={vendor.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      {vendor.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <User className='w-4 h-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-600'>Owner</p>
                    <p className='font-medium'>{vendor.ownerName || 'Not provided'}</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Mail className='w-4 h-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-600'>Email</p>
                    <p className='font-medium'>{vendor.email}</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Phone className='w-4 h-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-600'>Phone</p>
                    <p className='font-medium'>{vendor.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <MapPin className='w-4 h-4 text-gray-400' />
                  <div>
                    <p className='text-sm text-gray-600'>Address</p>
                    <p className='font-medium'>
                      {vendor.businessAddress && vendor.businessCity && vendor.businessState
                        ? `${vendor.businessAddress}, ${vendor.businessCity}, ${vendor.businessState}`
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle>Banking Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-600'>Bank Name</p>
                  <p className='font-medium'>{vendor.bankName || 'Not provided'}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Account Number</p>
                  <p className='font-medium'>
                    {vendor.bankAccountNumber
                      ? `****${vendor.bankAccountNumber.slice(-4)}`
                      : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Account Name</p>
                  <p className='font-medium'>{vendor.bankAccountName || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-600'>Registration Date</p>
                  <p className='font-medium'>
                    {format(new Date(vendor.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {vendor.verifiedAt && (
                  <div>
                    <p className='text-sm text-gray-600'>Verified Date</p>
                    <p className='font-medium'>
                      {format(new Date(vendor.verifiedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-sm text-gray-600'>Last Updated</p>
                  <p className='font-medium'>
                    {format(new Date(vendor.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Products Listed</p>
                  <p className='font-medium'>{vendor.productCount || 0}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Total Sales</p>
                  <p className='font-medium'>₦{vendor.totalSales?.toLocaleString() || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='documents'>
          <VendorDocumentViewer
            documents={documents || []}
            vendorId={vendorId}
            vendorName={vendor.businessName}
            onVerifyDocument={handleVerifyDocument}
            onDownloadDocument={handleDownloadDocument}
            isLoading={docsLoading}
            canVerify={session?.user?.role === 'admin' || session?.user?.role === 'super_admin'}
          />
        </TabsContent>

        <TabsContent value='history'>
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600'>Verification history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='communication'>
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Button variant='outline' className='w-full'>
                  <MessageSquare className='w-4 h-4 mr-2' />
                  Send Message to Vendor
                </Button>
                <p className='text-sm text-gray-600 text-center'>
                  Communication history will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Modal */}
      {showApprovalModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Reject Vendor Application</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Rejection Reason <span className='text-red-500'>*</span>
                </label>
                <select
                  className='w-full p-2 border rounded-lg'
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                >
                  <option value=''>Select a reason</option>
                  <option value='Incomplete documentation'>Incomplete documentation</option>
                  <option value='Invalid business registration'>
                    Invalid business registration
                  </option>
                  <option value='Failed verification checks'>Failed verification checks</option>
                  <option value='Fraudulent information'>Fraudulent information</option>
                  <option value='Policy violation'>Policy violation</option>
                  <option value='Other'>Other</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Additional Notes (Optional)
                </label>
                <textarea
                  className='w-full p-2 border rounded-lg resize-none'
                  rows={4}
                  placeholder='Provide additional feedback for the vendor...'
                  value={approvalNotes}
                  onChange={e => setApprovalNotes(e.target.value)}
                />
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setShowApprovalModal(false);
                    setRejectionReason('');
                    setApprovalNotes('');
                  }}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectVendor}
                  disabled={!rejectionReason || rejectVendorMutation.isPending}
                  className='flex-1 bg-red-600 hover:bg-red-700 text-white'
                >
                  Reject Vendor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
