'use client';

import { useState } from 'react';
import { Mail, Shield, Calendar, Building, Briefcase, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { useInviteStaff, useRolePermissions } from '@/lib/hooks/use-staff';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteStaffModal({ isOpen, onClose }: InviteStaffModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'support' as 'super_admin' | 'admin' | 'moderator' | 'analyst' | 'support' | 'viewer',
    department: '',
    jobTitle: '',
    customMessage: '',
    expiresInDays: 7,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const inviteStaff = useInviteStaff();
  const { data: rolePermissions } = useRolePermissions();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.expiresInDays < 1 || formData.expiresInDays > 30) {
      newErrors.expiresInDays = 'Expiry must be between 1 and 30 days';
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
      const inviteData = {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        role: formData.role,
        department: formData.department.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined,
        customMessage: formData.customMessage.trim() || undefined,
        expiresInDays: formData.expiresInDays,
      };

      await inviteStaff.mutateAsync(inviteData);
      onClose();
      resetForm();
    } catch (error: any) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'support',
      department: '',
      jobTitle: '',
      customMessage: '',
      expiresInDays: 7,
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Send className='w-5 h-5' />
            Invite Staff Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to join the admin system. The recipient will receive a secure link to set up their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Invitation Details</CardTitle>
              <CardDescription>
                Basic information for the invitation
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address *</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder='john.doe@company.com'
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    placeholder='John'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    value={formData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    placeholder='Doe'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Position */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Role and Position</CardTitle>
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
                    <SelectItem value='support'>Customer Support</SelectItem>
                    <SelectItem value='moderator'>Moderator</SelectItem>
                    <SelectItem value='analyst'>Business Analyst</SelectItem>
                    <SelectItem value='admin'>Administrator</SelectItem>
                    <SelectItem value='super_admin'>Super Administrator</SelectItem>
                    <SelectItem value='viewer'>Viewer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className='text-sm text-red-500'>{errors.role}</p>}
              </div>

              {/* Role Description */}
              {rolePermissions && formData.role && (
                <div className='p-3 bg-gray-50 rounded-md'>
                  <div className='text-sm font-medium mb-1'>
                    {rolePermissions.roles[formData.role]?.name}
                  </div>
                  <div className='text-xs text-muted-foreground mb-2'>
                    {rolePermissions.roles[formData.role]?.description}
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {rolePermissions.roles[formData.role]?.permissions.slice(0, 6).map((permission: string) => (
                      <Badge key={permission} variant='outline' className='text-xs'>
                        {permission === '*' ? 'All Permissions' : permission.replace(':', ': ')}
                      </Badge>
                    ))}
                    {rolePermissions.roles[formData.role]?.permissions.length > 6 && (
                      <Badge variant='outline' className='text-xs'>
                        +{rolePermissions.roles[formData.role]?.permissions.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='department'>Department</Label>
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

                <div className='space-y-2'>
                  <Label htmlFor='jobTitle'>Job Title</Label>
                  <div className='relative'>
                    <Briefcase className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      id='jobTitle'
                      value={formData.jobTitle}
                      onChange={e => handleInputChange('jobTitle', e.target.value)}
                      placeholder='e.g., Senior Support Agent'
                      className='pl-10'
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invitation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Invitation Settings</CardTitle>
              <CardDescription>
                Configure invitation expiry and custom message
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='expiresInDays'>Invitation Expires In (Days)</Label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    id='expiresInDays'
                    type='number'
                    min='1'
                    max='30'
                    value={formData.expiresInDays}
                    onChange={e => handleInputChange('expiresInDays', parseInt(e.target.value))}
                    className={`pl-10 ${errors.expiresInDays ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.expiresInDays && <p className='text-sm text-red-500'>{errors.expiresInDays}</p>}
                <p className='text-xs text-muted-foreground'>
                  The invitation link will expire after this many days
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='customMessage'>Custom Message (Optional)</Label>
                <Textarea
                  id='customMessage'
                  value={formData.customMessage}
                  onChange={e => handleInputChange('customMessage', e.target.value)}
                  placeholder='Welcome to the team! Please check your email for setup instructions...'
                  rows={3}
                />
                <p className='text-xs text-muted-foreground'>
                  This message will be included in the invitation email
                </p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={inviteStaff.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={inviteStaff.isPending}
            >
              {inviteStaff.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}