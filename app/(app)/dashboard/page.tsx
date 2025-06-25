'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { getTrackableItems } from '@/lib/trackable-items';
import { getDashboardStats, getTodaysEntries } from '@/lib/dashboard-stats';
import { TodaysLogWidget } from '@/components/dashboard/TodaysLogWidget';
import { StreaksStatsWidget } from '@/components/dashboard/StreaksStatsWidget';
import { ExperimentProgressWidget } from '@/components/dashboard/ExperimentProgressWidget';
import { CommunityFeedWidget } from '@/components/dashboard/CommunityFeedWidget';
import { LoadingState, CardSkeleton } from '@/components/error/LoadingState';
import { PageErrorBoundary } from '@/components/error/PageErrorBoundary';
import { useQuery } from '@tanstack/react-query';

function DashboardContent() {
  const { userProfile, user } = useAuth();

  // Extract first name with fallback logic
  const firstName = userProfile?.first_name || 
                   user?.user_metadata?.first_name || 
                   user?.email?.split('@')[0] || 
                   'there';

  // Fetch trackable items with error handling
  const { data: trackableItems = [], isLoading: loadingItems, error: itemsError } = useQuery({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch today's entries with error handling
  const { data: todaysEntries = {}, isLoading: loadingEntries, error: entriesError } = useQuery({
    queryKey: ['todaysEntries', user?.id],
    queryFn: () => getTodaysEntries(user!.id),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch dashboard stats with error handling
  const { data: dashboardStats, isLoading: loadingStats, error: statsError } = useQuery({
    queryKey: ['dashboardStats', user?.id],
    queryFn: () => getDashboardStats(user!.id),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingItems || loadingEntries || loadingStats;
  const hasError = itemsError || entriesError || statsError;

  // Handle errors gracefully
  if (hasError) {
    console.error('Dashboard data loading error:', { itemsError, entriesError, statsError });
    // Let the error boundary handle this
    throw new Error('Failed to load dashboard data');
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CardSkeleton />
              <div className="flex flex-col justify-center">
                <div className="animate-pulse">
                  <div className="h-10 bg-white/20 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-white/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Section 1: Welcome & Stats - SWAPPED POSITIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Streaks & Stats Widget */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
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

          {/* Section 2: Interactive "Today's Log" */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <TodaysLogWidget
              trackableItems={trackableItems}
              todaysEntries={todaysEntries}
              loading={isLoading}
            />
          </div>

          {/* Section 3: "Active Experiments" */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <ExperimentProgressWidget />
          </div>

          {/* Section 4: "Community Insights" */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <CommunityFeedWidget />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PageErrorBoundary pageName="Dashboard">
      <DashboardContent />
    </PageErrorBoundary>
  );
}