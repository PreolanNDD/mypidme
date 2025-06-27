'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { getTrackableItems } from '@/lib/trackable-items';
import { getDashboardStats, getTodaysEntries } from '@/lib/dashboard-stats';
import { TodaysLogWidget } from '@/components/dashboard/TodaysLogWidget';
import { StreaksStatsWidget } from '@/components/dashboard/StreaksStatsWidget';
import { ExperimentProgressWidget } from '@/components/dashboard/ExperimentProgressWidget';
import { CommunityFeedWidget } from '@/components/dashboard/CommunityFeedWidget';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const { userProfile, user } = useAuth();

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

            {/* Right: Welcome Message with enhanced styling */}
            <div className="flex flex-col justify-center h-full min-h-[200px] rounded-2xl p-8 relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
              
              {/* Content with enhanced styling */}
              <div className="relative z-10 space-y-4">
                <h1 className="text-5xl font-heading bg-gradient-to-r from-accent-1 via-yellow-300 to-accent-1 bg-clip-text text-transparent">
                  Hello, {firstName}!
                </h1>
                <div className="space-y-2">
                  <p className="text-2xl text-white font-light">
                    Ready to unlock your potential today?
                  </p>
                  <div className="w-20 h-1 bg-gradient-to-r from-accent-1 to-accent-1/50 rounded-full"></div>
                </div>
                
                {/* Optional motivational quote */}
                <p className="text-white/70 text-sm italic mt-4 max-w-md">
                  "The key to success is to focus on goals, not obstacles."
                </p>
              </div>
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