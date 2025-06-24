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
import { FlaskConical, Plus, Calendar, Target, TrendingUp, Trash2, Play, Square, Eye, Edit2 } from 'lucide-react';
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

  // Fetch trackable items
  const { data: trackableItems = [], isLoading: loadingItems } = useQuery<TrackableItem[]>({
    queryKey: ['trackableItems', user?.id],
    queryFn: () => getTrackableItems(user!.id),
    enabled: !!user?.id,
  });

  // Fetch experiments
  const { data: experiments = [], isLoading: loadingExperiments } = useQuery<Experiment[]>({
    queryKey: ['experiments', user?.id],
    queryFn: () => getExperiments(user!.id),
    enabled: !!user?.id,
  });

  // Fetch experiment progress data for all experiments
  const { data: experimentProgressData = {} } = useQuery({
    queryKey: ['experimentProgress', user?.id, experiments.map(e => e.id)],
    queryFn: async () => {
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
            totalDays
          };
        }
      }
      
      return progressMap;
    },
    enabled: !!user?.id && experiments.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update experiment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'COMPLETED' }) => 
      updateExperimentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['experimentProgress', user?.id] });
    },
  });

  // Delete experiment mutation
  const deleteMutation = useMutation({
    mutationFn: deleteExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['experimentProgress', user?.id] });
      setShowDeleteDialog(false);
      setExperimentToDelete(null);
    },
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

  // Separate experiments by status
  const activeExperiments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return experiments.filter(exp => {
      // Auto-update status if end date has passed
      if (exp.status === 'ACTIVE' && exp.end_date < today) {
        updateStatusMutation.mutate({ id: exp.id, status: 'COMPLETED' });
        return false; // Don't show in active until refetch
      }
      return exp.status === 'ACTIVE';
    });
  }, [experiments, updateStatusMutation]);

  const completedExperiments = useMemo(() => 
    experiments.filter(exp => exp.status === 'COMPLETED'), 
    [experiments]
  );

  const experimentsToDisplay = activeTab === 'active' ? activeExperiments : completedExperiments;

  const handleEditExperiment = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setShowEditDialog(true);
  };

  const handleViewResults = async (experiment: Experiment) => {
    setAnalyzingId(experiment.id);
    try {
      const results = await analyzeExperimentResults(experiment);
      setSelectedResults(results);
      setShowResultsDialog(true);
    } catch (error) {
      console.error('Failed to analyze experiment:', error);
      alert('Failed to analyze experiment results');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleCompleteExperiment = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'COMPLETED' });
  };

  const handleReactivateExperiment = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'ACTIVE' });
  };

  const handleDeleteExperiment = (experiment: Experiment) => {
    setExperimentToDelete(experiment);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (experimentToDelete) {
      deleteMutation.mutate(experimentToDelete.id);
    }
  };

  const handleShareFinding = (results: ExperimentResults) => {
    // Navigate to community/new with experiment context and prepopulated data
    const params = new URLSearchParams({
      type: 'experiment',
      experimentId: results.experiment.id
    });
    
    router.push(`/community/new?${params.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getExperimentDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getExperimentProgress = (startDate: string, endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    
    // If experiment hasn't started yet
    if (elapsed < 0) {
      return { percentage: 0, daysElapsed: 0, totalDays: Math.ceil(totalDuration / (1000 * 60 * 60 * 24)) + 1, status: 'upcoming' };
    }
    
    // If experiment has ended
    if (today.getTime() > end.getTime()) {
      const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24)) + 1;
      return { percentage: 100, daysElapsed: totalDays, totalDays, status: 'completed' };
    }
    
    // Experiment is in progress
    const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const daysElapsed = Math.ceil(elapsed / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24)) + 1;
    
    return { percentage, daysElapsed: Math.max(1, daysElapsed), totalDays, status: 'active' };
  };

  const isLoading = loadingItems || loadingExperiments;

  if (isLoading) {
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
          {/* Main Page Header with Start New Experiment Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl text-white mb-2">Experimentation Lab</h1>
              <p style={{ color: '#e6e2eb' }}>Design and track personal experiments to optimize your life</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200"
                style={{ color: '#4a2a6d' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Experiment
              </Button>
            </div>
          </div>

          {/* Check if user has required metrics */}
          {inputMetrics.length === 0 || outputMetrics.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
              <CardContent className="text-center py-12">
                <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-heading text-xl text-primary-text mb-2">Ready to Start Experimenting?</h3>
                <p className="text-secondary-text mb-6 max-w-md mx-auto">
                  To create experiments, you need both input metrics (things you control) and output metrics (things you measure).
                </p>
                <div className="space-y-2 text-sm text-secondary-text mb-6">
                  <p>✓ Input metrics: {inputMetrics.length} created</p>
                  <p>✓ Output metrics: {outputMetrics.length} created</p>
                </div>
                <Button onClick={() => window.location.href = '/log'}>
                  Create Your Metrics
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex space-x-1 p-1 rounded-lg" style={{ backgroundColor: '#cdc1db' }}>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'active'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-white/50'
                  }`}
                  style={{ 
                    color: activeTab === 'active' ? '#4a2a6d' : '#9992a2'
                  }}
                >
                  Active ({activeExperiments.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-white/50'
                  }`}
                  style={{ 
                    color: activeTab === 'completed' ? '#4a2a6d' : '#9992a2'
                  }}
                >
                  Completed ({completedExperiments.length})
                </button>
              </div>

              {/* Experiments List */}
              {experimentsToDisplay.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
                  <CardContent className="text-center py-8">
                    <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-secondary-text">
                      {activeTab === 'active' 
                        ? "No active experiments. Start your first experiment to begin optimizing!"
                        : "No completed experiments yet."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {experimentsToDisplay.map((experiment) => {
                    const progress = getExperimentProgress(experiment.start_date, experiment.end_date);
                    const progressData = experimentProgressData[experiment.id];
                    
                    return (
                      <div key={experiment.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-heading text-lg text-primary-text mb-2">
                                {experiment.title}
                              </h4>
                              <div className="flex items-center space-x-2 mb-3">
                                {experiment.status === 'ACTIVE' ? (
                                  <Badge className="bg-primary text-white">
                                    ACTIVE
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-500 text-black">
                                    COMPLETED
                                  </Badge>
                                )}
                                <span className="text-sm text-secondary-text">
                                  {getExperimentDuration(experiment.start_date, experiment.end_date)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar - Only show for active experiments or if experiment has started */}
                          {(experiment.status === 'ACTIVE' || progress.status !== 'upcoming') && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-primary-text">Progress</span>
                                <span className="text-secondary-text">
                                  {progress.status === 'upcoming' 
                                    ? 'Starts soon'
                                    : progress.status === 'completed'
                                    ? 'Completed'
                                    : `Day ${progress.daysElapsed} of ${progress.totalDays}`
                                  }
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                                    progress.status === 'completed' 
                                      ? 'bg-accent-2' 
                                      : progress.status === 'active'
                                      ? 'bg-primary' 
                                      : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${progress.percentage}%` }}
                                ></div>
                              </div>
                              {progress.status === 'active' && progress.percentage > 0 && progress.percentage < 100 && (
                                <p className="text-xs text-secondary-text">
                                  {Math.round(progress.percentage)}% complete
                                </p>
                              )}
                            </div>
                          )}

                          {/* Data Tracking Progress */}
                          {progressData && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-primary-text">Data Logged</span>
                                <span className="text-secondary-text">
                                  {progressData.daysWithData} of {progressData.totalDays} days
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-500 ease-out bg-blue-500"
                                  style={{ 
                                    width: `${progressData.totalDays > 0 ? (progressData.daysWithData / progressData.totalDays) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-secondary-text">
                                {progressData.totalDays > 0 ? Math.round((progressData.daysWithData / progressData.totalDays) * 100) : 0}% data completeness
                              </p>
                            </div>
                          )}

                          {/* Date Range */}
                          <div className="flex items-center space-x-2 text-sm text-secondary-text">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(experiment.start_date)} - {formatDate(experiment.end_date)}</span>
                          </div>

                          {/* Variables */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Target className="w-4 h-4 text-accent-1" />
                              <span className="text-secondary-text">Cause:</span>
                              <span className="font-medium text-primary-text">
                                {experiment.independent_variable?.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-accent-2" />
                              <span className="text-secondary-text">Effect:</span>
                              <span className="font-medium text-primary-text">
                                {experiment.dependent_variable?.name}
                              </span>
                            </div>
                          </div>

                          {/* Hypothesis */}
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-secondary-text italic">
                              "{experiment.hypothesis}"
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex space-x-2">
                              {experiment.status === 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleViewResults(experiment)}
                                  loading={analyzingId === experiment.id}
                                  disabled={analyzingId === experiment.id}
                                  className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Results
                                </Button>
                              )}
                              {experiment.status === 'ACTIVE' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteExperiment(experiment.id)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Square className="w-4 h-4 mr-2" />
                                  Complete
                                </Button>
                              )}
                              {experiment.status === 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReactivateExperiment(experiment.id)}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Reactivate
                                </Button>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              {/* Only show edit button for active experiments */}
                              {experiment.status === 'ACTIVE' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditExperiment(experiment)}
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteExperiment(experiment)}
                                disabled={deleteMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </div>
  );
}