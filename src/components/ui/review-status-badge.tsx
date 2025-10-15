/**
 * Review Status Badge Component
 *
 * Color-coded status badges for review statuses.
 */

import { Badge } from './badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReviewStatus } from '@/lib/api/types/reviews.types';

interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    variant: 'outline' as const,
    className: 'border-yellow-500 text-yellow-700 bg-yellow-50',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    variant: 'outline' as const,
    className: 'border-green-500 text-green-700 bg-green-50',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    variant: 'outline' as const,
    className: 'border-red-500 text-red-700 bg-red-50',
    icon: XCircle,
  },
  FLAGGED: {
    label: 'Flagged',
    variant: 'outline' as const,
    className: 'border-orange-500 text-orange-700 bg-orange-50',
    icon: AlertTriangle,
  },
};

export function ReviewStatusBadge({
  status,
  className,
  showIcon = true,
}: ReviewStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
