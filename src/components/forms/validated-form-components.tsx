'use client';

import React, { forwardRef, useState } from 'react';
import { UseFormReturn, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import { 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  Upload,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { useFieldValidation } from '@/hooks/use-form-validation';
import { cn } from '@/lib/utils';

// ===== VALIDATED INPUT COMPONENT =====

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  showValidation?: boolean;
  rightElement?: React.ReactNode;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(({
  form,
  name,
  label,
  description,
  required = false,
  showValidation = true,
  rightElement,
  className,
  ...props
}, ref) => {
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const value = watch(name);
  const error = errors[name];
  const hasError = !!error;
  const hasValue = value && value.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={name} className={cn(
          "text-sm font-medium",
          hasError ? "text-red-600" : "text-gray-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {showValidation && hasValue && !hasError && (
          <Check className="w-4 h-4 text-green-600" />
        )}
        
        {hasError && (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
      </div>

      <div className="relative">
        <Input
          {...register(name)}
          {...props}
          ref={ref}
          id={name}
          className={cn(
            className,
            hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
            hasValue && !hasError && "border-green-300 focus:border-green-500 focus:ring-green-500"
          )}
        />
        
        {rightElement && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {description && !hasError && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error.message}
        </p>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

// ===== PASSWORD INPUT WITH VALIDATION =====

interface PasswordInputProps extends Omit<ValidatedInputProps, 'type'> {
  showStrength?: boolean;
}

export function PasswordInput({ 
  showStrength = true, 
  rightElement,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const value = props.form.watch(props.name);

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: 'No password', color: 'gray' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 2) return { score, label: 'Weak', color: 'red' };
    if (score < 4) return { score, label: 'Medium', color: 'yellow' };
    return { score, label: 'Strong', color: 'green' };
  };

  const strength = getPasswordStrength(value || '');

  const toggleButton = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="space-y-2">
      <ValidatedInput
        {...props}
        type={showPassword ? 'text' : 'password'}
        rightElement={rightElement || toggleButton}
      />
      
      {showStrength && value && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  strength.color === 'red' && "bg-red-500",
                  strength.color === 'yellow' && "bg-yellow-500", 
                  strength.color === 'green' && "bg-green-500"
                )}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <Badge 
              variant="outline"
              className={cn(
                "text-xs",
                strength.color === 'red' && "text-red-600 border-red-300",
                strength.color === 'yellow' && "text-yellow-600 border-yellow-300",
                strength.color === 'green' && "text-green-600 border-green-300"
              )}
            >
              {strength.label}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== VALIDATED SELECT COMPONENT =====

interface ValidatedSelectProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export function ValidatedSelect({
  form,
  name,
  label,
  description,
  required = false,
  options,
  placeholder = "Select an option...",
}: ValidatedSelectProps) {
  const {
    control,
    formState: { errors },
  } = form;

  const error = errors[name];
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={name} className={cn(
          "text-sm font-medium",
          hasError ? "text-red-600" : "text-gray-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {hasError && (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select {...field}>
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </Select>
        )}
      />

      {description && !hasError && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ===== VALIDATED SWITCH COMPONENT =====

interface ValidatedSwitchProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
}

export function ValidatedSwitch({
  form,
  name,
  label,
  description,
}: ValidatedSwitchProps) {
  const { control, watch } = form;
  const value = watch(name);

  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-1">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch
            {...field}
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    </div>
  );
}

// ===== FILE UPLOAD COMPONENT =====

interface FileUploadProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

export function FileUpload({
  form,
  name,
  label,
  description,
  required = false,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const {
    setValue,
    formState: { errors },
    watch,
  } = form;

  const error = errors[name];
  const hasError = !!error;

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.size <= maxSize);

    if (multiple) {
      const totalFiles = uploadedFiles.length + validFiles.length;
      const filesToAdd = totalFiles > maxFiles 
        ? validFiles.slice(0, maxFiles - uploadedFiles.length)
        : validFiles;
      
      const newFiles = [...uploadedFiles, ...filesToAdd];
      setUploadedFiles(newFiles);
      setValue(name, newFiles);
    } else {
      const file = validFiles[0];
      if (file) {
        setUploadedFiles([file]);
        setValue(name, file);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setValue(name, multiple ? newFiles : null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className={cn(
          "text-sm font-medium",
          hasError ? "text-red-600" : "text-gray-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {hasError && (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          hasError && "border-red-300"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
            browse
            <input
              type="file"
              className="hidden"
              accept={accept}
              multiple={multiple}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </label>
        </p>
        <p className="text-xs text-gray-500">
          Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
          {multiple && `, Max files: ${maxFiles}`}
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {description && !hasError && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ===== FORM SUBMISSION BUTTON =====

interface FormSubmitButtonProps {
  form: UseFormReturn<any>;
  isSubmitting?: boolean;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  loadingText?: string;
}

export function FormSubmitButton({
  form,
  isSubmitting = false,
  children,
  variant = 'default',
  className,
  loadingText = 'Submitting...',
}: FormSubmitButtonProps) {
  const { formState: { isValid, errors } } = form;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={isSubmitting || hasErrors}
      className={className}
    >
      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {isSubmitting ? loadingText : children}
    </Button>
  );
}

// ===== FORM VALIDATION SUMMARY =====

interface FormValidationSummaryProps {
  form: UseFormReturn<any>;
  showSuccessMessage?: boolean;
}

export function FormValidationSummary({ 
  form, 
  showSuccessMessage = false 
}: FormValidationSummaryProps) {
  const { formState: { errors, isValid, touchedFields } } = form;
  
  const errorEntries = Object.entries(errors);
  const touchedCount = Object.keys(touchedFields).length;

  if (errorEntries.length === 0) {
    if (showSuccessMessage && isValid && touchedCount > 0) {
      return (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5" />
            <p className="font-medium">Form is valid and ready to submit</p>
          </div>
        </Card>
      );
    }
    return null;
  }

  return (
    <Card className="p-4 border-red-200 bg-red-50">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-800 mb-2">
            Please fix the following errors:
          </p>
          <ul className="space-y-1">
            {errorEntries.map(([field, error]) => (
              <li key={field} className="text-sm text-red-700">
                • {(error as any)?.message || `Error in ${field}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}