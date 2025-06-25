'use client';

// Make sure useCallback is imported from 'react'
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTrackableItems } from '@/lib/trackable-items';
import { TrackableItem } from '@/lib/types';
import { MetricsManagement } from '@/components/log/MetricsManagement';
import { DailyLogger } from '@/components/log/DailyLogger';
import { LoadingState } from '@/components/error/LoadingState';
import { PageErrorBoundary } from '@/components/error/PageErrorBoundary';
import { BookOpen } from 'lucide-react';

function LogContent() {
  const { user } = useAuth();
  const [trackableItems, setTrackableItems] = useState<TrackableItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- THE DEFINITIVE FIX IS HERE ---
  // We wrap the data fetching function in useCallback and depend ONLY
  // on the user's ID, which is a stable string.
  const loadTrackableItems = useCallback(async () => {
    if (!user?.id) {
      // If there's no user ID, we can't fetch anything.
      setTrackableItems([]);
      setLoadingItems(false);
      return;
    };
    
    setLoadingItems(true);
    setError(null);
    
    try {
      const items = await getTrackableItems(user.id);
      setTrackableItems(items);
    } catch (error) {
      console.error('Failed to load trackable items:', error);
      setError('Failed to load your metrics. Please try refreshing the page.');
      setTrackableItems([]); // Set to empty array on error
    } finally {
      setLoadingItems(false);
    }
  }, [user?.id]); // The dependency array is now stable.

  // This useEffect now calls the stable function. It will only run ONCE
  // when the component mounts and the user exists, because loadTrackableItems
  // is now stable. This breaks the loop at its source.
  useEffect(() => {
    loadTrackableItems();
  }, [loadTrackableItems]);

  // Handle errors gracefully
  if (error) {
    throw new Error(error);
  }

  if (loadingItems) {
    return <LoadingState fullScreen message="Loading your metrics..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <MetricsManagement
                  // We now pass the stable function as the onRefresh prop
                  onRefresh={loadTrackableItems}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <DailyLogger
                // This component also needs the list of items
                // This will be stable because loadTrackableItems only runs once
                trackableItems={trackableItems}
                loading={loadingItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LogPage() {
  return (
    <PageErrorBoundary pageName="Log">
      <LogContent />
    </PageErrorBoundary>
  );
}