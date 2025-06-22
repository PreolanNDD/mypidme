'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Target } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      console.log('Home: User is authenticated, redirecting to dashboard');
      router.replace('/dashboard'); // Use replace instead of push
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
      {/* Left Side - Welcome Content with Background (5/13 of screen) */}
      <div 
        className="flex-shrink-0 h-screen relative flex items-center justify-center w-5/13"
        style={{
          backgroundImage: 'url(/images/login_form_background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Content Container - Vertically centered */}
        <div className="relative z-10 w-full max-w-md px-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo.svg"
                alt="PIDMe Logo"
                width={0}
                height={0}
                className="w-auto h-auto"
              />
            </div>

            {/* Main Description - Large Text */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading text-primary-text leading-tight mb-4">
                Tune your lifestyle with precision engineering
              </h1>
            </div>

            {/* Value Proposition */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-accent-1 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-medium text-primary-text text-sm mb-1">Proportional Control</h3>
                  <p className="text-xs text-secondary-text">Set targets and track your inputs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-accent-2 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-medium text-primary-text text-sm mb-1">Integral Analysis</h3>
                  <p className="text-xs text-secondary-text">Learn from accumulated trends</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-soft-accent rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-primary-text text-sm mb-1">Derivative Response</h3>
                  <p className="text-xs text-secondary-text">React quickly to changes</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link href="/signup" className="block w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  Sign up
                </Button>
              </Link>
              <Link href="/login" className="block w-full">
                <Button variant="outline" className="w-full bg-white/90 hover:bg-white border-gray-200 text-primary-text shadow-lg hover:shadow-xl transition-all duration-200">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image (8/13 of screen) */}
      <div 
        className="flex-1 h-screen relative w-8/13"
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

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-black/10 backdrop-blur-sm border-t border-white/10">
        <p className="text-center text-sm text-white/80">
          © 2024 PIDMe. Engineering your personal optimization.
        </p>
      </footer>
    </div>
  );
}