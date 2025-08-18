'use client';

import { useState, useCallback, useRef } from 'react';
import { ApiError, isApiError } from '@/lib/api/client';
import { ErrorType } from '@/components/error/error-states';

interface ErrorInfo {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: number;
  retryCount: number;
}

interface UseErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  logErrors?: boolean;
  showToast?: boolean;
}

interface UseErrorHandlingReturn {
  error: ErrorInfo | null;
  isLoading: boolean;
  retry: () => void;
  clearError: () => void;
  handleAsync: <T>(operation: () => Promise<T>) => Promise<T | null>;
  setLoading: (loading: boolean) => void;
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}): UseErrorHandlingReturn {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    logErrors = true,
    showToast = false
  } = options;

  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastOperationRef = useRef<(() => Promise<any>) | null>(null);

  const mapErrorToType = useCallback((error: any): ErrorType => {
    if (isApiError(error)) {
      switch (error.status) {
        case 401:
          return 'authentication';
        case 403:
          return 'authorization';
        case 404:
          return 'not-found';
        case 408:
        case 504:
          return 'timeout';
        case 429:
          return 'rate-limit';
        case 422:
        case 400:
          return 'validation';
        case 503:
          return 'maintenance';
        case 500:
        case 502:
        case 503:
          return 'server';
        default:
          return 'unknown';
      }
    }

    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return 'network';
    }

    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return 'timeout';
    }

    return 'unknown';
  }, []);

  const logError = useCallback((error: any, context?: string) => {
    if (!logErrors) return;

    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      status: isApiError(error) ? error.status : undefined,
      data: isApiError(error) ? error.data : undefined,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('[Error Handler]', errorData);

    // In a real application, send to error tracking service
    // errorTrackingService.captureException(error, errorData);
  }, [logErrors]);

  const showErrorToast = useCallback((errorInfo: ErrorInfo) => {
    if (!showToast) return;

    // In a real application, integrate with your toast library
    console.warn('[Toast]', `${errorInfo.type}: ${errorInfo.message}`);
  }, [showToast]);

  const createErrorInfo = useCallback((error: any, retryCount = 0): ErrorInfo => {
    const type = mapErrorToType(error);
    let message = error.message || 'An unexpected error occurred';

    // Customize messages based on error type
    if (isApiError(error) && error.data?.message) {
      message = error.data.message;
    }

    return {
      type,
      message,
      details: isApiError(error) ? JSON.stringify(error.data, null, 2) : error.stack,
      timestamp: Date.now(),
      retryCount,
    };
  }, [mapErrorToType]);

  const setErrorState = useCallback((error: any, retryCount = 0) => {
    const errorInfo = createErrorInfo(error, retryCount);
    setError(errorInfo);
    logError(error);
    showErrorToast(errorInfo);
  }, [createErrorInfo, logError, showErrorToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (!error || !lastOperationRef.current) return;

    const newRetryCount = error.retryCount + 1;
    
    if (newRetryCount > maxRetries) {
      setErrorState(new Error('Maximum retry attempts exceeded'), newRetryCount);
      return;
    }

    clearError();
    setIsLoading(true);

    // Add delay before retry
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * newRetryCount));
    }

    try {
      await lastOperationRef.current();
    } catch (retryError) {
      setErrorState(retryError, newRetryCount);
    } finally {
      setIsLoading(false);
    }
  }, [error, maxRetries, retryDelay, clearError, setErrorState]);

  const handleAsync = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    lastOperationRef.current = operation;
    clearError();
    setIsLoading(true);

    try {
      const result = await operation();
      setIsLoading(false);
      return result;
    } catch (error) {
      setErrorState(error);
      setIsLoading(false);
      return null;
    }
  }, [clearError, setErrorState]);

  return {
    error,
    isLoading,
    retry,
    clearError,
    handleAsync,
    setLoading: setIsLoading,
  };
}

// Hook for handling form errors specifically
export function useFormErrorHandling() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, []);

  const handleApiError = useCallback((error: any) => {
    clearAllErrors();

    if (isApiError(error) && error.data?.details) {
      // Handle validation errors with field-specific messages
      if (Array.isArray(error.data.details)) {
        const newFieldErrors: Record<string, string> = {};
        
        error.data.details.forEach((detail: any) => {
          if (detail.field && detail.message) {
            newFieldErrors[detail.field] = detail.message;
          }
        });
        
        setFieldErrors(newFieldErrors);
        
        if (Object.keys(newFieldErrors).length === 0) {
          setGeneralError(error.data.message || 'Validation error occurred');
        }
      } else {
        setGeneralError(error.data.message || error.message);
      }
    } else {
      setGeneralError(error.message || 'An unexpected error occurred');
    }
  }, [clearAllErrors]);

  return {
    fieldErrors,
    generalError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleApiError,
    hasErrors: Object.keys(fieldErrors).length > 0 || !!generalError,
  };
}

// Hook for handling async operations with loading states
export function useAsyncOperation<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorInfo: ErrorInfo = {
        type: 'unknown',
        message: err instanceof Error ? err.message : 'Operation failed',
        timestamp: Date.now(),
        retryCount: 0,
      };
      setError(errorInfo);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

// Hook for handling batch operations
export function useBatchOperation<T = any>() {
  const [results, setResults] = useState<Array<{ success: boolean; data?: T; error?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const executeBatch = useCallback(async (
    operations: Array<() => Promise<T>>,
    onProgress?: (completed: number, total: number) => void
  ) => {
    setIsLoading(true);
    setResults([]);
    setProgress(0);

    const newResults: Array<{ success: boolean; data?: T; error?: string }> = [];

    for (let i = 0; i < operations.length; i++) {
      try {
        const result = await operations[i]();
        newResults.push({ success: true, data: result });
      } catch (error) {
        newResults.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Operation failed' 
        });
      }

      const completed = i + 1;
      setProgress((completed / operations.length) * 100);
      setResults([...newResults]);
      onProgress?.(completed, operations.length);
    }

    setIsLoading(false);
    return newResults;
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setProgress(0);
    setIsLoading(false);
  }, []);

  return {
    results,
    isLoading,
    progress,
    executeBatch,
    reset,
    successCount: results.filter(r => r.success).length,
    errorCount: results.filter(r => !r.success).length,
  };
}