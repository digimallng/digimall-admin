'use client';

import { CheckCircle, XCircle, AlertTriangle, Clock, Loader } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SystemStatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'offline' | 'maintenance' | 'loading' | 'unknown';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showPulse?: boolean;
  className?: string;
}

export function SystemStatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  showPulse = false,
  className,
}: SystemStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          pulseColor: 'bg-green-400',
          text: label || 'Healthy',
        };
      case 'warning':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600',
          pulseColor: 'bg-yellow-400',
          text: label || 'Warning',
        };
      case 'critical':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
          pulseColor: 'bg-red-400',
          text: label || 'Critical',
        };
      case 'offline':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
          pulseColor: 'bg-red-400',
          text: label || 'Offline',
        };
      case 'maintenance':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          iconColor: 'text-blue-600',
          pulseColor: 'bg-blue-400',
          text: label || 'Maintenance',
        };
      case 'loading':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Loader,
          iconColor: 'text-gray-600',
          pulseColor: 'bg-gray-400',
          text: label || 'Loading',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          iconColor: 'text-gray-600',
          pulseColor: 'bg-gray-400',
          text: label || 'Unknown',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn('relative inline-flex items-center gap-2', className)}>
      {showPulse && (
        <span className="absolute -inset-1 opacity-75 rounded-full animate-ping">
          <span className={cn('inline-flex h-full w-full rounded-full', config.pulseColor)} />
        </span>
      )}
      
      <div
        className={cn(
          'inline-flex items-center gap-1.5 font-medium border rounded-full',
          config.color,
          getSizeClasses()
        )}
      >
        {showIcon && (
          <Icon
            className={cn(
              getIconSize(),
              config.iconColor,
              status === 'loading' && 'animate-spin'
            )}
          />
        )}
        <span className="capitalize">{config.text}</span>
      </div>
    </div>
  );
}