'use client';

import { AlertTriangle, Info, XCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SystemAlertProps {
  level: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp?: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

export function SystemAlert({
  level,
  title,
  message,
  timestamp,
  onDismiss,
  dismissible = false,
  className,
}: SystemAlertProps) {
  const getAlertConfig = () => {
    switch (level) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          dismissColor: 'text-green-600 hover:text-green-800',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          dismissColor: 'text-yellow-600 hover:text-yellow-800',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          dismissColor: 'text-red-600 hover:text-red-800',
        };
      default: // info
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          dismissColor: 'text-blue-600 hover:text-blue-800',
        };
    }
  };

  const config = getAlertConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-200',
        config.container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={cn('text-sm font-medium', config.titleColor)}>
                {title}
              </h4>
              <p className={cn('text-sm mt-1', config.messageColor)}>
                {message}
              </p>
              {timestamp && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(timestamp).toLocaleString()}
                </p>
              )}
            </div>
            
            {dismissible && onDismiss && (
              <button
                onClick={onDismiss}
                className={cn(
                  'ml-3 inline-flex rounded-md p-1.5 transition-colors',
                  config.dismissColor
                )}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}