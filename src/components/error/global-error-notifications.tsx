'use client';

import React from 'react';
import { useErrorContext } from '@/providers/error-provider';
import { Card } from '@/components/ui/Card';
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
  Info
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
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllErrors}
            className="text-xs"
          >
            Clear All ({errors.length})
          </Button>
        </div>
      )}

      {/* Error Notifications */}
      {errors.map((error) => {
        const Icon = errorIcons[error.type];
        const colorClass = errorColors[error.type];

        return (
          <Card key={error.id} className={`p-4 border-l-4 ${colorClass} shadow-lg animate-slide-in-right`}>
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{error.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {error.type}
                  </Badge>
                </div>
                
                <p className="text-sm opacity-90 mb-2">{error.message}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-75">
                    {formatRelativeTime(error.timestamp)}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {error.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={error.action.onClick}
                        className="text-xs h-6 px-2"
                      >
                        {error.action.label}
                      </Button>
                    )}
                    
                    <button
                      onClick={() => dismissError(error.id)}
                      className="text-current opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
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
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">No active errors</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {criticalErrors.length > 0 && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">{criticalErrors.length} Critical</span>
        </div>
      )}
      
      {warningErrors.length > 0 && (
        <div className="flex items-center gap-2 text-orange-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{warningErrors.length} Warnings</span>
        </div>
      )}
      
      {infoErrors.length > 0 && (
        <div className="flex items-center gap-2 text-blue-600">
          <Info className="w-4 h-4" />
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
    <div className="bg-red-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
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
              className="text-red-600 border-white bg-white hover:bg-red-50"
            >
              {activeCriticalError.action.label}
            </Button>
          )}
          
          <button
            onClick={() => dismissError(activeCriticalError.id)}
            className="text-white hover:text-red-200 transition-colors"
          >
            <X className="w-5 h-5" />
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
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900 mb-1">No Errors</h3>
        <p className="text-gray-600 text-sm">System is running normally</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">Error Log ({errors.length})</h3>
        <Button variant="outline" size="sm" onClick={clearAllErrors}>
          Clear All
        </Button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {errors.map((error) => {
          const Icon = errorIcons[error.type];
          
          return (
            <div key={error.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                ['authentication', 'authorization', 'server', 'unknown'].includes(error.type) 
                  ? 'text-red-600' 
                  : ['network', 'timeout', 'rate-limit'].includes(error.type)
                  ? 'text-orange-600'
                  : 'text-yellow-600'
              }`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{error.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {error.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(error.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-1">{error.message}</p>
                
                {error.source && (
                  <p className="text-xs text-gray-500">Source: {error.source}</p>
                )}
                
                {error.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer">
                      View Details
                    </summary>
                    <pre className="mt-1 text-xs bg-white p-2 border rounded overflow-x-auto">
                      {error.details}
                    </pre>
                  </details>
                )}
              </div>
              
              <button
                onClick={() => dismissError(error.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}