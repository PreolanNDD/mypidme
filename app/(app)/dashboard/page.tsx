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

            {/* Right: Welcome Message */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-heading mb-2">
                <span className="text-accent-1">Hello, {firstName}!</span>
              </h1>
              <p className="text-xl text-white">
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