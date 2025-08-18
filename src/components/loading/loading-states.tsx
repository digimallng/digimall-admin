'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Loader2, RefreshCw, Database, Wifi, AlertCircle, Clock } from 'lucide-react';

// Basic loading spinner
export function LoadingSpinner({ 
  size = 'default',
  className = '' 
}: { 
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Inline loading with text
export function InlineLoading({ 
  text = 'Loading...',
  size = 'default'
}: {
  text?: string;
  size?: 'sm' | 'default' | 'lg';
}) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} />
      <span className={`text-gray-600 ${
        size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
      }`}>
        {text}
      </span>
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton({ 
  rows = 3,
  showHeader = true,
  className = ''
}: {
  rows?: number;
  showHeader?: boolean;
  className?: string;
}) {
  return (
    <Card className={`p-6 ${className}`}>
      {showHeader && (
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </Card>
  );
}

// Table loading skeleton
export function TableSkeleton({ 
  rows = 5,
  columns = 4,
  showHeader = true
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {showHeader && (
          <thead>
            <tr className="border-b border-gray-200">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="text-left py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Stats cards loading skeleton
export function StatsCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Dashboard loading state
export function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <StatsCardSkeleton />

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton rows={6} />
        <CardSkeleton rows={6} />
      </div>

      {/* Table skeleton */}
      <Card className="p-6">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <TableSkeleton />
      </Card>
    </div>
  );
}

// Full page loading
export function FullPageLoading({ 
  message = 'Loading...',
  submessage,
  showProgress = false,
  progress = 0
}: {
  message?: string;
  submessage?: string;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <LoadingSpinner size="lg" className="text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
          {submessage && (
            <p className="text-gray-600">{submessage}</p>
          )}
        </div>

        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          Please wait while we load your data...
        </div>
      </div>
    </div>
  );
}

// Data loading states
export function DataLoadingState({ 
  type = 'default',
  message,
  icon: Icon,
  retry
}: {
  type?: 'default' | 'empty' | 'error' | 'slow' | 'offline';
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  retry?: () => void;
}) {
  const getConfig = () => {
    switch (type) {
      case 'empty':
        return {
          icon: Database,
          message: message || 'No data available',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100'
        };
      case 'error':
        return {
          icon: AlertCircle,
          message: message || 'Failed to load data',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'slow':
        return {
          icon: Clock,
          message: message || 'This is taking longer than usual...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'offline':
        return {
          icon: Wifi,
          message: message || 'No internet connection',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      default:
        return {
          icon: Loader2,
          message: message || 'Loading data...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
    }
  };

  const config = getConfig();
  const IconComponent = Icon || config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
        <IconComponent className={`w-6 h-6 ${config.color} ${type === 'default' ? 'animate-spin' : ''}`} />
      </div>
      <p className={`text-center ${config.color} mb-4`}>
        {config.message}
      </p>
      {retry && type === 'error' && (
        <button
          onClick={retry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// Loading overlay
export function LoadingOverlay({ 
  visible,
  message = 'Loading...',
  blocking = true
}: {
  visible: boolean;
  message?: string;
  blocking?: boolean;
}) {
  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      blocking ? 'bg-black bg-opacity-50' : 'bg-white bg-opacity-75'
    }`}>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-gray-900">{message}</span>
        </div>
      </div>
    </div>
  );
}

// Suspense fallback components
export function SuspenseFallback({ level = 'component' }: { level?: 'page' | 'component' | 'section' }) {
  if (level === 'page') {
    return <DashboardLoading />;
  }
  
  if (level === 'section') {
    return <CardSkeleton rows={4} />;
  }
  
  return (
    <div className="flex items-center justify-center py-8">
      <InlineLoading text="Loading component..." />
    </div>
  );
}