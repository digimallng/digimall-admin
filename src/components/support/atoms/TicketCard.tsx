import { SupportTicket } from '@/lib/api/types';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { ChannelIcon } from './ChannelIcon';
import { formatDistanceToNow } from 'date-fns';
import { Eye, MessageSquare, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TicketCardProps {
  ticket: SupportTicket;
  onClick?: () => void;
  onAssign?: () => void;
  onResolve?: () => void;
  className?: string;
  delay?: number;
}

export function TicketCard({ 
  ticket, 
  onClick, 
  onAssign, 
  onResolve, 
  className,
  delay = 0 
}: TicketCardProps) {
  const isOverdue = ticket.slaBreached;
  const hasResponses = ticket.responses && ticket.responses.length > 0;
  
  return (
    <AnimatedCard delay={delay} className={className}>
      <div className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-sm',
        isOverdue && 'border-l-4 border-l-red-500'
      )} onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ChannelIcon channel={ticket.channel} className="flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {ticket.subject}
              </h3>
              <p className="text-sm text-gray-600">#{ticket.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {ticket.description}
        </p>

        {/* Customer and Agent Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <User size={14} />
            <span>{ticket.customerName || ticket.customerEmail}</span>
          </div>
          {ticket.assignedAgentId && (
            <div className="text-sm text-gray-500">
              Assigned to: <span className="font-medium">Agent</span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
            {hasResponses && (
              <div className="flex items-center gap-1">
                <MessageSquare size={12} />
                <span>{ticket.responses.length} responses</span>
              </div>
            )}
            {ticket.escalationLevel > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">
                Escalated L{ticket.escalationLevel}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Eye size={12} />
              <span>View</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {ticket.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{ticket.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons for Quick Actions */}
        {(ticket.status === 'open' || ticket.status === 'in_progress') && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {ticket.status === 'open' && !ticket.assignedAgentId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign?.();
                }}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded font-medium transition-colors"
              >
                Assign
              </button>
            )}
            {ticket.status === 'in_progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve?.();
                }}
                className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded font-medium transition-colors"
              >
                Resolve
              </button>
            )}
          </div>
        )}

        {/* SLA Warning */}
        {isOverdue && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <span className="text-red-800 font-medium">SLA Breached</span>
            <span className="text-red-600 ml-2">
              Response time exceeded
            </span>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}