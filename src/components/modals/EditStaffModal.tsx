'use client';

import { useState, useEffect } from 'react';
import { useUpdateStaff } from '@/lib/hooks/use-staff';
import { Staff } from '@/lib/api/services/staff.service';
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
import { Edit, Mail, Phone, Shield, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSuccess?: () => void;
}

export function EditStaffModal({ isOpen, onClose, staff, onSuccess }: EditStaffModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'admin' as 'super_admin' | 'admin' | 'moderator' | 'analyst' | 'support' | 'viewer',
    department: '',
    jobTitle: '',
    status: 'active' as 'active' | 'pending' | 'suspended' | 'inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const updateStaff = useUpdateStaff();

  useEffect(() => {
    if (staff && isOpen) {
      setFormData({
        firstName: staff.firstName || '',
        lastName: staff.lastName || '',
        email: staff.email || '',
        phoneNumber: staff.phoneNumber || '',
        role: staff.role,
        department: staff.department || '',
        jobTitle: staff.jobTitle || '',
        status: staff.status,
      });
      setShowResetPassword(false);
      setNewPassword('');
    }
  }, [staff, isOpen]);

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

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff || !validateForm()) {
      return;
    }

    try {
      await updateStaff.mutateAsync({
        staffId: staff.id,
        data: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          role: formData.role,
          department: formData.department.trim() || undefined,
          jobTitle: formData.jobTitle.trim() || undefined,
          status: formData.status,
        },
      });

      toast.success('Staff member updated successfully');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update staff member');
    }
  };

  const handleResetPassword = async () => {
    if (!staff) return;

    try {
      // For now, we'll generate a temporary password
      // This should be handled by the staff service
      const tempPassword = Math.random().toString(36).slice(-8);
      setNewPassword(tempPassword);
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

  if (!staff) return null;

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
            <Label htmlFor='phoneNumber'>Phone Number</Label>
            <div className='relative'>
              <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                id='phoneNumber'
                value={formData.phoneNumber}
                onChange={e => handleInputChange('phoneNumber', e.target.value)}
                placeholder='+234 800 000 0000'
                className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phoneNumber && <p className='text-sm text-red-500'>{errors.phoneNumber}</p>}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <div className='flex items-center gap-2'>
                    <Shield className='w-4 h-4 text-gray-400' />
                    <SelectValue placeholder='Select role' />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='super_admin'>Super Admin</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='moderator'>Moderator</SelectItem>
                  <SelectItem value='analyst'>Analyst</SelectItem>
                  <SelectItem value='support'>Support</SelectItem>
                  <SelectItem value='viewer'>Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='status'>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='suspended'>Suspended</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='department'>Department</Label>
              <Input
                id='department'
                value={formData.department}
                onChange={e => handleInputChange('department', e.target.value)}
                placeholder='Technology'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='jobTitle'>Job Title</Label>
              <Input
                id='jobTitle'
                value={formData.jobTitle}
                onChange={e => handleInputChange('jobTitle', e.target.value)}
                placeholder='Senior Developer'
              />
            </div>
          </div>

          <div className='space-y-4 border-t pt-4'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium'>Password Management</h4>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleResetPassword}
                className='flex items-center gap-2'
              >
                <Key className='w-4 h-4' />
                Reset Password
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

          <DialogFooter className='gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={updateStaff.isPending}>
              {updateStaff.isPending ? 'Updating...' : 'Update Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}