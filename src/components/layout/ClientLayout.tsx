'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
// COMMENTED OUT: Live chat websocket provider temporarily disabled
// import { ChatWebSocketProvider } from '@/providers/chat-websocket-provider';
import { AdminWebSocketProvider } from '@/providers/admin-websocket-provider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render layout for auth pages or setup pages
  const isAuthPage = pathname.startsWith('/auth');
  const isSetupPage = pathname.startsWith('/setup');

  if (isAuthPage || isSetupPage) {
    return <>{children}</>;
  }

  if (!mounted) {
    return null;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, middleware will handle redirect
  if (!session) {
    return null;
  }

  return (
    <AdminWebSocketProvider>
      {/* COMMENTED OUT: Live chat websocket provider temporarily disabled */}
      {/* <ChatWebSocketProvider> */}
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 lg:p-6">
              <div className="container mx-auto">{children}</div>
            </main>
          </div>
        </div>
      {/* </ChatWebSocketProvider> */}
    </AdminWebSocketProvider>
  );
}
