'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SetupWrapperProps {
  children: React.ReactNode;
}

export function SetupWrapper({ children }: SetupWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const isSetupPage = pathname?.startsWith('/setup');
  const isAuthPage = pathname?.startsWith('/auth');

  const checkSetupStatus = async () => {
    // Prevent multiple simultaneous checks
    if (isChecking) return;
    
    try {
      setIsChecking(true);
      setIsLoading(true);
      
      // Check if super admin exists by calling the setup check endpoint
      const response = await fetch('/api/setup/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const needsSetup = data.setupRequired || false;
        setSetupRequired(needsSetup);

        // Only redirect if we're not already on the correct page
        if (needsSetup && !isSetupPage) {
          console.log('Setup required, redirecting to /setup');
          router.push('/setup');
        } else if (!needsSetup && isSetupPage) {
          console.log('Setup complete, redirecting to /auth/login');
          router.push('/auth/login');
        }
      } else {
        // If check fails, assume setup is needed
        console.log('Setup check failed, assuming setup needed');
        setSetupRequired(true);
        if (!isSetupPage) {
          router.push('/setup');
        }
      }
    } catch (error) {
      console.error('Setup check error:', error);
      // On error, assume setup is needed
      setSetupRequired(true);
      if (!isSetupPage) {
        router.push('/setup');
      }
    } finally {
      setIsLoading(false);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSetupStatus();
  }, []); // Only run once on mount

  // Show loading while checking setup status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
          <p className="text-gray-400">Checking setup status...</p>
        </div>
      </div>
    );
  }

  // If setup is required and we're not on setup page, don't render children
  if (setupRequired && !isSetupPage) {
    return null; // Will redirect via useEffect
  }

  // If setup is complete and we're on setup page, don't render children  
  if (!setupRequired && isSetupPage) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}