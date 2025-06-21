'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a client with more aggressive settings to prevent tab refocus issues
const queryClient = new QueryClient({
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
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}