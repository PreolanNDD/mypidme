'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { Users, MessageSquare, User } from 'lucide-react';

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'community' | 'my-findings'>('community');

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Page Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl text-white mb-2">Community Findings</h1>
            <p style={{ color: '#e6e2eb' }}>
              Discover insights and patterns shared by the PIDMe community
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="font-medium text-blue-900 mb-2">
                  Welcome to Community Findings
                </h2>
                <p className="text-blue-800 text-sm leading-relaxed">
                  This is where our community shares valuable insights, patterns, and discoveries 
                  from their personal optimization journeys. Vote on findings that resonate with you 
                  and help surface the most valuable insights for everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 p-1 rounded-lg" style={{ backgroundColor: '#cdc1db' }}>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'community'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              style={{ 
                color: activeTab === 'community' ? '#4a2a6d' : '#9992a2'
              }}
            >
              <Users className="w-4 h-4" />
              <span>Community Feed</span>
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-findings')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${
                  activeTab === 'my-findings'
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-white/50'
                }`}
                style={{ 
                  color: activeTab === 'my-findings' ? '#4a2a6d' : '#9992a2'
                }}
              >
                <User className="w-4 h-4" />
                <span>My Findings</span>
              </button>
            )}
          </div>

          {/* Community Feed */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <div className="p-6">
              <CommunityFeed activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}