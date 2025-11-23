import { useAuth as useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Hook to get current user and auth status
export function useAuth() {
  return useAuthContext();
}

// Hook to protect pages - redirects unauthenticated users
export function useRequireAuth(redirectUrl: string = '/auth/signin') {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, loading, router, redirectUrl]);

  return { isAuthenticated, loading };
}

// Hook for role-based protection
export function useRequireRole(requiredRole: 'patient' | 'researcher', redirectUrl: string = '/') {
  const { user, isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
      } else if (user?.role !== requiredRole) {
        router.push(redirectUrl);
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, router, redirectUrl]);

  return { isAuthenticated, hasRequiredRole: user?.role === requiredRole, loading };
}