'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    // Only redirect if loading is complete and there's no user
    if (!loading && !user && !redirectingRef.current) {
      redirectingRef.current = true;
      router.replace('/login'); // Use replace instead of push to avoid back button issues
    }
    
    // Reset redirecting flag when user is authenticated
    if (user && redirectingRef.current) {
      redirectingRef.current = false;
    }
  }, [user, loading, router]);

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while redirecting (no user)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary-text">Redirecting...</p>
        </div>
      </div>
    );
  }

  // If we have a user, render the protected content
  return <>{children}</>;
}