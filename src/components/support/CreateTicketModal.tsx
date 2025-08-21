'use client';

import { useState } from 'react';
import { useCreateSupportTicket } from '@/lib/hooks/use-support';
import { TicketPriority, TicketCategory, SupportChannel } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/Textarea';
import { SimpleSelect as Select } from '@/components/ui/SimpleSelect';
import { Modal } from '@/components/ui/Modal';
import { X, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (ticketId: string) => void;
}

interface CreateTicketForm {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  channel: SupportChannel;
  customerEmail: string;
  customerName: string;
  tags: string[];
}

const initialForm: CreateTicketForm = {
  subject: '',
  description: '',
  priority: TicketPriority.MEDIUM,
  category: TicketCategory.GENERAL_INQUIRY,
  channel: SupportChannel.EMAIL,
  customerEmail: '',
  customerName: '',
  tags: []
};

export function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const [form, setForm] = useState<CreateTicketForm>(initialForm);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Partial<CreateTicketForm>>({});

  const createTicketMutation = useCreateSupportTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<CreateTicketForm> = {};
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.customerEmail.trim()) newErrors.customerEmail = 'Customer email is required';
    if (!form.customerName.trim()) newErrors.customerName = 'Customer name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const ticket = await createTicketMutation.mutateAsync({
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        category: form.category,
        channel: form.channel,
        customerEmail: form.customerEmail,
        customerName: form.customerName,
        tags: form.tags
      });

      // Reset form and close modal
      setForm(initialForm);
      setTagInput('');
      setErrors({});
      onClose();
      onSuccess?.(ticket.id);
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const priorityOptions = [
    { value: TicketPriority.LOW, label: 'Low' },
    { value: TicketPriority.MEDIUM, label: 'Medium' },
    { value: TicketPriority.HIGH, label: 'High' },
    { value: TicketPriority.URGENT, label: 'Urgent' }
  ];

  const categoryOptions = [
    { value: TicketCategory.GENERAL_INQUIRY, label: 'General Inquiry' },
    { value: TicketCategory.TECHNICAL_SUPPORT, label: 'Technical Support' },
    { value: TicketCategory.BILLING_QUESTION, label: 'Billing Question' },
    { value: TicketCategory.BUG_REPORT, label: 'Bug Report' },
    { value: TicketCategory.FEATURE_REQUEST, label: 'Feature Request' },
    { value: TicketCategory.ACCOUNT_ISSUE, label: 'Account Issue' }
  ];

  const channelOptions = [
    { value: SupportChannel.EMAIL, label: 'Email' },
    { value: SupportChannel.CHAT, label: 'Live Chat' },
    { value: SupportChannel.PHONE, label: 'Phone' },
    { value: SupportChannel.SOCIAL_MEDIA, label: 'Social Media' },
    { value: SupportChannel.WEB_FORM, label: 'Web Form' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <Input
                  value={form.customerName}
                  onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                  error={errors.customerName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email
                </label>
                <Input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                  error={errors.customerEmail}
                />
              </div>
            </div>

            {/* Ticket Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <Input
                value={form.subject}
                onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of the issue"
                error={errors.subject}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue or request"
                rows={4}
                error={errors.description}
              />
            </div>

            {/* Classification */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <Select
                  value={form.priority}
                  onChange={(value) => setForm(prev => ({ ...prev, priority: value as TicketPriority }))}
                  options={priorityOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Select
                  value={form.category}
                  onChange={(value) => setForm(prev => ({ ...prev, category: value as TicketCategory }))}
                  options={categoryOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <Select
                  value={form.channel}
                  onChange={(value) => setForm(prev => ({ ...prev, channel: value as SupportChannel }))}
                  options={channelOptions}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter to add)"
              />
              {form.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Display */}
            {createTicketMutation.error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Failed to create ticket. Please try again.</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createTicketMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createTicketMutation.isPending}
            className="flex items-center gap-2"
          >
            {createTicketMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Create Ticket
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}