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

  // Fetch trackable items
  const { data: trackableItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id,
  });

  // Fetch today's entries
  const { data: todaysEntries = {}, isLoading: loadingEntries } = useQuery({
    queryKey: ['todaysEntries', user?.id],
    queryFn: () => getTodaysEntries(user!.id),
    enabled: !!user?.id,
  });

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: () => getDashboardStats(user!.id),
    enabled: !!user?.id,
  });

  const isLoading = loadingItems || loadingEntries || loadingStats;

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Section 1: Welcome & Stats - SWAPPED POSITIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Streaks & Stats Widget */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_25px_50px_-12px_rgba(255,255,255,0.25)]">
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
                Ready to optimize your day?
              </p>
            </div>
          </div>

          {/* Section 2: Interactive "Today's Log" */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_25px_50px_-12px_rgba(255,255,255,0.25)]">
            <TodaysLogWidget
              trackableItems={trackableItems}
              todaysEntries={todaysEntries}
              loading={isLoading}
            />
          </div>

          {/* Section 3: "Active Experiments" */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_25px_50px_-12px_rgba(255,255,255,0.25)]">
            <ExperimentProgressWidget />
          </div>

          {/* Section 4: "Community Insights" */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_25px_50px_-12px_rgba(255,255,255,0.25)]">
            <CommunityFeedWidget />
          </div>

        </div>
      </div>
    </div>
  );
}