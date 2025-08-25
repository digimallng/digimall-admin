'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useUpdateUser } from '@/lib/hooks/use-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading: userLoading, error: userError, refetch } = useUser(userId);
  const updateUser = useUpdateUser();


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    isEmailVerified: false,
    isPhoneVerified: false,
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    profile: {
      bio: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        status: user.status || 'active',
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
        preferences: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          smsNotifications: user.preferences?.smsNotifications ?? false,
          pushNotifications: user.preferences?.pushNotifications ?? true,
        },
        profile: {
          bio: user.profile?.bio || '',
          dateOfBirth: user.profile?.dateOfBirth || '',
          address: {
            street: user.profile?.address?.street || '',
            city: user.profile?.address?.city || '',
            state: user.profile?.address?.state || '',
            postalCode: user.profile?.address?.postalCode || '',
            country: user.profile?.address?.country || '',
          },
        },
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        address: {
          ...prev.profile.address,
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUser.mutateAsync({
        id: userId,
        data: formData,
      });

      toast.success('User updated successfully');
      router.push('/users');
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (userError || !user) {
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

  return (
    <div className='space-y-8'>
      <PageHeader
        title={`Edit User: ${user.firstName} ${user.lastName}`}
        description='Update user information and settings'
        icon={UserIcon}
        actions={[
          {
            label: 'Back to Users',
            icon: ArrowLeft,
            variant: 'secondary',
            onClick: () => router.push('/users'),
          },
        ]}
      />

      <form onSubmit={handleSubmit} className='space-y-8'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserIcon className='w-5 h-5' />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className='pl-10'
                    required
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role and Status */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='w-5 h-5' />
              Role and Status
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='role'>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='customer'>Customer</SelectItem>
                    <SelectItem value='vendor'>Vendor</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='super_admin'>Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                    <SelectItem value='suspended'>Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Label>Email Verified</Label>
                  <p className='text-sm text-gray-600'>User's email is verified</p>
                </div>
                <Switch
                  checked={formData.isEmailVerified}
                  onCheckedChange={(checked) => handleInputChange('isEmailVerified', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Label>Phone Verified</Label>
                  <p className='text-sm text-gray-600'>User's phone is verified</p>
                </div>
                <Switch
                  checked={formData.isPhoneVerified}
                  onCheckedChange={(checked) => handleInputChange('isPhoneVerified', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Label>Email Notifications</Label>
                  <p className='text-sm text-gray-600'>Receive notifications via email</p>
                </div>
                <Switch
                  checked={formData.preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    handleNestedChange('preferences', 'emailNotifications', checked)
                  }
                />
              </div>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Label>SMS Notifications</Label>
                  <p className='text-sm text-gray-600'>Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={formData.preferences.smsNotifications}
                  onCheckedChange={(checked) => 
                    handleNestedChange('preferences', 'smsNotifications', checked)
                  }
                />
              </div>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Label>Push Notifications</Label>
                  <p className='text-sm text-gray-600'>Receive push notifications</p>
                </div>
                <Switch
                  checked={formData.preferences.pushNotifications}
                  onCheckedChange={(checked) => 
                    handleNestedChange('preferences', 'pushNotifications', checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                value={formData.profile.bio}
                onChange={(e) => handleNestedChange('profile', 'bio', e.target.value)}
                placeholder='User bio or description'
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='dateOfBirth'>Date of Birth</Label>
              <div className='relative'>
                <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  id='dateOfBirth'
                  type='date'
                  value={formData.profile.dateOfBirth}
                  onChange={(e) => handleNestedChange('profile', 'dateOfBirth', e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <Label>Address</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Input
                  placeholder='Street Address'
                  value={formData.profile.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                />
                <Input
                  placeholder='City'
                  value={formData.profile.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                />
                <Input
                  placeholder='State/Province'
                  value={formData.profile.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
                <Input
                  placeholder='Postal Code'
                  value={formData.profile.address.postalCode}
                  onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                />
                <Input
                  placeholder='Country'
                  value={formData.profile.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className='md:col-span-2'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label>Created At</Label>
                <p className='text-sm text-gray-600 mt-1'>
                  {user.createdAt 
                    ? format(new Date(user.createdAt), 'MMMM dd, yyyy HH:mm')
                    : 'Not available'
                  }
                </p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className='text-sm text-gray-600 mt-1'>
                  {user.updatedAt 
                    ? format(new Date(user.updatedAt), 'MMMM dd, yyyy HH:mm')
                    : 'Not available'
                  }
                </p>
              </div>
              {user.lastLoginAt && (
                <div>
                  <Label>Last Login</Label>
                  <p className='text-sm text-gray-600 mt-1'>
                    {format(new Date(user.lastLoginAt), 'MMMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex items-center justify-end space-x-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/users')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size='sm' className='mr-2' />
                Updating...
              </>
            ) : (
              <>
                <Save className='w-4 h-4 mr-2' />
                Update User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}