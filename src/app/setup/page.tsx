'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { UserPlus, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SetupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SetupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Please enter a valid email address';
    if (formData.password.length < 8) return 'Password must be at least 8 characters long';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/setup/super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Setup failed');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);

    } catch (err) {
      console.error('Setup error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-white">Setup Complete!</h1>
            <p className="mb-6 text-gray-300">
              Super admin account has been created successfully. 
              <br />
              Redirecting to login page...
            </p>
            <div className="flex items-center justify-center">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 mr-1"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400 mr-1" style={{animationDelay: '0.2s'}}></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-400">
            © 2025 digiMall. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Image
            src={'/icon.svg'}
            alt="digiMall Logo"
            width={48}
            height={48}
            className="mx-auto mb-4"
          />
          <h1 className="mb-2 text-3xl font-bold text-white">Admin Setup</h1>
          <p className="text-gray-400">Create your super admin account to get started</p>
        </div>

        {/* Setup Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-200">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-200">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@digimall.ng"
                className="border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repeat your password"
                  className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Super Admin Account
                </div>
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              This will create the first super admin account for digiMall Admin Dashboard
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          © 2025 digiMall. All rights reserved.
        </div>
      </div>
    </div>
  );
}