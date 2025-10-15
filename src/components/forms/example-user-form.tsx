'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFormValidation, useFormPersistence } from '@/hooks/use-form-validation';
import { 
  ValidatedInput, 
  PasswordInput, 
  ValidatedSelect, 
  ValidatedSwitch, 
  FileUpload,
  FormSubmitButton,
  FormValidationSummary 
} from './validated-form-components';
import { createUserSchema, CreateUserForm } from '@/lib/validation/schemas';
import { useErrorContext } from '@/providers/error-provider';
import { User, Save, RotateCcw, Trash2 } from 'lucide-react';

// Mock API call for demonstration
const createUser = async (data: CreateUserForm): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
  
  // Simulate validation error
  if (data.email === 'error@test.com') {
    throw {
      status: 422,
      data: {
        message: 'Validation failed',
        details: [
          { field: 'email', message: 'This email is already taken' },
          { field: 'phone', message: 'Phone number format is invalid' }
        ]
      }
    };
  }

  console.log('User created successfully:', data);
};

export function ExampleUserForm() {
  const { showError } = useErrorContext();
  
  // Form persistence
  const { loadPersistedData, persistData, clearPersistedData } = useFormPersistence({
    key: 'create_user_form',
    schema: createUserSchema,
    defaultValues: {
      role: 'customer',
      status: 'pending',
    },
    exclude: ['password', 'confirmPassword'], // Don't persist sensitive data
  });

  // Form validation
  const form = useFormValidation({
    schema: createUserSchema,
    defaultValues: loadPersistedData(),
    onSubmit: async (data) => {
      try {
        await createUser(data);
        showError({
          type: 'validation',
          title: 'Success',
          message: 'User created successfully!',
          source: 'User Form',
        });
        form.reset();
        clearPersistedData();
      } catch (error) {
        throw error; // Let the form handle the error
      }
    },
    validateOnChange: true,
    showErrorNotifications: true,
  });

  const { watch, reset, formState: { isDirty } } = form;

  // Auto-save form data
  React.useEffect(() => {
    if (isDirty) {
      const subscription = watch((value) => {
        persistData(value);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, isDirty, persistData]);

  const handleReset = () => {
    reset();
    clearPersistedData();
  };

  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'staff', label: 'Staff' },
    { value: 'admin', label: 'Administrator' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        </div>
        <p className="text-gray-600">
          Fill out the form below to create a new user account. All required fields must be completed.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(form.submitForm)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput
              form={form}
              name="firstName"
              label="First Name"
              placeholder="Enter first name"
              required
            />
            
            <ValidatedInput
              form={form}
              name="lastName"
              label="Last Name"
              placeholder="Enter last name"
              required
            />
          </div>

          <div className="mt-4">
            <ValidatedInput
              form={form}
              name="email"
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              description="Use 'error@test.com' to simulate validation error"
              required
            />
          </div>

          <div className="mt-4">
            <ValidatedInput
              form={form}
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="+234 XXX XXX XXXX"
              description="Nigerian phone number format"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedSelect
              form={form}
              name="role"
              label="User Role"
              options={roleOptions}
              required
            />
            
            <ValidatedSelect
              form={form}
              name="status"
              label="Account Status"
              options={statusOptions}
              required
            />
          </div>

          <div className="mt-4">
            <PasswordInput
              form={form}
              name="password"
              label="Password"
              placeholder="Create a strong password"
              description="Password must contain uppercase, lowercase, number, and special character"
              required
              showStrength
            />
          </div>

          <div className="mt-4">
            <ValidatedInput
              form={form}
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile & Settings</h2>
          
          <div className="mb-4">
            <FileUpload
              form={form}
              name="profileImage"
              label="Profile Image"
              description="Upload a profile picture (optional)"
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            />
          </div>

          <div className="mb-4">
            <ValidatedInput
              form={form}
              name="notes"
              label="Notes"
              placeholder="Additional notes about this user..."
              description="Optional notes for administrative purposes"
            />
          </div>
        </Card>

        {/* Form Validation Summary */}
        <FormValidationSummary form={form} showSuccessMessage />

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDirty && (
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Changes saved automatically
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={form.isSubmitting || !isDirty}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={clearPersistedData}
              disabled={form.isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
            
            <FormSubmitButton
              form={form}
              isSubmitting={form.isSubmitting}
              loadingText="Creating User..."
            >
              <Save className="w-4 h-4 mr-2" />
              Create User
            </FormSubmitButton>
          </div>
        </div>
      </form>

      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 mt-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Development Tools</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600">Form State:</p>
              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                {JSON.stringify({
                  isValid: form.formState.isValid,
                  isDirty: form.formState.isDirty,
                  isSubmitting: form.isSubmitting,
                  errorCount: Object.keys(form.formState.errors).length,
                }, null, 2)}
              </pre>
            </div>
            
            <div>
              <p className="text-xs text-gray-600">Current Values:</p>
              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto max-h-32">
                {JSON.stringify(form.watch(), null, 2)}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}