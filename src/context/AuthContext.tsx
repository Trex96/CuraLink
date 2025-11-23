'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isPatient: boolean;
  isResearcher: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isPatient: false,
  isResearcher: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setTimeout(() => {
        setLoading(true);
      }, 0);
      return;
    }

    setTimeout(() => {
      if (session?.user) {
        setUser({
          id: (session.user as unknown as AuthUser).id,
          name: session.user.name || '',
          email: session.user.email || '',
          role: (session.user as unknown as AuthUser).role,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    }, 0);
  }, [session, status]);

  const isAuthenticated = !!user;
  const isPatient = user?.role === UserRole.PATIENT;
  const isResearcher = user?.role === UserRole.RESEARCHER;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isPatient,
        isResearcher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}