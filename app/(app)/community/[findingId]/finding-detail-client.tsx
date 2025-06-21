'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommunityFindingById, getUserVotes } from '@/lib/community';
import { castVoteAction, reportFindingAction } from '@/lib/actions/community-actions';
import { CommunityFinding, FindingVote } from '@/lib/community';
import { getTrackableItems } from '@/lib/trackable-items';
import { getDualMetricChartData } from '@/lib/chart-data';
import { calculatePearsonCorrelation } from '@/lib/correlation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CorrelationCard } from '@/components/dashboard/CorrelationCard';
import { MetricRelationshipBreakdown } from '@/components/dashboard/MetricRelationshipBreakdown';
import { ChevronUp, ChevronDown, Flag, User, Calendar, ArrowLeft, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}

function ReportDialog({ isOpen, onClose, onSubmit, loading }: ReportDialogProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
    setReason('');
  };

  const handleClose = () => {
    if (loading) return;
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-primary-text">
            Report Finding
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary-text">
              Reason for reporting (optional)
            </Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why you're reporting this finding..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FindingDetailClientProps {
  initialFinding: CommunityFinding;
}

export function FindingDetailClient({ initialFinding }: FindingDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reportingFindingId, setReportingFindingId] = useState<string | null>(null);

  // Use the initial finding data and set up TanStack Query for future updates
  const { data: findingData = initialFinding } = useQuery<CommunityFinding | null>({
    queryKey: ['communityFinding', initialFinding.id],
    queryFn: () => getCommunityFindingById(initialFinding.id),
    initialData: initialFinding,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle case where finding might be null (e.g., deleted after initial load)
  if (!findingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-primary-text mb-4">Finding Not Found</h1>
          <p className="text-secondary-text mb-6">This finding may have been removed or is no longer available.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const finding = findingData;

  // Fetch trackable items for chart context
  const { data: trackableItems = [] } = useQuery({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id && finding.share_data && !!finding.chart_config,
  });

  // Fetch chart data if there's chart config
  const { data: chartData = [] } = useQuery({
    queryKey: ['findingChartData', finding.id, finding.chart_config],
    queryFn: () => {
      if (!finding.chart_config || !user?.id) return [];
      
      const { primaryMetricId, comparisonMetricId, dateRange } = finding.chart_config;
      return getDualMetricChartData(
        user.id,
        primaryMetricId,
        comparisonMetricId || null,
        dateRange || 30
      );
    },
    enabled: !!user?.id && finding.share_data && !!finding.chart_config,
  });

  // Get metric details
  const primaryMetric = trackableItems.find(item => item.id === finding.chart_config?.primaryMetricId);
  const comparisonMetric = trackableItems.find(item => item.id === finding.chart_config?.comparisonMetricId);

  // Calculate correlation score
  const correlationScore = React.useMemo(() => {
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
  const { processedChartData, axisConfig } = React.useMemo(() => {
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

  // Fetch user votes for this finding
  const { data: userVotes = [] } = useQuery<FindingVote[]>({
    queryKey: ['userVotes', user?.id, finding.id],
    queryFn: () => getUserVotes(user!.id, [finding.id]),
    enabled: !!user?.id,
  });

  // Get user's vote for this finding
  const userVote = userVotes.find(vote => vote.finding_id === finding.id)?.vote_type;

  // Vote mutation using Server Action
  const voteMutation = useMutation({
    mutationFn: ({ voteType }: { voteType: 'upvote' | 'downvote' }) =>
      castVoteAction(user!.id, finding.id, voteType),
    onSuccess: (result) => {
      if (result?.error) {
        alert(`Failed to cast vote: ${result.error}`);
      } else {
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['communityFinding', finding.id] });
        queryClient.invalidateQueries({ queryKey: ['communityFindings'] });
        queryClient.invalidateQueries({ queryKey: ['userVotes', user?.id] });
      }
    },
    onError: (error: any) => {
      alert(`Failed to cast vote: ${error.message}`);
    },
  });

  // Report mutation using Server Action
  const reportMutation = useMutation({
    mutationFn: ({ reason }: { reason: string }) =>
      reportFindingAction(user!.id, finding.id, reason),
    onSuccess: (result) => {
      if (result?.error) {
        alert(`Failed to report finding: ${result.error}`);
      } else {
        setReportingFindingId(null);
        alert('Finding reported successfully. Thank you for helping keep our community safe.');
      }
    },
    onError: (error: any) => {
      alert(`Failed to report finding: ${error.message}`);
    },
  });

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!user || voteMutation.isPending) return;
    voteMutation.mutate({ voteType });
  };

  const handleReport = () => {
    setReportingFindingId(finding.id);
  };

  const handleSubmitReport = (reason: string) => {
    if (!finding.id || !user) return;
    reportMutation.mutate({ reason });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAuthorName = (finding: CommunityFinding) => {
    if (!finding.author) return 'Anonymous';
    const { first_name, last_name } = finding.author;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    } else if (first_name) {
      return first_name;
    } else if (last_name) {
      return last_name;
    }
    return 'Anonymous';
  };

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

  const score = finding.upvotes - finding.downvotes;

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-heading text-3xl text-primary-text mb-2">
                {finding.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-secondary-text">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{getAuthorName(finding)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(finding.created_at)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Score: {score > 0 ? '+' : ''}{score}
                </Badge>
                {finding.share_data && (
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    Data Shared
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Content */}
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-primary-text leading-relaxed">
                    {finding.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Visualization - Chart Analysis */}
            {finding.share_data && finding.chart_config && primaryMetric && (
              <div className="space-y-6">
                {/* Chart Display */}
                <Card>
                  <CardContent className="p-8">
                    <h3 className="font-heading text-xl text-primary-text mb-4">
                      Data Analysis: {primaryMetric.name}
                      {comparisonMetric && ` vs ${comparisonMetric.name}`}
                    </h3>
                    
                    {processedChartData.length > 0 ? (
                      <div className="h-96">
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
                    ) : (
                      <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-secondary-text">No chart data available for this time period</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* At a Glance - Correlation Analysis */}
                {correlationScore !== null && primaryMetric && comparisonMetric && (
                  <CorrelationCard
                    correlationScore={correlationScore}
                    primaryMetricName={primaryMetric.name}
                    comparisonMetricName={comparisonMetric.name}
                  />
                )}

                {/* Metric Relationship Breakdown */}
                {primaryMetric && comparisonMetric && processedChartData.length > 0 && (
                  <MetricRelationshipBreakdown
                    chartData={processedChartData}
                    primaryMetric={primaryMetric}
                    comparisonMetric={comparisonMetric}
                  />
                )}
              </div>
            )}

            {/* Data Visualization Placeholder for Experiment */}
            {finding.share_data && finding.experiment_id && !finding.chart_config && (
              <Card>
                <CardContent className="p-8">
                  <h3 className="font-heading text-xl text-primary-text mb-4">
                    Experiment Results
                  </h3>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-secondary-text">
                      Experiment data visualization will be displayed here when implemented
                    </p>
                    {finding.experiment_id && (
                      <div className="mt-4 text-xs text-secondary-text">
                        Experiment ID: {finding.experiment_id}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Voting */}
                  <div className="flex items-center space-x-2">
                    {/* Upvote */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVote('upvote')}
                      disabled={!user || voteMutation.isPending}
                      className={`flex items-center space-x-1 ${
                        userVote === 'upvote' 
                          ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                          : 'text-secondary-text hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <ChevronUp className="w-5 h-5" />
                      <span>{finding.upvotes}</span>
                    </Button>

                    {/* Score */}
                    <div className="px-3 py-2 text-sm font-medium text-primary-text">
                      {score > 0 ? '+' : ''}{score}
                    </div>

                    {/* Downvote */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVote('downvote')}
                      disabled={!user || voteMutation.isPending}
                      className={`flex items-center space-x-1 ${
                        userVote === 'downvote' 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-secondary-text hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                      <span>{finding.downvotes}</span>
                    </Button>
                  </div>

                  {/* Report Button - only show for other users' posts */}
                  {user && user.id !== finding.author_id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleReport}
                      disabled={reportMutation.isPending}
                      className="text-secondary-text hover:text-red-600 hover:bg-red-50"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={!!reportingFindingId}
        onClose={() => setReportingFindingId(null)}
        onSubmit={handleSubmitReport}
        loading={reportMutation.isPending}
      />
    </>
  );
}