'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Debug modal rendering
  console.log('Modal render - isOpen:', isOpen, 'title:', title);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-white/20'
      onClick={handleBackdropClick}
      style={{
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-white/20',
          'bg-white/95 backdrop-blur-xl',
          sizes[size],
          className
        )}
        style={{
          zIndex: 10000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/20 bg-white/50 backdrop-blur-sm'>
          <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
          <button
            onClick={onClose}
            className='p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto max-h-[calc(90vh-80px)] bg-white/30 backdrop-blur-sm'>
          {children}
        </div>
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return <div className={cn('px-6 py-4 border-b border-gray-200', className)}>{children}</div>;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('p-6 bg-white/20 backdrop-blur-sm', className)}>{children}</div>;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-white/20 bg-white/50 backdrop-blur-sm flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmModalProps) {
  const variants = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-primary hover:bg-primary/90',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size='sm'>
      <ModalBody>
        <p className='text-gray-600'>{message}</p>
      </ModalBody>
      <ModalFooter>
        <button
          onClick={onClose}
          className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
            variants[variant]
          )}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}
