'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Add animation delay for initial load and check for mobile
  useEffect(() => {
    setIsLoaded(true);
    
    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - Use CSS variable for dynamic width */}
      <main 
        className={`flex-1 transition-all duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ marginLeft: isMobile ? '0' : 'var(--sidebar-width, 0px)' }}
      >
        {children}
      </main>
    </div>
  );
}