import { useState } from 'react';
import { 
  useSupportTicket
} from '@/lib/hooks/use-support';
import { 
  SupportTicket, 
  TicketStatus, 
  TicketPriority
} from '@/lib/api/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { PriorityBadge, StatusBadge, ChannelIcon, SatisfactionRating } from './atoms';
import { TicketActionsModal } from './TicketActionsModal';
import { TicketResponseForm } from './TicketResponseForm';
import { 
  X, 
  User, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Paperclip, 
  Send,
  Edit,
  Flag,
  UserPlus,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink
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

  const handleAddResponse = async () => {
    if (!responseContent.trim()) return;

    const responseData: TicketResponseRequest = {
      content: responseContent,
      responseType,
      notifyCustomer: responseType === 'public',
    };

    await addResponseMutation.mutateAsync({
      ticketId,
      data: responseData,
    });

    setResponseContent('');
    setShowResponseForm(false);
    refetch();
  };

  const handleStatusUpdate = async (status: TicketStatus) => {
    await updateTicketMutation.mutateAsync({
      ticketId,
      data: { status },
    });
    refetch();
  };

  const handlePriorityUpdate = async (priority: TicketPriority) => {
    await updateTicketMutation.mutateAsync({
      ticketId,
      data: { priority },
    });
    refetch();
  };

  const handleEscalate = async (reason: EscalationReason, notes: string) => {
    await escalateTicketMutation.mutateAsync({
      ticketId,
      data: { reason, notes },
    });
    setShowEscalationForm(false);
    refetch();
  };

  const handleAssign = async (agentId: string) => {
    await assignTicketMutation.mutateAsync({
      ticketId,
      data: { assignedAgentId: agentId },
    });
    setShowAssignForm(false);
    refetch();
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

  const canResolve = ticket.status === TicketStatus.IN_PROGRESS;
  const canReopen = ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED;

  return (
    <div className={cn('bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <ChannelIcon channel={ticket.channel} size={24} />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{ticket.subject}</h1>
            <p className="text-sm text-gray-600">Ticket #{ticket.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Ticket Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="mt-1">
                  <StatusBadge status={ticket.status} />
                </div>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <div className="mt-1">
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
              <div>
                <span className="text-gray-600">Channel:</span>
                <div className="flex items-center gap-2 mt-1">
                  <ChannelIcon channel={ticket.channel} size={16} />
                  <span className="capitalize">{ticket.channel.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="mt-1 capitalize">{ticket.category.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="mt-1">{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <p className="mt-1">{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</p>
              </div>
              {ticket.assignedAgentId && (
                <div>
                  <span className="text-gray-600">Assigned to:</span>
                  <p className="mt-1">Agent {ticket.assignedAgentId}</p>
                </div>
              )}
              {ticket.resolvedAt && (
                <div>
                  <span className="text-gray-600">Resolved:</span>
                  <p className="mt-1">{format(new Date(ticket.resolvedAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p className="mt-1">{ticket.customerName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="mt-1">{ticket.customerEmail || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Customer ID:</span>
                <p className="mt-1">{ticket.customerId || 'Guest'}</p>
              </div>
              {ticket.orderId && (
                <div>
                  <span className="text-gray-600">Related Order:</span>
                  <p className="mt-1 flex items-center gap-1">
                    {ticket.orderId}
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {ticket.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{attachment}</span>
                    <button className="ml-auto text-blue-600 hover:text-blue-800 text-sm">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {ticket.internalNotes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Internal Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.internalNotes}</p>
              </div>
            </div>
          )}

          {/* Response History */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Response History ({ticket.responses?.length || 0})
            </h3>
            
            {ticket.responses && ticket.responses.length > 0 ? (
              <div className="space-y-4">
                {ticket.responses.map((response, index) => (
                  <div
                    key={response.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      response.responseType === 'internal'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-white border-gray-200'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {response.agentName || 'Agent'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(response.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          response.responseType === 'internal'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        )}
                      >
                        {response.responseType === 'internal' ? 'Internal' : 'Public'}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{response.content}</p>
                    
                    {response.attachments && response.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Attachments:</p>
                        <div className="space-y-1">
                          {response.attachments.map((attachment, attachIndex) => (
                            <div key={attachIndex} className="flex items-center gap-2">
                              <Paperclip className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{attachment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No responses yet</p>
              </div>
            )}
          </div>

          {/* Add Response */}
          {!showResponseForm ? (
            <button
              onClick={() => setShowResponseForm(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Add Response
            </button>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <h4 className="font-medium text-gray-900">Add Response</h4>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="public"
                      checked={responseType === 'public'}
                      onChange={(e) => setResponseType(e.target.value as 'public' | 'internal')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Public</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="internal"
                      checked={responseType === 'internal'}
                      onChange={(e) => setResponseType(e.target.value as 'public' | 'internal')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Internal</span>
                  </label>
                </div>
              </div>
              
              <textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                placeholder={`Type your ${responseType} response here...`}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseContent('');
                  }}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddResponse}
                    disabled={!responseContent.trim() || addResponseMutation.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {addResponseMutation.isPending ? 'Sending...' : 'Send Response'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 lg:border-l border-gray-200 p-6">
          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {ticket.status === TicketStatus.OPEN && (
                <button
                  onClick={() => handleStatusUpdate(TicketStatus.IN_PROGRESS)}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Take Ticket
                </button>
              )}
              
              {canResolve && (
                <button
                  onClick={() => handleStatusUpdate(TicketStatus.RESOLVED)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
              
              {canReopen && (
                <button
                  onClick={() => handleStatusUpdate(TicketStatus.IN_PROGRESS)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reopen Ticket
                </button>
              )}
              
              <button
                onClick={() => setShowEscalationForm(true)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Flag className="h-4 w-4" />
                Escalate
              </button>
              
              {!ticket.assignedAgentId && (
                <button
                  onClick={() => setShowAssignForm(true)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign Agent
                </button>
              )}
            </div>
          </div>

          {/* Priority Update */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Update Priority</h3>
            <div className="space-y-2">
              {Object.values(TicketPriority).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityUpdate(priority)}
                  disabled={ticket.priority === priority}
                  className={cn(
                    'w-full text-left py-2 px-3 rounded border transition-colors',
                    ticket.priority === priority
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <PriorityBadge priority={priority} />
                </button>
              ))}
            </div>
          </div>

          {/* SLA Information */}
          {ticket.slaBreached && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">SLA Breached</span>
                </div>
                <p className="text-sm text-red-700">
                  This ticket has exceeded the response time SLA. Immediate attention required.
                </p>
              </div>
            </div>
          )}

          {/* Escalation Information */}
          {ticket.escalationLevel > 0 && (
            <div className="mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    Escalated (Level {ticket.escalationLevel})
                  </span>
                </div>
                <p className="text-sm text-orange-700">
                  This ticket has been escalated and requires senior attention.
                </p>
              </div>
            </div>
          )}

          {/* Follow-up Date */}
          {ticket.followUpDate && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Follow-up</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {format(new Date(ticket.followUpDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Ticket Created</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {ticket.firstResponseAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">First Response</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ticket.firstResponseAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}

              {ticket.assignedAgentId && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Assigned to Agent</p>
                    <p className="text-xs text-gray-500">Agent {ticket.assignedAgentId}</p>
                  </div>
                </div>
              )}

              {ticket.escalationLevel > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Flag className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Escalated</p>
                    <p className="text-xs text-gray-500">Level {ticket.escalationLevel}</p>
                  </div>
                </div>
              )}

              {ticket.resolvedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Resolved</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ticket.resolvedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Modal - Simple placeholder */}
      {showEscalationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Escalate Ticket</h3>
            <textarea
              placeholder="Escalation notes..."
              className="w-full h-20 p-3 border rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowEscalationForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEscalate(EscalationReason.TECHNICAL_COMPLEXITY, 'Escalation required')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal - Simple placeholder */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Ticket</h3>
            <select className="w-full p-3 border rounded-lg mb-4">
              <option>Select Agent...</option>
              <option value="agent1">Agent 1</option>
              <option value="agent2">Agent 2</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAssignForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign('agent1')}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}