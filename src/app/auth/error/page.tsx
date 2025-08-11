'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to access this resource.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default;

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full mb-4'>
            <AlertCircle className='w-8 h-8 text-red-400' />
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>Authentication Error</h1>
          <p className='text-gray-400'>There was a problem signing you in</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl'>
          <div className='text-center space-y-4'>
            <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
              <p className='text-red-300 text-sm'>{errorMessage}</p>
            </div>

            <div className='space-y-3'>
              <Link href='/auth/login'>
                <Button className='w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'>
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className='text-center mt-8 text-gray-400 text-sm'>
          If you continue to have problems, please contact support.
        </div>
      </div>
    </div>
  );
}
