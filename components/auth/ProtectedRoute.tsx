'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { LoadingState } from '@/components/error/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }

    // Only redirect if loading is complete and there's no user
    // Add a small delay to prevent race conditions
    if (!loading && !user) {
      console.log('ProtectedRoute: No authenticated user found, redirecting to login');
      
      // Use a timeout to prevent immediate redirects that might interfere with auth flow
      redirectTimeoutRef.current = setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [user, loading]);

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