'use client';

import React from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - Use CSS variable for dynamic width */}
      <main 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: 'var(--sidebar-width, 64px)' }}
      >
        {children}
      </main>
    </div>
  );
}