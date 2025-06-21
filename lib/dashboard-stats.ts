import { supabase } from './supabase';

export interface DashboardStats {
  currentStreak: number;
  totalMetrics: number;
  totalEntries: number;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  console.log('Fetching dashboard stats for user:', userId);

  if (!userId) {
    console.error('No userId provided to getDashboardStats');
    return {
      currentStreak: 0,
      totalMetrics: 0,
      totalEntries: 0,
    };
  }

  try {
    // Get total active metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('trackable_items')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (metricsError) {
      console.error('Error fetching metrics count:', metricsError);
      throw new Error(`Failed to fetch metrics count: ${metricsError.message}`);
    }

    // Get total entries count
    const { data: entriesData, error: entriesError } = await supabase
      .from('logged_entries')
      .select('id')
      .eq('user_id', userId);

    if (entriesError) {
      console.error('Error fetching entries count:', entriesError);
      throw new Error(`Failed to fetch entries count: ${entriesError.message}`);
    }

    // Calculate current streak
    const currentStreak = await calculateCurrentStreak(userId);

    const stats: DashboardStats = {
      currentStreak,
      totalMetrics: metricsData?.length || 0,
      totalEntries: entriesData?.length || 0,
    };

    console.log('Dashboard stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('Unexpected error in getDashboardStats:', error);
    throw error;
  }
}

async function calculateCurrentStreak(userId: string): Promise<number> {
  console.log('Calculating current streak for user:', userId);

  if (!userId) {
    console.error('No userId provided to calculateCurrentStreak');
    return 0;
  }

  try {
    // Get all dates where user has logged at least one entry, ordered by date descending
    const { data: entryDates, error } = await supabase
      .from('logged_entries')
      .select('entry_date')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching entry dates for streak:', error);
      return 0;
    }

    if (!entryDates || entryDates.length === 0) {
      console.log('No entries found, streak is 0');
      return 0;
    }

    // Get unique dates and sort them
    const uniqueDates = Array.from(new Set(entryDates.map(entry => entry.entry_date))).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    console.log('Unique entry dates:', uniqueDates);

    // Start from today and count backwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    // Check each day going backwards
    for (let i = 0; i < uniqueDates.length; i++) {
      const entryDate = new Date(uniqueDates[i]);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);
      
      // If this entry date matches the expected date in our streak
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        // If we hit a gap, break the streak
        break;
      }
    }

    console.log('Calculated current streak:', streak);
    return streak;
  } catch (error) {
    console.error('Unexpected error in calculateCurrentStreak:', error);
    return 0;
  }
}

export async function getTodaysEntries(userId: string): Promise<Record<string, any>> {
  const today = new Date().toISOString().split('T')[0];
  console.log('Fetching today\'s entries for user:', userId, 'date:', today);

  if (!userId) {
    console.error('No userId provided to getTodaysEntries');
    return {};
  }

  try {
    const { data: entries, error } = await supabase
      .from('logged_entries')
      .select('trackable_item_id, numeric_value, text_value, boolean_value')
      .eq('user_id', userId)
      .eq('entry_date', today);

    if (error) {
      console.error('Error fetching today\'s entries:', error);
      throw new Error(`Failed to fetch today's entries: ${error.message}`);
    }

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
      }
    });

    console.log('Today\'s entries map:', entriesMap);
    return entriesMap;
  } catch (error) {
    console.error('Unexpected error in getTodaysEntries:', error);
    throw error;
  }
}