'use client';

import { useState, useEffect } from 'react';
import { useUpdateUser, useResetUserPassword } from '@/lib/hooks/use-users';
import { User } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Edit, Mail, Phone, Shield, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function EditStaffModal({ isOpen, onClose, user }: EditStaffModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'admin' as 'admin' | 'super_admin',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role as 'admin' | 'super_admin',
        emailNotifications: user.emailNotifications ?? true,
        smsNotifications: user.smsNotifications ?? true,
        pushNotifications: user.pushNotifications ?? true,
      });
      setShowResetPassword(false);
      setNewPassword('');
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateForm()) {
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
          pushNotifications: formData.pushNotifications,
        },
      });

      toast.success('Staff member updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update staff member');
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;

    try {
      const result = await resetPassword.mutateAsync(user.id);
      setNewPassword(result.temporaryPassword);
      setShowResetPassword(true);
      toast.success('Password reset successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='w-5 h-5' />
            Edit Staff Member
          </DialogTitle>
          <DialogDescription>Update staff member information and permissions.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>First Name *</Label>
              <Input
                id='firstName'
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                placeholder='John'
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && <p className='text-sm text-red-500'>{errors.firstName}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lastName'>Last Name *</Label>
              <Input
                id='lastName'
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                placeholder='Doe'
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && <p className='text-sm text-red-500'>{errors.lastName}</p>}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address *</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder='john.doe@digimall.ng'
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <div className='relative'>
              <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                id='phone'
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder='+234 800 000 0000'
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phone && <p className='text-sm text-red-500'>{errors.phone}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'super_admin') => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <div className='flex items-center gap-2'>
                  <Shield className='w-4 h-4 text-gray-400' />
                  <SelectValue placeholder='Select role' />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='super_admin'>Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-4 border-t pt-4'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium'>Password Management</h4>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleResetPassword}
                disabled={resetPassword.isPending}
                className='flex items-center gap-2'
              >
                <Key className='w-4 h-4' />
                {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>

            {showResetPassword && newPassword && (
              <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='flex items-start gap-2'>
                  <AlertTriangle className='w-4 h-4 text-yellow-600 mt-0.5' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-yellow-800'>
                      New temporary password generated
                    </p>
                    <p className='text-xs text-yellow-700 mt-1'>
                      Make sure to share this securely with the staff member
                    </p>
                    <div className='flex items-center gap-2 mt-2'>
                      <code className='bg-yellow-100 px-2 py-1 rounded text-sm font-mono'>
                        {newPassword}
                      </code>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={copyPassword}
                        className='h-6 w-6 p-0'
                      >
                        {copied ? (
                          <Check className='w-3 h-3 text-green-600' />
                        ) : (
                          <Copy className='w-3 h-3' />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='space-y-4 border-t pt-4'>
            <h4 className='text-sm font-medium'>Notification Preferences</h4>

            <div className='flex items-center justify-between'>
              <Label htmlFor='emailNotifications' className='text-sm'>
                Email Notifications
              </Label>
              <Switch
                id='emailNotifications'
                checked={formData.emailNotifications}
                onCheckedChange={checked => handleInputChange('emailNotifications', checked)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label htmlFor='smsNotifications' className='text-sm'>
                SMS Notifications
              </Label>
              <Switch
                id='smsNotifications'
                checked={formData.smsNotifications}
                onCheckedChange={checked => handleInputChange('smsNotifications', checked)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label htmlFor='pushNotifications' className='text-sm'>
                Push Notifications
              </Label>
              <Switch
                id='pushNotifications'
                checked={formData.pushNotifications}
                onCheckedChange={checked => handleInputChange('pushNotifications', checked)}
              />
            </div>
          </div>

          <DialogFooter className='gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Updating...' : 'Update Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
