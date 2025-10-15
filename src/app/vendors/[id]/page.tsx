'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  useVendorById,
  useApproveRejectVendor,
  useSuspendUnsuspendVendor,
  useVendorPerformance,
} from '@/lib/api/hooks/use-vendors';
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
  Award,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Store,
  Target,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const vendorId = params.id as string;

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const {
    data: vendor,
    isLoading,
    error,
    refetch,
  } = useVendorById(vendorId, !!vendorId);

  const { data: performance } = useVendorPerformance(vendorId, !!vendorId);
  const approveRejectVendor = useApproveRejectVendor();
  const suspendUnsuspendVendor = useSuspendUnsuspendVendor();

  // Handlers
  const handleApprove = async () => {
    if (!vendor) return;
    try {
      await approveRejectVendor.mutateAsync({
        id: vendor.id,
        data: {
          approved: true
        },
      });
      toast.success('Vendor approved successfully');
      setApproveModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async () => {
    if (!vendor || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await approveRejectVendor.mutateAsync({
        id: vendor.id,
        data: {
          approved: false,
          rejectionReason: rejectReason
        },
      });
      toast.success('Vendor rejected');
      setRejectModalOpen(false);
      setRejectReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject vendor');
    }
  };

  const handleSuspend = async () => {
    if (!vendor || !suspendReason.trim()) {
      toast.error('Please provide a suspension reason');
      return;
    }
    try {
      await suspendUnsuspendVendor.mutateAsync({
        id: vendor.id,
        data: { action: 'suspend', reason: suspendReason },
      });
      toast.success('Vendor suspended successfully');
      setSuspendModalOpen(false);
      setSuspendReason('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend vendor');
    }
  };

  const handleUnsuspend = async () => {
    if (!vendor) return;
    try {
      await suspendUnsuspendVendor.mutateAsync({
        id: vendor.id,
        data: { action: 'unsuspend', reason: 'Unsuspended by admin' },
      });
      toast.success('Vendor unsuspended successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unsuspend vendor');
    }
  };

  // Status helpers
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      active: { className: 'bg-green-500', icon: CheckCircle },
      pending: { className: 'bg-yellow-500', icon: AlertTriangle },
      suspended: { className: 'bg-red-500', icon: XCircle },
      inactive: { className: 'bg-gray-500', icon: XCircle },
      verified: { className: 'bg-green-500', icon: CheckCircle },
      under_review: { className: 'bg-yellow-500', icon: Clock },
      rejected: { className: 'bg-red-500', icon: XCircle },
    };

    const config = variants[status?.toLowerCase()] || variants.inactive;
    const Icon = config.icon;

    return (
      <Badge className={cn('gap-1', config.className)}>
        <Icon className='h-3 w-3' />
        {status}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-500',
      silver: 'bg-slate-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500',
    };
    return <Badge className={colors[tier?.toLowerCase()] || 'bg-gray-500'}>{tier}</Badge>;
  };

  // Action conditions
  const canApprove = vendor?.status === 'pending';
  const canSuspend = vendor?.status === 'active';
  const canUnsuspend = vendor?.status === 'suspended';

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Failed to load vendor details'
          message='There was an error loading the vendor information.'
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Vendor not found'
          message='The requested vendor could not be found.'
        />
      </div>
    );
  }

  const businessInfo = vendor.businessInfo || vendor;
  const metrics = vendor.metrics || vendor;
  const kyc = vendor.kyc || {};

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.push('/vendors')}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {businessInfo.businessName || 'Vendor Details'}
            </h1>
            <p className='text-muted-foreground mt-1'>
              View and manage vendor information
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Profile Header */}
      <Card className='overflow-hidden'>
        <div className='h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5' />
        <CardContent className='pt-0'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8 -mt-16 relative z-10'>
            <Avatar className='h-32 w-32 border-4 border-background'>
              <AvatarFallback className='bg-primary text-primary-foreground text-4xl'>
                {businessInfo.businessName?.charAt(0) || 'V'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 pb-4'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                  <h2 className='text-2xl font-bold'>{businessInfo.businessName}</h2>
                  <div className='flex flex-wrap items-center gap-2 mt-2'>
                    {getStatusBadge(vendor.status)}
                    {getTierBadge(vendor.tier || 'basic')}
                    {kyc.status === 'verified' && (
                      <Badge variant='outline' className='gap-1'>
                        <Award className='h-3 w-3' />
                        KYC Verified
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center gap-4 mt-3 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Star className='h-4 w-4 text-yellow-400 fill-yellow-400' />
                      <span className='font-medium'>
                        {metrics.averageRating || 0}
                      </span>
                      <span>({metrics.totalReviews || 0} reviews)</span>
                    </div>
                    <Separator orientation='vertical' className='h-4' />
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      <span>Joined {format(new Date(vendor.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {canApprove && (
                    <>
                      <Button onClick={() => setApproveModalOpen(true)} size='sm'>
                        <CheckCircle className='h-4 w-4 mr-2' />
                        Approve
                      </Button>
                      <Button
                        onClick={() => setRejectModalOpen(true)}
                        variant='destructive'
                        size='sm'
                      >
                        <XCircle className='h-4 w-4 mr-2' />
                        Reject
                      </Button>
                    </>
                  )}
                  {canSuspend && (
                    <Button
                      onClick={() => setSuspendModalOpen(true)}
                      variant='destructive'
                      size='sm'
                    >
                      <Ban className='h-4 w-4 mr-2' />
                      Suspend
                    </Button>
                  )}
                  {canUnsuspend && (
                    <Button onClick={handleUnsuspend} size='sm'>
                      <Play className='h-4 w-4 mr-2' />
                      Unsuspend
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Revenue
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ₦{(metrics.totalRevenue || 0).toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              All-time sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Orders
            </CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalOrders || 0}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Products Listed
            </CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.totalProducts || 0}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Active products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Avg. Rating
            </CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{metrics.averageRating || 0}</div>
            <Progress value={(metrics.averageRating || 0) * 20} className='mt-2 h-1' />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue='business' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='business'>Business Info</TabsTrigger>
          <TabsTrigger value='contact'>Contact</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
        </TabsList>

        <TabsContent value='business' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building className='h-5 w-5' />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Business Name
                  </label>
                  <p className='text-sm'>{businessInfo.businessName || 'N/A'}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Business Type
                  </label>
                  <p className='text-sm'>{businessInfo.businessType || 'N/A'}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Registration Number
                  </label>
                  <p className='text-sm'>{businessInfo.registrationNumber || 'N/A'}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Tax ID
                  </label>
                  <p className='text-sm'>{businessInfo.taxId || 'N/A'}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Website
                  </label>
                  <div className='flex items-center gap-2'>
                    <Globe className='h-4 w-4 text-muted-foreground' />
                    <p className='text-sm'>{businessInfo.website || 'N/A'}</p>
                  </div>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Tier
                  </label>
                  <div className='flex items-center gap-2'>
                    {getTierBadge(vendor.tier || 'basic')}
                  </div>
                </div>
              </div>

              {businessInfo.description && (
                <>
                  <Separator />
                  <div className='space-y-1'>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Description
                    </label>
                    <p className='text-sm'>{businessInfo.description}</p>
                  </div>
                </>
              )}

              <Separator />
              <div className='space-y-1'>
                <label className='text-sm font-medium text-muted-foreground'>
                  Business Address
                </label>
                <div className='flex items-start gap-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <div className='text-sm'>
                    <p>{businessInfo.address?.street || 'N/A'}</p>
                    <p className='text-muted-foreground'>
                      {businessInfo.address?.city}, {businessInfo.address?.state}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='contact' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Phone className='h-5 w-5' />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Primary Phone
                  </label>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <p className='text-sm'>{vendor.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Email
                  </label>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <p className='text-sm'>{vendor.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='documents' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                KYC Documents
              </CardTitle>
              <CardDescription>
                Document verification status and information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <FileText className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <p className='font-medium'>KYC Verification</p>
                    <p className='text-sm text-muted-foreground'>
                      Status: {kyc.status || 'Not submitted'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(kyc.status || 'pending')}
              </div>

              {kyc.documents && kyc.documents.length > 0 && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Submitted Documents</label>
                  <div className='space-y-2'>
                    {kyc.documents.map((doc: any, index: number) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 border rounded-lg'
                      >
                        <div className='flex items-center gap-2'>
                          <FileText className='h-4 w-4 text-muted-foreground' />
                          <span className='text-sm'>{doc.type || `Document ${index + 1}`}</span>
                        </div>
                        <Button variant='ghost' size='sm'>
                          <Eye className='h-4 w-4 mr-2' />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Sales Performance
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Total Revenue</span>
                    <span className='font-medium'>
                      ₦{(metrics.totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Total Orders</span>
                    <span className='font-medium'>{metrics.totalOrders || 0}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Avg. Order Value</span>
                    <span className='font-medium'>
                      ₦
                      {metrics.totalOrders
                        ? Math.round((metrics.totalRevenue || 0) / metrics.totalOrders).toLocaleString()
                        : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5' />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Average Rating</span>
                    <span className='font-medium'>{metrics.averageRating || 0}/5</span>
                  </div>
                  <Progress value={(metrics.averageRating || 0) * 20} className='h-2' />
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Total Reviews</span>
                    <span className='font-medium'>{metrics.totalReviews || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {businessInfo.businessName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={approveRejectVendor.isPending}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {businessInfo.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder='Enter rejection reason...'
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleReject}
              disabled={approveRejectVendor.isPending || !rejectReason.trim()}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Vendor</DialogTitle>
            <DialogDescription>
              Provide a reason for suspending {businessInfo.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder='Enter suspension reason...'
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleSuspend}
              disabled={suspendUnsuspendVendor.isPending || !suspendReason.trim()}
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
