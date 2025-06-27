'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { createFindingAction } from '@/lib/actions/community-actions';
import { getTrackableItems } from '@/lib/trackable-items';
import { getDualMetricChartData } from '@/lib/chart-data';
import { getExperiments, analyzeExperimentResults } from '@/lib/experiments';
import { calculatePearsonCorrelation } from '@/lib/correlation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CorrelationCard } from '@/components/dashboard/CorrelationCard';
import { MetricRelationshipBreakdown } from '@/components/dashboard/MetricRelationshipBreakdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Edit3, Eye, Send, Calendar, User, BarChart3, FlaskConical, Target, TrendingUp, ArrowLeft, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useFormState, useFormStatus } from 'react-dom';

interface ShareContext {
  type: 'chart' | 'experiment';
  primaryMetricId?: string;
  comparisonMetricId?: string | null;
  dateRange?: number;
  experimentId?: string;
}

// SubmitButton component that uses useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group/button relative overflow-hidden w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/button:opacity-100 transition-opacity duration-500"></div>
      
      {/* Sliding highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700 ease-out"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-center space-x-3">
        {/* Icon with animation */}
        <div className="transform group-hover/button:scale-110 group-hover/button:rotate-12 transition-transform duration-300">
          {pending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </div>
        
        {/* Text with enhanced styling */}
        <span className="tracking-wide group-hover/button:tracking-wider transition-all duration-300">
          {pending ? 'Publishing...' : 'Publish Finding'}
        </span>
      </div>
      
      {/* Pulse ring effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/button:opacity-100 group-hover/button:scale-105 transition-all duration-500"></div>
    </button>
  );
}

export default function CreateFindingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  // Add animation delay for initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Use useFormState for form handling
  const [state, formAction] = useFormState(createFindingAction, { message: '' });

  // Form state for metric selection and content
  const [selectedHabitId, setSelectedHabitId] = useState<string>('none');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  // Parse context from URL parameters
  const context = useMemo((): ShareContext | null => {
    const type = searchParams.get('type') as 'chart' | 'experiment' | null;
    if (!type) {
      return null;
    }

    if (type === 'chart') {
      const chartContext = {
        type: 'chart' as const,
        primaryMetricId: searchParams.get('primaryMetricId') || undefined,
        comparisonMetricId: searchParams.get('comparisonMetricId') || null,
        dateRange: searchParams.get('dateRange') ? parseInt(searchParams.get('dateRange')!) : undefined
      };
      return chartContext;
    } else if (type === 'experiment') {
      const experimentContext = {
        type: 'experiment' as const,
        experimentId: searchParams.get('experimentId') || undefined
      };
      return experimentContext;
    }

    return null;
  }, [searchParams]);

  // Fetch trackable items
  const { data: trackableItems = [] } = useQuery({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id,
  });

  // Separate metrics by category
  const inputMetrics = useMemo(() => 
    trackableItems.filter(item => item.category === 'INPUT'), 
    [trackableItems]
  );
  
  const outputMetrics = useMemo(() => 
    trackableItems.filter(item => item.category === 'OUTPUT' && (item.type === 'SCALE_1_10' || item.type === 'NUMERIC')), 
    [trackableItems]
  );

  // Set initial values from context
  useEffect(() => {
    if (context && context.type === 'chart') {
      if (context.primaryMetricId) {
        setSelectedGoalId(context.primaryMetricId);
      }
      if (context.comparisonMetricId) {
        setSelectedHabitId(context.comparisonMetricId);
      } else {
        setSelectedHabitId('none');
      }
      if (context.dateRange) {
        setSelectedDateRange(context.dateRange.toString());
      }
    }
  }, [context]);

  // Fetch chart data for preview
  const { data: chartData = [] } = useQuery({
    queryKey: ['chartData', selectedGoalId, selectedHabitId, selectedDateRange],
    queryFn: () => {
      if (!selectedGoalId) return [];
      return getDualMetricChartData(
        user!.id,
        selectedGoalId,
        selectedHabitId === 'none' ? null : selectedHabitId,
        parseInt(selectedDateRange)
      );
    },
    enabled: !!user?.id && !!selectedGoalId,
  });

  // Fetch experiment data for preview
  const { data: experiments = [] } = useQuery({
    queryKey: ['experiments', user?.id],
    queryFn: () => getExperiments(user!.id),
    enabled: !!user?.id && context?.type === 'experiment',
  });

  const experiment = experiments.find(exp => exp.id === context?.experimentId);

  // Fetch experiment results for preview
  const { data: experimentResults } = useQuery({
    queryKey: ['experimentResults', context?.experimentId],
    queryFn: () => analyzeExperimentResults(experiment!),
    enabled: !!experiment && context?.type === 'experiment',
  });

  // Get metric details
  const primaryMetric = trackableItems.find(item => item.id === selectedGoalId);
  const comparisonMetric = trackableItems.find(item => item.id === selectedHabitId);

  // Calculate correlation score for preview
  const correlationScore = useMemo(() => {
    if (!primaryMetric || !comparisonMetric || !chartData.length) {
      return null;
    }

    const primaryValues: number[] = [];
    const comparisonValues: number[] = [];

    chartData.forEach(dataPoint => {
      if (dataPoint.primaryValue !== null && dataPoint.primaryValue !== undefined &&
          dataPoint.comparisonValue !== null && dataPoint.comparisonValue !== undefined) {
        primaryValues.push(dataPoint.primaryValue);
        comparisonValues.push(dataPoint.comparisonValue);
      }
    });

    if (primaryValues.length >= 2) {
      return calculatePearsonCorrelation(primaryValues, comparisonValues);
    }

    return null;
  }, [chartData, primaryMetric, comparisonMetric]);

  // Advanced Axis Synchronization Processing (same as /data page)
  const { processedChartData, axisConfig } = useMemo(() => {
    if (!primaryMetric || !chartData.length) {
      return { processedChartData: chartData, axisConfig: null };
    }

    const primaryValues = chartData
      .map(d => d.primaryValue)
      .filter(v => v !== null && v !== undefined) as number[];
    const comparisonValues = chartData
      .map(d => d.comparisonValue)
      .filter(v => v !== null && v !== undefined) as number[];
    
    const primaryMax = primaryValues.length > 0 ? Math.max(...primaryValues) : 10;
    const comparisonMax = comparisonValues.length > 0 ? Math.max(...comparisonValues) : 10;

    let config: any;
    let processedData = [...chartData];

    if (!comparisonMetric) {
      config = {
        leftDomain: primaryMetric.type === 'SCALE_1_10' ? [1, 10] : [0, Math.max(primaryMax * 1.1, 1)],
        rightDomain: [0, 10],
        normalizeComparison: false
      };
    } else if (primaryMetric.type === 'NUMERIC' && comparisonMetric.type === 'SCALE_1_10') {
      const scaledMax = Math.max(primaryMax * 1.1, 1);
      config = {
        leftDomain: [0, scaledMax],
        rightDomain: [0, scaledMax],
        rightTickFormatter: (value: number) => {
          const scaleValue = Math.round((value / scaledMax) * 10);
          return scaleValue >= 1 && scaleValue <= 10 ? scaleValue.toString() : '';
        },
        rightTicks: Array.from({ length: 10 }, (_, i) => ((i + 1) / 10) * scaledMax),
        normalizeComparison: false
      };
    } else if (primaryMetric.type === 'SCALE_1_10' && comparisonMetric.type === 'NUMERIC') {
      config = {
        leftDomain: [1, 10],
        rightDomain: [0, Math.max(comparisonMax * 1.1, 1)],
        normalizeComparison: false
      };
    } else if (primaryMetric.type === 'SCALE_1_10' && comparisonMetric.type === 'BOOLEAN') {
      processedData = chartData.map(d => ({
        ...d,
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
      const leftMax = primaryMetric.type === 'SCALE_1_10' ? 10 : Math.max(primaryMax * 1.1, 1);
      const rightMax = comparisonMetric.type === 'SCALE_1_10' ? 10 : Math.max(comparisonMax * 1.1, 1);
      
      config = {
        leftDomain: primaryMetric.type === 'SCALE_1_10' ? [1, 10] : [0, leftMax],
        rightDomain: comparisonMetric.type === 'SCALE_1_10' ? [1, 10] : [0, rightMax],
        normalizeComparison: false
      };
    }

    return { processedChartData: processedData, axisConfig: config };
  }, [chartData, primaryMetric, comparisonMetric]);

  // Enhanced form action wrapper
  const enhancedFormAction = async (formData: FormData) => {
    // Set chart config based on selected metrics
    if (selectedGoalId && selectedHabitId !== 'none') {
      formData.set('shareData', 'on');
      formData.set('chartConfig', JSON.stringify({
        primaryMetricId: selectedGoalId,
        comparisonMetricId: selectedHabitId,
        dateRange: parseInt(selectedDateRange)
      }));
    } else if (context) {
      formData.set('shareData', 'on');
      if (context.type === 'chart') {
        formData.set('chartConfig', JSON.stringify({
          primaryMetricId: context.primaryMetricId,
          comparisonMetricId: context.comparisonMetricId,
          dateRange: context.dateRange
        }));
      } else if (context.type === 'experiment') {
        formData.set('experimentId', context.experimentId || '');
      }
    }

    try {
      const result = await formAction(formData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const getContextDescription = () => {
    if (!context) return '';
    
    if (context.type === 'chart') {
      return `This finding is based on your data analysis${context.dateRange ? ` over the last ${context.dateRange} days` : ''}.`;
    } else if (context.type === 'experiment') {
      return 'This finding is based on your experiment results.';
    }
    
    return '';
  };

  // Auto-populate content for experiment findings
  useEffect(() => {
    if (context?.type === 'experiment' && experimentResults && !content) {
      const { experiment, positiveConditionAverage, negativeConditionAverage, 
              positiveConditionCount, negativeConditionCount, daysWithData } = experimentResults;
      
      const getConditionLabel = (isPositive: boolean): string => {
        if (!experiment.independent_variable) return isPositive ? 'High' : 'Low';
        
        if (experiment.independent_variable.type === 'BOOLEAN') {
          return isPositive ? 'Yes' : 'No';
        } else if (experiment.independent_variable.type === 'SCALE_1_10') {
          return isPositive ? 'High (6-10)' : 'Low (1-5)';
        } else {
          return isPositive ? 'High' : 'Low';
        }
      };

      const difference = positiveConditionAverage !== null && negativeConditionAverage !== null 
        ? positiveConditionAverage - negativeConditionAverage 
        : null;

      let autoContent = `Based on my ${experiment.title} experiment, I tracked ${experiment.independent_variable?.name} and measured its impact on ${experiment.dependent_variable?.name} over ${daysWithData} days with data.\n\n`;

      if (difference !== null && positiveConditionAverage !== null && negativeConditionAverage !== null) {
        autoContent += `Key findings:\n`;
        autoContent += `• On days with ${getConditionLabel(true).toLowerCase()} ${experiment.independent_variable?.name?.toLowerCase()}, my average ${experiment.dependent_variable?.name} was ${positiveConditionAverage.toFixed(1)} (${positiveConditionCount} days)\n`;
        autoContent += `• On days with ${getConditionLabel(false).toLowerCase()} ${experiment.independent_variable?.name?.toLowerCase()}, my average ${experiment.dependent_variable?.name} was ${negativeConditionAverage.toFixed(1)} (${negativeConditionCount} days)\n`;
        autoContent += `• This represents a ${Math.abs(difference).toFixed(1)} point ${difference > 0 ? 'improvement' : 'decrease'} when ${experiment.independent_variable?.name?.toLowerCase()} was ${getConditionLabel(true).toLowerCase()}\n\n`;
        
        if (Math.abs(difference) >= 1) {
          autoContent += `This suggests that ${experiment.independent_variable?.name?.toLowerCase()} has a meaningful impact on my ${experiment.dependent_variable?.name?.toLowerCase()}. `;
        } else {
          autoContent += `The impact appears to be modest, suggesting ${experiment.independent_variable?.name?.toLowerCase()} may have a limited effect on my ${experiment.dependent_variable?.name?.toLowerCase()}. `;
        }
      } else {
        autoContent += `Unfortunately, I didn't have enough data points to draw strong conclusions from this experiment. `;
      }

      autoContent += `\n\nWhat I learned and what this means for my optimization journey...`;

      setContent(autoContent);
    }
  }, [context, experimentResults, content]);

  // Custom Tooltip Component (same as /data page)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-medium text-primary-text mb-2">{label}</p>
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

  // Custom Legend Component (same as /data page)
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

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Get author name with proper capitalization
  const getAuthorName = () => {
    if (!userProfile) return 'You';
    const { first_name, last_name } = userProfile;
    if (first_name && last_name) {
      return `${capitalizeFirstLetter(first_name)} ${capitalizeFirstLetter(last_name)}`;
    } else if (first_name) {
      return capitalizeFirstLetter(first_name);
    } else if (last_name) {
      return capitalizeFirstLetter(last_name);
    }
    return 'You';
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Page Header with Back Button - Enhanced with animations */}
          <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </Button>
            <div className="flex items-center space-x-4 group/header">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-500 group-hover/header:scale-110 group-hover/header:rotate-6">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-heading text-3xl text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent transition-all duration-300 group-hover/header:tracking-wider">
                  Create Finding
                </h1>
                <p style={{ color: '#e6e2eb' }} className="text-lg transition-all duration-300 group-hover/header:translate-x-1">
                  Share your insights with the community
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Editor - Enhanced with animations */}
            <div className={`space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
              <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/editor">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-500 group-hover/editor:scale-110 group-hover/editor:rotate-6">
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-heading text-xl text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 group-hover/editor:tracking-wider">
                      Write Your Finding
                    </h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <form action={enhancedFormAction} className="space-y-6">
                    {/* Display form errors from the server */}
                    {state?.message && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                          {state.message}
                        </p>
                      </div>
                    )}

                    {/* Context Info */}
                    {context && (
                      <div className="group/context p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-blue-200/30 hover:-translate-y-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 flex-shrink-0 transition-all duration-300 group-hover/context:scale-110 group-hover/context:rotate-6">
                            {context.type === 'chart' ? (
                              <BarChart3 className="w-5 h-5 text-white" />
                            ) : (
                              <FlaskConical className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 transition-all duration-300 group-hover/context:translate-x-1">
                            <h4 className="font-medium text-blue-900 mb-2 transition-all duration-300 group-hover/context:tracking-wide">
                              Data Context
                            </h4>
                            <p className="text-blue-800 text-sm leading-relaxed transition-all duration-300 group-hover/context:text-indigo-800">
                              {getContextDescription()}
                            </p>
                            <p className="text-blue-700 text-xs mt-2 bg-blue-50/50 p-2 rounded-lg transition-all duration-300 group-hover/context:bg-blue-50">
                              <Sparkles className="w-3 h-3 inline-block mr-1 text-blue-500" /> Your data visualization will be automatically shared with this finding
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metric Selection - Only show if no context */}
                    {!context && (
                      <div className="space-y-5">
                        <h3 className="font-medium text-lg text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          Select Metrics to Feature
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Goal Selector */}
                          <div className="space-y-3 group/goal">
                            <label className="flex items-center space-x-2 text-sm font-medium text-primary-text transition-all duration-300 group-hover/goal:text-purple-600">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-green-400/20 transition-all duration-300 group-hover/goal:scale-110 group-hover/goal:rotate-6">
                                <TrendingUp className="w-3 h-3 text-white" />
                              </div>
                              <span className="transition-all duration-300 group-hover/goal:tracking-wide">Goal</span>
                            </label>
                            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                              <SelectTrigger className="bg-white border-gray-200 transition-all duration-300 hover:border-green-300 focus:border-green-400 focus:ring-green-200">
                                <SelectValue placeholder="Select a goal metric" />
                              </SelectTrigger>
                              <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                                {outputMetrics.map((metric) => (
                                  <SelectItem 
                                    key={metric.id} 
                                    value={metric.id}
                                    className="transition-colors duration-200 hover:bg-green-50 focus:bg-green-50 rounded-lg my-1"
                                  >
                                    {metric.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Habit Selector */}
                          <div className="space-y-3 group/habit">
                            <label className="flex items-center space-x-2 text-sm font-medium text-primary-text transition-all duration-300 group-hover/habit:text-purple-600">
                              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md shadow-orange-400/20 transition-all duration-300 group-hover/habit:scale-110 group-hover/habit:rotate-6">
                                <Target className="w-3 h-3 text-white" />
                              </div>
                              <span className="transition-all duration-300 group-hover/habit:tracking-wide">Habit</span>
                            </label>
                            <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                              <SelectTrigger className="bg-white border-gray-200 transition-all duration-300 hover:border-orange-300 focus:border-orange-400 focus:ring-orange-200">
                                <SelectValue placeholder="Select a habit" />
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
                                    {metric.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Date Range Selector */}
                        <div className="space-y-3 group/date">
                          <label className="flex items-center space-x-2 text-sm font-medium text-primary-text transition-all duration-300 group-hover/date:text-purple-600">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 transition-all duration-300 group-hover/date:scale-110 group-hover/date:rotate-6">
                              <Calendar className="w-3 h-3 text-white" />
                            </div>
                            <span className="transition-all duration-300 group-hover/date:tracking-wide">Time Period</span>
                          </label>
                          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                            <SelectTrigger className="bg-white border-gray-200 transition-all duration-300 hover:border-blue-300 focus:border-blue-400 focus:ring-blue-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                              <SelectItem 
                                value="7"
                                className="transition-colors duration-200 hover:bg-blue-50 focus:bg-blue-50 rounded-lg my-1"
                              >
                                Last 7 Days
                              </SelectItem>
                              <SelectItem 
                                value="30"
                                className="transition-colors duration-200 hover:bg-blue-50 focus:bg-blue-50 rounded-lg my-1"
                              >
                                Last 30 Days
                              </SelectItem>
                              <SelectItem 
                                value="90"
                                className="transition-colors duration-200 hover:bg-blue-50 focus:bg-blue-50 rounded-lg my-1"
                              >
                                Last 90 Days
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <Input
                      label="Finding Title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Morning meditation significantly improves my focus"
                      required
                      className="bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all duration-300 focus:scale-[1.01]"
                    />

                    {/* Content */}
                    <div className="space-y-2 group/content">
                      <Label className="text-sm font-medium text-primary-text transition-all duration-300 group-hover/content:text-purple-600">
                        Your Insights & Analysis *
                      </Label>
                      <textarea
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your insights, patterns you discovered, and what this means for your optimization journey. What did you learn? What surprised you? How might this help others?"
                        className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white transition-all duration-300 focus:scale-[1.01]"
                        rows={12}
                        required
                      />
                    </div>

                    <SubmitButton />
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Live Preview - Enhanced with animations */}
            <div className={`space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
              <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/preview">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-400/20 transition-all duration-500 group-hover/preview:scale-110 group-hover/preview:rotate-6">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-heading text-xl text-primary-text bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 group-hover/preview:tracking-wider">
                      Live Preview
                    </h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Preview Header */}
                    <div className="space-y-4">
                      <h1 className="font-heading text-2xl text-primary-text transition-all duration-300 group-hover/preview:text-purple-700">
                        {title || 'Your finding title will appear here...'}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-secondary-text">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/preview:bg-purple-50 group-hover/preview:shadow-sm">
                          <User className="w-4 h-4" />
                          <span className="transition-all duration-300 group-hover/preview:text-purple-700">{getAuthorName()}</span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/preview:bg-blue-50 group-hover/preview:shadow-sm">
                          <Calendar className="w-4 h-4" />
                          <span className="transition-all duration-300 group-hover/preview:text-blue-700">Just now</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-300 shadow-sm transition-all duration-300 group-hover/preview:bg-green-200 group-hover/preview:scale-105">
                          Published
                        </Badge>
                        {(context || (selectedGoalId && selectedHabitId !== 'none')) && (
                          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 shadow-sm transition-all duration-300 group-hover/preview:bg-blue-100 group-hover/preview:scale-105">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Data Shared
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="prose prose-lg max-w-none">
                      <div className="text-primary-text leading-relaxed whitespace-pre-wrap transition-all duration-300 group-hover/preview:text-gray-700">
                        {content || 'Your insights and analysis will appear here as you type...'}
                      </div>
                    </div>

                    {/* Preview Data Visualization - Chart Analysis */}
                    {((context && context.type === 'chart') || (selectedGoalId && selectedHabitId !== 'none')) && primaryMetric && (
                      <div className="space-y-4 border-t border-gray-200 pt-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 transition-all duration-300 group-hover/preview:scale-110 group-hover/preview:rotate-6">
                            <BarChart3 className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-medium text-lg text-primary-text bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover/preview:tracking-wider">
                            Data Analysis: {primaryMetric.name}
                            {comparisonMetric && ` vs ${comparisonMetric.name}`}
                          </h4>
                        </div>
                        
                        {processedChartData.length > 0 ? (
                          <div className="space-y-4">
                            {/* Chart */}
                            <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm transition-all duration-500 group-hover/preview:shadow-md">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                                  
                                  {/* Primary metric line */}
                                  <Line 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="primaryValue"
                                    stroke="#7ed984"
                                    strokeWidth={2}
                                    connectNulls={false}
                                    name={primaryMetric.name}
                                    dot={{ fill: '#7ed984', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, stroke: '#7ed984', strokeWidth: 2 }}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                  />
                                  
                                  {/* Comparison metric line */}
                                  {comparisonMetric && axisConfig && (
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
                                      animationDuration={1500}
                                      animationEasing="ease-in-out"
                                      animationBegin={300}
                                    />
                                  )}
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* Metric Relationship Breakdown Preview */}
                            {primaryMetric && comparisonMetric && processedChartData.length > 0 && (
                              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 group-hover/preview:shadow-md">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-purple-400/20">
                                    <Sparkles className="w-3 h-3 text-white" />
                                  </div>
                                  <h5 className="font-medium text-primary-text">Relationship Breakdown Preview</h5>
                                </div>
                                <p className="text-sm text-secondary-text">
                                  Detailed metric breakdown will be shown here
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm text-sm text-secondary-text text-center">
                            Chart data will be displayed here when available
                          </div>
                        )}
                      </div>
                    )}

                    {/* Preview Data Visualization - Experiment */}
                    {context && context.type === 'experiment' && experiment && (
                      <div className="space-y-4 border-t border-gray-200 pt-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-400/20 transition-all duration-300 group-hover/preview:scale-110 group-hover/preview:rotate-6">
                            <FlaskConical className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-medium text-lg text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover/preview:tracking-wider">
                            Experiment Results
                          </h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="text-sm text-secondary-text p-3 bg-white rounded-lg shadow-sm transition-all duration-300 group-hover/preview:shadow-md">
                            <span className="font-medium">Experiment:</span> {experiment.title}
                          </div>
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 group-hover/preview:shadow-md">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2 p-3 bg-white/80 rounded-lg transition-all duration-300 group-hover/preview:bg-white group-hover/preview:shadow-sm">
                                <Target className="w-4 h-4 text-orange-500" />
                                <div>
                                  <span className="font-medium text-primary-text block mb-1">Independent Variable:</span>
                                  <span className="text-secondary-text">{experiment.independent_variable?.name}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 p-3 bg-white/80 rounded-lg transition-all duration-300 group-hover/preview:bg-white group-hover/preview:shadow-sm">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <div>
                                  <span className="font-medium text-primary-text block mb-1">Dependent Variable:</span>
                                  <span className="text-secondary-text">{experiment.dependent_variable?.name}</span>
                                </div>
                              </div>
                            </div>
                            {experimentResults && (
                              <div className="mt-3 text-xs text-secondary-text p-2 bg-white/80 rounded-lg">
                                {experimentResults.daysWithData} days with data out of {experimentResults.totalDays} total days
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview Actions */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-secondary-text">0 votes</div>
                        </div>
                        <div className="text-xs text-secondary-text px-3 py-1 bg-gray-100 rounded-full">
                          Preview mode
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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