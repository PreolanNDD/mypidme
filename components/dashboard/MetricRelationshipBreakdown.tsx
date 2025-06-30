'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Zap, BarChart2, CalendarCheck2, TrendingUp, TrendingDown, AlertCircle, Search, LineChart, Sparkles, Calendar } from 'lucide-react';
import { TrackableItem } from '@/lib/types';

interface DualMetricChartData {
  date: string;
  formattedDate: string;
  primaryValue: number | null;
  comparisonValue: number | null;
}

interface ConditionalAveragesData {
  type: 'boolean' | 'numeric';
  group1: {
    label: string;
    average: number;
    count: number;
  };
  group2: {
    label: string;
    average: number;
    count: number;
  };
  difference: number;
}

interface ConsistencyAnalysisData {
  inStreakAverage: number;
  outOfStreakAverage: number;
  inStreakCount: number;
  outOfStreakCount: number;
  totalStreaks: number;
  longestStreak: number;
  difference: number;
}

interface MetricRelationshipBreakdownProps {
  chartData: DualMetricChartData[];
  primaryMetric: TrackableItem;
  comparisonMetric: TrackableItem;
}

export function MetricRelationshipBreakdown({ 
  chartData, 
  primaryMetric, 
  comparisonMetric 
}: MetricRelationshipBreakdownProps) {
  // Calculate conditional averages
  const conditionalAverages = useMemo((): ConditionalAveragesData | null => {
    if (!chartData.length) {
      return null;
    }

    // Get valid data points where both metrics have values
    const validDataPoints = chartData.filter(dataPoint => 
      dataPoint.primaryValue !== null && dataPoint.primaryValue !== undefined &&
      dataPoint.comparisonValue !== null && dataPoint.comparisonValue !== undefined
    );

    if (validDataPoints.length < 2) {
      return null;
    }

    if (comparisonMetric.type === 'BOOLEAN') {
      // Scenario A: Boolean comparison metric
      const yesGroup = validDataPoints.filter(d => d.comparisonValue === 1);
      const noGroup = validDataPoints.filter(d => d.comparisonValue === 0);

      if (yesGroup.length === 0 || noGroup.length === 0) {
        return null;
      }

      const yesAverage = yesGroup.reduce((sum, d) => sum + d.primaryValue!, 0) / yesGroup.length;
      const noAverage = noGroup.reduce((sum, d) => sum + d.primaryValue!, 0) / noGroup.length;

      return {
        type: 'boolean' as const,
        group1: {
          label: `On days ${comparisonMetric.name} was Yes`,
          average: yesAverage,
          count: yesGroup.length
        },
        group2: {
          label: `On days ${comparisonMetric.name} was No`,
          average: noAverage,
          count: noGroup.length
        },
        difference: yesAverage - noAverage
      };
    } else {
      // Scenario B: Numeric or Scale comparison metric
      const comparisonValues = validDataPoints.map(d => d.comparisonValue!);
      
      // Check for insufficient variance - all values are the same
      const uniqueValues = [...new Set(comparisonValues)];
      if (uniqueValues.length < 2) {
        return null; // Not enough variance to perform analysis
      }
      
      const sortedValues = [...comparisonValues].sort((a, b) => a - b);
      const medianIndex = Math.floor(sortedValues.length / 2);
      const median = sortedValues.length % 2 === 0 
        ? (sortedValues[medianIndex - 1] + sortedValues[medianIndex]) / 2
        : sortedValues[medianIndex];

      const highGroup = validDataPoints.filter(d => d.comparisonValue! > median);
      const lowGroup = validDataPoints.filter(d => d.comparisonValue! <= median);

      if (highGroup.length === 0 || lowGroup.length === 0) {
        return null;
      }

      const highAverage = highGroup.reduce((sum, d) => sum + d.primaryValue!, 0) / highGroup.length;
      const lowAverage = lowGroup.reduce((sum, d) => sum + d.primaryValue!, 0) / lowGroup.length;

      return {
        type: 'numeric' as const,
        group1: {
          label: `On High ${comparisonMetric.name} days`,
          average: highAverage,
          count: highGroup.length
        },
        group2: {
          label: `On Low ${comparisonMetric.name} days`,
          average: lowAverage,
          count: lowGroup.length
        },
        difference: highAverage - lowAverage
      };
    }
  }, [chartData, comparisonMetric]);

  // Calculate consistency analysis
  const consistencyAnalysis = useMemo((): ConsistencyAnalysisData | null => {
    if (!chartData.length) {
      return null;
    }

    // Get valid data points where both metrics have values
    const validDataPoints = chartData.filter(dataPoint => 
      dataPoint.primaryValue !== null && dataPoint.primaryValue !== undefined &&
      dataPoint.comparisonValue !== null && dataPoint.comparisonValue !== undefined
    );

    if (validDataPoints.length < 3) {
      return null;
    }

    // Sort by date to ensure chronological order
    const sortedDataPoints = [...validDataPoints].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Determine streak condition based on comparison metric type
    let streakCondition: (value: number) => boolean;
    
    if (comparisonMetric.type === 'BOOLEAN') {
      // For boolean: streak day is when value is true (1)
      streakCondition = (value: number) => value === 1;
    } else {
      // For numeric/scale: check for variance first
      const comparisonValues = sortedDataPoints.map(d => d.comparisonValue!);
      const uniqueValues = [...new Set(comparisonValues)];
      
      if (uniqueValues.length < 2) {
        return null; // Not enough variance to perform analysis
      }
      
      // Calculate median and use above median as streak condition
      const sortedValues = [...comparisonValues].sort((a, b) => a - b);
      const medianIndex = Math.floor(sortedValues.length / 2);
      const median = sortedValues.length % 2 === 0 
        ? (sortedValues[medianIndex - 1] + sortedValues[medianIndex]) / 2
        : sortedValues[medianIndex];
      
      streakCondition = (value: number) => value > median;
    }

    // Detect streaks of 3+ consecutive days
    const streaks: number[][] = [];
    let currentStreak: number[] = [];
    
    sortedDataPoints.forEach((dataPoint, index) => {
      if (streakCondition(dataPoint.comparisonValue!)) {
        currentStreak.push(index);
      } else {
        if (currentStreak.length >= 3) {
          streaks.push([...currentStreak]);
        }
        currentStreak = [];
      }
    });
    
    // Don't forget the last streak if it's still ongoing
    if (currentStreak.length >= 3) {
      streaks.push([...currentStreak]);
    }

    if (streaks.length === 0) {
      return null;
    }

    // Collect all in-streak and out-of-streak days
    const inStreakIndices = new Set(streaks.flat());
    const inStreakDays: number[] = [];
    const outOfStreakDays: number[] = [];

    sortedDataPoints.forEach((dataPoint, index) => {
      if (inStreakIndices.has(index)) {
        inStreakDays.push(dataPoint.primaryValue!);
      } else {
        outOfStreakDays.push(dataPoint.primaryValue!);
      }
    });

    if (inStreakDays.length === 0 || outOfStreakDays.length === 0) {
      return null;
    }

    // Calculate averages
    const inStreakAverage = inStreakDays.reduce((sum, val) => sum + val, 0) / inStreakDays.length;
    const outOfStreakAverage = outOfStreakDays.reduce((sum, val) => sum + val, 0) / outOfStreakDays.length;

    // Calculate streak statistics
    const longestStreak = Math.max(...streaks.map(streak => streak.length));

    return {
      inStreakAverage,
      outOfStreakAverage,
      inStreakCount: inStreakDays.length,
      outOfStreakCount: outOfStreakDays.length,
      totalStreaks: streaks.length,
      longestStreak,
      difference: inStreakAverage - outOfStreakAverage
    };
  }, [chartData, comparisonMetric]);

  // Check if we have insufficient data variance for analysis
  const hasInsufficientVariance = useMemo(() => {
    if (!chartData.length) return false;

    const validDataPoints = chartData.filter(dataPoint => 
      dataPoint.primaryValue !== null && dataPoint.primaryValue !== undefined &&
      dataPoint.comparisonValue !== null && dataPoint.comparisonValue !== undefined
    );

    if (validDataPoints.length < 2) return false;

    // Check if all comparison values are the same
    const comparisonValues = validDataPoints.map(d => d.comparisonValue!);
    const uniqueValues = [...new Set(comparisonValues)];
    
    return uniqueValues.length < 2;
  }, [chartData]);

  // Check if we have enough data points for analysis
  const hasEnoughDataPoints = useMemo(() => {
    if (!chartData.length) return false;

    // Count data points where both metrics have values (including zeros)
    const validDataPoints = chartData.filter(dataPoint => 
      dataPoint.primaryValue !== null && dataPoint.primaryValue !== undefined &&
      dataPoint.comparisonValue !== null && dataPoint.comparisonValue !== undefined
    );

    // We need at least 2 data points for correlation analysis
    return validDataPoints.length >= 2;
  }, [chartData]);

  // Render Conditional Averages Section
  const renderConditionalAverages = () => {
    if (hasInsufficientVariance) {
      return (
        <div className="text-center py-8 space-y-4 group/insufficient">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-md transition-all duration-500 group-hover/insufficient:shadow-lg group-hover/insufficient:scale-110 group-hover/insufficient:rotate-6">
            <Search className="w-10 h-10 text-blue-500 transition-all duration-500 group-hover/insufficient:text-indigo-500" />
          </div>
          <div className="space-y-3 max-w-xl mx-auto">
            <h5 className="font-heading text-xl text-primary-text transition-all duration-500 group-hover/insufficient:text-indigo-700 group-hover/insufficient:tracking-wide">
              Keep Logging to Reveal Your Patterns
            </h5>
            <p className="text-secondary-text leading-relaxed transition-all duration-500 group-hover/insufficient:text-indigo-600">
              You're doing a great job logging your data! This analysis works by comparing different types of days (like high-energy days vs. low-energy days). To find a pattern, the app needs a bit more variety in your logged data for <strong className="text-indigo-700">{comparisonMetric.name}</strong>. Keep tracking consistently, and new insights will appear here as soon as a pattern emerges!
            </p>
          </div>
        </div>
      );
    }

    if (!hasEnoughDataPoints) {
      return (
        <div className="text-center py-6 group/nodata">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover/nodata:scale-110 group-hover/nodata:shadow-md">
            <BarChart2 className="w-8 h-8 text-gray-400 transition-all duration-500 group-hover/nodata:text-gray-600" />
          </div>
          <p className="text-secondary-text transition-all duration-500 group-hover/nodata:text-gray-700">
            Not enough data for conditional analysis. Log more entries to see patterns.
          </p>
        </div>
      );
    }

    if (!conditionalAverages) {
      return (
        <div className="text-center py-6 group/nodata">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover/nodata:scale-110 group-hover/nodata:shadow-md">
            <BarChart2 className="w-8 h-8 text-gray-400 transition-all duration-500 group-hover/nodata:text-gray-600" />
          </div>
          <p className="text-secondary-text transition-all duration-500 group-hover/nodata:text-gray-700">
            Not enough data for conditional analysis. Log more entries to see patterns.
          </p>
        </div>
      );
    }

    const { group1, group2, difference } = conditionalAverages;
    const higherGroup = group1.average > group2.average ? group1 : group2;
    const lowerGroup = group1.average > group2.average ? group2 : group1;

    return (
      <div className="space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-400/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-medium text-lg text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
            Conditional Averages
          </h4>
        </div>

        {/* Group Comparisons - Enhanced with animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Group 1 */}
          <div className="group/group1 bg-gradient-to-br from-green-50 to-green-100 rounded-xl overflow-hidden shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-green-200/30 hover:-translate-y-1">
            <div className="p-5 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-400/20 transition-all duration-300 group-hover/group1:scale-110 group-hover/group1:rotate-6">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-medium text-green-900 transition-all duration-300 group-hover/group1:tracking-wide">
                  {group1.label}
                </h5>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-700 transition-all duration-300 group-hover/group1:scale-110 group-hover/group1:text-green-800">
                    {group1.average.toFixed(1)}
                  </p>
                  <p className="text-sm text-green-600">
                    avg {primaryMetric.name}
                  </p>
                </div>
                <div className="bg-white/70 px-3 py-1 rounded-full text-sm text-green-700 shadow-sm transition-all duration-300 group-hover/group1:bg-white group-hover/group1:shadow-md">
                  {group1.count} day{group1.count !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Group 2 */}
          <div className="group/group2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-gray-200/30 hover:-translate-y-1">
            <div className="p-5 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center shadow-md shadow-gray-400/20 transition-all duration-300 group-hover/group2:scale-110 group-hover/group2:rotate-6">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <h5 className="font-medium text-gray-900 transition-all duration-300 group-hover/group2:tracking-wide">
                  {group2.label}
                </h5>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-700 transition-all duration-300 group-hover/group2:scale-110 group-hover/group2:text-gray-800">
                    {group2.average.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    avg {primaryMetric.name}
                  </p>
                </div>
                <div className="bg-white/70 px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm transition-all duration-300 group-hover/group2:bg-white group-hover/group2:shadow-md">
                  {group2.count} day{group2.count !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Difference Analysis - Enhanced with animations */}
        <div className="group/diff bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-blue-200/30 hover:-translate-y-1">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 flex-shrink-0 transition-all duration-300 group-hover/diff:scale-110 group-hover/diff:rotate-6">
              {difference > 0 ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : difference < 0 ? (
                <TrendingDown className="w-5 h-5 text-white" />
              ) : (
                <BarChart2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h5 className="font-medium text-blue-900 text-lg transition-all duration-300 group-hover/diff:tracking-wide group-hover/diff:text-indigo-900">
                  Difference: {Math.abs(difference).toFixed(1)} points
                </h5>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse absolute -top-2 -right-2" />
                </div>
              </div>
              <p className="text-blue-800 leading-relaxed transition-all duration-300 group-hover/diff:text-indigo-800">
                {higherGroup.label} shows <span className="font-medium">{Math.abs(difference).toFixed(1)} points higher</span> average {primaryMetric.name} than {lowerGroup.label}.
                {Math.abs(difference) >= 2 ? (
                  <span className="block mt-2 text-sm font-medium text-blue-700 transition-all duration-300 group-hover/diff:text-indigo-700">
                    Upon closer inpsection, this is a significant difference! It suggests a strong relationship between these metrics.
                  </span>
                ) : Math.abs(difference) >= 1 ? (
                  <span className="block mt-2 text-sm font-medium text-blue-700 transition-all duration-300 group-hover/diff:text-indigo-700">
                    Upon closer inpsection, this is a notable difference that's worth paying attention to.
                  </span>
                ) : (
                  <span className="block mt-2 text-sm font-medium text-blue-700 transition-all duration-300 group-hover/diff:text-indigo-700">
                    Upon closer inpsection, this is a subtle difference. More data might reveal a stronger pattern over time.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Consistency Analysis Section
  const renderConsistencyAnalysis = () => {
    if (hasInsufficientVariance) {
      return (
        <div className="text-center py-8 space-y-4 group/insufficient">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-md transition-all duration-500 group-hover/insufficient:shadow-lg group-hover/insufficient:scale-110 group-hover/insufficient:rotate-6">
            <LineChart className="w-10 h-10 text-blue-500 transition-all duration-500 group-hover/insufficient:text-indigo-500" />
          </div>
          <div className="space-y-3 max-w-xl mx-auto">
            <h5 className="font-heading text-xl text-primary-text transition-all duration-500 group-hover/insufficient:text-indigo-700 group-hover/insufficient:tracking-wide">
              Keep Logging to Reveal Your Patterns
            </h5>
            <p className="text-secondary-text leading-relaxed transition-all duration-500 group-hover/insufficient:text-indigo-600">
              You're doing a great job logging your data! This analysis works by comparing different types of days (like high-energy days vs. low-energy days). To find a pattern, the app needs a bit more variety in your logged data for <strong className="text-indigo-700">{comparisonMetric.name}</strong>. Keep tracking consistently, and new insights will appear here as soon as a pattern emerges!
            </p>
          </div>
        </div>
      );
    }

    if (!hasEnoughDataPoints) {
      return (
        <div className="text-center py-8 space-y-4 group/nostreak">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover/nostreak:scale-110 group-hover/nostreak:shadow-md">
            <AlertCircle className="w-8 h-8 text-gray-400 transition-all duration-500 group-hover/nostreak:text-gray-600" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h5 className="font-medium text-primary-text text-lg transition-all duration-500 group-hover/nostreak:text-gray-700 group-hover/nostreak:tracking-wide">
              Unlock Your Consistency Insight
            </h5>
            <p className="text-secondary-text transition-all duration-500 group-hover/nostreak:text-gray-700">
              This analysis reveals how building a streak of positive inputs impacts your outcomes.
            </p>
            <p className="text-secondary-text transition-all duration-500 group-hover/nostreak:text-gray-700">
              Your first insight is just a 3-day streak away. Start one today by logging a positive value (like a 'Yes' for a workout or a high rating for your sleep quality) for 3 days in a row!
            </p>
          </div>
        </div>
      );
    }

    if (!consistencyAnalysis) {
      return (
        <div className="text-center py-8 space-y-4 group/nostreak">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover/nostreak:scale-110 group-hover/nostreak:shadow-md">
            <AlertCircle className="w-8 h-8 text-gray-400 transition-all duration-500 group-hover/nostreak:text-gray-600" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h5 className="font-medium text-primary-text text-lg transition-all duration-500 group-hover/nostreak:text-gray-700 group-hover/nostreak:tracking-wide">
              Unlock Your Consistency Insight
            </h5>
            <p className="text-secondary-text transition-all duration-500 group-hover/nostreak:text-gray-700">
              This analysis reveals how building a streak of positive inputs impacts your outcomes.
            </p>
            <p className="text-secondary-text transition-all duration-500 group-hover/nostreak:text-gray-700">
              Your first insight is just a 3-day streak away. Start one today by logging a positive value (like a 'Yes' for a workout or a high rating for your sleep quality) for 3 days in a row!
            </p>
          </div>
        </div>
      );
    }

    const { 
      inStreakAverage, 
      outOfStreakAverage, 
      inStreakCount, 
      outOfStreakCount, 
      totalStreaks, 
      longestStreak, 
      difference 
    } = consistencyAnalysis;

    const getImpactStrength = (diff: number): string => {
      const absDiff = Math.abs(diff);
      if (absDiff >= 2) return 'Strong';
      if (absDiff >= 1) return 'Moderate';
      return 'Minimal';
    };

    const impactStrength = getImpactStrength(difference);

    return (
      <div className="space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-400/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
            <CalendarCheck2 className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-medium text-lg text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
            Consistency Impact
          </h4>
        </div>

        {/* Streak Summary - Enhanced with animations */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group/streaks bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-blue-200/30 hover:-translate-y-1">
            <div className="p-5 text-center">
              <p className="text-3xl font-bold text-blue-600 mb-1 transition-all duration-300 group-hover/streaks:scale-110 group-hover/streaks:text-indigo-600">
                {totalStreaks}
              </p>
              <p className="text-sm text-blue-700">
                Total Streaks
              </p>
              <div className="mt-2 text-xs text-blue-500">
                Periods of 3+ consecutive days
              </div>
            </div>
          </div>
          
          <div className="group/longest bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl overflow-hidden shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-purple-200/30 hover:-translate-y-1">
            <div className="p-5 text-center">
              <p className="text-3xl font-bold text-purple-600 mb-1 transition-all duration-300 group-hover/longest:scale-110 group-hover/longest:text-pink-600">
                {longestStreak}
              </p>
              <p className="text-sm text-purple-700">
                Longest Streak
              </p>
              <div className="mt-2 text-xs text-purple-500">
                Consecutive days in a row
              </div>
            </div>
          </div>
        </div>

        {/* Consistency Comparison - Enhanced with animations */}
        <div className="space-y-4">
          {/* In-Streak Performance */}
          <div className="group/inStreak bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl overflow-hidden border border-green-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-green-200/30 hover:-translate-y-1">
            <div className="p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-md shadow-green-400/20 transition-all duration-300 group-hover/inStreak:scale-110 group-hover/inStreak:rotate-6">
                  <CalendarCheck2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h5 className="font-medium text-green-900 transition-all duration-300 group-hover/inStreak:tracking-wide">
                    During consistent {comparisonMetric.name} periods
                  </h5>
                  <p className="text-xs text-green-700">
                    {inStreakCount} day{inStreakCount !== 1 ? 's' : ''} (streaks of 3+ days)
                  </p>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-700 transition-all duration-300 group-hover/inStreak:scale-110 group-hover/inStreak:text-green-800">
                    {inStreakAverage.toFixed(1)}
                  </p>
                  <p className="text-sm text-green-600">
                    avg {primaryMetric.name}
                  </p>
                </div>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-green-500 animate-pulse absolute -top-2 -right-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Out-of-Streak Performance */}
          <div className="group/outStreak bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-gray-200/30 hover:-translate-y-1">
            <div className="p-5">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center shadow-md shadow-gray-400/20 transition-all duration-300 group-hover/outStreak:scale-110 group-hover/outStreak:rotate-6">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 transition-all duration-300 group-hover/outStreak:tracking-wide">
                    On all other days
                  </h5>
                  <p className="text-xs text-gray-700">
                    {outOfStreakCount} day{outOfStreakCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-gray-700 transition-all duration-300 group-hover/outStreak:scale-110 group-hover/outStreak:text-gray-800">
                    {outOfStreakAverage.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    avg {primaryMetric.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Analysis - Enhanced with animations */}
        <div className="group/impact bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-blue-200/30 hover:-translate-y-1">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 flex-shrink-0 transition-all duration-300 group-hover/impact:scale-110 group-hover/impact:rotate-6">
              {difference > 0 ? (
                <TrendingUp className="w-5 h-5 text-white" />
              ) : difference < 0 ? (
                <TrendingDown className="w-5 h-5 text-white" />
              ) : (
                <CalendarCheck2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h5 className="font-medium text-blue-900 text-lg transition-all duration-300 group-hover/impact:tracking-wide group-hover/impact:text-indigo-900">
                  {impactStrength} Impact: {Math.abs(difference).toFixed(1)} points
                </h5>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse absolute -top-2 -right-2" />
                </div>
              </div>
              <p className="text-blue-800 leading-relaxed transition-all duration-300 group-hover/impact:text-indigo-800">
                {difference > 0 
                  ? <span>Consistency <span className="font-medium">boosts</span> your {primaryMetric.name} by {difference.toFixed(1)} points on average.</span>
                  : difference < 0
                  ? <span>Consistency appears to <span className="font-medium">lower</span> your {primaryMetric.name} by {Math.abs(difference).toFixed(1)} points on average.</span>
                  : <span>Consistency shows no clear impact on your {primaryMetric.name}.</span>
                }
                
                {Math.abs(difference) >= 2 ? (
                  <span className="block mt-2 text-sm font-medium text-blue-700 transition-all duration-300 group-hover/impact:text-indigo-700">
                    This is a significant effect! Maintaining consistent {comparisonMetric.name} appears to have a strong influence on your {primaryMetric.name}.
                  </span>
                ) : Math.abs(difference) >= 1 ? (
                  <span className="block mt-2 text-sm font-medium text-blue-700 transition-all duration-300 group-hover/impact:text-indigo-700">
                    This is a notable effect. Consistency in your {comparisonMetric.name} seems to matter for your {primaryMetric.name}.
                  </span>
                ) : (
                  <span className="block mt-2 text-sm font-medium text-blue-700 transition-all duration-300 group-hover/impact:text-indigo-700">
                    This is a subtle effect. More data might reveal a stronger pattern over time.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-heading text-2xl text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
            Relationship Breakdown
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-4">
        {/* Conditional Averages Section */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-500 hover:shadow-lg hover:border-purple-100 group">
          {renderConditionalAverages()}
        </div>
        
        {/* Consistency Analysis Section */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-500 hover:shadow-lg hover:border-purple-100 group">
          {renderConsistencyAnalysis()}
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
      </CardContent>
    </Card>
  );
}