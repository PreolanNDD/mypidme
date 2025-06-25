'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  fullScreen = false,
  className = ""
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className={`min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] flex items-center justify-center ${className}`}>
        <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-secondary-text">{message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-secondary-text">{message}</p>
      </div>
    </div>
  );
}

// Skeleton loading components for specific use cases
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ${className}`}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ items = 3, className = "" }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}