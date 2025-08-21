'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SetupStatus {
  setupRequired: boolean;
  loading: boolean;
  error: string | null;
}

export function useSetupCheck() {
  const [status, setStatus] = useState<SetupStatus>({
    setupRequired: false,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      // Call the setup verify API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/setup/verify-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Setup check failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Setup check response:', data);

      // Check if setup is needed based on API response
      const setupRequired = data.needsSetup === true;

      setStatus({
        setupRequired,
        loading: false,
        error: null,
      });

      // Redirect based on setup status
      if (setupRequired) {
        console.log('Setup required - redirecting to setup page');
        router.push('/setup');
      } else {
        console.log('Setup completed - redirecting to login');
        router.push('/auth/login');
      }

    } catch (error) {
      console.error('Setup check error:', error);
      setStatus({
        setupRequired: true, // Assume setup is needed if we can't check
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check setup status',
      });
      
      // If we can't check, redirect to setup to be safe
      router.push('/setup');
    }
  };

  return {
    ...status,
    refetch: checkSetupStatus,
  };
}