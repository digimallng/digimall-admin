'use client';

import { useState } from 'react';
import { 
  useUpdateSupportTicket, 
  useEscalateTicket, 
  useAssignTicket,
  useSupportAgents 
} from '@/lib/hooks/use-support';
import { 
  TicketPriority, 
  TicketStatus, 
  EscalationReason,
  SupportTicket 
} from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SimpleSelect as Select } from '@/components/ui/SimpleSelect';
import { Modal } from '@/components/ui/Modal';
import { 
  X, 
  AlertTriangle, 
  UserPlus, 
  Edit, 
  Flag,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TicketActionsModalProps {
  ticket: SupportTicket;
  action: 'priority' | 'status' | 'escalate' | 'assign' | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedTicket: SupportTicket) => void;
}

export function TicketActionsModal({ 
  ticket, 
  action, 
  isOpen, 
  onClose, 
  onSuccess 
}: TicketActionsModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [notes, setNotes] = useState('');

  const updateTicketMutation = useUpdateSupportTicket();
  const escalateTicketMutation = useEscalateTicket();
  const assignTicketMutation = useAssignTicket();
  const { data: agents } = useSupportAgents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let result;

      switch (action) {
        case 'priority':
          result = await updateTicketMutation.mutateAsync({
            ticketId: ticket.id,
            data: { 
              priority: formData.priority,
              notes: notes || `Priority updated to ${formData.priority}`
            }
          });
          break;

        case 'status':
          result = await updateTicketMutation.mutateAsync({
            ticketId: ticket.id,
            data: { 
              status: formData.status,
              notes: notes || `Status updated to ${formData.status}`
            }
          });
          break;

        case 'escalate':
          result = await escalateTicketMutation.mutateAsync({
            ticketId: ticket.id,
            data: {
              reason: formData.reason || EscalationReason.COMPLEX_ISSUE,
              notes: notes || 'Ticket escalated for further review',
              escalatedToTeam: formData.escalatedToTeam,
              priority: formData.newPriority || ticket.priority
            }
          });
          break;

        case 'assign':
          if (formData.agentId === 'unassign') {
            result = await updateTicketMutation.mutateAsync({
              ticketId: ticket.id,
              data: { 
                assignedTo: null,
                notes: notes || 'Ticket unassigned'
              }
            });
          } else {
            result = await assignTicketMutation.mutateAsync({
              ticketId: ticket.id,
              data: {
                agentId: formData.agentId,
                notes: notes || `Ticket assigned to agent ${formData.agentId}`
              }
            });
          }
          break;
      }

      onSuccess?.(result);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const resetForm = () => {
    setFormData({});
    setNotes('');
  };

  const priorityOptions = [
    { value: TicketPriority.LOW, label: 'Low' },
    { value: TicketPriority.MEDIUM, label: 'Medium' },
    { value: TicketPriority.HIGH, label: 'High' },
    { value: TicketPriority.URGENT, label: 'Urgent' }
  ];

  const statusOptions = [
    { value: TicketStatus.OPEN, label: 'Open' },
    { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TicketStatus.PENDING_CUSTOMER, label: 'Pending Customer' },
    { value: TicketStatus.RESOLVED, label: 'Resolved' },
    { value: TicketStatus.CLOSED, label: 'Closed' }
  ];

  const escalationReasons = [
    { value: EscalationReason.COMPLEX_ISSUE, label: 'Complex Issue' },
    { value: EscalationReason.HIGH_PRIORITY_CUSTOMER, label: 'High Priority Customer' },
    { value: EscalationReason.SLA_BREACH, label: 'SLA Breach' },
    { value: EscalationReason.TECHNICAL_EXPERTISE_REQUIRED, label: 'Technical Expertise Required' },
    { value: EscalationReason.MANAGEMENT_REVIEW, label: 'Management Review' }
  ];

  const agentOptions = [
    { value: 'unassign', label: 'Unassign Ticket' },
    ...(agents?.data || []).map(agent => ({
      value: agent.id,
      label: `${agent.name} (${agent.email})`
    }))
  ];

  const getModalTitle = () => {
    switch (action) {
      case 'priority': return 'Update Priority';
      case 'status': return 'Update Status';
      case 'escalate': return 'Escalate Ticket';
      case 'assign': return 'Assign Ticket';
      default: return 'Update Ticket';
    }
  };

  const getModalIcon = () => {
    switch (action) {
      case 'priority': return <Flag className="h-5 w-5" />;
      case 'status': return <CheckCircle className="h-5 w-5" />;
      case 'escalate': return <AlertTriangle className="h-5 w-5" />;
      case 'assign': return <UserPlus className="h-5 w-5" />;
      default: return <Edit className="h-5 w-5" />;
    }
  };

  const isLoading = updateTicketMutation.isPending || 
                   escalateTicketMutation.isPending || 
                   assignTicketMutation.isPending;

  if (!action) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getModalIcon()}
            <h2 className="text-xl font-semibold text-gray-900">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Priority Update */}
          {action === 'priority' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Priority
              </label>
              <Select
                value={formData.priority || ticket.priority}
                onChange={(value) => setFormData({ ...formData, priority: value })}
                options={priorityOptions}
              />
            </div>
          )}

          {/* Status Update */}
          {action === 'status' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <Select
                value={formData.status || ticket.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                options={statusOptions}
              />
            </div>
          )}

          {/* Escalation */}
          {action === 'escalate' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalation Reason
                </label>
                <Select
                  value={formData.reason || EscalationReason.COMPLEX_ISSUE}
                  onChange={(value) => setFormData({ ...formData, reason: value })}
                  options={escalationReasons}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalate to Team (Optional)
                </label>
                <Input
                  value={formData.escalatedToTeam || ''}
                  onChange={(e) => setFormData({ ...formData, escalatedToTeam: e.target.value })}
                  placeholder="Enter team name or ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Priority (Optional)
                </label>
                <Select
                  value={formData.newPriority || ticket.priority}
                  onChange={(value) => setFormData({ ...formData, newPriority: value })}
                  options={priorityOptions}
                />
              </div>
            </>
          )}

          {/* Assignment */}
          {action === 'assign' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Agent
              </label>
              <Select
                value={formData.agentId || ''}
                onChange={(value) => setFormData({ ...formData, agentId: value })}
                options={agentOptions}
                placeholder="Select an agent..."
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes {action === 'escalate' ? '(Required)' : '(Optional)'}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Add notes about this ${action}...`}
              rows={3}
              required={action === 'escalate'}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {getModalIcon()}
                  {getModalTitle()}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}