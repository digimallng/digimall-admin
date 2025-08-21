'use client';

import { useState } from 'react';
import { useSupportTicket } from '@/lib/hooks/use-support';
import { SupportTicket, TicketStatus, TicketPriority } from '@/lib/api/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { PriorityBadge, StatusBadge, ChannelIcon, SatisfactionRating } from './atoms';
import { TicketActionsModal } from './TicketActionsModal';
import { TicketResponseForm } from './TicketResponseForm';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Send,
  Edit,
  Flag,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface TicketDetailsProps {
  ticketId: string;
  onClose?: () => void;
  onTicketUpdate?: (ticket: SupportTicket) => void;
  className?: string;
}

export function TicketDetails({ 
  ticketId, 
  onClose, 
  onTicketUpdate, 
  className 
}: TicketDetailsProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [currentAction, setCurrentAction] = useState<'priority' | 'status' | 'escalate' | 'assign' | null>(null);

  const { data: ticket, isLoading, error, refetch } = useSupportTicket(ticketId);

  const handleTicketUpdate = (updatedTicket: SupportTicket) => {
    onTicketUpdate?.(updatedTicket);
    refetch();
  };

  const handleResponseSuccess = () => {
    setShowResponseForm(false);
    refetch();
  };

  const handleActionClose = () => {
    setCurrentAction(null);
  };

  const handleTakeTicket = () => {
    setCurrentAction('assign');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <ErrorMessage
        title="Failed to load ticket"
        message="There was an error loading the ticket details. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  const isAssigned = ticket.assignedTo;
  const canResolve = ticket.status === TicketStatus.IN_PROGRESS;
  const canReopen = ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED;

  return (
    <div className={cn('bg-white h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
              {ticket.subject}
            </h2>
            <span className="text-sm text-gray-500">#{ticket.id.slice(-8)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Ticket Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
            <div className="mt-1">
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</label>
            <div className="mt-1">
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</label>
            <div className="mt-1 flex items-center gap-2">
              <ChannelIcon channel={ticket.channel} />
              <span className="text-sm text-gray-900 capitalize">{ticket.channel}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</label>
            <div className="mt-1">
              <span className="text-sm text-gray-900 capitalize">
                {ticket.category.replace(/_/g, ' ').toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {ticket.customerName?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{ticket.customerName || 'Unknown Customer'}</h3>
            <p className="text-sm text-gray-600">{ticket.customerEmail}</p>
          </div>
          {ticket.assignedTo && (
            <div className="text-right">
              <div className="text-xs font-medium text-gray-500">Assigned to</div>
              <div className="text-sm text-gray-900">{ticket.assignedTo}</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {!isAssigned && (
            <Button
              onClick={handleTakeTicket}
              size="sm"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Take Ticket
            </Button>
          )}
          
          <Button
            onClick={() => setCurrentAction('assign')}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {isAssigned ? 'Reassign' : 'Assign'}
          </Button>

          <Button
            onClick={() => setCurrentAction('priority')}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Flag className="h-4 w-4" />
            Priority
          </Button>

          <Button
            onClick={() => setCurrentAction('status')}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Status
          </Button>

          <Button
            onClick={() => setCurrentAction('escalate')}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Escalate
          </Button>

          <Button
            onClick={() => setShowResponseForm(!showResponseForm)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {showResponseForm ? 'Cancel' : 'Respond'}
          </Button>
        </div>
      </div>

      {/* Response Form */}
      {showResponseForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <TicketResponseForm
            ticket={ticket}
            onSuccess={handleResponseSuccess}
          />
        </div>
      )}

      {/* Ticket Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Original Message */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {ticket.customerName?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{ticket.customerName}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy at h:mm a')}
                  </span>
                  <Eye className="h-4 w-4 text-blue-600" title="Public message" />
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {ticket.description}
                </div>
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {ticket.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Responses */}
          {ticket.responses && ticket.responses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Responses</h3>
              {ticket.responses.map((response, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border',
                    response.isPublic
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold',
                      response.isPublic ? 'bg-green-500' : 'bg-gray-500'
                    )}>
                      {response.authorName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {response.authorName || 'Support Agent'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(response.createdAt), 'MMM d, yyyy at h:mm a')}
                        </span>
                        {response.isPublic ? (
                          <Eye className="h-4 w-4 text-green-600" title="Public response" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-600" title="Internal note" />
                        )}
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        {response.content}
                      </div>
                      {response.attachments && response.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {response.attachments.map((attachment, attachIndex) => (
                            <div
                              key={attachIndex}
                              className="flex items-center gap-2 p-2 bg-white rounded border"
                            >
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{attachment.name}</span>
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer Satisfaction */}
          {ticket.satisfaction && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Customer Satisfaction</h4>
              <div className="flex items-center gap-4">
                <SatisfactionRating rating={ticket.satisfaction.rating} readonly />
                {ticket.satisfaction.feedback && (
                  <p className="text-sm text-gray-600">"{ticket.satisfaction.feedback}"</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Modal */}
      <TicketActionsModal
        ticket={ticket}
        action={currentAction}
        isOpen={currentAction !== null}
        onClose={handleActionClose}
        onSuccess={handleTicketUpdate}
      />
    </div>
  );
}