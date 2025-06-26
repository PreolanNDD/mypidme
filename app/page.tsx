'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, Eye, Settings } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!loading && user && !redirectingRef.current) {
      console.log('🏠 [Home] User is authenticated, redirecting to dashboard');
      redirectingRef.current = true;
      router.replace('/dashboard'); // Use replace instead of push
    }
    
    // Reset redirecting flag when user is not authenticated
    if (!user && redirectingRef.current) {
      redirectingRef.current = false;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative">
      {/* Left Side - Welcome Content with Background (Desktop: 40% of screen, Mobile: Full screen) */}
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
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Content Container with Safety Margins and Responsive Sizing */}
        <div className="relative z-10 w-full max-w-xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 xl:py-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
            {/* Logo with Responsive Sizing */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <Image
                src="/images/logo.svg"
                alt="PIDMe Logo"
                width={320}
                height={120}
                className="h-auto w-auto max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] rounded-xl"
                priority
              />
            </div>

            {/* Main Headline with Responsive Text */}
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-base sm:text-lg text-secondary-text font-medium">
                Your <strong className="font-bold text-black">Personal Insight Dashboard</strong> that helps you prove what works.
              </p>
            </div>

            {/* Value Proposition Features with Responsive Spacing */}
            <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-1 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-primary-text text-sm sm:text-base mb-1">Track Your Life</h3>
                  <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">Log your key inputs and outputs in less than a minute a day.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-2 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-primary-text text-sm sm:text-base mb-1">See What's Working</h3>
                  <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">Instantly visualize the connections between your habits and your ambitions.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-soft-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-primary-text text-sm sm:text-base mb-1">Master Your Routine</h3>
                  <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">Use your data to adapt, improve, and build a lifestyle that's precisely tuned to your goals.</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons with Responsive Sizing */}
            <div className="space-y-3 sm:space-y-4">
              <Link href="/signup" className="block w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-3">
                  Start Your Lab
                </Button>
              </Link>
              <Link href="/login" className="block w-full">
                <Button variant="outline" className="w-full bg-white/90 hover:bg-white border-gray-200 text-primary-text shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base py-2 sm:py-3">
                  Log In
                </Button>
              </Link>
            </div>
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

      {/* Footer - Only show on mobile/tablet when full screen */}
      <footer className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 py-3 sm:py-4 bg-black/10 backdrop-blur-sm border-t border-white/10 lg:hidden">
        <p className="text-center text-xs sm:text-sm text-white/80">
          © 2025 PIDMe. Engineering your personal optimization.
        </p>
      </footer>
    </div>
  );
}