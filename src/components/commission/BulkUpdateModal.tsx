'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { commissionService } from '@/services/commission.service';
import { BulkCommissionUpdateDto, CommissionStatus, CommissionRule } from '@/types/commission.types';
import { useToast } from '@/hooks/use-toast';

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRules: CommissionRule[];
}

export function BulkUpdateModal({ isOpen, onClose, selectedRules }: BulkUpdateModalProps) {
  const [formData, setFormData] = useState<BulkCommissionUpdateDto>({
    ruleIds: [],
    status: CommissionStatus.ACTIVE,
    reason: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bulkUpdateMutation = useMutation({
    mutationFn: commissionService.bulkUpdateCommissionRules,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast({
        title: 'Success',
        description: `Successfully updated ${data.updatedCount} commission rules`,
        type: 'success',
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update commission rules',
        type: 'error',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      ruleIds: [],
      status: CommissionStatus.ACTIVE,
      reason: '',
    });
  };

  const handleSave = () => {
    if (selectedRules.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one rule to update',
        type: 'error',
      });
      return;
    }

    const updateData: BulkCommissionUpdateDto = {
      ruleIds: selectedRules.map(rule => rule.id),
      status: formData.status,
      reason: formData.reason || undefined,
    };

    bulkUpdateMutation.mutate(updateData);
  };

  const getStatusColor = (status: CommissionStatus) => {
    switch (status) {
      case CommissionStatus.ACTIVE:
        return 'text-green-600';
      case CommissionStatus.INACTIVE:
        return 'text-red-600';
      case CommissionStatus.EXPIRED:
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusDescription = (status: CommissionStatus) => {
    switch (status) {
      case CommissionStatus.ACTIVE:
        return 'Rules will be available for commission calculations';
      case CommissionStatus.INACTIVE:
        return 'Rules will be disabled and not used for calculations';
      case CommissionStatus.EXPIRED:
        return 'Rules will be marked as expired';
      default:
        return '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Update Commission Rules"
      size="lg"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Selected Rules Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Selected Rules</h4>
            <p className="text-sm text-gray-600 mb-3">
              You are about to update {selectedRules.length} commission rule{selectedRules.length !== 1 ? 's' : ''}:
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedRules.map(rule => (
                <div key={rule.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{rule.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    rule.status === CommissionStatus.ACTIVE 
                      ? 'bg-green-100 text-green-800'
                      : rule.status === CommissionStatus.INACTIVE
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rule.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status *
            </label>
            <select
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as CommissionStatus }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={CommissionStatus.ACTIVE}>Active</option>
              <option value={CommissionStatus.INACTIVE}>Inactive</option>
              <option value={CommissionStatus.EXPIRED}>Expired</option>
            </select>
            <p className={`text-sm mt-1 ${getStatusColor(formData.status)}`}>
              {getStatusDescription(formData.status)}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={formData.reason}
              onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter reason for bulk update (optional)"
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be recorded in the audit log for tracking purposes.
            </p>
          </div>

          {/* Warning for Default Rules */}
          {selectedRules.some(rule => rule.isDefault) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800">Default Rule Warning</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    You have selected default commission rules for update. 
                    Deactivating default rules may affect commission calculations. 
                    Please ensure you have other active rules to handle commission calculations.
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-800">Default rules selected:</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside mt-1">
                      {selectedRules
                        .filter(rule => rule.isDefault)
                        .map(rule => (
                          <li key={rule.id}>{rule.name}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Impact Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Impact Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rules to be updated:</span>
                <span className="font-medium">{selectedRules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current active rules:</span>
                <span className="font-medium">
                  {selectedRules.filter(rule => rule.status === CommissionStatus.ACTIVE).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Will be active after update:</span>
                <span className={`font-medium ${getStatusColor(formData.status)}`}>
                  {formData.status === CommissionStatus.ACTIVE ? selectedRules.length : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Default rules affected:</span>
                <span className="font-medium">
                  {selectedRules.filter(rule => rule.isDefault).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <GlowingButton variant="secondary" onClick={onClose}>
          Cancel
        </GlowingButton>
        <GlowingButton
          variant="primary"
          onClick={handleSave}
          disabled={bulkUpdateMutation.isPending || selectedRules.length === 0}
        >
          {bulkUpdateMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Update {selectedRules.length} Rule{selectedRules.length !== 1 ? 's' : ''}
        </GlowingButton>
      </ModalFooter>
    </Modal>
  );
}