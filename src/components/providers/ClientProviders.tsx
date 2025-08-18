'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { SetupWrapper } from '@/components/setup/SetupWrapper';

const AuthProvider = dynamic(
  () => import('@/lib/providers/auth-provider').then(mod => ({ default: mod.AuthProvider })),
  { ssr: false }
);
const QueryProvider = dynamic(
  () => import('@/lib/providers/query-provider').then(mod => ({ default: mod.QueryProvider })),
  { ssr: false }
);
const ClientLayout = dynamic(
  () => import('@/components/layout/ClientLayout').then(mod => ({ default: mod.ClientLayout })),
  { ssr: false }
);
const ToastProvider = dynamic(
  () => import('@/providers/ToastProvider').then(mod => ({ default: mod.ToastProvider })),
  { ssr: false }
);

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <QueryProvider>
        <SetupWrapper>
          <ClientLayout>{children}</ClientLayout>
        </SetupWrapper>
        <ToastProvider />
      </QueryProvider>
    </AuthProvider>
  );
}
