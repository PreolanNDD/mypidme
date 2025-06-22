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

  // For update-password page, allow access regardless of auth state
  // For other auth pages, don't render if user is authenticated (will redirect)
  if (pathname !== '/update-password' && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render all auth pages with responsive layout
  return (
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
        
        {/* Form Container - Much wider to use available space */}
        <div className="relative z-10 w-full max-w-lg px-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
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
  );
}