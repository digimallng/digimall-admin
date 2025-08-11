'use client';

import { SessionProvider } from 'next-auth/react';
import * as React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}