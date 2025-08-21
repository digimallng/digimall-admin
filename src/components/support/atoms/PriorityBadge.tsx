import { TicketPriority } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const priorityConfig = {
  [TicketPriority.CRITICAL]: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Critical',
  },
  [TicketPriority.URGENT]: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Urgent',
  },
  [TicketPriority.HIGH]: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'High',
  },
  [TicketPriority.MEDIUM]: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Medium',
  },
  [TicketPriority.LOW]: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Low',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}