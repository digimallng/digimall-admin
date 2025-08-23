import { useState, useCallback } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: string;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = `toast-${++toastCounter}`;
    const duration = options.duration || 5000;
    
    const newToast: Toast = {
      ...options,
      id,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    // For now, just console log since we don't have a toast component
    console.log(`[${options.type || 'info'}] ${options.title}: ${options.description || ''}`);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toast,
    toasts,
    dismissToast,
  };
}