'use client';

import { useState } from 'react';
import { useCreateStaff, useRolePermissions } from '@/lib/hooks/use-staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Shield, 
  Calendar,
  MapPin,
  Building,
  Briefcase,
  AlertTriangle,
  Plus,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStaffModal({ isOpen, onClose }: CreateStaffModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'support' as 'super_admin' | 'admin' | 'moderator' | 'analyst' | 'support' | 'viewer',
    department: '',
    jobTitle: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    allowedIps: [''] as string[],
    customPermissions: [] as string[],
    requirePasswordChange: false,
    sendWelcomeEmail: true,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const createStaff = useCreateStaff();
  const { data: rolePermissions } = useRolePermissions();

  const addIpAddress = () => {
    setFormData(prev => ({
      ...prev,
      allowedIps: [...prev.allowedIps, ''],
    }));
  };

  const removeIpAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allowedIps: prev.allowedIps.filter((_, i) => i !== index),
    }));
  };

  const updateIpAddress = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      allowedIps: prev.allowedIps.map((ip, i) => i === index ? value : ip),
    }));
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permission)
        ? prev.customPermissions.filter(p => p !== permission)
        : [...prev.customPermissions, permission],
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
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate IP addresses
    const validIps = formData.allowedIps.filter(ip => ip.trim());
    validIps.forEach((ip, index) => {
      if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip.trim())) {
        newErrors[`ip_${index}`] = 'Invalid IP address format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const staffData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        role: formData.role,
        department: formData.department.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        allowedIps: formData.allowedIps.filter(ip => ip.trim()).map(ip => ip.trim()),
        customPermissions: useCustomPermissions ? formData.customPermissions : undefined,
        requirePasswordChange: formData.requirePasswordChange,
        sendWelcomeEmail: formData.sendWelcomeEmail,
        notes: formData.notes.trim() || undefined,
      };

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
      phoneNumber: '',
      role: 'support',
      department: '',
      jobTitle: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      allowedIps: [''],
      customPermissions: [],
      requirePasswordChange: false,
      sendWelcomeEmail: true,
      notes: '',
    });
    setActiveTab('basic');
    setUseCustomPermissions(false);
    setShowPassword(false);
    setErrors({});
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
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            Create Staff Member
          </DialogTitle>
          <DialogDescription>
            Add a new staff member to the admin system. Set their password and they can login immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='basic'>Basic Info</TabsTrigger>
              <TabsTrigger value='role'>Role & Permissions</TabsTrigger>
              <TabsTrigger value='security'>Security</TabsTrigger>
              <TabsTrigger value='additional'>Additional</TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-4'>
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
                      placeholder='Enter password'
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 transform -translate-y-1/2'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='w-4 h-4 text-gray-400' />
                      ) : (
                        <Eye className='w-4 h-4 text-gray-400' />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
                  <p className='text-xs text-gray-500'>Minimum 8 characters required</p>
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
                      placeholder='Confirm password'
                      className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className='text-sm text-red-500'>{errors.confirmPassword}</p>}
                </div>
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
                  <Label htmlFor='department'>Department</Label>
                  <div className='relative'>
                    <Building className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      id='department'
                      value={formData.department}
                      onChange={e => handleInputChange('department', e.target.value)}
                      placeholder='e.g., Technology, Operations'
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
                      placeholder='e.g., Customer Support Agent'
                      className='pl-10'
                    />
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='startDate'>Start Date</Label>
                  <div className='relative'>
                    <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      id='startDate'
                      type='date'
                      value={formData.startDate}
                      onChange={e => handleInputChange('startDate', e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='endDate'>End Date (Optional)</Label>
                  <div className='relative'>
                    <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <Input
                      id='endDate'
                      type='date'
                      value={formData.endDate}
                      onChange={e => handleInputChange('endDate', e.target.value)}
                      className={`pl-10 ${errors.endDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.endDate && <p className='text-sm text-red-500'>{errors.endDate}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='role' className='space-y-4'>

              <div className='space-y-2'>
                <Label htmlFor='role'>Staff Role *</Label>
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
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm'>Role: {rolePermissions.roles[formData.role]?.name}</CardTitle>
                    <CardDescription className='text-xs'>
                      {rolePermissions.roles[formData.role]?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='text-xs text-muted-foreground mb-2'>Default Permissions:</div>
                    <div className='flex flex-wrap gap-1'>
                      {rolePermissions.roles[formData.role]?.permissions.slice(0, 8).map((permission: string) => (
                        <Badge key={permission} variant='outline' className='text-xs'>
                          {permission === '*' ? 'All Permissions' : permission.replace(':', ': ')}
                        </Badge>
                      ))}
                      {rolePermissions.roles[formData.role]?.permissions.length > 8 && (
                        <Badge variant='outline' className='text-xs'>
                          +{rolePermissions.roles[formData.role]?.permissions.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Custom Permissions Toggle */}
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label className='text-sm font-medium'>Custom Permissions</Label>
                  <p className='text-xs text-muted-foreground'>
                    Override default role permissions with custom selection
                  </p>
                </div>
                <Switch
                  checked={useCustomPermissions}
                  onCheckedChange={setUseCustomPermissions}
                />
              </div>

              {/* Custom Permissions Selection */}
              {useCustomPermissions && rolePermissions && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-sm'>Select Custom Permissions</CardTitle>
                    <CardDescription className='text-xs'>
                      Choose specific permissions for this staff member
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid gap-2 max-h-40 overflow-y-auto'>
                      {Object.entries(rolePermissions.permissions).map(([permission, description]) => (
                        <div key={permission} className='flex items-center space-x-2'>
                          <Checkbox
                            id={permission}
                            checked={formData.customPermissions.includes(permission)}
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          <div className='flex-1'>
                            <Label htmlFor={permission} className='text-xs font-medium'>
                              {permission}
                            </Label>
                            <p className='text-xs text-muted-foreground'>{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value='security' className='space-y-4'>

              {/* Password Requirements */}
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label className='text-sm font-medium'>Require Password Change</Label>
                  <p className='text-xs text-muted-foreground'>
                    Require staff to change password on first login (optional since you set their initial password)
                  </p>
                </div>
                <Switch
                  checked={formData.requirePasswordChange}
                  onCheckedChange={checked => handleInputChange('requirePasswordChange', checked)}
                />
              </div>

              {/* IP Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>IP Address Restrictions</CardTitle>
                  <CardDescription className='text-xs'>
                    Limit access to specific IP addresses (leave empty to allow all)
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {formData.allowedIps.map((ip, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <div className='relative flex-1'>
                        <MapPin className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <Input
                          value={ip}
                          onChange={e => updateIpAddress(index, e.target.value)}
                          placeholder='192.168.1.100'
                          className={`pl-10 ${errors[`ip_${index}`] ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {formData.allowedIps.length > 1 && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => removeIpAddress(index)}
                        >
                          <Minus className='w-4 h-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addIpAddress}
                    className='w-full'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add IP Address
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='additional' className='space-y-4'>

              {/* Email Settings */}
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label className='text-sm font-medium'>Send Welcome Email</Label>
                  <p className='text-xs text-muted-foreground'>
                    Send welcome message with login instructions via email (password not included)
                  </p>
                </div>
                <Switch
                  checked={formData.sendWelcomeEmail}
                  onCheckedChange={checked => handleInputChange('sendWelcomeEmail', checked)}
                />
              </div>

              {/* Notes */}
              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes (Optional)</Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={e => handleInputChange('notes', e.target.value)}
                  placeholder='Additional notes about this staff member...'
                  rows={3}
                />
              </div>

              {/* Account Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>Account Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Name:</span>
                    <span>{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Email:</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Role:</span>
                    <Badge className='text-xs'>{formData.role.replace('_', ' ')}</Badge>
                  </div>
                  {formData.department && (
                    <div className='flex justify-between text-sm'>
                      <span>Department:</span>
                      <span>{formData.department}</span>
                    </div>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span>Password Change Required:</span>
                    <Badge variant={formData.requirePasswordChange ? 'destructive' : 'secondary'} className='text-xs'>
                      {formData.requirePasswordChange ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className='gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={createStaff.isPending}>
              {createStaff.isPending ? 'Creating...' : 'Create Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
