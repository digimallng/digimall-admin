'use client';

import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface TestButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'public' | 'admin' | 'super_admin' | 'special' | 'utility';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses = {
  public: 'bg-green-600 hover:bg-green-700 text-white',
  admin: 'bg-blue-600 hover:bg-blue-700 text-white',
  super_admin: 'bg-red-600 hover:bg-red-700 text-white',
  special: 'bg-purple-600 hover:bg-purple-700 text-white',
  utility: 'bg-orange-600 hover:bg-orange-700 text-white',
};

export function TestButton({
  variant = 'admin',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: TestButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]}
        px-4 py-2.5 rounded-md
        font-medium text-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        w-full
        shadow-sm hover:shadow-md
        ${props.className || ''}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
