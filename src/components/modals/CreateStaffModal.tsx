'use client';

import { useState } from 'react';
import { useCreateUser } from '@/lib/hooks/use-users';
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
import { Eye, EyeOff, Lock, Mail, Phone, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStaffModal({ isOpen, onClose }: CreateStaffModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'admin' as 'admin' | 'super_admin',
    password: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUser = useCreateUser();

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
  };

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createUser.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        password: formData.password,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        pushNotifications: formData.pushNotifications,
      });

      toast.success('Staff member created successfully');
      onClose();

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create staff member');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            Create Staff Member
          </DialogTitle>
          <DialogDescription>
            Add a new staff member to the admin system. They will receive login credentials via
            email.
          </DialogDescription>
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

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password'>Password *</Label>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={generatePassword}
                className='text-xs'
              >
                Generate
              </Button>
            </div>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                placeholder='Enter password'
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2'
              >
                {showPassword ? (
                  <EyeOff className='w-4 h-4 text-gray-400' />
                ) : (
                  <Eye className='w-4 h-4 text-gray-400' />
                )}
              </button>
            </div>
            {errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password *</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                placeholder='Confirm password'
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2'
              >
                {showConfirmPassword ? (
                  <EyeOff className='w-4 h-4 text-gray-400' />
                ) : (
                  <Eye className='w-4 h-4 text-gray-400' />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className='text-sm text-red-500'>{errors.confirmPassword}</p>
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
            <Button type='submit' disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
