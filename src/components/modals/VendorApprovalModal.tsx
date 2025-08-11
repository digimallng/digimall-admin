'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Vendor } from '@/lib/api/types';

interface VendorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: { notes?: string; conditions?: string[] }) => void;
  onReject: (data: { reason: string; feedback?: string; blockedFields?: string[] }) => void;
  vendor: Vendor | null;
  isLoading?: boolean;
  action: 'approve' | 'reject' | null;
}

export function VendorApprovalModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  vendor,
  isLoading = false,
  action,
}: VendorApprovalModalProps) {
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');

  if (!isOpen || !vendor || !action) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (action === 'approve') {
      onApprove({
        notes: notes.trim() || undefined,
        conditions: conditions.length > 0 ? conditions : undefined,
      });
    } else if (action === 'reject') {
      if (!reason.trim()) return;

      onReject({
        reason: reason.trim(),
        feedback: feedback.trim() || undefined,
      });
    }
  };

  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const isApproval = action === 'approve';
  const title = isApproval ? 'Approve Vendor' : 'Reject Vendor';
  const icon = isApproval ? CheckCircle : XCircle;
  const iconColor = isApproval ? 'text-green-500' : 'text-red-500';
  const submitButtonColor = isApproval
    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500';

  return (
    <div
      className='fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className={`flex-shrink-0 ${iconColor}`}>
              {React.createElement(icon, { className: 'h-6 w-6' })}
            </div>
            <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6'>
          <div className='mb-4'>
            <div className='bg-gray-50 rounded-lg p-4 mb-4'>
              <h4 className='font-medium text-gray-900 mb-2'>{vendor.businessName}</h4>
              <div className='text-sm text-gray-600 space-y-1'>
                <p>
                  <strong>Email:</strong> {vendor.email}
                </p>
                <p>
                  <strong>Business Type:</strong> {vendor.businessType}
                </p>
                <p>
                  <strong>Location:</strong> {vendor.businessCity}, {vendor.businessState}
                </p>
                {vendor.registrationNumber && (
                  <p>
                    <strong>Registration:</strong> {vendor.registrationNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {isApproval ? (
            <>
              <div className='mb-4'>
                <label htmlFor='notes' className='block text-sm font-medium text-gray-700 mb-2'>
                  Approval Notes (Optional)
                </label>
                <textarea
                  id='notes'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='Add any notes or comments for this approval...'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Approval Conditions (Optional)
                </label>
                <div className='flex gap-2 mb-2'>
                  <Input
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                    placeholder='Add a condition...'
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  />
                  <Button type='button' onClick={addCondition} size='sm' variant='outline'>
                    Add
                  </Button>
                </div>
                {conditions.length > 0 && (
                  <div className='space-y-2'>
                    {conditions.map((condition, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between bg-green-50 px-3 py-2 rounded-md'
                      >
                        <span className='text-sm'>{condition}</span>
                        <button
                          type='button'
                          onClick={() => removeCondition(index)}
                          className='text-red-500 hover:text-red-700'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className='mb-4'>
                <label htmlFor='reason' className='block text-sm font-medium text-gray-700 mb-2'>
                  Rejection Reason <span className='text-red-500'>*</span>
                </label>
                <select
                  id='reason'
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                >
                  <option value=''>Select a reason</option>
                  <option value='Insufficient documentation'>Insufficient documentation</option>
                  <option value='Invalid business registration'>
                    Invalid business registration
                  </option>
                  <option value='Incomplete application'>Incomplete application</option>
                  <option value='Failed verification checks'>Failed verification checks</option>
                  <option value='Policy violation'>Policy violation</option>
                  <option value='Fraudulent information'>Fraudulent information</option>
                  <option value='Other'>Other</option>
                </select>
              </div>

              <div className='mb-4'>
                <label htmlFor='feedback' className='block text-sm font-medium text-gray-700 mb-2'>
                  Feedback for Vendor (Optional)
                </label>
                <textarea
                  id='feedback'
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
                  placeholder='Provide guidance on what the vendor needs to fix or improve...'
                />
              </div>
            </>
          )}

          <div className='flex justify-end space-x-3'>
            <Button type='button' onClick={onClose} disabled={isLoading} variant='outline'>
              Cancel
            </Button>
            <button
              type='submit'
              disabled={isLoading || (!isApproval && !reason.trim())}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${submitButtonColor}`}
            >
              {isLoading ? (
                <div className='flex items-center space-x-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>{isApproval ? 'Approving...' : 'Rejecting...'}</span>
                </div>
              ) : (
                <span>{isApproval ? 'Approve Vendor' : 'Reject Vendor'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
