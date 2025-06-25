'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LoadingState } from '@/components/error/LoadingState';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Allow access to update-password page even if user is authenticated
    if (pathname === '/update-password') {
      return;
    }

    // For other auth pages, redirect authenticated users to dashboard
    if (!loading && user) {
      console.log('AuthLayout: User is authenticated, redirecting to dashboard');
      // Use window.location instead of router to avoid RSC payload issues
      window.location.href = '/dashboard';
    }
  }, [user, loading, pathname]);

  if (loading) {
    return <LoadingState fullScreen message="Loading..." />;
  }

  // For update-password page, allow access regardless of auth state
  // For other auth pages, don't render if user is authenticated (will redirect)
  if (pathname !== '/update-password' && user) {
    return <LoadingState fullScreen message="Redirecting..." />;
  }

  // Render all auth pages with responsive layout and safety margins
  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full flex overflow-hidden relative">
        {/* Left Side - Auth Form with Background (Desktop: 40% of screen, Mobile: Full screen) */}
        <div 
          className="flex-shrink-0 h-screen relative flex items-center justify-center w-full lg:w-2/5"
          style={{
            backgroundImage: 'url(/images/login_form_background.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Form Container with Safety Margins */}
          <div className="relative z-10 w-full max-w-lg px-6 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
              {children}
            </div>
          </div>
        </div>

        {/* Right Side - Background Image (Desktop only: 60% of screen, Hidden on tablet and mobile) */}
        <div 
          className="hidden lg:flex flex-1 h-screen relative w-3/5"
          style={{
            backgroundImage: 'url(/images/login_background.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Subtle gradient overlay for visual enhancement */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/5"></div>
        </div>
      </div>
    </ErrorBoundary>
  );
}