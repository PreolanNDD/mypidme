'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTrackableItems } from '@/lib/trackable-items';
import { getExperiments, updateExperimentStatus, deleteExperiment, analyzeExperimentResults } from '@/lib/experiments';
import { Experiment, ExperimentResults } from '@/lib/experiments';
import { TrackableItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { CreateExperimentDialog } from '@/components/lab/CreateExperimentDialog';
import { EditExperimentDialog } from '@/components/lab/EditExperimentDialog';
import { ExperimentResultsDialog } from '@/components/lab/ExperimentResultsDialog';
import { DeleteExperimentDialog } from '@/components/lab/DeleteExperimentDialog';
import { FlaskConical, Calendar, Target, TrendingUp, Trash2, Play, Square, Eye, Edit2, BarChart3, ArrowRight, Beaker } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function LabPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [selectedResults, setSelectedResults] = useState<ExperimentResults | null>(null);
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Helper function to get error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
  };

  // Enhanced error handling for trackable items
  const { data: trackableItems = [], isLoading: loadingItems, error: itemsError } = useQuery<TrackableItem[]>({
    queryKey: ['trackableItems', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('No user ID available for trackable items fetch');
        return [];
      }
      try {
        return await getTrackableItems(user.id);
      } catch (error) {
        console.error('Error fetching trackable items:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced error handling for experiments
  const { data: experiments = [], isLoading: loadingExperiments, error: experimentsError } = useQuery<Experiment[]>({
    queryKey: ['experiments', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('No user ID available for experiments fetch');
        return [];
      }
      try {
        return await getExperiments(user.id);
      } catch (error) {
        console.error('Error fetching experiments:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Enhanced error handling for experiment progress data
  const { data: experimentProgressData = {} } = useQuery({
    queryKey: ['experimentProgress', user?.id, experiments.map(e => e.id)],
    queryFn: async () => {
      if (!user?.id || experiments.length === 0) {
        return {};
      }

      const progressMap: Record<string, { daysWithData: number; totalDays: number }> = {};
      
      for (const experiment of experiments) {
        try {
          const results = await analyzeExperimentResults(experiment);
          progressMap[experiment.id] = {
            daysWithData: results.daysWithData,
            totalDays: results.totalDays
          };
        } catch (error) {
          console.error(`Failed to analyze experiment ${experiment.id}:`, error);
          // Fallback calculation
          const startDate = new Date(experiment.start_date);
          const endDate = new Date(experiment.end_date);
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          progressMap[experiment.id] = {
            daysWithData: 0,
            totalDays: Math.max(totalDays, 1) // Ensure at least 1 day
          };
        }
      }
      
      return progressMap;
    },
    enabled: !!user?.id && experiments.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    retry: 1,
  });

  // Update experiment status mutation with enhanced error handling
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'COMPLETED' }) => {
      if (!id || !status) {
        throw new Error('Invalid experiment ID or status');
      }
      return updateExperimentStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['experimentProgress', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating experiment status:', error);
      alert(`Failed to update experiment status: ${getErrorMessage(error)}`);
    },
  });

  // Delete experiment mutation with enhanced error handling
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error('Invalid experiment ID');
      }
      return deleteExperiment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['experimentProgress', user?.id] });
      setShowDeleteDialog(false);
      setExperimentToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting experiment:', error);
      alert(`Failed to delete experiment: ${getErrorMessage(error)}`);
      setShowDeleteDialog(false);
      setExperimentToDelete(null);
    },
  });

  // Separate metrics by category with null checks
  const inputMetrics = useMemo(() => {
    if (!Array.isArray(trackableItems)) {
      console.warn('trackableItems is not an array:', trackableItems);
      return [];
    }
    return trackableItems.filter(item => item && item.category === 'INPUT');
  }, [trackableItems]);
  
  const outputMetrics = useMemo(() => {
    if (!Array.isArray(trackableItems)) {
      console.warn('trackableItems is not an array:', trackableItems);
      return [];
    }
    return trackableItems.filter(item => 
      item && 
      item.category === 'OUTPUT' && 
      (item.type === 'SCALE_1_10' || item.type === 'NUMERIC')
    );
  }, [trackableItems]);

  // Separate experiments by status with enhanced error handling
  const activeExperiments = useMemo(() => {
    if (!Array.isArray(experiments)) {
      console.warn('experiments is not an array:', experiments);
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    return experiments.filter(exp => {
      if (!exp || !exp.id || !exp.status) {
        console.warn('Invalid experiment object:', exp);
        return false;
      }

      // Auto-update status if end date has passed
      if (exp.status === 'ACTIVE' && exp.end_date && exp.end_date < today) {
        // Only update if mutation is not already pending
        if (!updateStatusMutation.isPending) {
          updateStatusMutation.mutate({ id: exp.id, status: 'COMPLETED' });
        }
        return false; // Don't show in active until refetch
      }
      return exp.status === 'ACTIVE';
    });
  }, [experiments, updateStatusMutation]);

  const completedExperiments = useMemo(() => {
    if (!Array.isArray(experiments)) {
      console.warn('experiments is not an array:', experiments);
      return [];
    }
    return experiments.filter(exp => exp && exp.status === 'COMPLETED');
  }, [experiments]);

  const experimentsToDisplay = activeTab === 'active' ? activeExperiments : completedExperiments;

  const handleEditExperiment = (experiment: Experiment) => {
    if (!experiment || !experiment.id) {
      console.error('Invalid experiment for editing:', experiment);
      return;
    }
    setSelectedExperiment(experiment);
    setShowEditDialog(true);
  };

  const handleViewResults = async (experiment: Experiment) => {
    if (!experiment || !experiment.id) {
      console.error('Invalid experiment for viewing results:', experiment);
      return;
    }

    setAnalyzingId(experiment.id);
    try {
      const results = await analyzeExperimentResults(experiment);
      setSelectedResults(results);
      setShowResultsDialog(true);
    } catch (error) {
      console.error('Failed to analyze experiment:', error);
      alert(`Failed to analyze experiment results: ${getErrorMessage(error)}`);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleViewProgress = async (experiment: Experiment) => {
    if (!experiment || !experiment.id) {
      console.error('Invalid experiment for viewing progress:', experiment);
      return;
    }

    setAnalyzingId(experiment.id);
    try {
      const results = await analyzeExperimentResults(experiment);
      setSelectedResults(results);
      setShowResultsDialog(true);
    } catch (error) {
      console.error('Failed to analyze experiment progress:', error);
      alert(`Failed to analyze experiment progress: ${getErrorMessage(error)}`);
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleCompleteExperiment = (id: string) => {
    if (!id) {
      console.error('Invalid experiment ID for completion');
      return;
    }
    updateStatusMutation.mutate({ id, status: 'COMPLETED' });
  };

  const handleReactivateExperiment = (id: string) => {
    if (!id) {
      console.error('Invalid experiment ID for reactivation');
      return;
    }
    updateStatusMutation.mutate({ id, status: 'ACTIVE' });
  };

  const handleDeleteExperiment = (experiment: Experiment) => {
    if (!experiment || !experiment.id) {
      console.error('Invalid experiment for deletion:', experiment);
      return;
    }
    setExperimentToDelete(experiment);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (experimentToDelete && experimentToDelete.id) {
      deleteMutation.mutate(experimentToDelete.id);
    } else {
      console.error('No experiment to delete or invalid experiment ID');
    }
  };

  const handleShareFinding = (results: ExperimentResults) => {
    if (!results || !results.experiment || !results.experiment.id) {
      console.error('Invalid experiment results for sharing:', results);
      return;
    }

    // Navigate to community/new with experiment context and prepopulated data
    const params = new URLSearchParams({
      type: 'experiment',
      experimentId: results.experiment.id
    });
    
    router.push(`/community/new?${params.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Invalid Date';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return 'Invalid Date';
    }
  };

  const getExperimentDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '0 days';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `${Math.max(days, 1)} day${days !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Error calculating experiment duration:', startDate, endDate, error);
      return '0 days';
    }
  };

  const isLoading = loadingItems || loadingExperiments;

  // Handle errors gracefully
  if (itemsError || experimentsError) {
    console.error('Lab page errors:', { itemsError, experimentsError });
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-white mb-4">Unable to Load Lab</h1>
          <p style={{ color: '#e6e2eb' }} className="mb-6">
            There was an error loading your lab data. Please try refreshing the page.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200"
            style={{ color: '#4a2a6d' }}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b] flex items-center justify-center">
        <div className="w-16 h-16 relative">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Page Header with Start New Experiment Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="group/header">
              <h1 className="font-heading text-3xl text-white mb-2 bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Experimentation Lab
              </h1>
              <p style={{ color: '#e6e2eb' }} className="text-lg">
                Design and track personal experiments to optimize your life
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateDialog(true)}
                className="group/new relative overflow-hidden px-6 py-3 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-white/60 text-gray-800 shadow-lg transition-all duration-300 hover:bg-white hover:border-white hover:shadow-xl hover:shadow-white/30"
              >
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover/new:translate-x-full transition-transform duration-500 ease-out"></div>
                
                {/* Content */}
                <div className="relative">
                  <span className="font-medium text-base transition-all duration-300 group-hover/new:tracking-wide">
                    Start New Experiment
                  </span>
                </div>
                
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-xl bg-purple-100/20 opacity-0 group-hover/new:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* Check if user has required metrics */}
          {inputMetrics.length === 0 || outputMetrics.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/empty">
              <div className="text-center py-16 px-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover/empty:scale-110 group-hover/empty:rotate-12 group-hover/empty:shadow-xl">
                  <FlaskConical className="w-12 h-12 text-purple-400 transition-all duration-500 group-hover/empty:text-indigo-500" />
                </div>
                <h3 className="font-heading text-2xl text-primary-text mb-4 transition-all duration-500 group-hover/empty:scale-105 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Ready to Start Experimenting?
                </h3>
                <p className="text-secondary-text mb-8 max-w-lg mx-auto text-lg">
                  To create experiments, you need both input metrics (things you control) and output metrics (things you measure).
                </p>
                <div className="space-y-3 text-sm text-secondary-text mb-8 max-w-md mx-auto">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm transition-all duration-300 group-hover/empty:shadow-md">
                    <span>Input metrics (habits):</span>
                    <span className={`px-3 py-1 rounded-full ${inputMetrics.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {inputMetrics.length} created
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm transition-all duration-300 group-hover/empty:shadow-md">
                    <span>Output metrics (goals):</span>
                    <span className={`px-3 py-1 rounded-full ${outputMetrics.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {outputMetrics.length} created
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/log')}
                  className="group/metric relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  {/* Animated background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/metric:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Sliding highlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/metric:translate-x-full transition-transform duration-700 ease-out"></div>
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-center space-x-3">
                    {/* Icon with bounce animation */}
                    <div className="transform group-hover/metric:scale-110 group-hover/metric:rotate-12 transition-transform duration-300">
                      <Plus className="w-6 h-6" />
                    </div>
                    
                    {/* Text with enhanced styling */}
                    <span className="tracking-wide group-hover/metric:tracking-wider transition-all duration-300">
                      Create Your Metrics
                    </span>
                  </div>
                  
                  {/* Pulse ring effect */}
                  <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/metric:opacity-100 group-hover/metric:scale-110 transition-all duration-500"></div>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs - Fixed to not have hover animation sticking out */}
              <div className="flex space-x-1 p-1 rounded-lg transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: '#cdc1db' }}>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    activeTab === 'active'
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/50'
                  }`}
                  style={{ 
                    color: activeTab === 'active' ? '#4a2a6d' : '#9992a2'
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Beaker className={`w-4 h-4 ${activeTab === 'active' ? 'text-purple-600' : 'text-purple-400'}`} />
                    <span>Active ({activeExperiments.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    activeTab === 'completed'
                      ? 'bg-white shadow-md'
                      : 'hover:bg-white/50'
                  }`}
                  style={{ 
                    color: activeTab === 'completed' ? '#4a2a6d' : '#9992a2'
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FlaskConical className={`w-4 h-4 ${activeTab === 'completed' ? 'text-green-600' : 'text-green-400'}`} />
                    <span>Completed ({completedExperiments.length})</span>
                  </div>
                </button>
              </div>

              {/* Experiments List - Enhanced with animations */}
              {experimentsToDisplay.length === 0 ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/empty">
                  <div className="text-center py-12 px-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover/empty:scale-110 group-hover/empty:rotate-12 group-hover/empty:shadow-xl">
                      <FlaskConical className="w-10 h-10 text-gray-400 transition-all duration-500 group-hover/empty:text-gray-600" />
                    </div>
                    <h3 className="font-heading text-2xl text-primary-text mb-4 transition-all duration-500 group-hover/empty:scale-105">
                      {activeTab === 'active' 
                        ? "No active experiments" 
                        : "No completed experiments yet"
                      }
                    </h3>
                    <p className="text-secondary-text mb-6 max-w-md mx-auto text-lg">
                      {activeTab === 'active' 
                        ? "Start your first experiment to begin optimizing your life!" 
                        : "Complete an active experiment to see it here."
                      }
                    </p>
                    {activeTab === 'active' && (
                      <button
                        onClick={() => setShowCreateDialog(true)}
                        className="group/start relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                      >
                        {/* Animated background gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/start:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Sliding highlight effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/start:translate-x-full transition-transform duration-700 ease-out"></div>
                        
                        {/* Content */}
                        <div className="relative flex items-center justify-center space-x-3">
                          <span className="tracking-wide group-hover/start:tracking-wider transition-all duration-300">
                            Start Your First Experiment
                          </span>
                        </div>
                        
                        {/* Pulse ring effect */}
                        <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/start:opacity-100 group-hover/start:scale-110 transition-all duration-500"></div>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {experimentsToDisplay.map((experiment) => {
                    if (!experiment || !experiment.id) {
                      console.warn('Skipping invalid experiment:', experiment);
                      return null;
                    }

                    const progressData = experimentProgressData[experiment.id];
                    const isActive = experiment.status === 'ACTIVE';
                    
                    return (
                      <div 
                        key={experiment.id} 
                        className="group/experiment relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10"
                      >
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover/experiment:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                        
                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover/experiment:opacity-100 transition-opacity duration-500 blur-sm"></div>
                        
                        <div className="relative p-6 space-y-5">
                          {/* Enhanced Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading text-xl text-primary-text group-hover/experiment:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                                {experiment.title || 'Untitled Experiment'}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                {isActive ? (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none shadow-sm transition-all duration-300 group-hover/experiment:shadow-md group-hover/experiment:scale-105">
                                    ACTIVE
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gradient-to-r from-green-500 to-teal-600 text-white border-none shadow-sm transition-all duration-300 group-hover/experiment:shadow-md group-hover/experiment:scale-105">
                                    COMPLETED
                                  </Badge>
                                )}
                                <span className="text-sm text-secondary-text group-hover/experiment:text-gray-700 transition-colors duration-300 px-2 py-1 bg-gray-100 rounded-full">
                                  {getExperimentDuration(experiment.start_date, experiment.end_date)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar - Now shows data completeness with enhanced styling */}
                          {progressData && (
                            <div className="space-y-2 group/progress">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-primary-text group-hover/experiment:text-purple-700 transition-colors duration-300">Progress</span>
                                <span className="text-secondary-text group-hover/experiment:text-purple-600 transition-colors duration-300">
                                  {progressData.daysWithData} of {progressData.totalDays} days logged
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 group-hover/experiment:bg-gray-300 transition-colors duration-300 overflow-hidden">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-700 ease-out ${
                                    isActive 
                                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 group-hover/experiment:from-purple-600 group-hover/experiment:to-indigo-600' 
                                      : 'bg-gradient-to-r from-green-500 to-teal-500 group-hover/experiment:from-green-600 group-hover/experiment:to-teal-600'
                                  }`}
                                  style={{ width: `${progressData.totalDays > 0 ? Math.min(100, (progressData.daysWithData / progressData.totalDays) * 100) : 0}%` }}
                                ></div>
                              </div>
                              {progressData.totalDays > 0 && (
                                <p className="text-xs text-secondary-text group-hover/experiment:text-purple-600 transition-colors duration-300">
                                  {Math.round(Math.min(100, (progressData.daysWithData / progressData.totalDays) * 100))}% data completeness
                                </p>
                              )}
                            </div>
                          )}

                          {/* Date Range with enhanced styling */}
                          <div className="flex items-center space-x-2 text-sm text-secondary-text group-hover/experiment:text-gray-700 transition-colors duration-300 p-3 bg-gray-50 rounded-lg group-hover/experiment:bg-gray-100">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">{formatDate(experiment.start_date)} - {formatDate(experiment.end_date)}</span>
                          </div>

                          {/* Variables with enhanced styling */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg transition-all duration-300 group-hover/experiment:bg-orange-100 group-hover/experiment:shadow-sm">
                              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center group-hover/experiment:scale-110 transition-transform duration-300 shadow-sm shadow-orange-400/20">
                                <Target className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-orange-700 group-hover/experiment:text-orange-800 transition-colors duration-300">Cause</p>
                                <p className="font-medium text-orange-900 truncate group-hover/experiment:text-orange-950 transition-colors duration-300">
                                  {experiment.independent_variable?.name || 'Unknown Variable'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg transition-all duration-300 group-hover/experiment:bg-green-100 group-hover/experiment:shadow-sm">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center group-hover/experiment:scale-110 transition-transform duration-300 shadow-sm shadow-green-400/20">
                                <TrendingUp className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-green-700 group-hover/experiment:text-green-800 transition-colors duration-300">Effect</p>
                                <p className="font-medium text-green-900 truncate group-hover/experiment:text-green-950 transition-colors duration-300">
                                  {experiment.dependent_variable?.name || 'Unknown Variable'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Hypothesis with enhanced styling */}
                          {experiment.hypothesis && (
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 transition-all duration-300 group-hover/experiment:bg-indigo-100 group-hover/experiment:border-indigo-200 group-hover/experiment:shadow-sm">
                              <p className="text-sm text-indigo-800 italic leading-relaxed group-hover/experiment:text-indigo-900 transition-colors duration-300">
                                "{experiment.hypothesis}"
                              </p>
                            </div>
                          )}

                          {/* Actions with enhanced styling */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 group-hover/experiment:border-purple-100 transition-colors duration-300">
                            <div className="flex space-x-2">
                              {experiment.status === 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleViewResults(experiment)}
                                  loading={analyzingId === experiment.id}
                                  disabled={analyzingId === experiment.id}
                                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Results
                                </Button>
                              )}
                              {experiment.status === 'ACTIVE' && (
                                <>
                                  {/* View Progress Button - requires at least 3 days of data */}
                                  {progressData && progressData.daysWithData >= 3 && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleViewProgress(experiment)}
                                      loading={analyzingId === experiment.id}
                                      disabled={analyzingId === experiment.id}
                                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
                                    >
                                      <BarChart3 className="w-4 h-4 mr-2" />
                                      View Progress
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCompleteExperiment(experiment.id)}
                                    disabled={updateStatusMutation.isPending}
                                    className="border-gray-300 text-gray-700 transition-all duration-300 hover:bg-gray-100 hover:border-gray-400 hover:scale-105"
                                  >
                                    <Square className="w-4 h-4 mr-2" />
                                    Complete
                                  </Button>
                                </>
                              )}
                              {experiment.status === 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReactivateExperiment(experiment.id)}
                                  disabled={updateStatusMutation.isPending}
                                  className="border-green-300 text-green-700 transition-all duration-300 hover:bg-green-50 hover:border-green-400 hover:scale-105"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Reactivate
                                </Button>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {/* Only show edit button for active experiments */}
                              {experiment.status === 'ACTIVE' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditExperiment(experiment)}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300 hover:scale-110"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteExperiment(experiment)}
                                disabled={deleteMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 hover:scale-110"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Start New Experiment Button - Fixed at bottom for easy access */}
              {experimentsToDisplay.length > 0 && (
                <div className="pt-6">
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="group/discover relative overflow-hidden w-full px-6 py-4 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-white/60 text-gray-800 shadow-lg transition-all duration-300 hover:bg-white hover:border-white hover:shadow-xl hover:shadow-white/30"
                  >
                    {/* Sliding highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover/discover:translate-x-full transition-transform duration-500 ease-out"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-3">
                      <span className="font-semibold text-lg transition-all duration-300 group-hover/discover:tracking-wide text-gray-800">
                        Start New Experiment
                      </span>
                      <div className="transform group-hover/discover:translate-x-1 transition-transform duration-300">
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-purple-100/20 opacity-0 group-hover/discover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateExperimentDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        inputMetrics={inputMetrics}
        outputMetrics={outputMetrics}
      />

      <EditExperimentDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedExperiment(null);
        }}
        experiment={selectedExperiment}
        inputMetrics={inputMetrics}
        outputMetrics={outputMetrics}
      />

      <ExperimentResultsDialog
        isOpen={showResultsDialog}
        onClose={() => setShowResultsDialog(false)}
        results={selectedResults}
        onShare={handleShareFinding}
      />

      <DeleteExperimentDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setExperimentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        experiment={experimentToDelete}
        loading={deleteMutation.isPending}
      />
      
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
    </div>
  );
}