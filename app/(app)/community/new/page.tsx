'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { CorrelationCard } from '@/components/dashboard/CorrelationCard';
import { MetricRelationshipBreakdown } from '@/components/dashboard/MetricRelationshipBreakdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Edit3, Eye, ArrowLeft, Send, Calendar, User, BarChart3, FlaskConical } from 'lucide-react';
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

  console.log('🔘 [SubmitButton] Render state:', { pending });

  return (
    <Button
      type="submit"
      loading={pending}
      disabled={pending}
      className="w-full"
      size="lg"
    >
      <Send className="w-4 h-4 mr-2" />
      {pending ? 'Publishing...' : 'Publish Finding'}
    </Button>
  );
}

export default function CreateFindingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  console.log('🎯 [CreateFindingPage] Component mounted/rendered:', {
    userId: user?.id,
    userEmail: user?.email,
    searchParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  });

  // Use useFormState for form handling
  const [state, formAction] = useFormState(createFindingAction, { message: '' });

  console.log('📋 [CreateFindingPage] Form state:', state);

  // Parse context from URL parameters
  const context = useMemo((): ShareContext | null => {
    console.log('🔍 [CreateFindingPage] Parsing context from URL params...');
    
    const type = searchParams.get('type') as 'chart' | 'experiment' | null;
    if (!type) {
      console.log('❌ [CreateFindingPage] No type parameter found');
      return null;
    }

    if (type === 'chart') {
      const chartContext = {
        type: 'chart' as const,
        primaryMetricId: searchParams.get('primaryMetricId') || undefined,
        comparisonMetricId: searchParams.get('comparisonMetricId') || null,
        dateRange: searchParams.get('dateRange') ? parseInt(searchParams.get('dateRange')!) : undefined
      };
      console.log('📊 [CreateFindingPage] Chart context parsed:', chartContext);
      return chartContext;
    } else if (type === 'experiment') {
      const experimentContext = {
        type: 'experiment' as const,
        experimentId: searchParams.get('experimentId') || undefined
      };
      console.log('🧪 [CreateFindingPage] Experiment context parsed:', experimentContext);
      return experimentContext;
    }

    console.log('❓ [CreateFindingPage] Unknown context type:', type);
    return null;
  }, [searchParams]);

  // Fetch trackable items for chart context
  const { data: trackableItems = [] } = useQuery({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => {
      console.log('📊 [CreateFindingPage] Fetching trackable items for user:', user?.id);
      return getTrackableItems(user!.id);
    },
    enabled: !!user?.id && context?.type === 'chart',
  });

  // Fetch chart data for preview
  const { data: chartData = [] } = useQuery({
    queryKey: ['chartData', context],
    queryFn: () => {
      if (!context || context.type !== 'chart' || !context.primaryMetricId) {
        console.log('❌ [CreateFindingPage] Cannot fetch chart data - missing context or primaryMetricId');
        return [];
      }
      console.log('📈 [CreateFindingPage] Fetching chart data:', {
        userId: user!.id,
        primaryMetricId: context.primaryMetricId,
        comparisonMetricId: context.comparisonMetricId,
        dateRange: context.dateRange
      });
      return getDualMetricChartData(
        user!.id,
        context.primaryMetricId,
        context.comparisonMetricId ?? null,
        context.dateRange || 30
      );
    },
    enabled: !!user?.id && context?.type === 'chart' && !!context.primaryMetricId,
  });

  // Fetch experiment data for preview
  const { data: experiments = [] } = useQuery({
    queryKey: ['experiments', user?.id],
    queryFn: () => {
      console.log('🧪 [CreateFindingPage] Fetching experiments for user:', user?.id);
      return getExperiments(user!.id);
    },
    enabled: !!user?.id && context?.type === 'experiment',
  });

  const experiment = experiments.find(exp => exp.id === context?.experimentId);

  // Get metric details
  const primaryMetric = trackableItems.find(item => item.id === context?.primaryMetricId);
  const comparisonMetric = trackableItems.find(item => item.id === context?.comparisonMetricId);

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

  const getContextDescription = () => {
    if (!context) return '';
    
    if (context.type === 'chart') {
      return `Chart analysis: ${primaryMetric?.name || 'Unknown metric'}${
        comparisonMetric ? ` vs ${comparisonMetric.name}` : ''
      } over ${context.dateRange || 30} days`;
    } else if (context.type === 'experiment') {
      return `Experiment results: ${experiment?.title || 'Unknown experiment'}`;
    }
    
    return '';
  };

  // Enhanced form action wrapper with detailed logging
  const enhancedFormAction = async (formData: FormData) => {
    console.log('🚀 [CreateFindingPage] Form submission initiated');
    console.log('📝 [CreateFindingPage] Form data entries:');
    
    // Log all form data entries
    for (const [key, value] of formData.entries()) {
      if (key === 'content') {
        console.log(`  ${key}: "${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}" (${String(value).length} chars)`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }

    // Automatically set shareData to 'on' if there's context (chart or experiment data)
    if (context) {
      formData.set('shareData', 'on');
      console.log('📊 [CreateFindingPage] Automatically enabled data sharing due to context');
    }

    console.log('👤 [CreateFindingPage] User context:', {
      userId: user?.id,
      userEmail: user?.email,
      isAuthenticated: !!user
    });

    console.log('🎯 [CreateFindingPage] Share context:', context);

    try {
      console.log('📤 [CreateFindingPage] Calling createFindingAction...');
      const result = await formAction(formData);
      console.log('✅ [CreateFindingPage] createFindingAction completed with result:', result);
      return result;
    } catch (error) {
      console.error('❌ [CreateFindingPage] createFindingAction failed:', error);
      throw error;
    }
  };

  // Log state changes
  useEffect(() => {
    console.log('📊 [CreateFindingPage] State change detected:', {
      hasMessage: !!state?.message,
      message: state?.message,
      timestamp: new Date().toISOString()
    });
  }, [state]);

  // Custom Tooltip Component (same as /data page)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-primary-text">{label}</p>
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

  // Custom Legend Component (same as /data page)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('🔙 [CreateFindingPage] Back button clicked');
                router.back();
              }}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-3xl text-primary-text">Create Finding</h1>
              <p className="text-secondary-text">Share your insights with the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Editor */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Edit3 className="w-5 h-5 text-primary" />
                    <h2 className="font-heading text-xl text-primary-text">Write Your Finding</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <form action={enhancedFormAction} className="space-y-6">
                    {/* Display form errors from the server */}
                    {state?.message && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{state.message}</p>
                      </div>
                    )}

                    {/* Context Info */}
                    {context && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          {context.type === 'chart' ? (
                            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <FlaskConical className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">
                              Data Context
                            </h4>
                            <p className="text-blue-800 text-sm">
                              {getContextDescription()}
                            </p>
                            <p className="text-blue-700 text-xs mt-2">
                              📊 Your data visualization will be automatically shared with this finding
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hidden fields for context data */}
                    {context && (
                      <>
                        {context.type === 'chart' && (
                          <input
                            type="hidden"
                            name="chartConfig"
                            value={JSON.stringify({
                              primaryMetricId: context.primaryMetricId,
                              comparisonMetricId: context.comparisonMetricId,
                              dateRange: context.dateRange
                            })}
                          />
                        )}
                        {context.type === 'experiment' && (
                          <input
                            type="hidden"
                            name="experimentId"
                            value={context.experimentId || ''}
                          />
                        )}
                      </>
                    )}

                    {/* Title */}
                    <Input
                      label="Finding Title"
                      name="title"
                      placeholder="e.g., Morning meditation significantly improves my focus"
                      required
                      onChange={(e) => {
                        console.log('📝 [CreateFindingPage] Title changed:', e.target.value.length, 'characters');
                      }}
                    />

                    {/* Content */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-primary-text">
                        Your Insights & Analysis *
                      </Label>
                      <textarea
                        name="content"
                        placeholder="Share your insights, patterns you discovered, and what this means for your optimization journey. What did you learn? What surprised you? How might this help others?"
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={12}
                        required
                        onChange={(e) => {
                          console.log('📝 [CreateFindingPage] Content changed:', e.target.value.length, 'characters');
                        }}
                      />
                    </div>

                    <SubmitButton />
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Live Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <h2 className="font-heading text-xl text-primary-text">Live Preview</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Preview Header */}
                    <div className="space-y-4">
                      <h1 className="font-heading text-2xl text-primary-text">
                        Your finding title will appear here...
                      </h1>
                      
                      <div className="flex items-center space-x-4 text-sm text-secondary-text">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{user?.email?.split('@')[0] || 'You'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Just now</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800 border-green-300">Published</Badge>
                        {context && (
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            Data Shared
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Preview Content */}
                    <div className="prose prose-sm max-w-none">
                      <div className="text-primary-text leading-relaxed whitespace-pre-wrap">
                        Your insights and analysis will appear here as you type...
                      </div>
                    </div>

                    {/* Preview Data Visualization - Chart Analysis */}
                    {context && context.type === 'chart' && primaryMetric && (
                      <div className="space-y-4">
                        <div className="border-t border-gray-200 pt-4">
                          <h3 className="font-medium text-primary-text mb-3">
                            Data Analysis: {primaryMetric.name}
                            {comparisonMetric && ` vs ${comparisonMetric.name}`}
                          </h3>
                          
                          {processedChartData.length > 0 ? (
                            <div className="space-y-4">
                              {/* Chart */}
                              <div className="h-64 w-full">
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
                                      />
                                    )}
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>

                              {/* At a Glance - Correlation Analysis Preview */}
                              {correlationScore !== null && primaryMetric && comparisonMetric && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <h4 className="font-medium text-primary-text mb-2">At a Glance Preview</h4>
                                  <p className="text-sm text-secondary-text">
                                    Correlation analysis and detailed metric breakdown will be shown here
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg text-sm text-secondary-text">
                              Chart data will be displayed here when available
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preview Data Visualization - Experiment */}
                    {context && context.type === 'experiment' && experiment && (
                      <div className="space-y-4">
                        <div className="border-t border-gray-200 pt-4">
                          <h3 className="font-medium text-primary-text mb-3">Experiment Results</h3>
                          
                          <div className="space-y-3">
                            <div className="text-sm text-secondary-text">
                              Experiment: {experiment.title}
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-primary-text">
                                <strong>Hypothesis:</strong> {experiment.hypothesis}
                              </p>
                              <div className="mt-2 text-xs text-secondary-text">
                                {experiment.start_date} to {experiment.end_date}
                              </div>
                            </div>
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
                        <div className="text-xs text-secondary-text">
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
    </div>
  );
}