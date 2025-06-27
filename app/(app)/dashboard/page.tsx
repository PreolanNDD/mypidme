'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { getTrackableItems } from '@/lib/trackable-items';
import { getDashboardStats, getTodaysEntries } from '@/lib/dashboard-stats';
import { TodaysLogWidget } from '@/components/dashboard/TodaysLogWidget';
import { StreaksStatsWidget } from '@/components/dashboard/StreaksStatsWidget';
import { ExperimentProgressWidget } from '@/components/dashboard/ExperimentProgressWidget';
import { CommunityFeedWidget } from '@/components/dashboard/CommunityFeedWidget';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

export default function Dashboard() {
  const { userProfile, user } = useAuth();
  const welcomeRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Extract first name with fallback logic
  const firstName = userProfile?.first_name || 
                   user?.user_metadata?.first_name || 
                   user?.email?.split('@')[0] || 
                   'there';

  // Fetch trackable items with aggressive caching
  const { data: trackableItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch today's entries with caching
  const { data: todaysEntries = {}, isLoading: loadingEntries } = useQuery({
    queryKey: ['todaysEntries', user?.id],
    queryFn: () => getTodaysEntries(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  });

  // Fetch dashboard stats with caching
  const { data: dashboardStats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: () => getDashboardStats(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
  });

  // Handle mouse movement for welcome section animation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (welcomeRef.current) {
      const rect = welcomeRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const isLoading = loadingItems || loadingEntries || loadingStats;

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Section 1: Welcome & Stats - SWAPPED POSITIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Streaks & Stats Widget - REMOVED WHITE CONTAINER */}
            <div className="rounded-2xl backdrop-blur-sm">
              <StreaksStatsWidget
                currentStreak={dashboardStats?.currentStreak || 0}
                totalMetrics={dashboardStats?.totalMetrics || 0}
                totalEntries={dashboardStats?.totalEntries || 0}
                loading={loadingStats}
              />
            </div>

            {/* Right: Welcome Message with cursor-following animation */}
            <div 
              ref={welcomeRef}
              onMouseMove={handleMouseMove}
              className="flex flex-col justify-center relative overflow-hidden h-full min-h-[200px] rounded-2xl p-8"
            >
              {/* Animated gradient spotlight that follows cursor */}
              <div 
                className="absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-3xl opacity-0 transition-opacity duration-300"
                style={{
                  left: `${mousePosition.x - 250}px`,
                  top: `${mousePosition.y - 250}px`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'opacity 0.3s ease'
                }}
              ></div>
              
              <h1 className="text-4xl font-heading mb-2 relative z-10">
                <span 
                  className="text-accent-1 transition-all duration-300"
                  style={{
                    textShadow: `0 0 ${Math.min(10, Math.max(0, (Math.abs(mousePosition.x - 250) + Math.abs(mousePosition.y - 100)) / 50)}px rgba(255, 255, 255, ${Math.max(0.1, 0.5 - (Math.abs(mousePosition.x - 250) + Math.abs(mousePosition.y - 100)) / 1000)})`
                    )
                  }}
                >
                  Hello, {firstName}!
                </span>
              </h1>
              <p 
                className="text-xl text-white relative z-10 transition-all duration-300"
                style={{
                  textShadow: `0 0 ${Math.min(8, Math.max(0, (Math.abs(mousePosition.x - 250) + Math.abs(mousePosition.y - 150)) / 60)}px rgba(255, 255, 255, ${Math.max(0.05, 0.3 - (Math.abs(mousePosition.x - 250) + Math.abs(mousePosition.y - 150)) / 1200)})`
                  )
                }}
              >
                Ready to unlock your potential today?
              </p>
            </div>
          </div>

          {/* Section 2: Interactive "Today's Log" - NO WHITE CONTAINER */}
          <TodaysLogWidget
            trackableItems={trackableItems}
            todaysEntries={todaysEntries}
            loading={isLoading}
          />

          {/* Section 3: "Active Experiments" - NO WHITE CONTAINER */}
          <ExperimentProgressWidget />

          {/* Section 4: "Community Insights" - NO WHITE CONTAINER */}
          <CommunityFeedWidget />

        </div>
      </div>
    </div>
  );
}