'use client';

import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useCallback, useEffect } from 'react';
import { useErrorContext } from '@/providers/error-provider';
import { validateData, ValidationResult, extractApiValidationErrors } from '@/lib/validation/validation-utils';

// ===== FORM VALIDATION HOOK =====

interface UseFormValidationOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver'> {
  schema: z.ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (error: any) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showErrorNotifications?: boolean;
}

interface UseFormValidationReturn<T extends FieldValues> extends UseFormReturn<T> {
  isValidating: boolean;
  isSubmitting: boolean;
  submitForm: () => Promise<void>;
  validateField: (fieldName: Path<T>) => Promise<boolean>;
  setApiErrors: (error: any) => void;
  clearErrors: () => void;
  hasErrors: boolean;
  isValid: boolean;
}

export function useFormValidation<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  validateOnChange = true,
  validateOnBlur = true,
  showErrorNotifications = true,
  ...formOptions
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError } = useErrorContext();

  const form = useForm<T>({
    ...formOptions,
    resolver: zodResolver(schema),
    mode: validateOnChange ? 'onChange' : validateOnBlur ? 'onBlur' : 'onSubmit',
  });

  const {
    handleSubmit,
    setError,
    clearErrors: clearFormErrors,
    formState: { errors, isValid },
    trigger,
    getValues,
  } = form;

  // Validate individual field
  const validateField = useCallback(async (fieldName: Path<T>): Promise<boolean> => {
    setIsValidating(true);
    try {
      const result = await trigger(fieldName);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [trigger]);

  // Set API validation errors
  const setApiErrors = useCallback((error: any) => {
    const fieldErrors = extractApiValidationErrors(error);
    
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      setError(field as Path<T>, {
        type: 'server',
        message: Array.isArray(messages) ? messages[0] : String(messages),
      });
    });

    if (showErrorNotifications && Object.keys(fieldErrors).length === 0) {
      // Show general error if no field-specific errors
      showError({
        type: 'validation',
        title: 'Form Validation Error',
        message: error.message || 'Please check your input and try again',
        source: 'Form Validation',
      });
    }
  }, [setError, showError, showErrorNotifications]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    clearFormErrors();
  }, [clearFormErrors]);

  // Submit form with error handling
  const submitForm = useCallback(async () => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      const formData = getValues();
      await handleSubmit(async (data) => {
        try {
          await onSubmit(data);
        } catch (error) {
          setApiErrors(error);
          if (onError) {
            onError(error);
          }
          throw error;
        }
      })();
    } catch (error) {
      // Error already handled above
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, handleSubmit, getValues, setApiErrors, onError]);

  return {
    ...form,
    isValidating,
    isSubmitting,
    submitForm,
    validateField,
    setApiErrors,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0,
    isValid,
  };
}

// ===== FIELD VALIDATION HOOK =====

interface UseFieldValidationOptions<T> {
  schema: z.ZodSchema<T>;
  value: T;
  name: string;
  validateOnChange?: boolean;
  debounceMs?: number;
}

interface UseFieldValidationReturn {
  isValidating: boolean;
  error: string | null;
  isValid: boolean;
  validate: () => Promise<boolean>;
}

export function useFieldValidation<T>({
  schema,
  value,
  name,
  validateOnChange = true,
  debounceMs = 300,
}: UseFieldValidationOptions<T>): UseFieldValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const validate = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    try {
      const result = validateData(schema, value);
      if (result.success) {
        setError(null);
        return true;
      } else {
        const fieldError = result.errors?.find(err => err.field === name || err.field === '');
        setError(fieldError?.message || result.errors?.[0]?.message || 'Validation failed');
        return false;
      }
    } catch (err) {
      setError('Validation error');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [schema, value, name]);

  // Debounced validation on change
  useEffect(() => {
    if (!validateOnChange) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      validate();
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [value, validateOnChange, debounceMs, validate]);

  return {
    isValidating,
    error,
    isValid: error === null && !isValidating,
    validate,
  };
}

// ===== ASYNC VALIDATION HOOK =====

interface UseAsyncValidationOptions<T> {
  validator: (value: T) => Promise<ValidationResult>;
  debounceMs?: number;
  dependencies?: any[];
}

interface UseAsyncValidationReturn {
  isValidating: boolean;
  error: string | null;
  isValid: boolean;
  validate: () => Promise<boolean>;
}

export function useAsyncValidation<T>(
  value: T,
  { validator, debounceMs = 500, dependencies = [] }: UseAsyncValidationOptions<T>
): UseAsyncValidationReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const validate = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    try {
      const result = await validator(value);
      if (result.success) {
        setError(null);
        return true;
      } else {
        setError(result.errors?.[0]?.message || 'Validation failed');
        return false;
      }
    } catch (err) {
      setError('Validation failed');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [validator, value]);

  useEffect(() => {
    if (!value) {
      setError(null);
      return;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      validate();
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [value, debounceMs, validate, ...dependencies]);

  return {
    isValidating,
    error,
    isValid: error === null && !isValidating,
    validate,
  };
}

// ===== FORM PERSISTENCE HOOK =====

interface UseFormPersistenceOptions<T extends FieldValues> {
  key: string;
  schema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  exclude?: (keyof T)[];
}

export function useFormPersistence<T extends FieldValues>({
  key,
  schema,
  defaultValues = {},
  exclude = [],
}: UseFormPersistenceOptions<T>) {
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted data
  const loadPersistedData = useCallback((): Partial<T> => {
    try {
      const stored = localStorage.getItem(`form_${key}`);
      if (!stored) return defaultValues;

      const parsed = JSON.parse(stored);
      const result = validateData(schema.partial(), parsed);
      
      if (result.success) {
        // Filter out excluded fields
        const filtered = Object.fromEntries(
          Object.entries(result.data!).filter(([field]) => !exclude.includes(field as keyof T))
        );
        return { ...defaultValues, ...filtered };
      }
    } catch (error) {
      console.warn('Failed to load persisted form data:', error);
    }
    
    return defaultValues;
  }, [key, schema, defaultValues, exclude]);

  // Save form data
  const persistData = useCallback((data: Partial<T>) => {
    try {
      // Filter out excluded fields and empty values
      const filtered = Object.fromEntries(
        Object.entries(data)
          .filter(([field, value]) => 
            !exclude.includes(field as keyof T) && 
            value !== undefined && 
            value !== null && 
            value !== ''
          )
      );

      localStorage.setItem(`form_${key}`, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Failed to persist form data:', error);
    }
  }, [key, exclude]);

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(`form_${key}`);
    } catch (error) {
      console.warn('Failed to clear persisted form data:', error);
    }
  }, [key]);

  // Initialize with persisted data
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    loadPersistedData,
    persistData,
    clearPersistedData,
  };
}

// ===== BULK VALIDATION HOOK =====

interface UseBulkValidationOptions<T> {
  schema: z.ZodSchema<T>;
  items: T[];
  continueOnError?: boolean;
}

interface UseBulkValidationReturn<T> {
  isValidating: boolean;
  validItems: T[];
  invalidItems: Array<{ index: number; item: T; errors: string[] }>;
  validationProgress: number;
  validate: () => Promise<void>;
  isValid: boolean;
  hasErrors: boolean;
}

export function useBulkValidation<T>({
  schema,
  items,
  continueOnError = true,
}: UseBulkValidationOptions<T>): UseBulkValidationReturn<T> {
  const [isValidating, setIsValidating] = useState(false);
  const [validItems, setValidItems] = useState<T[]>([]);
  const [invalidItems, setInvalidItems] = useState<Array<{ index: number; item: T; errors: string[] }>>([]);
  const [validationProgress, setValidationProgress] = useState(0);

  const validate = useCallback(async () => {
    setIsValidating(true);
    setValidationProgress(0);
    setValidItems([]);
    setInvalidItems([]);

    const valid: T[] = [];
    const invalid: Array<{ index: number; item: T; errors: string[] }> = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const result = validateData(schema, item);

      if (result.success) {
        valid.push(result.data!);
      } else {
        const errors = result.errors?.map(err => err.message) || ['Validation failed'];
        invalid.push({ index: i, item, errors });

        if (!continueOnError) {
          break;
        }
      }

      setValidationProgress(((i + 1) / items.length) * 100);
    }

    setValidItems(valid);
    setInvalidItems(invalid);
    setIsValidating(false);
  }, [schema, items, continueOnError]);

  return {
    isValidating,
    validItems,
    invalidItems,
    validationProgress,
    validate,
    isValid: invalidItems.length === 0 && validItems.length === items.length,
    hasErrors: invalidItems.length > 0,
  };
}

// ===== VALIDATION STATE HOOK =====

interface ValidationState {
  isValidating: boolean;
  hasErrors: boolean;
  errorCount: number;
  validFields: string[];
  invalidFields: string[];
}

export function useValidationState(form: UseFormReturn<any>): ValidationState {
  const { formState: { errors, isValidating }, getValues } = form;

  const errorEntries = Object.entries(errors);
  const fieldNames = Object.keys(getValues());

  return {
    isValidating,
    hasErrors: errorEntries.length > 0,
    errorCount: errorEntries.length,
    validFields: fieldNames.filter(field => !errors[field]),
    invalidFields: errorEntries.map(([field]) => field),
  };
}