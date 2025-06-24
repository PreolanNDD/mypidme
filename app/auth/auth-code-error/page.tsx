'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen w-full flex overflow-hidden relative">
      {/* Left Side - Error Content with Background */}
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
        
        {/* Content Container with Safety Margins */}
        <div className="relative z-10 w-full max-w-xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 xl:py-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
            {/* Logo */}
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

            {/* Error Content */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-heading text-primary-text mb-4">
                Authentication Error
              </h1>
              <p className="text-secondary-text mb-6">
                Sorry, we couldn't complete your authentication. This could be due to an expired or invalid link.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/login" className="block w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  Try Logging In Again
                </Button>
              </Link>
              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full bg-white/90 hover:bg-white border-gray-200 text-primary-text shadow-lg hover:shadow-xl transition-all duration-200">
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image (Desktop only) */}
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