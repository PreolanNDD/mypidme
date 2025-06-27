'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Add animation delay for initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - Use CSS variable for dynamic width */}
      <main 
        className={`flex-1 transition-all duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ marginLeft: 'var(--sidebar-width, 64px)' }}
      >
        {children}
      </main>
    </div>
  );
}