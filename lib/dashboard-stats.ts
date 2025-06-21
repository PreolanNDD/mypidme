import { supabase } from './supabase';

export interface DashboardStats {
  currentStreak: number;
  totalMetrics: number;
  totalEntries: number;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  console.log('📊 [getDashboardStats] === DASHBOARD STATS FETCH STARTED ===');
  console.log('📊 [getDashboardStats] User ID:', userId);

  if (!userId) {
    console.error('❌ [getDashboardStats] No userId provided');
    return {
      currentStreak: 0,
      totalMetrics: 0,
      totalEntries: 0,
    };
  }

  try {
    console.log('📈 [getDashboardStats] Fetching total active metrics...');
    // Get total active metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('trackable_items')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (metricsError) {
      console.error('❌ [getDashboardStats] Error fetching metrics count:', metricsError);
      throw new Error(`Failed to fetch metrics count: ${metricsError.message}`);
    }

    console.log('📈 [getDashboardStats] Metrics data:', {
      count: metricsData?.length || 0,
      data: metricsData
    });

    console.log('📝 [getDashboardStats] Fetching total entries...');
    // Get total entries count
    const { data: entriesData, error: entriesError } = await supabase
      .from('logged_entries')
      .select('id')
      .eq('user_id', userId);

    if (entriesError) {
      console.error('❌ [getDashboardStats] Error fetching entries count:', entriesError);
      throw new Error(`Failed to fetch entries count: ${entriesError.message}`);
    }

    console.log('📝 [getDashboardStats] Entries data:', {
      count: entriesData?.length || 0
    });

    console.log('🔥 [getDashboardStats] Calculating current streak...');
    // Calculate current streak
    const currentStreak = await calculateCurrentStreak(userId);

    const stats: DashboardStats = {
      currentStreak,
      totalMetrics: metricsData?.length || 0,
      totalEntries: entriesData?.length || 0,
    };

    console.log('✅ [getDashboardStats] Dashboard stats calculated successfully:', stats);
    console.log('📊 [getDashboardStats] === DASHBOARD STATS FETCH COMPLETED ===');
    return stats;
  } catch (error) {
    console.error('💥 [getDashboardStats] Unexpected error:', error);
    throw error;
  }
}

async function calculateCurrentStreak(userId: string): Promise<number> {
  console.log('🔥 [calculateCurrentStreak] === STREAK CALCULATION STARTED ===');
  console.log('🔥 [calculateCurrentStreak] User ID:', userId);

  if (!userId) {
    console.error('❌ [calculateCurrentStreak] No userId provided');
    return 0;
  }

  try {
    console.log('📅 [calculateCurrentStreak] Fetching entry dates...');
    // Get all dates where user has logged at least one entry, ordered by date descending
    const { data: entryDates, error } = await supabase
      .from('logged_entries')
      .select('entry_date')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('❌ [calculateCurrentStreak] Error fetching entry dates:', error);
      return 0;
    }

    console.log('📅 [calculateCurrentStreak] Entry dates data:', {
      count: entryDates?.length || 0,
      sample: entryDates?.slice(0, 5)
    });

    if (!entryDates || entryDates.length === 0) {
      console.log('📅 [calculateCurrentStreak] No entries found, streak is 0');
      return 0;
    }

    // Get unique dates and sort them
    const uniqueDates = Array.from(new Set(entryDates.map(entry => entry.entry_date))).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    console.log('📅 [calculateCurrentStreak] Unique entry dates:', {
      count: uniqueDates.length,
      dates: uniqueDates.slice(0, 10) // Show first 10 dates
    });

    // Start from today and count backwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    console.log('🔢 [calculateCurrentStreak] Starting streak calculation from today:', today.toISOString().split('T')[0]);

    // Check each day going backwards
    for (let i = 0; i < uniqueDates.length; i++) {
      const entryDate = new Date(uniqueDates[i]);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);
      
      console.log(`🔢 [calculateCurrentStreak] Checking day ${i + 1}:`, {
        entryDate: entryDate.toISOString().split('T')[0],
        expectedDate: expectedDate.toISOString().split('T')[0],
        currentStreak: streak,
        matches: entryDate.getTime() === expectedDate.getTime()
      });
      
      // If this entry date matches the expected date in our streak
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
        console.log(`✅ [calculateCurrentStreak] Streak continued! New streak: ${streak}`);
      } else {
        console.log(`❌ [calculateCurrentStreak] Streak broken at day ${i + 1}`);
        // If we hit a gap, break the streak
        break;
      }
    }

    console.log('🏁 [calculateCurrentStreak] Final calculated streak:', streak);
    console.log('🔥 [calculateCurrentStreak] === STREAK CALCULATION COMPLETED ===');
    return streak;
  } catch (error) {
    console.error('💥 [calculateCurrentStreak] Unexpected error:', error);
    return 0;
  }
}

export async function getTodaysEntries(userId: string): Promise<Record<string, any>> {
  const today = new Date().toISOString().split('T')[0];
  console.log('📝 [getTodaysEntries] === TODAYS ENTRIES FETCH STARTED ===');
  console.log('📝 [getTodaysEntries] User ID:', userId);
  console.log('📝 [getTodaysEntries] Date:', today);

  if (!userId) {
    console.error('❌ [getTodaysEntries] No userId provided');
    return {};
  }

  try {
    console.log('🔍 [getTodaysEntries] Querying database...');
    const { data: entries, error } = await supabase
      .from('logged_entries')
      .select('trackable_item_id, numeric_value, text_value, boolean_value')
      .eq('user_id', userId)
      .eq('entry_date', today);

    if (error) {
      console.error('❌ [getTodaysEntries] Error fetching entries:', error);
      throw new Error(`Failed to fetch today's entries: ${error.message}`);
    }

    console.log('📝 [getTodaysEntries] Raw entries data:', {
      count: entries?.length || 0,
      entries: entries
    });

    // Convert to a map of trackable_item_id -> value
    const entriesMap: Record<string, any> = {};
    entries?.forEach(entry => {
      let value: any = null;
      
      if (entry.numeric_value !== null && entry.numeric_value !== undefined) {
        value = entry.numeric_value;
      } else if (entry.boolean_value !== null && entry.boolean_value !== undefined) {
        value = entry.boolean_value;
      } else if (entry.text_value !== null && entry.text_value !== undefined) {
        value = entry.text_value;
      }
      
      if (value !== null) {
        entriesMap[entry.trackable_item_id] = value;
        console.log(`📝 [getTodaysEntries] Mapped entry: ${entry.trackable_item_id} = ${value}`);
      }
    });

    console.log('✅ [getTodaysEntries] Entries map created:', entriesMap);
    console.log('📝 [getTodaysEntries] === TODAYS ENTRIES FETCH COMPLETED ===');
    return entriesMap;
  } catch (error) {
    console.error('💥 [getTodaysEntries] Unexpected error:', error);
    throw error;
  }
}