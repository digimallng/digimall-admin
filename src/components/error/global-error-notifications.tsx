'use client';

import React from 'react';
import { useErrorContext } from '@/providers/error-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  X,
  Shield,
  Wifi,
  Server,
  Clock,
  Ban,
  FileX,
  Bug,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatters';

const errorIcons = {
  network: Wifi,
  authentication: Shield,
  authorization: Ban,
  server: Server,
  timeout: Clock,
  validation: AlertCircle,
  'not-found': FileX,
  'rate-limit': AlertTriangle,
  maintenance: Server,
  unknown: Bug,
};

const errorColors = {
  network: 'border-orange-300 bg-orange-50 text-orange-800',
  authentication: 'border-red-300 bg-red-50 text-red-800',
  authorization: 'border-red-300 bg-red-50 text-red-800',
  server: 'border-red-300 bg-red-50 text-red-800',
  timeout: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  validation: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  'not-found': 'border-gray-300 bg-gray-50 text-gray-800',
  'rate-limit': 'border-orange-300 bg-orange-50 text-orange-800',
  maintenance: 'border-blue-300 bg-blue-50 text-blue-800',
  unknown: 'border-red-300 bg-red-50 text-red-800',
};

export function GlobalErrorNotifications() {
  const { errors, dismissError, clearAllErrors, hasErrors } = useErrorContext();

  if (!hasErrors) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {/* Clear All Button */}
      {errors.length > 1 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearAllErrors} className="text-xs">
            Clear All ({errors.length})
          </Button>
        </div>
      )}

      {/* Error Notifications */}
      {errors.map(error => {
        const Icon = errorIcons[error.type];
        const colorClass = errorColors[error.type];

        return (
          <Card
            key={error.id}
            className={`border-l-4 p-4 ${colorClass} animate-slide-in-right shadow-lg`}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h4 className="truncate text-sm font-medium">{error.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {error.type}
                  </Badge>
                </div>

                <p className="mb-2 text-sm opacity-90">{error.message}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-75">{formatRelativeTime(error.timestamp)}</span>

                  <div className="flex items-center gap-2">
                    {error.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={error.action.onClick}
                        className="h-6 px-2 text-xs"
                      >
                        {error.action.label}
                      </Button>
                    )}

                    <button
                      onClick={() => dismissError(error.id)}
                      className="text-current opacity-50 transition-opacity hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Error summary component for system monitoring
export function ErrorSummary() {
  const { criticalErrors, warningErrors, infoErrors } = useErrorContext();

  const totalErrors = criticalErrors.length + warningErrors.length + infoErrors.length;

  if (totalErrors === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">No active errors</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {criticalErrors.length > 0 && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{criticalErrors.length} Critical</span>
        </div>
      )}

      {warningErrors.length > 0 && (
        <div className="flex items-center gap-2 text-orange-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{warningErrors.length} Warnings</span>
        </div>
      )}

      {infoErrors.length > 0 && (
        <div className="flex items-center gap-2 text-blue-600">
          <Info className="h-4 w-4" />
          <span className="text-sm">{infoErrors.length} Info</span>
        </div>
      )}
    </div>
  );
}

// Error banner for critical system-wide errors
export function CriticalErrorBanner() {
  const { criticalErrors, dismissError } = useErrorContext();

  const activeCriticalError = criticalErrors[0]; // Show only the most recent critical error

  if (!activeCriticalError) return null;

  return (
    <div className="bg-red-600 p-4 text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-medium">{activeCriticalError.title}</div>
            <div className="text-sm opacity-90">{activeCriticalError.message}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeCriticalError.action && (
            <Button
              variant="outline"
              size="sm"
              onClick={activeCriticalError.action.onClick}
              className="border-white bg-white text-red-600 hover:bg-red-50"
            >
              {activeCriticalError.action.label}
            </Button>
          )}

          <button
            onClick={() => dismissError(activeCriticalError.id)}
            className="text-white transition-colors hover:text-red-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline error list for debugging/admin pages
export function ErrorLogView() {
  const { errors, dismissError, clearAllErrors } = useErrorContext();

  if (errors.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
        <h3 className="mb-1 font-medium text-gray-900">No Errors</h3>
        <p className="text-sm text-gray-600">System is running normally</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Error Log ({errors.length})</h3>
        <Button variant="outline" size="sm" onClick={clearAllErrors}>
          Clear All
        </Button>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {errors.map(error => {
          const Icon = errorIcons[error.type];

          return (
            <div key={error.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
              <Icon
                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                  ['authentication', 'authorization', 'server', 'unknown'].includes(error.type)
                    ? 'text-red-600'
                    : ['network', 'timeout', 'rate-limit'].includes(error.type)
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                }`}
              />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{error.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {error.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(error.timestamp)}
                  </span>
                </div>

                <p className="mb-1 text-sm text-gray-700">{error.message}</p>

                {error.source && <p className="text-xs text-gray-500">Source: {error.source}</p>}

                {error.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-blue-600">View Details</summary>
                    <pre className="mt-1 overflow-x-auto rounded border bg-white p-2 text-xs">
                      {error.details}
                    </pre>
                  </details>
                )}
              </div>

              <button
                onClick={() => dismissError(error.id)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
