'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { commissionService } from '@/services/commission.service';
import { 
  TieredCommissionRuleDto, 
  CommissionTier, 
  CommissionRuleType 
} from '@/types/commission.types';
import { useToast } from '@/hooks/use-toast';

interface TieredCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TieredCommissionModal({ isOpen, onClose }: TieredCommissionModalProps) {
  const [formData, setFormData] = useState<TieredCommissionRuleDto>({
    name: '',
    description: '',
    type: CommissionRuleType.TIERED,
    value: 0,
    tiers: [
      { minValue: 0, maxValue: 100000, rate: 5.0 },
      { minValue: 100000, maxValue: 500000, rate: 4.0 },
      { minValue: 500000, maxValue: 999999999, rate: 3.0 },
    ],
    isDefault: false,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTieredRuleMutation = useMutation({
    mutationFn: commissionService.createTieredCommissionRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      queryClient.invalidateQueries({ queryKey: ['commission-analytics'] });
      toast({
        title: 'Success',
        description: 'Tiered commission rule created successfully',
        type: 'success',
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create tiered commission rule',
        type: 'error',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: CommissionRuleType.TIERED,
      value: 0,
      tiers: [
        { minValue: 0, maxValue: 100000, rate: 5.0 },
        { minValue: 100000, maxValue: 500000, rate: 4.0 },
        { minValue: 500000, maxValue: 999999999, rate: 3.0 },
      ],
      isDefault: false,
    });
  };

  const handleAddTier = () => {
    const lastTier = formData.tiers[formData.tiers.length - 1];
    const newMinValue = lastTier ? lastTier.maxValue : 0;
    
    setFormData(prev => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          minValue: newMinValue,
          maxValue: newMinValue + 100000,
          rate: 3.0,
        },
      ],
    }));
  };

  const handleRemoveTier = (index: number) => {
    if (formData.tiers.length > 1) {
      setFormData(prev => ({
        ...prev,
        tiers: prev.tiers.filter((_, i) => i !== index),
      }));
    }
  };

  const handleTierChange = (index: number, field: keyof CommissionTier, value: number) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));
  };

  const handleSave = () => {
    // Validate tiers
    const sortedTiers = [...formData.tiers].sort((a, b) => a.minValue - b.minValue);
    
    // Check for overlaps
    for (let i = 1; i < sortedTiers.length; i++) {
      if (sortedTiers[i].minValue <= sortedTiers[i - 1].maxValue) {
        toast({
          title: 'Validation Error',
          description: 'Tier ranges cannot overlap',
          type: 'error',
        });
        return;
      }
    }

    // Update tiers with sorted order
    const updatedFormData = {
      ...formData,
      tiers: sortedTiers,
    };

    createTieredRuleMutation.mutate(updatedFormData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tiered Commission Rule"
      size="xl"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter rule name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor ID
              </label>
              <input
                type="text"
                value={formData.vendorId || ''}
                onChange={e => setFormData(prev => ({ ...prev, vendorId: e.target.value || undefined }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Leave empty for all vendors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter rule description"
            />
          </div>

          {/* Order Value Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Value
              </label>
              <input
                type="number"
                value={formData.minOrderValue || ''}
                onChange={e => setFormData(prev => ({ ...prev, minOrderValue: parseFloat(e.target.value) || undefined }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Order Value
              </label>
              <input
                type="number"
                value={formData.maxOrderValue || ''}
                onChange={e => setFormData(prev => ({ ...prev, maxOrderValue: parseFloat(e.target.value) || undefined }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Leave empty for no limit"
                min="0"
              />
            </div>
          </div>

          {/* Commission Tiers */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700">Commission Tiers</h4>
              <GlowingButton
                variant="secondary"
                size="sm"
                onClick={handleAddTier}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Tier
              </GlowingButton>
            </div>

            <div className="space-y-4">
              {formData.tiers.map((tier, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-800">Tier {index + 1}</h5>
                    {formData.tiers.length > 1 && (
                      <button
                        onClick={() => handleRemoveTier(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Min Value (₦)
                      </label>
                      <input
                        type="number"
                        value={tier.minValue}
                        onChange={e => handleTierChange(index, 'minValue', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Max Value (₦)
                      </label>
                      <input
                        type="number"
                        value={tier.maxValue}
                        onChange={e => handleTierChange(index, 'maxValue', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Rate (%)
                      </label>
                      <input
                        type="number"
                        value={tier.rate}
                        onChange={e => handleTierChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        step="0.01"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {formatCurrency(tier.minValue)} - {formatCurrency(tier.maxValue)} = {tier.rate}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From
              </label>
              <input
                type="date"
                value={formData.validFrom || ''}
                onChange={e => setFormData(prev => ({ ...prev, validFrom: e.target.value || undefined }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.validUntil || ''}
                onChange={e => setFormData(prev => ({ ...prev, validUntil: e.target.value || undefined }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Default Rule Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefaultTiered"
              checked={formData.isDefault}
              onChange={e => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
            />
            <label htmlFor="isDefaultTiered" className="text-sm text-gray-700">
              Set as Default Rule
            </label>
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
          disabled={createTieredRuleMutation.isPending || !formData.name}
        >
          {createTieredRuleMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          Create Tiered Rule
        </GlowingButton>
      </ModalFooter>
    </Modal>
  );
}