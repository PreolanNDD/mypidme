'use client';

import { AuthDebug } from '@/components/debug/AuthDebug';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl text-primary-text">Debug Panel</h1>
          <p className="text-secondary-text">Test authentication and database access</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <AuthDebug />
        </div>
      </div>
    </div>
  );
}