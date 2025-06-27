'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { Users, MessageSquare, User, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'community' | 'my-findings'>('community');
  const [isLoaded, setIsLoaded] = useState(false);

  // Add animation delay for initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleNewFinding = () => {
    router.push('/community/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Page Header with New Finding Button - Enhanced with animations */}
          <div className={`flex items-center justify-between mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="group/header">
              <h1 className="font-heading text-3xl text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent transition-all duration-300 group-hover/header:tracking-wider">
                Community Findings
              </h1>
              <div className="relative">
                <p style={{ color: '#e6e2eb' }} className="text-lg transition-all duration-300 group-hover/header:translate-x-1">
                  Discover insights and patterns shared by the myPID.me community
                </p>
                <div className="absolute -top-6 -right-8 opacity-0 group-hover/header:opacity-100 transition-opacity duration-500">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
              </div>
            </div>
            {user && (
              <button
                onClick={handleNewFinding}
                className="group/new relative overflow-hidden px-5 py-3 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-white/60 text-gray-800 shadow-lg transition-all duration-300 hover:bg-white hover:border-white hover:shadow-xl hover:shadow-white/30"
              >
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover/new:translate-x-full transition-transform duration-500 ease-out"></div>
                
                {/* Content */}
                <div className="relative flex items-center space-x-2">
                  <div className="transform group-hover/new:scale-110 group-hover/new:rotate-12 transition-transform duration-300">
                    <Plus className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium transition-all duration-300 group-hover/new:tracking-wide text-gray-800">
                    New Finding
                  </span>
                </div>
                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-xl bg-purple-100/20 opacity-0 group-hover/new:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>

          {/* Introduction - Enhanced with animations */}
          <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:shadow-3xl hover:shadow-white/20 group/intro`}>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-400/20 transition-all duration-500 group-hover/intro:scale-110 group-hover/intro:rotate-6 flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="transition-all duration-500 group-hover/intro:translate-x-1">
                <h2 className="font-medium text-xl text-blue-900 mb-3 transition-all duration-500 group-hover/intro:text-indigo-700">
                  Welcome to Community Findings
                </h2>
                <p className="text-blue-800 text-base leading-relaxed transition-all duration-500 group-hover/intro:text-indigo-800">
                  This is where our community shares valuable insights, patterns, and discoveries 
                  from their personal optimization journeys. Vote on findings that resonate with you 
                  and help surface the most valuable insights for everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Fixed to not have hover animation sticking out */}
          <div className={`flex space-x-1 p-1 rounded-lg transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ backgroundColor: '#cdc1db' }}>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === 'community'
                  ? 'bg-white shadow-md'
                  : 'hover:bg-white/50'
              }`}
              style={{ 
                color: activeTab === 'community' ? '#4a2a6d' : '#9992a2'
              }}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm transition-all duration-300">
                <Users className="w-3 h-3 text-white" />
              </div>
              <span>Community Feed</span>
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('my-findings')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                  activeTab === 'my-findings'
                    ? 'bg-white shadow-md'
                    : 'hover:bg-white/50'
                }`}
                style={{ 
                  color: activeTab === 'my-findings' ? '#4a2a6d' : '#9992a2'
                }}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm transition-all duration-300">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span>My Findings</span>
              </button>
            )}
          </div>

          {/* Community Feed - Enhanced with animations */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <CommunityFeed activeTab={activeTab} />
          </div>
        </div>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}