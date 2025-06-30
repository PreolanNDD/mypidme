'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommunityFindingById, getUserVotes } from '@/lib/community';
import { castVoteAction, reportFindingAction, deleteFindingAction } from '@/lib/actions/community-actions';
import { CommunityFinding, FindingVote } from '@/lib/community';
import { getTrackableItems } from '@/lib/trackable-items';
import { getDualMetricChartData } from '@/lib/chart-data';
import { getExperiments, analyzeExperimentResults } from '@/lib/experiments';
import { calculatePearsonCorrelation } from '@/lib/correlation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CorrelationCard } from '@/components/dashboard/CorrelationCard';
import { MetricRelationshipBreakdown } from '@/components/dashboard/MetricRelationshipBreakdown';
import { ChevronUp, ChevronDown, Flag, User, Calendar, ArrowLeft, MessageSquare, Target, TrendingUp, TrendingDown, BarChart3, Trash2, AlertTriangle } from 'lucide-react';
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-heading text-xl text-primary-text">
              Report Finding
            </DialogTitle>
          </div>
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

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  findingTitle: string;
}

function DeleteDialog({ isOpen, onClose, onConfirm, loading, findingTitle }: DeleteDialogProps) {
  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-heading text-xl text-primary-text">
              Delete Finding?
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{findingTitle}"</span>?
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Warning: This action cannot be undone.
                </p>
                <p className="text-sm text-yellow-700">
                  The finding and all its votes will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
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
              onClick={onConfirm}
              loading={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
            >
              Yes, Delete Finding
            </Button>
          </div>
        </div>
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Use the initial finding data and set up TanStack Query for future updates
  const { data: findingData = initialFinding } = useQuery<CommunityFinding | null>({
    queryKey: ['communityFinding', initialFinding.id],
    queryFn: () => getCommunityFindingById(initialFinding.id),
    initialData: initialFinding,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  });

  // Handle case where finding might be null (e.g., deleted after initial load)
  if (!findingData) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-white mb-4">Finding Not Found</h1>
          <p style={{ color: '#e6e2eb' }} className="mb-6">This finding may have been removed or is no longer available.</p>
          <Button onClick={() => router.back()} className="bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200" style={{ color: '#4a2a6d' }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const finding = findingData;

  // Check if current user is the author
  const isAuthor = user?.id === finding.author_id;

  // Fetch trackable items for chart context with better caching
  const { data: trackableItems = [] } = useQuery({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id && finding.share_data === true && (!!finding.chart_config || !!finding.experiment_id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch chart data if there's chart config with better caching
  const { data: chartData = [] } = useQuery({
    queryKey: ['findingChartData', finding.id, finding.chart_config],
    queryFn: () => {
      if (!finding.chart_config || !user?.id) return [];
      
      const { primaryMetricId, comparisonMetricId, startDate, endDate } = finding.chart_config;
      
      // If we have specific date range, use it
      if (startDate && endDate) {
        return getDualMetricChartData(
          user.id,
          primaryMetricId,
          comparisonMetricId || null,
          startDate,
          endDate
        );
      } 
      // Fallback to using dateRange if available (for backward compatibility)
      else if (finding.chart_config.dateRange) {
        return getDualMetricChartData(
          user.id,
          primaryMetricId,
          comparisonMetricId || null,
          finding.chart_config.dateRange
        );
      }
      
      // Default to 30 days if no date information is available
      return getDualMetricChartData(
        user.id,
        primaryMetricId,
        comparisonMetricId || null,
        30
      );
    },
    enabled: !!user?.id && finding.share_data === true && !!finding.chart_config,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch experiment data if there's an experiment_id
  const { data: experiments = [] } = useQuery({
    queryKey: ['experiments', user?.id],
    queryFn: () => getExperiments(user!.id),
    enabled: !!user?.id && finding.share_data === true && !!finding.experiment_id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Get the specific experiment for this finding
  const experiment = experiments.find(exp => exp.id === finding.experiment_id);

  // Fetch experiment results if we have an experiment
  const { data: experimentResults } = useQuery({
    queryKey: ['experimentResults', finding.experiment_id],
    queryFn: () => analyzeExperimentResults(experiment!),
    enabled: !!experiment && finding.share_data === true && !!finding.experiment_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

  // Fetch user votes for this finding with better caching
  const { data: userVotes = [] } = useQuery<FindingVote[]>({
    queryKey: ['userVotes', user?.id, finding.id],
    queryFn: () => getUserVotes(user!.id, [finding.id]),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user's vote for this finding
  const userVote = userVotes.find(vote => vote.finding_id === finding.id)?.vote_type;

  // Optimistic vote mutation with immediate UI updates
  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: 'upvote' | 'downvote' }) => {
      const result = await castVoteAction(user!.id, finding.id, voteType);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async ({ voteType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['communityFinding', finding.id] });
      await queryClient.cancelQueries({ queryKey: ['userVotes', user?.id, finding.id] });

      // Snapshot the previous values
      const previousFinding = queryClient.getQueryData<CommunityFinding>(['communityFinding', finding.id]);
      const previousVotes = queryClient.getQueryData<FindingVote[]>(['userVotes', user?.id, finding.id]);

      // Optimistically update the finding
      if (previousFinding) {
        let newUpvotes = previousFinding.upvotes;
        let newDownvotes = previousFinding.downvotes;

        // Handle vote logic
        if (userVote === voteType) {
          // User clicked same vote - remove it
          if (voteType === 'upvote') {
            newUpvotes = Math.max(0, newUpvotes - 1);
          } else {
            newDownvotes = Math.max(0, newDownvotes - 1);
          }
        } else if (userVote) {
          // User clicked different vote - switch it
          if (userVote === 'upvote') {
            newUpvotes = Math.max(0, newUpvotes - 1);
            newDownvotes = newDownvotes + 1;
          } else {
            newDownvotes = Math.max(0, newDownvotes - 1);
            newUpvotes = newUpvotes + 1;
          }
        } else {
          // No previous vote - add new vote
          if (voteType === 'upvote') {
            newUpvotes = newUpvotes + 1;
          } else {
            newDownvotes = newDownvotes + 1;
          }
        }

        const updatedFinding = {
          ...previousFinding,
          upvotes: newUpvotes,
          downvotes: newDownvotes
        };

        queryClient.setQueryData(['communityFinding', finding.id], updatedFinding);
      }

      // Optimistically update the user votes
      if (previousVotes) {
        const updatedVotes = previousVotes.filter(vote => vote.finding_id !== finding.id);
        
        // Add new vote if it's different from current or if no current vote
        if (userVote !== voteType) {
          updatedVotes.push({
            id: `temp-${Date.now()}`,
            user_id: user!.id,
            finding_id: finding.id,
            vote_type: voteType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        queryClient.setQueryData(['userVotes', user?.id, finding.id], updatedVotes);
      }

      // Return a context object with the previous values
      return { previousFinding, previousVotes };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFinding) {
        queryClient.setQueryData(['communityFinding', finding.id], context.previousFinding);
      }
      if (context?.previousVotes) {
        queryClient.setQueryData(['userVotes', user?.id, finding.id], context.previousVotes);
      }
      
      // Show error message
      alert(`Failed to cast vote: ${err.message}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['communityFinding', finding.id] });
      queryClient.invalidateQueries({ queryKey: ['communityFindings'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes', user?.id] });
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

  // Delete mutation using Server Action
  const deleteMutation = useMutation({
    mutationFn: () => deleteFindingAction(user!.id, finding.id),
    onSuccess: (result) => {
      if (result?.error) {
        alert(`Failed to delete finding: ${result.error}`);
      } else {
        setShowDeleteDialog(false);
        
        // Immediately update the cache to remove this finding from all relevant queries
        queryClient.removeQueries({ queryKey: ['communityFinding', finding.id] });
        
        // Update the communityFindings cache to remove this finding
        queryClient.setQueryData(['communityFindings'], (oldData: CommunityFinding[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(f => f.id !== finding.id);
        });
        
        // Update the userFindings cache to remove this finding
        queryClient.setQueryData(['userFindings', user?.id], (oldData: CommunityFinding[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(f => f.id !== finding.id);
        });
        
        // Invalidate queries to ensure everything is up to date
        queryClient.invalidateQueries({ queryKey: ['communityFindings'] });
        queryClient.invalidateQueries({ queryKey: ['userFindings', user?.id] });
        
        // Redirect to community page after successful deletion
        router.push('/community');
      }
    },
    onError: (error: any) => {
      alert(`Failed to delete finding: ${error.message}`);
    },
  });

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!user) return;
    voteMutation.mutate({ voteType });
  };

  const handleReport = () => {
    setReportingFindingId(finding.id);
  };

  const handleSubmitReport = (reason: string) => {
    if (!finding.id || !user) return;
    reportMutation.mutate({ reason });
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!user) return;
    deleteMutation.mutate();
  };

  const handleAuthorClick = () => {
    router.push(`/community/user/${finding.author_id}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAuthorName = (finding: CommunityFinding) => {
    console.log('🔍 [getAuthorName] Processing finding:', {
      findingId: finding.id,
      authorId: finding.author_id,
      authorData: finding.author
    });

    if (!finding.author) {
      console.log('⚠️ [getAuthorName] No author data found, returning Anonymous');
      return 'Anonymous';
    }

    const { first_name, last_name } = finding.author;
    
    console.log('📝 [getAuthorName] Author name components:', {
      firstName: first_name,
      lastName: last_name
    });

    // Handle different name combinations
    if (first_name && last_name) {
      const fullName = `${first_name.trim()} ${last_name.trim()}`;
      console.log('✅ [getAuthorName] Returning full name:', fullName);
      return fullName;
    } else if (first_name) {
      const firstName = first_name.trim();
      console.log('✅ [getAuthorName] Returning first name only:', firstName);
      return firstName;
    } else if (last_name) {
      const lastName = last_name.trim();
      console.log('✅ [getAuthorName] Returning last name only:', lastName);
      return lastName;
    }
    
    console.log('⚠️ [getAuthorName] No valid name components, returning Anonymous');
    return 'Anonymous';
  };

  // Helper function for experiment results display
  const getConditionLabel = (isPositive: boolean): string => {
    if (!experiment?.independent_variable) return isPositive ? 'High' : 'Low';
    
    if (experiment.independent_variable.type === 'BOOLEAN') {
      return isPositive ? 'Yes' : 'No';
    } else if (experiment.independent_variable.type === 'SCALE_1_10') {
      return isPositive ? 'High (6-10)' : 'Low (1-5)';
    } else {
      return isPositive ? 'High' : 'Low';
    }
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
  const authorName = getAuthorName(finding);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
        {/* Content */}
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="group/viewall relative overflow-hidden px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg hover:shadow-white/20 mb-4"
              >
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/viewall:translate-x-full transition-transform duration-500 ease-out"></div>
                
                {/* Content */}
                <div className="relative flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium transition-all duration-300 group-hover/viewall:tracking-wide">
                    Back
                  </span>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover/viewall:opacity-100 transition-opacity duration-300"></div>
              </button>
              <div>
                <h1 className="font-heading text-3xl text-white mb-2">
                  {finding.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm" style={{ color: '#e6e2eb' }}>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span 
                      className="hover:text-white transition-colors cursor-pointer"
                      onClick={handleAuthorClick}
                    >
                      {authorName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(finding.created_at)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                    Score: {score > 0 ? '+' : ''}{score}
                  </Badge>
                  {finding.share_data === true && (
                    <Badge variant="outline" className="text-blue-200 border-blue-300 bg-blue-500/20">
                      Data Shared
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-primary-text leading-relaxed">
                    {finding.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Visualization - Chart Analysis */}
            {finding.share_data === true && finding.chart_config && primaryMetric && (
              <div className="space-y-6">
                {/* Chart Display */}
                <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
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
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                    <CorrelationCard
                      correlationScore={correlationScore}
                      primaryMetricName={primaryMetric.name}
                      comparisonMetricName={comparisonMetric.name}
                    />
                  </div>
                )}

                {/* Metric Relationship Breakdown */}
                {primaryMetric && comparisonMetric && processedChartData.length > 0 && (
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                    <MetricRelationshipBreakdown
                      chartData={processedChartData}
                      primaryMetric={primaryMetric}
                      comparisonMetric={comparisonMetric}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Data Visualization - Experiment Results */}
            {finding.share_data === true && finding.experiment_id && experiment && experimentResults && (
              <div className="space-y-6">
                {/* Experiment Overview */}
                <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                  <CardContent className="p-8">
                    <h3 className="font-heading text-xl text-primary-text mb-4">
                      Experiment Results: {experiment.title}
                    </h3>
                    
                    {/* Experiment Details */}
                    <div className="p-4 bg-gray-50 rounded-lg mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-primary-text">Independent Variable:</span>
                          <span className="ml-2 text-secondary-text">{experiment.independent_variable?.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-primary-text">Dependent Variable:</span>
                          <span className="ml-2 text-secondary-text">{experiment.dependent_variable?.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-primary-text">Duration:</span>
                          <span className="ml-2 text-secondary-text">{experimentResults.totalDays} days</span>
                        </div>
                        <div>
                          <span className="font-medium text-primary-text">Data Completeness:</span>
                          <span className="ml-2 text-secondary-text">{experimentResults.daysWithData} days with data</span>
                        </div>
                      </div>
                    </div>

                    {/* Results Analysis */}
                    {experimentResults.daysWithData > 0 && experimentResults.positiveConditionAverage !== null && experimentResults.negativeConditionAverage !== null ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <Target className="w-4 h-4 text-primary" />
                          <h4 className="font-medium text-primary-text">Results Analysis</h4>
                        </div>

                        {/* Condition Comparison */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Positive Condition */}
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-center">
                              <h5 className="font-medium text-green-900 mb-2">
                                {getConditionLabel(true)} {experiment.independent_variable?.name}
                              </h5>
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                {experimentResults.positiveConditionAverage.toFixed(1)}
                              </div>
                              <p className="text-sm text-green-700">
                                Average {experiment.dependent_variable?.name}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                {experimentResults.positiveConditionCount} day{experimentResults.positiveConditionCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Negative Condition */}
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="text-center">
                              <h5 className="font-medium text-gray-900 mb-2">
                                {getConditionLabel(false)} {experiment.independent_variable?.name}
                              </h5>
                              <div className="text-2xl font-bold text-gray-600 mb-1">
                                {experimentResults.negativeConditionAverage.toFixed(1)}
                              </div>
                              <p className="text-sm text-gray-700">
                                Average {experiment.dependent_variable?.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {experimentResults.negativeConditionCount} day{experimentResults.negativeConditionCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Impact Summary */}
                        {(() => {
                          const difference = experimentResults.positiveConditionAverage - experimentResults.negativeConditionAverage;
                          const getImpactStrength = (diff: number): string => {
                            const absDiff = Math.abs(diff);
                            if (absDiff >= 2) return 'Strong';
                            if (absDiff >= 1) return 'Moderate';
                            if (absDiff >= 0.5) return 'Weak';
                            return 'Minimal';
                          };

                          return (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center space-x-2 mb-3">
                                {difference > 0 ? (
                                  <TrendingUp className="w-5 h-5 text-blue-600" />
                                ) : difference < 0 ? (
                                  <TrendingDown className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <BarChart3 className="w-5 h-5 text-blue-600" />
                                )}
                                <h5 className="font-medium text-blue-900">
                                  {getImpactStrength(difference)} {difference > 0 ? 'Positive' : difference < 0 ? 'Negative' : 'No'} Impact
                                </h5>
                                <Badge variant="outline" className="text-blue-700 border-blue-300">
                                  {Math.abs(difference).toFixed(1)} point difference
                                </Badge>
                              </div>
                              <p className="text-sm text-blue-800">
                                During the experiment, on days when {experiment.independent_variable?.name?.toLowerCase()} was {getConditionLabel(true).toLowerCase()}, 
                                the average {experiment.dependent_variable?.name} was <strong>{experimentResults.positiveConditionAverage.toFixed(1)}</strong>. 
                                On days when it was {getConditionLabel(false).toLowerCase()}, 
                                the average {experiment.dependent_variable?.name} was <strong>{experimentResults.negativeConditionAverage.toFixed(1)}</strong>.
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="font-medium text-primary-text mb-2">Insufficient Data</h4>
                        <p className="text-secondary-text">
                          No data was logged for both variables during the experiment period.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data Visualization Placeholder for Experiment without results */}
            {finding.share_data === true && finding.experiment_id && experiment && !experimentResults && (
              <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
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
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Voting */}
                  <div className="flex items-center space-x-2">
                    {/* Upvote */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVote('upvote')}
                      disabled={!user}
                      className={`flex items-center space-x-1 transition-all duration-200 ${
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
                      disabled={!user}
                      className={`flex items-center space-x-1 transition-all duration-200 ${
                        userVote === 'downvote' 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-secondary-text hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                      <span>{finding.downvotes}</span>
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Delete Button - only show for author */}
                    {isAuthor && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}

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

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        findingTitle={finding.title}
      />
    </>
  );
}