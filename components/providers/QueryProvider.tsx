'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient instance using useState
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Completely disable all automatic refetching
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: true,
        retry: 1,
        staleTime: 15 * 60 * 1000, // 15 minutes - longer stale time
        gcTime: 20 * 60 * 1000, // 20 minutes - longer garbage collection time
        // Disable all background refetching
        refetchInterval: false,
        refetchIntervalInBackground: false,
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}