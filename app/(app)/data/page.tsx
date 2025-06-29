'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTrackableItems } from '@/lib/trackable-items';
import { getDualMetricChartData } from '@/lib/chart-data';
import { calculatePearsonCorrelation } from '@/lib/correlation';
import { TrackableItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3, Calendar, TrendingUp, Target, RefreshCw, Share2, ArrowRight } from 'lucide-react';
import { RelationshipStory } from '@/components/dashboard/RelationshipStory';
import { MetricRelationshipBreakdown } from '@/components/dashboard/MetricRelationshipBreakdown';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const DATE_RANGES = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
];

interface DualMetricChartData {
  date: string;
  formattedDate: string;
  primaryValue: number | null;
  comparisonValue: number | null;
  normalizedComparisonValue?: number | null; // For boolean normalization
}

interface AxisConfig {
  leftDomain: [number, number];
  rightDomain: [number, number];
  rightTickFormatter?: (value: number) => string;
  rightTicks?: number[];
  normalizeComparison: boolean;
}

export default function DataPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [primaryMetricId, setPrimaryMetricId] = useState<string>('');
  const [comparisonMetricId, setComparisonMetricId] = useState<string>('none');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30');
  const [shouldFetchChart, setShouldFetchChart] = useState(false);

  // Fetch trackable items with aggressive caching
  const { data: allItems = [], isLoading: loadingItems } = useQuery<TrackableItem[]>({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const outputMetrics = useMemo(() => allItems.filter(item => 
    item.category === 'OUTPUT' && (item.type === 'SCALE_1_10' || item.type === 'NUMERIC')
  ), [allItems]);

  const inputMetrics = useMemo(() => allItems.filter(item => 
    item.category === 'INPUT' && (item.type === 'SCALE_1_10' || item.type === 'NUMERIC' || item.type === 'BOOLEAN')
  ), [allItems]);

  const primaryMetric = allItems.find(item => item.id === primaryMetricId);
  const comparisonMetric = allItems.find(item => item.id === comparisonMetricId);

  // Fetch chart data with enhanced caching
  const { data: rawChartData = [], isLoading: loadingChart, error } = useQuery<DualMetricChartData[]>({
    queryKey: ['dualMetricChartData', user?.id, primaryMetricId, comparisonMetricId, selectedDateRange],
    queryFn: () => getDualMetricChartData(
      user!.id, 
      primaryMetricId, 
      comparisonMetricId === 'none' ? null : comparisonMetricId, 
      parseInt(selectedDateRange)
    ),
    enabled: !!user?.id && !!primaryMetricId && shouldFetchChart,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
  });

  // Advanced Axis Synchronization Processing
  const { chartData, axisConfig } = useMemo(() => {
    if (!primaryMetric || !rawChartData.length) {
      return { chartData: rawChartData, axisConfig: null };
    }

    // Calculate maximum values including 0 values
    const primaryValues = rawChartData
      .map(d => d.primaryValue)
      .filter(v => v !== null && v !== undefined) as number[];
    const comparisonValues = rawChartData
      .map(d => d.comparisonValue)
      .filter(v => v !== null && v !== undefined) as number[];
    
    const primaryMax = primaryValues.length > 0 ? Math.max(...primaryValues) : 10;
    const comparisonMax = comparisonValues.length > 0 ? Math.max(...comparisonValues) : 10;

    let config: AxisConfig;
    let processedData = [...rawChartData];

    if (!comparisonMetric) {
      // Single metric - simple configuration
      config = {
        leftDomain: primaryMetric.type === 'SCALE_1_10' ? [1, 10] : [0, Math.max(primaryMax * 1.1, 1)],
        rightDomain: [0, 10],
        normalizeComparison: false
      };
    } else if (primaryMetric.type === 'NUMERIC' && comparisonMetric.type === 'SCALE_1_10') {
      // Scenario A: Primary NUMERIC, Comparison SCALE_1_10
      const scaledMax = Math.max(primaryMax * 1.1, 1);
      config = {
        leftDomain: [0, scaledMax],
        rightDomain: [0, scaledMax],
        rightTickFormatter: (value: number) => {
          // Convert scaled value back to 1-10 scale
          const scaleValue = Math.round((value / scaledMax) * 10);
          return scaleValue >= 1 && scaleValue <= 10 ? scaleValue.toString() : '';
        },
        rightTicks: Array.from({ length: 10 }, (_, i) => ((i + 1) / 10) * scaledMax),
        normalizeComparison: false
      };
    } else if (primaryMetric.type === 'SCALE_1_10' && comparisonMetric.type === 'NUMERIC') {
      // Scenario B: Primary SCALE_1_10, Comparison NUMERIC
      config = {
        leftDomain: [1, 10],
        rightDomain: [0, Math.max(comparisonMax * 1.1, 1)],
        normalizeComparison: false
      };
    } else if (primaryMetric.type === 'SCALE_1_10' && comparisonMetric.type === 'BOOLEAN') {
      // Scenario C: Primary SCALE_1_10, Comparison BOOLEAN
      // Normalize boolean values to align with 1-10 scale
      processedData = rawChartData.map(d => ({
        ...d,
        // Properly handle false values (0) and true values (1)
        normalizedComparisonValue: d.comparisonValue === 1 ? 7.5 : 
                                   d.comparisonValue === 0 ? 2.5 : null
      }));

      config = {
        leftDomain: [1, 10],
        rightDomain: [1, 10],
        rightTickFormatter: (value: number) => {
          if (Math.abs(value - 7.5) < 0.5) return 'Yes';
          if (Math.abs(value - 2.5) < 0.5) return 'No';
          return '';
        },
        rightTicks: [2.5, 7.5],
        normalizeComparison: true
      };
    } else {
      // Default case - both same type or other combinations
      const leftMax = primaryMetric.type === 'SCALE_1_10' ? 10 : Math.max(primaryMax * 1.1, 1);
      const rightMax = comparisonMetric.type === 'SCALE_1_10' ? 10 : Math.max(comparisonMax * 1.1, 1);
      
      config = {
        leftDomain: primaryMetric.type === 'SCALE_1_10' ? [1, 10] : [0, leftMax],
        rightDomain: comparisonMetric.type === 'SCALE_1_10' ? [1, 10] : [0, rightMax],
        normalizeComparison: false
      };
    }

    return { chartData: processedData, axisConfig: config };
  }, [rawChartData, primaryMetric, comparisonMetric]);

  // Calculate correlation score
  const correlationScore = useMemo(() => {
    if (!primaryMetric || !comparisonMetric || comparisonMetricId === 'none' || !chartData.length) {
      return null;
    }

    // Prepare paired arrays for correlation calculation
    const primaryValues: number[] = [];
    const comparisonValues: number[] = [];

    chartData.forEach(dataPoint => {
      // Only include data points where both metrics have valid values
      if (dataPoint.primaryValue !== null && dataPoint.primaryValue !== undefined &&
          dataPoint.comparisonValue !== null && dataPoint.comparisonValue !== undefined) {
        
        primaryValues.push(dataPoint.primaryValue);
        
        // Use the original comparison value (not normalized) for correlation calculation
        // Boolean values are already converted to 0/1 in the data fetching
        comparisonValues.push(dataPoint.comparisonValue);
      }
    });

    // Calculate correlation if we have enough paired data points
    if (primaryValues.length >= 2) {
      return calculatePearsonCorrelation(primaryValues, comparisonValues);
    }

    return null;
  }, [chartData, primaryMetric, comparisonMetric, comparisonMetricId]);

  const handleUpdateChart = () => {
    if (primaryMetricId) {
      setShouldFetchChart(true);
    }
  };

  const handleShareFinding = () => {
    if (!shouldFetchChart || !primaryMetricId) return;
    
    // Navigate to community/new with chart context
    const params = new URLSearchParams({
      type: 'chart',
      primaryMetricId,
      ...(comparisonMetricId !== 'none' && { comparisonMetricId }),
      dateRange: selectedDateRange
    });
    
    router.push(`/community/new?${params.toString()}`);
  };

  const canShare = shouldFetchChart && primaryMetricId && chartData.length > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-medium text-primary-text mb-2">{label}</p>
          {/* Show 0 values properly */}
          {(data.primaryValue !== null && data.primaryValue !== undefined) && (
            <p className="text-sm flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#7ed984]"></span>
              <span className="font-medium">{primaryMetric?.name}:</span> 
              <span>{data.primaryValue}</span>
            </p>
          )}
          {comparisonMetric && (data.comparisonValue !== null && data.comparisonValue !== undefined) && (
            <p className="text-sm flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#FFA500]"></span>
              <span className="font-medium">{comparisonMetric.name}:</span>
              <span>
                {comparisonMetric.type === 'BOOLEAN' 
                  ? (data.comparisonValue === 1 ? 'Yes' : 'No')
                  : data.comparisonValue
                }
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Legend Component with increased padding and black text
  const CustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload || payload.length === 0) return null;

    return (
      <div className="flex justify-center items-center space-x-8 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-3 px-4 py-2 bg-white/80 rounded-full shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-black">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loadingItems) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Main Page Header - Removed hover animation and star icon */}
          <div className="mb-4">
            <h1 className="font-heading text-3xl text-white mb-2">
              Data Analysis
            </h1>
            <p style={{ color: '#e6e2eb' }} className="text-lg">
              Ever wonder why some days feel great and others don't? Select any goal and any habit to visualize their relationship and find the answer.
            </p>
          </div>
          
          {/* Share Finding Button - Styled like "view all" button from dashboard */}
          {canShare && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleShareFinding}
                className="group/viewall relative overflow-hidden px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
              >
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/viewall:translate-x-full transition-transform duration-500 ease-out"></div>
                
                {/* Content */}
                <div className="relative flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium transition-all duration-300 group-hover/viewall:tracking-wide">
                    Share Finding
                  </span>
                  <div className="transform group-hover/viewall:translate-x-1 transition-transform duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover/viewall:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}

          {outputMetrics.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden group/empty transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 border border-white/20">
              <div className="text-center py-16 px-8">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover/empty:scale-110 group-hover/empty:rotate-12 group-hover/empty:shadow-xl">
                  <BarChart3 className="w-12 h-12 text-gray-400 transition-all duration-500 group-hover/empty:text-gray-600" />
                </div>
                <h3 className="font-heading text-2xl text-primary-text mb-4 transition-all duration-500 group-hover/empty:scale-105">No Output Metrics Available</h3>
                <p className="text-secondary-text mb-8 max-w-lg mx-auto text-lg">
                  You need to create some output metrics (like "Energy Level" or "Mood") before you can analyze your data.
                </p>
                <Button 
                  onClick={() => window.location.href = '/log'}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 px-8 py-3 text-lg"
                >
                  Create Your First Metric
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/empty:translate-x-1" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Chart Controls Section - Enhanced with animations */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/controls">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-500 group-hover/controls:scale-110 group-hover/controls:rotate-6">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="font-heading text-xl sm:text-2xl text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 group-hover/controls:tracking-wider">
                      Chart Controls
                    </h3>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Form Fields in a Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      {/* Output Metric Selector */}
                      <div className="space-y-2 sm:space-y-3 group/goal">
                        <label className="flex items-center space-x-2 text-sm font-medium text-primary-text transition-all duration-300 group-hover/goal:text-purple-600">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-green-400/20 transition-all duration-300 group-hover/goal:scale-110 group-hover/goal:rotate-6">
                            <TrendingUp className="w-3 h-3 text-white" />
                          </div>
                          <span className="transition-all duration-300 group-hover/goal:tracking-wide">Goal</span>
                        </label>
                        <Select 
                          value={primaryMetricId} 
                          onValueChange={setPrimaryMetricId}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 hover:border-green-300 focus:border-green-400 focus:ring-green-200">
                            <SelectValue placeholder="Select an output metric" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                            {outputMetrics.map((metric) => (
                              <SelectItem 
                                key={metric.id} 
                                value={metric.id}
                                className="transition-colors duration-200 hover:bg-green-50 focus:bg-green-50 rounded-lg my-1"
                              >
                                {metric.name} ({metric.type === 'SCALE_1_10' ? 'Scale 1-10' : 'Numeric'})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Input Metric Selector */}
                      <div className="space-y-2 sm:space-y-3 group/habit">
                        <label className="flex items-center space-x-2 text-sm font-medium text-primary-text transition-all duration-300 group-hover/habit:text-purple-600">
                          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-400/20 transition-all duration-300 group-hover/habit:scale-110 group-hover/habit:rotate-6">
                            <Target className="w-3 h-3 text-white" />
                          </div>
                          <span className="transition-all duration-300 group-hover/habit:tracking-wide">Habit</span>
                        </label>
                        <Select 
                          value={comparisonMetricId} 
                          onValueChange={setComparisonMetricId}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 hover:border-orange-300 focus:border-orange-400 focus:ring-orange-200">
                            <SelectValue placeholder="Select an input metric" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                            <SelectItem 
                              value="none"
                              className="transition-colors duration-200 hover:bg-gray-50 focus:bg-gray-50 rounded-lg my-1"
                            >
                              None
                            </SelectItem>
                            {inputMetrics.map((metric) => (
                              <SelectItem 
                                key={metric.id} 
                                value={metric.id}
                                className="transition-colors duration-200 hover:bg-orange-50 focus:bg-orange-50 rounded-lg my-1"
                              >
                                {metric.name} ({
                                  metric.type === 'BOOLEAN' ? 'Yes/No' : 
                                  metric.type === 'SCALE_1_10' ? 'Scale 1-10' : 'Numeric'
                                })
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Range Selector */}
                      <div className="space-y-2 sm:space-y-3 group/date">
                        <label className="flex items-center space-x-2 text-sm font-medium text-primary-text transition-all duration-300 group-hover/date:text-purple-600">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 transition-all duration-300 group-hover/date:scale-110 group-hover/date:rotate-6">
                            <Calendar className="w-3 h-3 text-white" />
                          </div>
                          <span className="transition-all duration-300 group-hover/date:tracking-wide">Time Period</span>
                        </label>
                        <Select 
                          value={selectedDateRange} 
                          onValueChange={setSelectedDateRange}
                        >
                          <SelectTrigger className="bg-white border-2 border-gray-200 rounded-xl transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:ring-blue-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                            {DATE_RANGES.map((range) => (
                              <SelectItem 
                                key={range.value} 
                                value={range.value}
                                className="transition-colors duration-200 hover:bg-blue-50 focus:bg-blue-50 rounded-lg my-1"
                              >
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Update Chart Button - Enhanced with animations */}
                    <button 
                      onClick={handleUpdateChart}
                      disabled={!primaryMetricId || loadingChart}
                      className="group/update relative overflow-hidden w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 sm:px-8 sm:py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {/* Animated background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/update:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Sliding highlight effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/update:translate-x-full transition-transform duration-700 ease-out"></div>
                      
                      {/* Content */}
                      <div className="relative flex items-center justify-center space-x-3">
                        {/* Icon with animation */}
                        <div className="transform group-hover/update:scale-110 group-hover/update:rotate-180 transition-transform duration-700">
                          <RefreshCw className={`w-5 h-5 ${loadingChart ? 'animate-spin' : ''}`} />
                        </div>
                        
                        {/* Text with enhanced styling */}
                        <span className="tracking-wide group-hover/update:tracking-wider transition-all duration-300 text-base sm:text-lg">
                          {loadingChart ? 'Loading...' : 'Update Chart'}
                        </span>
                      </div>
                      
                      {/* Pulse ring effect */}
                      <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/update:opacity-100 group-hover/update:scale-105 transition-all duration-500"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Visual Analysis Section - Enhanced with animations */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/chart">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-500 group-hover/chart:scale-110 group-hover/chart:rotate-6">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className="font-heading text-xl sm:text-2xl text-primary-text bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 group-hover/chart:tracking-wider">
                      Visual Analysis
                    </h3>
                  </div>
                  
                  {!shouldFetchChart ? (
                    <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200 transition-all duration-500 group-hover/chart:border-indigo-200 group-hover/chart:shadow-inner">
                      <div className="text-center max-w-md px-4 sm:px-6 py-8 sm:py-10 transition-all duration-500 group-hover/chart:scale-105">
                        <BarChart3 className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-6 transition-all duration-500 group-hover/chart:text-indigo-300 group-hover/chart:scale-110" />
                        <p className="text-secondary-text text-base sm:text-lg mb-2 transition-all duration-500 group-hover/chart:text-indigo-600">Select a metric and click "Update Chart" to begin</p>
                        <p className="text-gray-400 text-sm transition-all duration-500 group-hover/chart:text-indigo-400">
                          Your data visualization will appear here
                        </p>
                      </div>
                    </div>
                  ) : loadingChart ? (
                    <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-secondary-text text-lg">Loading chart data...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-dashed border-red-200">
                      <div className="text-center">
                        <p className="text-red-600 mb-4 text-lg">Error loading chart data</p>
                        <Button onClick={handleUpdateChart} variant="outline" size="lg" className="bg-white hover:bg-red-50 border-red-300 text-red-600">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="h-64 sm:h-80 md:h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="text-center max-w-md px-4 sm:px-6 py-8 sm:py-10">
                        <BarChart3 className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-6" />
                        <p className="text-secondary-text text-base sm:text-lg mb-2">No data available for the selected time period</p>
                        <p className="text-gray-400 text-sm">
                          Try selecting a different date range or log some data first
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 sm:h-80 md:h-96 transition-all duration-500 transform group-hover/chart:scale-[1.01]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={chartData} 
                          margin={{ 
                            top: 5, 
                            right: 10, 
                            left: 0, 
                            bottom: 5 
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate" 
                            stroke="#708090"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e0e0e0' }}
                            tick={{ fill: '#708090' }}
                            padding={{ left: 5, right: 5 }}
                          />
                          
                          {/* Left Y-Axis */}
                          <YAxis 
                            yAxisId="left"
                            stroke="#7ed984"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e0e0e0' }}
                            tick={{ fill: '#7ed984' }}
                            domain={axisConfig?.leftDomain || ['auto', 'auto']}
                            width={25}
                          />
                          
                          {/* Right Y-Axis (only if comparison metric exists) */}
                          {comparisonMetric && axisConfig && (
                            <YAxis 
                              yAxisId="right"
                              orientation="right"
                              stroke="#FFA500"
                              fontSize={12}
                              tickLine={false}
                              axisLine={{ stroke: '#e0e0e0' }}
                              tick={{ fill: '#FFA500' }}
                              domain={axisConfig.rightDomain}
                              tickFormatter={axisConfig.rightTickFormatter}
                              ticks={axisConfig.rightTicks}
                              width={25}
                            />
                          )}
                          
                          <Tooltip content={<CustomTooltip />} />
                          <Legend content={<CustomLegend />} />
                          
                          {/* Primary metric line (always on left axis) - OUTPUT = accent-2 */}
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="primaryValue"
                            stroke="#7ed984"
                            strokeWidth={3}
                            connectNulls={false}
                            name={primaryMetric?.name}
                            dot={{ fill: '#7ed984', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#7ed984', strokeWidth: 2 }}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                          />
                          
                          {/* Comparison metric line - INPUT = accent-1 */}
                          {comparisonMetric && comparisonMetricId !== 'none' && axisConfig && (
                            <Line 
                              yAxisId={axisConfig.normalizeComparison ? "left" : "right"}
                              type="monotone" 
                              dataKey={axisConfig.normalizeComparison ? "normalizedComparisonValue" : "comparisonValue"}
                              stroke="#FFA500"
                              strokeWidth={3}
                              strokeDasharray={comparisonMetric.type === 'BOOLEAN' ? "5 5" : "0"}
                              connectNulls={false}
                              name={comparisonMetric.name}
                              dot={{ fill: '#FFA500', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: '#FFA500', strokeWidth: 2 }}
                              animationDuration={1500}
                              animationEasing="ease-in-out"
                              animationBegin={300}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Relationship Story Section - Enhanced with animations */}
              {shouldFetchChart && correlationScore !== null && primaryMetric && comparisonMetric && comparisonMetricId !== 'none' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 hover:translate-y-[-5px] group/story">
                  <RelationshipStory
                    correlationScore={correlationScore}
                    primaryMetricName={primaryMetric.name}
                    comparisonMetricName={comparisonMetric.name}
                  />
                </div>
              )}

              {/* 4. Relationship Breakdown Section - Enhanced with animations */}
              {shouldFetchChart && primaryMetric && comparisonMetric && comparisonMetricId !== 'none' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 hover:translate-y-[-5px] group/breakdown">
                  <MetricRelationshipBreakdown
                    chartData={chartData}
                    primaryMetric={primaryMetric}
                    comparisonMetric={comparisonMetric}
                  />
                </div>
              )}
            </>
          )}
        </div>
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
      `}</style>
    </div>
  );
}