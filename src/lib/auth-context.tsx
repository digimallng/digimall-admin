'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id || session.user.email || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'admin',
      });
    } else {
      setUser(null);
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading: status === 'loading',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}