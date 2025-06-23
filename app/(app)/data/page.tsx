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
import { BarChart3, Calendar, TrendingUp, Target, RefreshCw, Share2 } from 'lucide-react';
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

  const { data: allItems = [], isLoading: loadingItems } = useQuery<TrackableItem[]>({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id,
  });

  const outputMetrics = useMemo(() => allItems.filter(item => 
    item.category === 'OUTPUT' && (item.type === 'SCALE_1_10' || item.type === 'NUMERIC')
  ), [allItems]);

  const inputMetrics = useMemo(() => allItems.filter(item => 
    item.category === 'INPUT' && (item.type === 'SCALE_1_10' || item.type === 'NUMERIC' || item.type === 'BOOLEAN')
  ), [allItems]);

  const primaryMetric = allItems.find(item => item.id === primaryMetricId);
  const comparisonMetric = allItems.find(item => item.id === comparisonMetricId);

  const { data: rawChartData = [], isLoading: loadingChart, error } = useQuery<DualMetricChartData[]>({
    queryKey: ['dualMetricChartData', user?.id, primaryMetricId, comparisonMetricId, selectedDateRange],
    queryFn: () => getDualMetricChartData(
      user!.id, 
      primaryMetricId, 
      comparisonMetricId === 'none' ? null : comparisonMetricId, 
      parseInt(selectedDateRange)
    ),
    enabled: !!user?.id && !!primaryMetricId && shouldFetchChart,
  });

  // Advanced Axis Synchronization Processing
  const { chartData, axisConfig } = useMemo(() => {
    if (!primaryMetric || !rawChartData.length) {
      return { chartData: rawChartData, axisConfig: null };
    }

    // FIXED: Calculate maximum values including 0 values
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
        // FIXED: Properly handle false values (0) and true values (1)
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-primary-text">{label}</p>
          {/* FIXED: Show 0 values properly */}
          {(data.primaryValue !== null && data.primaryValue !== undefined) && (
            <p className="text-sm">
              <span className="font-medium">{primaryMetric?.name}:</span> {data.primaryValue}
            </p>
          )}
          {comparisonMetric && (data.comparisonValue !== null && data.comparisonValue !== undefined) && (
            <p className="text-sm">
              <span className="font-medium">{comparisonMetric.name}:</span>{' '}
              {comparisonMetric.type === 'BOOLEAN' 
                ? (data.comparisonValue === 1 ? 'Yes' : 'No')
                : data.comparisonValue
              }
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
          <div key={index} className="flex items-center space-x-3 px-4 py-2">
            <div 
              className="w-4 h-0.5" 
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
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Page Header with Share Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl text-white mb-2">Data Analysis</h1>
              <p style={{ color: '#e6e2eb' }}>Advanced dual-axis visualization with synchronized scaling</p>
            </div>
            {canShare && (
              <Button
                onClick={handleShareFinding}
                className="bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200"
                style={{ color: '#4a2a6d' }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Finding
              </Button>
            )}
          </div>

          {outputMetrics.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-heading text-xl text-primary-text mb-2">No Output Metrics Available</h3>
                <p className="text-secondary-text mb-6">
                  You need to create some output metrics (like "Energy Level" or "Mood") before you can analyze your data.
                </p>
                <Button onClick={() => window.location.href = '/log'}>
                  Create Your First Metric
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 1. Chart Controls Section */}
              <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-heading text-lg text-primary-text">Chart Controls</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Form Fields in a Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Output Metric Selector */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-primary-text">
                        <div className="w-4 h-4 bg-accent-2 rounded flex items-center justify-center">
                          <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                        <span>Output Metric</span>
                      </label>
                      <Select value={primaryMetricId} onValueChange={setPrimaryMetricId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an output metric" />
                        </SelectTrigger>
                        <SelectContent>
                          {outputMetrics.map((metric) => (
                            <SelectItem key={metric.id} value={metric.id}>
                              {metric.name} ({metric.type === 'SCALE_1_10' ? 'Scale 1-10' : 'Numeric'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Input Metric Selector */}
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium text-primary-text">
                        <div className="w-4 h-4 bg-accent-1 rounded flex items-center justify-center">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                        <span>Input Metric</span>
                      </label>
                      <Select value={comparisonMetricId} onValueChange={setComparisonMetricId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an input metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {inputMetrics.map((metric) => (
                            <SelectItem key={metric.id} value={metric.id}>
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
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-primary-text">
                        Time Period
                      </label>
                      <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DATE_RANGES.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Update Chart Button */}
                  <Button 
                    onClick={handleUpdateChart}
                    disabled={!primaryMetricId || loadingChart}
                    className="w-full bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingChart ? 'animate-spin' : ''}`} />
                    {loadingChart ? 'Loading...' : 'Update Chart'}
                  </Button>
                </CardContent>
              </Card>

              {/* 2. Visual Analysis Section */}
              <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-heading text-lg text-primary-text">
                      Visual Analysis
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  {!shouldFetchChart ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-secondary-text">Select a metric and click "Update Chart" to begin</p>
                      </div>
                    </div>
                  ) : loadingChart ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-secondary-text">Loading chart data...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-red-600 mb-2">Error loading chart data</p>
                        <Button onClick={handleUpdateChart} variant="outline" size="sm">
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-secondary-text">No data available for the selected time period</p>
                        <p className="text-sm text-secondary-text mt-2">Try selecting a different date range or log some data first</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate" 
                            stroke="#708090"
                            fontSize={12}
                            tickLine={false}
                          />
                          
                          {/* Left Y-Axis */}
                          <YAxis 
                            yAxisId="left"
                            stroke="#7ed984"
                            fontSize={12}
                            tickLine={false}
                            domain={axisConfig?.leftDomain || ['auto', 'auto']}
                          />
                          
                          {/* Right Y-Axis (only if comparison metric exists) */}
                          {comparisonMetric && axisConfig && (
                            <YAxis 
                              yAxisId="right"
                              orientation="right"
                              stroke="#FFA500"
                              fontSize={12}
                              tickLine={false}
                              domain={axisConfig.rightDomain}
                              tickFormatter={axisConfig.rightTickFormatter}
                              ticks={axisConfig.rightTicks}
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
                            strokeWidth={2}
                            connectNulls={false}
                            name={primaryMetric?.name}
                            dot={{ fill: '#7ed984', strokeWidth: 2, r: 3 }}
                            activeDot={{ r: 5, stroke: '#7ed984', strokeWidth: 2 }}
                          />
                          
                          {/* Comparison metric line - INPUT = accent-1 */}
                          {comparisonMetric && comparisonMetricId !== 'none' && axisConfig && (
                            <Line 
                              yAxisId={axisConfig.normalizeComparison ? "left" : "right"}
                              type="monotone" 
                              dataKey={axisConfig.normalizeComparison ? "normalizedComparisonValue" : "comparisonValue"}
                              stroke="#FFA500"
                              strokeWidth={2}
                              strokeDasharray={comparisonMetric.type === 'BOOLEAN' ? "5 5" : "0"}
                              connectNulls={false}
                              name={comparisonMetric.name}
                              dot={{ fill: '#FFA500', strokeWidth: 2, r: 3 }}
                              activeDot={{ r: 5, stroke: '#FFA500', strokeWidth: 2 }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Relationship Story Section */}
              {shouldFetchChart && correlationScore !== null && primaryMetric && comparisonMetric && comparisonMetricId !== 'none' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                  <RelationshipStory
                    correlationScore={correlationScore}
                    primaryMetricName={primaryMetric.name}
                    comparisonMetricName={comparisonMetric.name}
                  />
                </div>
              )}

              {/* 4. Relationship Breakdown Section */}
              {shouldFetchChart && primaryMetric && comparisonMetric && comparisonMetricId !== 'none' && (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
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
    </div>
  );
}