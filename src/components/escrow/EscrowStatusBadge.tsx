import { EscrowStatus } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  RefreshCw,
  Calendar,
  Ban
} from 'lucide-react';

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig = {
  [EscrowStatus.CREATED]: {
    label: 'Created',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock,
  },
  [EscrowStatus.FUNDED]: {
    label: 'Funded',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Shield,
  },
  [EscrowStatus.ACTIVE]: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  [EscrowStatus.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  [EscrowStatus.RELEASED]: {
    label: 'Released',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  [EscrowStatus.REFUNDED]: {
    label: 'Refunded',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: RefreshCw,
  },
  [EscrowStatus.DISPUTED]: {
    label: 'Disputed',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
  },
  [EscrowStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Ban,
  },
  [EscrowStatus.EXPIRED]: {
    label: 'Expired',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Calendar,
  },
};

export function EscrowStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true 
}: EscrowStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertTriangle,
  };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge 
      className={`
        inline-flex items-center gap-1.5 font-medium border
        ${config.color} 
        ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}