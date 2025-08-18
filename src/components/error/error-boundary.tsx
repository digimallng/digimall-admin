'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service
    this.logErrorToService(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error tracking service
    console.error('Error Boundary Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      level: this.props.level || 'component',
    });
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component' } = this.props;
      const { error, retryCount } = this.state;

      return (
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${
                level === 'critical' 
                  ? 'bg-red-100 text-red-600'
                  : level === 'page'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {level === 'critical' && 'Critical Error Occurred'}
              {level === 'page' && 'Page Error'}
              {level === 'component' && 'Something went wrong'}
            </h2>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">
              {level === 'critical' && 
                'A critical error has occurred that requires immediate attention. Please contact support.'
              }
              {level === 'page' && 
                'An error occurred while loading this page. You can try refreshing or going back to the dashboard.'
              }
              {level === 'component' && 
                'An unexpected error occurred in this component. You can try again or refresh the page.'
              }
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Development Error Details</span>
                </div>
                <div className="text-sm text-gray-700 font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs whitespace-pre-wrap bg-white p-2 border rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Retry Information */}
            {retryCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  Retry attempt #{retryCount}
                  {retryCount >= 3 && ' - If the problem persists, please contact support.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {level !== 'critical' && retryCount < 5 && (
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}

              {level === 'page' && (
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
              )}

              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </div>

            {/* Support Information */}
            {(level === 'critical' || retryCount >= 3) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Need help? Contact support at{' '}
                  <a 
                    href="mailto:support@digimall.ng" 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    support@digimall.ng
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Error ID: {Date.now().toString(36)}
                </p>
              </div>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  level?: 'page' | 'component' | 'critical';
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export function ErrorBoundaryWrapper({ 
  children, 
  level = 'component',
  fallback,
  onError 
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary level={level} fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

// Hook for programmatic error handling
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    // In a real application, send to error tracking service
    // errorTrackingService.captureException(error, { context });
  };

  const handleAsyncError = async <T>(
    asyncOperation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  };

  return { handleError, handleAsyncError };
}