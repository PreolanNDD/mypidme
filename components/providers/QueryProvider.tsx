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
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
        // Disable all background refetching for better performance
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