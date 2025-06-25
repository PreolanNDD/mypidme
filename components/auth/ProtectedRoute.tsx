'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@/components/error/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is complete and there's no user
    if (!loading && !user) {
      console.log('ProtectedRoute: No authenticated user found, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while auth is being determined
  if (loading) {
    return <LoadingState fullScreen message="Loading your account..." />;
  }

  // Show loading spinner while redirecting (no user)
  if (!user) {
    return <LoadingState fullScreen message="Redirecting to login..." />;
  }

  // If we have a user, render the protected content
  return <>{children}</>;
}