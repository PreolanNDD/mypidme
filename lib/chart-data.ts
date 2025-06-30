import { createClient } from './supabase/client';

export interface ChartDataPoint {
  date: string;
  value: number | null;
  formattedDate: string;
}

export interface MultiMetricChartData {
  date: string;
  formattedDate: string;
  [metricId: string]: number | string | null;
}

export interface DualMetricChartData {
  date: string;
  formattedDate: string;
  primaryValue: number | null;
  comparisonValue: number | null;
}

export async function getChartData(
  userId: string, 
  metricId: string, 
  days: number
): Promise<ChartDataPoint[]> {
  console.log(`Fetching chart data for user: ${userId}, metric: ${metricId}, days: ${days}`);

  if (!userId || !metricId) {
    console.error('Missing userId or metricId in getChartData');
    return [];
  }

  const supabase = createClient();

  try {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    // Format dates for SQL query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching chart data for ${days} days: ${startDateStr} to ${endDateStr}`);

    // Fetch logged entries for the specified metric and date range
    const { data: entries, error } = await supabase
      .from('logged_entries')
      .select('entry_date, numeric_value')
      .eq('user_id', userId)
      .eq('trackable_item_id', metricId)
      .gte('entry_date', startDateStr)
      .lte('entry_date', endDateStr)
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching chart data:', error);
      throw new Error(`Failed to fetch chart data: ${error.message}`);
    }

    // Create a map of existing entries - FIXED: Include 0 values
    const entryMap = new Map<string, number>();
    entries?.forEach(entry => {
      // CRITICAL FIX: Check for null/undefined explicitly, not falsy values
      if (entry.numeric_value !== null && entry.numeric_value !== undefined) {
        entryMap.set(entry.entry_date, entry.numeric_value);
      }
    });

    // Generate complete date range with null values for missing dates
    const chartData: ChartDataPoint[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      // FIXED: Use has() to check existence, not falsy check
      const value = entryMap.has(dateStr) ? entryMap.get(dateStr)! : null;
      
      chartData.push({
        date: dateStr,
        value: value,
        formattedDate: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: currentDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        })
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generated ${chartData.length} data points for ${days} days`);
    return chartData;
  } catch (error) {
    console.error('Unexpected error in getChartData:', error);
    throw error;
  }
}

export async function getMultiMetricChartData(
  userId: string, 
  metricIds: string[], 
  days: number
): Promise<MultiMetricChartData[]> {
  if (metricIds.length === 0) return [];

  console.log(`Fetching multi-metric chart data for user: ${userId}, metrics: ${metricIds.length}, days: ${days}`);

  if (!userId) {
    console.error('Missing userId in getMultiMetricChartData');
    return [];
  }

  const supabase = createClient();

  try {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    // Format dates for SQL query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching multi-metric chart data for ${days} days: ${startDateStr} to ${endDateStr}`);

    // Fetch logged entries for all specified metrics and date range
    const { data: entries, error } = await supabase
      .from('logged_entries')
      .select('entry_date, trackable_item_id, numeric_value')
      .eq('user_id', userId)
      .in('trackable_item_id', metricIds)
      .gte('entry_date', startDateStr)
      .lte('entry_date', endDateStr)
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching multi-metric chart data:', error);
      throw new Error(`Failed to fetch chart data: ${error.message}`);
    }

    // Create a nested map: date -> metricId -> value
    const entryMap = new Map<string, Map<string, number>>();
    entries?.forEach(entry => {
      // CRITICAL FIX: Check for null/undefined explicitly, not falsy values
      if (entry.numeric_value !== null && entry.numeric_value !== undefined) {
        if (!entryMap.has(entry.entry_date)) {
          entryMap.set(entry.entry_date, new Map());
        }
        entryMap.get(entry.entry_date)!.set(entry.trackable_item_id, entry.numeric_value);
      }
    });

    // Generate complete date range with null values for missing dates
    const chartData: MultiMetricChartData[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEntries = entryMap.get(dateStr) || new Map();
      
      const dataPoint: MultiMetricChartData = {
        date: dateStr,
        formattedDate: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: currentDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        })
      };

      // Add each metric's value for this date (or null if no data)
      metricIds.forEach(metricId => {
        // FIXED: Use has() to check existence, not falsy check
        dataPoint[metricId] = dayEntries.has(metricId) ? dayEntries.get(metricId)! : null;
      });

      chartData.push(dataPoint);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generated ${chartData.length} data points for ${days} days`);
    return chartData;
  } catch (error) {
    console.error('Unexpected error in getMultiMetricChartData:', error);
    throw error;
  }
}

// Function to get chart data for a specific date range
export const getDualMetricChartDataForDateRange = async (
  userId: string,
  primaryMetricId: string,
  comparisonMetricId: string | null,
  startDate: string,
  endDate: string
): Promise<DualMetricChartData[]> => {
  console.log(`Fetching dual metric chart data for user: ${userId}, primary: ${primaryMetricId}, comparison: ${comparisonMetricId}, from ${startDate} to ${endDate}`);

  if (!userId || !primaryMetricId || !startDate || !endDate) {
    console.error('Missing required parameters in getDualMetricChartDataForDateRange');
    return [];
  }

  const supabase = createClient();

  try {
    // Build the metric IDs array
    const metricIds = [primaryMetricId];
    if (comparisonMetricId) {
      metricIds.push(comparisonMetricId);
    }

    // Fetch logged entries for the specified metrics and date range
    const { data: entries, error } = await supabase
      .from('logged_entries')
      .select('entry_date, trackable_item_id, numeric_value, boolean_value')
      .eq('user_id', userId)
      .in('trackable_item_id', metricIds)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching dual metric chart data:', error);
      throw new Error(`Failed to fetch chart data: ${error.message}`);
    }

    // Create a nested map: date -> metricId -> value
    const entryMap = new Map<string, Map<string, number>>();
    entries?.forEach(entry => {
      // Handle both numeric and boolean values (convert boolean to 0/1)
      let value: number | null = null;
      
      // CRITICAL FIX: Check for null/undefined explicitly, not falsy values
      if (entry.numeric_value !== null && entry.numeric_value !== undefined) {
        value = entry.numeric_value;
      } else if (entry.boolean_value !== null && entry.boolean_value !== undefined) {
        // FIXED: Properly handle false boolean values
        value = entry.boolean_value ? 1 : 0;
      }

      // FIXED: Include 0 values and false boolean values (converted to 0)
      if (value !== null && value !== undefined) {
        if (!entryMap.has(entry.entry_date)) {
          entryMap.set(entry.entry_date, new Map());
        }
        entryMap.get(entry.entry_date)!.set(entry.trackable_item_id, value);
      }
    });

    // Generate complete date range with null values for missing dates
    const chartData: DualMetricChartData[] = [];
    
    // Calculate the number of days in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const currentDate = new Date(start);

    for (let i = 0; i < dayCount; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEntries = entryMap.get(dateStr) || new Map();
      
      const dataPoint: DualMetricChartData = {
        date: dateStr,
        formattedDate: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: currentDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        }),
        // FIXED: Use has() to check existence, not falsy check
        primaryValue: dayEntries.has(primaryMetricId) ? dayEntries.get(primaryMetricId)! : null,
        comparisonValue: comparisonMetricId ? (dayEntries.has(comparisonMetricId) ? dayEntries.get(comparisonMetricId)! : null) : null
      };

      chartData.push(dataPoint);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`Generated ${chartData.length} data points for date range`);
    return chartData;
  } catch (error) {
    console.error('Unexpected error in getDualMetricChartDataForDateRange:', error);
    throw error;
  }
};

// Original function with days parameter - now with overloaded signature
export async function getDualMetricChartData(
  userId: string, 
  primaryMetricId: string, 
  comparisonMetricId: string | null, 
  days: number
): Promise<DualMetricChartData[]>;

// Overloaded function with date range parameters
export async function getDualMetricChartData(
  userId: string, 
  primaryMetricId: string, 
  comparisonMetricId: string | null, 
  startDate: string, 
  endDate: string
): Promise<DualMetricChartData[]>;

// Implementation that handles both signatures
export async function getDualMetricChartData(
  userId: string, 
  primaryMetricId: string, 
  comparisonMetricId: string | null, 
  daysOrStartDate: number | string,
  endDate?: string
): Promise<DualMetricChartData[]> {
  // Check if we're using the date range version
  if (typeof daysOrStartDate === 'string' && endDate) {
    return getDualMetricChartDataForDateRange(
      userId,
      primaryMetricId,
      comparisonMetricId,
      daysOrStartDate,
      endDate
    );
  }
  
  // Otherwise, use the days version
  const days = typeof daysOrStartDate === 'number' ? daysOrStartDate : 30;
  
  console.log(`Fetching dual metric chart data for user: ${userId}, primary: ${primaryMetricId}, comparison: ${comparisonMetricId}, days: ${days}`);

  if (!userId || !primaryMetricId) {
    console.error('Missing userId or primaryMetricId in getDualMetricChartData');
    return [];
  }

  const supabase = createClient();

  try {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    // Format dates for SQL query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching dual metric chart data for ${days} days: ${startDateStr} to ${endDateStr}`);

    // Build the metric IDs array
    const metricIds = [primaryMetricId];
    if (comparisonMetricId) {
      metricIds.push(comparisonMetricId);
    }

    // Fetch logged entries for the specified metrics and date range
    const { data: entries, error } = await supabase
      .from('logged_entries')
      .select('entry_date, trackable_item_id, numeric_value, boolean_value')
      .eq('user_id', userId)
      .in('trackable_item_id', metricIds)
      .gte('entry_date', startDateStr)
      .lte('entry_date', endDateStr)
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching dual metric chart data:', error);
      throw new Error(`Failed to fetch chart data: ${error.message}`);
    }

    // Create a nested map: date -> metricId -> value
    const entryMap = new Map<string, Map<string, number>>();
    entries?.forEach(entry => {
      // Handle both numeric and boolean values (convert boolean to 0/1)
      let value: number | null = null;
      
      // CRITICAL FIX: Check for null/undefined explicitly, not falsy values
      if (entry.numeric_value !== null && entry.numeric_value !== undefined) {
        value = entry.numeric_value;
      } else if (entry.boolean_value !== null && entry.boolean_value !== undefined) {
        // FIXED: Properly handle false boolean values
        value = entry.boolean_value ? 1 : 0;
      }

      // FIXED: Include 0 values and false boolean values (converted to 0)
      if (value !== null && value !== undefined) {
        if (!entryMap.has(entry.entry_date)) {
          entryMap.set(entry.entry_date, new Map());
        }
        entryMap.get(entry.entry_date)!.set(entry.trackable_item_id, value);
      }
    });

    // Generate complete date range with null values for missing dates
    const chartData: DualMetricChartData[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < days; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEntries = entryMap.get(dateStr) || new Map();
      
      const dataPoint: DualMetricChartData = {
        date: dateStr,
        formattedDate: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: currentDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        }),
        // FIXED: Use has() to check existence, not falsy check
        primaryValue: dayEntries.has(primaryMetricId) ? dayEntries.get(primaryMetricId)! : null,
        comparisonValue: comparisonMetricId ? (dayEntries.has(comparisonMetricId) ? dayEntries.get(comparisonMetricId)! : null) : null
      };

      chartData.push(dataPoint);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  } catch (error) {
    console.error('Unexpected error in getDualMetricChartData:', error);
    throw error;
  }
}