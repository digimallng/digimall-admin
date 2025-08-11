'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`text-center max-w-md mx-auto ${className}`}>
      <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
        <AlertCircle className='w-8 h-8 text-red-600' />
      </div>

      <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>

      <p className='text-gray-600 mb-6'>{message}</p>

      {onRetry && (
        <Button onClick={onRetry} className='inline-flex items-center' variant='outline'>
          <RefreshCw className='w-4 h-4 mr-2' />
          Try Again
        </Button>
      )}
    </div>
  );
}
