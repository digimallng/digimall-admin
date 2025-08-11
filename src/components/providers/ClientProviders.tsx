'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <QueryProvider>
        <ClientLayout>{children}</ClientLayout>
        <ToastProvider />
      </QueryProvider>
    </AuthProvider>
  );
}
