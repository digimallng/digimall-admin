'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ErrorType } from '@/components/error/error-states';
import { isApiError } from '@/lib/api/client';

interface ErrorInfo {
  id: string;
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  timestamp: Date;
  source?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorContextValue {
  errors: ErrorInfo[];
  showError: (error: Omit<ErrorInfo, 'id' | 'timestamp'>) => string;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  criticalErrors: ErrorInfo[];
  warningErrors: ErrorInfo[];
  infoErrors: ErrorInfo[];
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  autoCleanup?: boolean;
  cleanupDelay?: number;
}

export function ErrorProvider({ 
  children, 
  maxErrors = 10,
  autoCleanup = true,
  cleanupDelay = 5000 
}: ErrorProviderProps) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const generateId = useCallback(() => {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }, []);

  const mapApiErrorToType = useCallback((error: any): ErrorType => {
    if (isApiError(error)) {
      switch (error.status) {
        case 401: return 'authentication';
        case 403: return 'authorization';
        case 404: return 'not-found';
        case 408: case 504: return 'timeout';
        case 429: return 'rate-limit';
        case 422: case 400: return 'validation';
        case 503: return 'maintenance';
        case 500: case 502: return 'server';
        default: return 'unknown';
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

  const showError = useCallback((errorData: Omit<ErrorInfo, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newError: ErrorInfo = {
      ...errorData,
      id,
      timestamp: new Date(),
    };

    setErrors(prev => {
      const updatedErrors = [newError, ...prev];
      // Keep only the most recent errors
      return updatedErrors.slice(0, maxErrors);
    });

    // Auto cleanup for non-critical errors
    if (autoCleanup && !['authentication', 'server', 'maintenance'].includes(errorData.type)) {
      setTimeout(() => {
        dismissError(id);
      }, cleanupDelay);
    }

    // Log error for monitoring
    console.error('[Error Provider]', {
      id,
      type: errorData.type,
      message: errorData.message,
      source: errorData.source,
      timestamp: new Date().toISOString(),
    });

    return id;
  }, [generateId, maxErrors, autoCleanup, cleanupDelay]);

  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Helper method to show errors from caught exceptions
  const showApiError = useCallback((error: any, source?: string) => {
    const type = mapApiErrorToType(error);
    let title = 'Error';
    let message = error.message || 'An unexpected error occurred';

    // Customize based on error type
    switch (type) {
      case 'authentication':
        title = 'Authentication Required';
        message = 'Your session has expired. Please log in again.';
        break;
      case 'authorization':
        title = 'Access Denied';
        message = 'You do not have permission to perform this action.';
        break;
      case 'network':
        title = 'Connection Problem';
        message = 'Unable to connect to the server. Please check your internet connection.';
        break;
      case 'server':
        title = 'Server Error';
        message = 'A server error occurred. Our team has been notified.';
        break;
      case 'validation':
        title = 'Validation Error';
        if (isApiError(error) && error.data?.message) {
          message = error.data.message;
        }
        break;
    }

    return showError({
      type,
      title,
      message,
      details: isApiError(error) ? JSON.stringify(error.data, null, 2) : error.stack,
      source,
    });
  }, [mapApiErrorToType, showError]);

  // Categorize errors by severity
  const criticalErrors = errors.filter(error => 
    ['authentication', 'server', 'maintenance'].includes(error.type)
  );
  
  const warningErrors = errors.filter(error => 
    ['network', 'timeout', 'rate-limit'].includes(error.type)
  );
  
  const infoErrors = errors.filter(error => 
    ['validation', 'not-found'].includes(error.type)
  );

  const value: ErrorContextValue = {
    errors,
    showError,
    dismissError,
    clearAllErrors,
    hasErrors: errors.length > 0,
    criticalErrors,
    warningErrors,
    infoErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

// Global error handler hook
export function useGlobalErrorHandler() {
  const { showError } = useErrorContext();

  const handleError = useCallback((error: any, source?: string) => {
    if (isApiError(error)) {
      const type = error.status === 401 ? 'authentication' :
                   error.status === 403 ? 'authorization' :
                   error.status === 404 ? 'not-found' :
                   error.status >= 500 ? 'server' : 'unknown';

      return showError({
        type,
        title: `${error.status} Error`,
        message: error.data?.message || error.message,
        details: JSON.stringify(error.data, null, 2),
        source,
      });
    }

    return showError({
      type: 'unknown',
      title: 'Unexpected Error',
      message: error.message || 'An unexpected error occurred',
      details: error.stack,
      source,
    });
  }, [showError]);

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    source?: string
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      handleError(error, source);
      return null;
    }
  }, [handleError]);

  const handleFormError = useCallback((error: any, source?: string) => {
    if (isApiError(error) && error.status === 422 && error.data?.details) {
      // Handle validation errors
      const fieldErrors = Array.isArray(error.data.details) 
        ? error.data.details.map((detail: any) => `${detail.field}: ${detail.message}`).join(', ')
        : 'Validation failed';

      return showError({
        type: 'validation',
        title: 'Form Validation Error',
        message: fieldErrors,
        source,
      });
    }

    return handleError(error, source);
  }, [handleError, showError]);

  return {
    handleError,
    handleAsyncError,
    handleFormError,
  };
}

// Error monitoring hook
export function useErrorMonitoring() {
  const { errors, criticalErrors, warningErrors } = useErrorContext();

  const getErrorStats = useCallback(() => {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentErrors = errors.filter(error => error.timestamp > lastHour);
    const dailyErrors = errors.filter(error => error.timestamp > lastDay);

    return {
      total: errors.length,
      critical: criticalErrors.length,
      warnings: warningErrors.length,
      recentCount: recentErrors.length,
      dailyCount: dailyErrors.length,
      errorRate: recentErrors.length / 60, // errors per minute
    };
  }, [errors, criticalErrors, warningErrors]);

  const getErrorsByType = useCallback(() => {
    const errorCounts: Record<ErrorType, number> = {} as Record<ErrorType, number>;
    
    errors.forEach(error => {
      errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
    });

    return errorCounts;
  }, [errors]);

  return {
    getErrorStats,
    getErrorsByType,
    hasRecentCriticalErrors: criticalErrors.some(
      error => error.timestamp > new Date(Date.now() - 5 * 60 * 1000)
    ),
  };
}