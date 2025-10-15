'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  useUserById,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useDeleteUser
} from '@/lib/api/hooks/use-users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Activity,
  ShoppingBag,
  DollarSign,
  Package,
  Bell,
  Ban,
  Play,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useUserById(userId);
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const suspendUser = useSuspendUser();
  const deleteUser = useDeleteUser();

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const handleActivate = async () => {
    try {
      await activateUser.mutateAsync(userId);
      toast.success('User activated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate user');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateUser.mutateAsync({ id: userId });
      toast.success('User deactivated successfully');
      setDeactivateModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate user');
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    try {
      await suspendUser.mutateAsync({
        id: userId,
        reason: suspendReason,
      });
      toast.success('User suspended successfully');
      setSuspendModalOpen(false);
      setSuspendReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend user');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(userId);
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
      router.push('/users');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='User not found'
          message='The requested user could not be found or you do not have permission to view it.'
          onRetry={() => router.push('/users')}
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      active: { className: 'bg-green-500', icon: CheckCircle },
      inactive: { className: 'bg-gray-500', icon: XCircle },
      suspended: { className: 'bg-red-500', icon: Ban },
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

  const canActivate = user?.status !== 'active';
  const canDeactivate = user?.status === 'active';
  const canSuspend = user?.status !== 'suspended';

  const profileInfo = user.profile || {};
  const userStats = user.statistics || {};

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.push('/users')}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {profileInfo.firstName && profileInfo.lastName
                ? `${profileInfo.firstName} ${profileInfo.lastName}`
                : 'User Details'}
            </h1>
            <p className='text-muted-foreground mt-1'>
              View and manage user information
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Header */}
      <Card className='overflow-hidden'>
        <div className='h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5' />
        <CardContent className='pt-0'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8 -mt-16 relative z-10'>
            <Avatar className='h-32 w-32 border-4 border-background'>
              <AvatarFallback className='bg-primary text-primary-foreground text-4xl'>
                {profileInfo.firstName?.charAt(0) || profileInfo.lastName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 pb-4'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                  <h2 className='text-2xl font-bold'>
                    {profileInfo.firstName} {profileInfo.lastName}
                  </h2>
                  <div className='flex flex-wrap items-center gap-2 mt-2'>
                    {getStatusBadge(user.status)}
                    <Badge variant='outline' className='gap-1'>
                      <Shield className='h-3 w-3' />
                      {user.role}
                    </Badge>
                    {user.emailVerified && (
                      <Badge variant='outline' className='gap-1 bg-green-50 text-green-700 border-green-200'>
                        <CheckCircle className='h-3 w-3' />
                        Email Verified
                      </Badge>
                    )}
                    {user.twoFactorEnabled && (
                      <Badge variant='outline' className='gap-1 bg-blue-50 text-blue-700 border-blue-200'>
                        <Shield className='h-3 w-3' />
                        2FA Enabled
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center gap-4 mt-3 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      <span>Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {canActivate && (
                    <Button onClick={handleActivate} disabled={activateUser.isPending} size='sm'>
                      <Play className='h-4 w-4 mr-2' />
                      Activate
                    </Button>
                  )}
                  {canDeactivate && (
                    <Button
                      onClick={() => setDeactivateModalOpen(true)}
                      variant='outline'
                      size='sm'
                    >
                      <XCircle className='h-4 w-4 mr-2' />
                      Deactivate
                    </Button>
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
                  {session?.user?.role === 'super_admin' && (
                    <Button
                      onClick={() => setDeleteModalOpen(true)}
                      variant='destructive'
                      size='sm'
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {userStats && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Orders
              </CardTitle>
              <ShoppingBag className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{userStats.totalOrders || 0}</div>
              <p className='text-xs text-muted-foreground mt-1'>
                {userStats.completedOrders || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Spent
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ₦{(userStats.totalSpent || 0).toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Lifetime value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Avg. Order Value
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ₦{(userStats.averageOrderValue || 0).toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Addresses
              </CardTitle>
              <MapPin className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{user.addresses?.length || 0}</div>
              <p className='text-xs text-muted-foreground mt-1'>
                Saved addresses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Information Tabs */}
      <Tabs defaultValue='profile' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='addresses'>Addresses</TabsTrigger>
          <TabsTrigger value='preferences'>Preferences</TabsTrigger>
          <TabsTrigger value='account'>Account</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserIcon className='h-5 w-5' />
                Basic Information
              </CardTitle>
              <CardDescription>Personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    First Name
                  </label>
                  <p className='text-sm'>{profileInfo.firstName || 'N/A'}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Last Name
                  </label>
                  <p className='text-sm'>{profileInfo.lastName || 'N/A'}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    Email Address
                  </label>
                  <p className='text-sm'>{user.email}</p>
                  {user.emailVerified && (
                    <Badge className='mt-1 bg-green-100 text-green-800 border-green-200'>
                      Verified
                    </Badge>
                  )}
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    Phone Number
                  </label>
                  <p className='text-sm'>{profileInfo.phone || 'N/A'}</p>
                  {user.phoneVerified && (
                    <Badge className='mt-1 bg-green-100 text-green-800 border-green-200'>
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                    <Shield className='h-4 w-4' />
                    Role
                  </label>
                  <p className='text-sm capitalize'>{user.role}</p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Status
                  </label>
                  <div>{getStatusBadge(user.status)}</div>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    2FA Enabled
                  </label>
                  <p className='text-sm'>{user.twoFactorEnabled ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='addresses' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                Saved Addresses
              </CardTitle>
              <CardDescription>
                {user.addresses?.length || 0} address(es) on file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user.addresses || user.addresses.length === 0 ? (
                <div className='text-center py-8'>
                  <MapPin className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
                  <p className='text-sm text-muted-foreground'>No addresses saved yet</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {user.addresses.map((address: any, index: number) => (
                    <div key={index} className='p-4 border rounded-lg'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <p className='font-medium'>
                            {address.street}
                          </p>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {address.city}, {address.state}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            {address.country} - {address.postalCode}
                          </p>
                        </div>
                        {address.isDefault && (
                          <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='preferences' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                User notification settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>Email Notifications</p>
                    <p className='text-xs text-muted-foreground'>
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Badge variant='outline'>
                  {user.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>SMS Notifications</p>
                    <p className='text-xs text-muted-foreground'>
                      Receive updates via SMS
                    </p>
                  </div>
                </div>
                <Badge variant='outline'>
                  {user.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className='flex items-center justify-between p-3 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Bell className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>Push Notifications</p>
                    <p className='text-xs text-muted-foreground'>
                      Receive push notifications
                    </p>
                  </div>
                </div>
                <Badge variant='outline'>
                  {user.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='account' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='h-5 w-5' />
                Account Information
              </CardTitle>
              <CardDescription>
                Account timestamps and activity
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Created At
                  </label>
                  <p className='text-sm'>
                    {user.createdAt
                      ? format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm')
                      : 'N/A'}
                  </p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Last Updated
                  </label>
                  <p className='text-sm'>
                    {user.updatedAt
                      ? format(new Date(user.updatedAt), 'MMM dd, yyyy HH:mm')
                      : 'N/A'}
                  </p>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Last Login
                  </label>
                  <p className='text-sm'>
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy HH:mm')
                      : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {/* Deactivate Modal */}
      <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {profileInfo.firstName} {profileInfo.lastName}?
              This will prevent them from accessing their account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeactivateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeactivate}
              disabled={deactivateUser.isPending}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Provide a reason for suspending {profileInfo.firstName} {profileInfo.lastName}.
              This will prevent them from accessing their account.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='suspend-reason'>Reason for Suspension *</Label>
              <Textarea
                id='suspend-reason'
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder='Enter reason for suspension...'
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleSuspend}
              disabled={suspendUser.isPending || !suspendReason.trim()}
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {profileInfo.firstName} {profileInfo.lastName}?
              This action cannot be undone and will permanently remove all user data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
