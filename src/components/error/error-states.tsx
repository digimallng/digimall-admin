'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Shield, 
  Server, 
  Clock,
  Ban,
  FileX,
  Bug,
  AlertCircle,
  XCircle,
  Home,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

export type ErrorType = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'server'
  | 'timeout'
  | 'validation'
  | 'not-found'
  | 'rate-limit'
  | 'maintenance'
  | 'unknown';

interface ErrorStateProps {
  type: ErrorType;
  message?: string;
  details?: string;
  retry?: () => void;
  goBack?: () => void;
  goHome?: () => void;
  showDetails?: boolean;
  className?: string;
}

const errorConfigs = {
  network: {
    icon: Wifi,
    title: 'Connection Problem',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Wait a moment and try again'
    ]
  },
  authentication: {
    icon: Shield,
    title: 'Authentication Required',
    defaultMessage: 'Your session has expired. Please log in again.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    suggestions: [
      'Log in to your account',
      'Check your credentials',
      'Contact support if the problem persists'
    ]
  },
  authorization: {
    icon: Ban,
    title: 'Access Denied',
    defaultMessage: 'You do not have permission to access this resource.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    suggestions: [
      'Contact your administrator for access',
      'Verify you are logged into the correct account',
      'Go back to the previous page'
    ]
  },
  server: {
    icon: Server,
    title: 'Server Error',
    defaultMessage: 'A server error occurred. Our team has been notified.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    suggestions: [
      'Try refreshing the page',
      'Wait a few minutes and try again',
      'Contact support if the issue persists'
    ]
  },
  timeout: {
    icon: Clock,
    title: 'Request Timeout',
    defaultMessage: 'The request took too long to complete.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    suggestions: [
      'Check your internet connection',
      'Try the request again',
      'Reduce the amount of data being requested'
    ]
  },
  validation: {
    icon: AlertCircle,
    title: 'Validation Error',
    defaultMessage: 'The provided data is invalid or incomplete.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    suggestions: [
      'Check all required fields',
      'Verify the format of your data',
      'Review any error messages below'
    ]
  },
  'not-found': {
    icon: FileX,
    title: 'Not Found',
    defaultMessage: 'The requested resource could not be found.',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    suggestions: [
      'Check the URL for typos',
      'Go back to the previous page',
      'Use the navigation menu to find what you need'
    ]
  },
  'rate-limit': {
    icon: AlertTriangle,
    title: 'Rate Limit Exceeded',
    defaultMessage: 'Too many requests. Please wait before trying again.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    suggestions: [
      'Wait a few minutes before trying again',
      'Reduce the frequency of your requests',
      'Contact support for higher limits'
    ]
  },
  maintenance: {
    icon: Server,
    title: 'System Maintenance',
    defaultMessage: 'The system is currently under maintenance. Please try again later.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    suggestions: [
      'Check back in a few minutes',
      'Follow our status page for updates',
      'Contact support for urgent matters'
    ]
  },
  unknown: {
    icon: Bug,
    title: 'Unexpected Error',
    defaultMessage: 'An unexpected error occurred. Please try again.',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the problem persists'
    ]
  }
};

export function ErrorState({
  type,
  message,
  details,
  retry,
  goBack,
  goHome,
  showDetails = false,
  className = ''
}: ErrorStateProps) {
  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <Card className={`p-8 max-w-2xl mx-auto ${className}`}>
      <div className="text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-4 rounded-full ${config.bgColor}`}>
            <Icon className={`w-8 h-8 ${config.color}`} />
          </div>
        </div>

        {/* Error Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {config.title}
        </h2>

        {/* Error Message */}
        <p className="text-gray-600 mb-6">
          {message || config.defaultMessage}
        </p>

        {/* Error Details */}
        {details && showDetails && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">Error Details</span>
            </div>
            <div className="text-sm text-gray-700">
              {details}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-blue-900 mb-2">Suggestions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {config.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {retry && (
            <Button
              onClick={retry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}

          {goBack && (
            <Button
              variant="outline"
              onClick={goBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          )}

          {goHome && (
            <Button
              variant="outline"
              onClick={goHome}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          )}

          {type === 'maintenance' && (
            <Button
              variant="outline"
              onClick={() => window.open('https://status.digimall.ng', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Status Page
            </Button>
          )}
        </div>

        {/* Support Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Still having trouble? Contact support at{' '}
            <a 
              href="mailto:support@digimall.ng" 
              className="text-blue-600 hover:text-blue-800"
            >
              support@digimall.ng
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Error Code: {type.toUpperCase()}-{Date.now().toString(36)}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Specific error components for common use cases
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      type="network"
      retry={onRetry}
      goBack={() => window.history.back()}
    />
  );
}

export function AuthenticationError() {
  return (
    <ErrorState
      type="authentication"
      goHome={() => window.location.href = '/auth/login'}
    />
  );
}

export function AuthorizationError() {
  return (
    <ErrorState
      type="authorization"
      goBack={() => window.history.back()}
      goHome={() => window.location.href = '/dashboard'}
    />
  );
}

export function NotFoundError() {
  return (
    <ErrorState
      type="not-found"
      goBack={() => window.history.back()}
      goHome={() => window.location.href = '/dashboard'}
    />
  );
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      type="server"
      retry={onRetry}
      goBack={() => window.history.back()}
    />
  );
}

// Inline error message
export function InlineError({
  message,
  type = 'validation',
  onDismiss
}: {
  message: string;
  type?: ErrorType;
  onDismiss?: () => void;
}) {
  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      type === 'validation' ? 'bg-yellow-50 border-yellow-200' :
      type === 'network' ? 'bg-orange-50 border-orange-200' :
      'bg-red-50 border-red-200'
    }`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
      <span className={`text-sm flex-1 ${config.color.replace('600', '800')}`}>
        {message}
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${config.color} hover:${config.color.replace('600', '800')}`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Form field error
export function FieldError({ 
  message,
  className = ''
}: { 
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 mt-1 ${className}`}>
      <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
      <span className="text-xs text-red-600">{message}</span>
    </div>
  );
}

// Toast error (for use with toast libraries)
export function ToastError({
  title,
  message,
  type = 'unknown',
  action
}: {
  title?: string;
  message: string;
  type?: ErrorType;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3">
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.color} mt-0.5`} />
      <div className="flex-1">
        {title && (
          <div className="font-medium text-gray-900 mb-1">{title}</div>
        )}
        <div className="text-sm text-gray-600">{message}</div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}