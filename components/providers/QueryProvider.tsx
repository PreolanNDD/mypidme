'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient instance using useState
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Optimize for better performance and user experience
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
        retry: (failureCount, error: any) => {
          // Don't retry on 401 errors (auth issues)
          if (error?.status === 401 || error?.message?.includes('401')) {
            console.log('🚨 [QueryProvider] 401 error detected, not retrying');
            return false;
          }
          // Retry other errors up to 1 time
          return failureCount < 1;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
        // Disable all background refetching for better performance
        refetchInterval: false,
        refetchIntervalInBackground: false,
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry on 401 errors (auth issues)
          if (error?.status === 401 || error?.message?.includes('401')) {
            console.log('🚨 [QueryProvider] 401 error in mutation, not retrying');
            return false;
          }
          // Retry other errors up to 1 time
          return failureCount < 1;
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}