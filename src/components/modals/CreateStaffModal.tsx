'use client';

import { useState } from 'react';
import { useCreateStaff, useRolePermissions } from '@/lib/hooks/use-staff';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Mail, User, Shield, Building } from 'lucide-react';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStaffModal({ isOpen, onClose }: CreateStaffModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff' as 'super_admin' | 'admin' | 'staff',
    department: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const createStaff = useCreateStaff();
  const { data: rolePermissions } = useRolePermissions();

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

    if (!formData.role) {
      newErrors.role = 'Role is required';
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
      const staffData: any = {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.department?.trim()) {
        staffData.department = formData.department.trim();
      }

      await createStaff.mutateAsync(staffData);
      onClose();
      resetForm();
    } catch (error: any) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
      department: '',
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            Create Staff Member
          </DialogTitle>
          <DialogDescription>
            Create a new staff member account with immediate access
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Basic Information</CardTitle>
              <CardDescription>
                Personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name *</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      id='firstName'
                      value={formData.firstName}
                      onChange={e => handleInputChange('firstName', e.target.value)}
                      placeholder='John'
                      className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.firstName && <p className='text-sm text-red-500'>{errors.firstName}</p>}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name *</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      id='lastName'
                      value={formData.lastName}
                      onChange={e => handleInputChange('lastName', e.target.value)}
                      placeholder='Doe'
                      className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                  </div>
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
                    placeholder='staff@digimall.ng'
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password *</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      placeholder='••••••••'
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
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
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                      placeholder='••••••••'
                      className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className='text-sm text-red-500'>{errors.confirmPassword}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Department */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Role and Department</CardTitle>
              <CardDescription>
                Define the role and organizational position
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='role'>Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <div className='flex items-center gap-2'>
                      <Shield className='w-4 h-4 text-gray-400' />
                      <SelectValue placeholder='Select role' />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='staff'>Staff</SelectItem>
                    <SelectItem value='admin'>Administrator</SelectItem>
                    <SelectItem value='super_admin'>Super Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className='text-sm text-red-500'>{errors.role}</p>}
              </div>

              {rolePermissions?.roles?.[formData.role] && (
                <div className='p-3 bg-gray-50 rounded-md'>
                  <div className='text-sm font-medium mb-1'>
                    {rolePermissions.roles[formData.role].name}
                  </div>
                  <div className='text-xs text-muted-foreground mb-2'>
                    {rolePermissions.roles[formData.role].description}
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {rolePermissions.roles[formData.role].permissions.slice(0, 6).map((permission: string) => (
                      <Badge key={permission} variant='outline' className='text-xs'>
                        {permission === '*' ? 'All Permissions' : permission.replace(':', ': ')}
                      </Badge>
                    ))}
                    {rolePermissions.roles[formData.role].permissions.length > 6 && (
                      <Badge variant='outline' className='text-xs'>
                        +{rolePermissions.roles[formData.role].permissions.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='department'>Department (Optional)</Label>
                <div className='relative'>
                  <Building className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    id='department'
                    value={formData.department}
                    onChange={e => handleInputChange('department', e.target.value)}
                    placeholder='e.g., Customer Support'
                    className='pl-10'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createStaff.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStaff.isPending}
            >
              {createStaff.isPending ? 'Creating...' : 'Create Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
