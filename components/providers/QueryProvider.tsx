'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient instance with optimized caching
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Aggressive caching for better performance
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false, // Don't refetch on mount if data exists
        retry: 1,
        staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
        gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache much longer
        // Disable all background refetching for better performance
        refetchInterval: false,
        refetchIntervalInBackground: false,
        // Enable network mode optimizations
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        // Keep mutation results in cache briefly for optimistic updates
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}