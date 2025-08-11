'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const iconColor = type === 'danger' ? 'text-red-500' : 'text-yellow-500';
  const confirmButtonColor =
    type === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';

  return (
    <div
      className='fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50'
      onClick={handleBackdropClick}
    >
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className={`flex-shrink-0 ${iconColor}`}>
              <AlertTriangle className='h-6 w-6' />
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

        <div className='p-6'>
          <p className='text-sm text-gray-600 mb-6'>{message}</p>

          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {cancelText}
            </button>
            <button
              type='button'
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmButtonColor}`}
            >
              {isLoading ? (
                <div className='flex items-center space-x-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
