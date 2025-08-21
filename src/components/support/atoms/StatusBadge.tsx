import { TicketStatus, AgentStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

interface StatusBadgeProps {
  status: TicketStatus | AgentStatus | string;
  type?: 'ticket' | 'agent';
  className?: string;
}

const ticketStatusConfig = {
  [TicketStatus.OPEN]: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Open',
  },
  [TicketStatus.IN_PROGRESS]: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'In Progress',
  },
  [TicketStatus.PENDING_CUSTOMER]: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Pending Customer',
  },
  [TicketStatus.RESOLVED]: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Resolved',
  },
  [TicketStatus.CLOSED]: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Closed',
  },
  [TicketStatus.ESCALATED]: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Escalated',
  },
  [TicketStatus.ON_HOLD]: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'On Hold',
  },
};

const agentStatusConfig = {
  [AgentStatus.AVAILABLE]: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Available',
  },
  [AgentStatus.BUSY]: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'Busy',
  },
  [AgentStatus.AWAY]: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Away',
  },
  [AgentStatus.OFFLINE]: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Offline',
  },
  [AgentStatus.IN_TRAINING]: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'In Training',
  },
};

export function StatusBadge({ status, type = 'ticket', className }: StatusBadgeProps) {
  const config = type === 'agent' 
    ? agentStatusConfig[status as AgentStatus] 
    : ticketStatusConfig[status as TicketStatus];

  // Fallback for unknown statuses
  const fallbackConfig = {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  };

  const finalConfig = config || fallbackConfig;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        finalConfig.color,
        className
      )}
    >
      {finalConfig.label}
    </span>
  );
}