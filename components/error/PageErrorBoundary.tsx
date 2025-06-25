'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const fallback = (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Error Content */}
        <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="font-heading text-2xl text-primary-text mb-4">
              {pageName ? `Error loading ${pageName}` : 'Page Error'}
            </h2>
            
            <p className="text-secondary-text mb-8 leading-relaxed max-w-md mx-auto">
              We encountered an issue while loading this page. Your data is safe, 
              and this is likely a temporary problem.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Button
                onClick={handleRefresh}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <Button
                onClick={handleGoHome}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={(error, errorInfo) => {
        console.error(`🚨 [PageErrorBoundary] Error in ${pageName || 'page'}:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}