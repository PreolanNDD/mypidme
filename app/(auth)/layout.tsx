'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to update-password page even if user is authenticated
    if (pathname === '/update-password') {
      return;
    }

    // For other auth pages, redirect authenticated users to dashboard
    if (!loading && user) {
      console.log('AuthLayout: User is authenticated, redirecting to dashboard');
      router.replace('/dashboard'); // Use replace instead of push
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow access to update-password page regardless of auth state
  if (pathname === '/update-password') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {children}
        </div>
      </div>
    );
  }

  // For other auth pages, don't render if user is authenticated (will redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // For login and signup pages, render without any container
  if (pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }

  // For other auth pages (like forgot-password), keep the centered container
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {children}
      </div>
    </div>
  );
}