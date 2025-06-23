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
      
      {/* Main Content - Remove fixed margins and use responsive classes */}
      <main className="flex-1 transition-all duration-300 ease-in-out ml-16 lg:ml-64">
        {children}
      </main>
    </div>
  );
}