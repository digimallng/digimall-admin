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

      // For now, let's skip the API call and assume setup is required
      // This will allow the setup page to show while we debug
      setStatus({
        setupRequired: true,
        loading: false,
        error: null,
      });

      // Don't auto-redirect for now
      console.log('Setup check: assuming setup is required');

    } catch (error) {
      console.error('Setup check error:', error);
      setStatus({
        setupRequired: true, // Assume setup is needed if we can't check
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check setup status',
      });
    }
  };

  return {
    ...status,
    refetch: checkSetupStatus,
  };
}