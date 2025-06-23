'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getExperiments } from '@/lib/experiments';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, Calendar, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function ExperimentProgressWidget() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch experiments
  const { data: experiments = [], isLoading } = useQuery({
    queryKey: ['experiments', user?.id],
    queryFn: () => getExperiments(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter active experiments
  const activeExperiments = experiments.filter(exp => exp.status === 'ACTIVE');

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCreateExperiment = () => {
    router.push('/lab');
  };

  const handleViewAllExperiments = () => {
    router.push('/lab');
  };

  if (isLoading) {
    return (
      <>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-heading text-lg text-primary-text">Active Experiments</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-primary-text">Active Experiments</h3>
              <p className="text-sm text-secondary-text">Track your ongoing experiments</p>
            </div>
          </div>
          {activeExperiments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAllExperiments}
              className="text-primary hover:text-primary/80"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activeExperiments.length === 0 ? (
          // No active experiments - show create experiment CTA
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-heading text-lg text-primary-text mb-2">
              Ready to Start Experimenting?
            </h4>
            <p className="text-secondary-text text-sm mb-6 max-w-sm mx-auto">
              Design controlled experiments to test what really works for your optimization goals.
            </p>
            <Button 
              onClick={handleCreateExperiment} 
              className="w-full sm:w-auto bg-brand-button hover:bg-white hover:text-brand-button hover:border-brand-button border border-transparent transition-all duration-200 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Experiment
            </Button>
          </div>
        ) : (
          // Show active experiments
          <div className="space-y-4">
            {activeExperiments.slice(0, 2).map((experiment) => {
              const progress = getExperimentProgress(experiment.start_date, experiment.end_date);
              
              return (
                <div key={experiment.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={handleViewAllExperiments}>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary-text truncate">
                          {experiment.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="default" className="text-xs">
                            {experiment.status}
                          </Badge>
                          <span className="text-xs text-secondary-text">
                            {formatDate(experiment.start_date)} - {formatDate(experiment.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Variables */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <Target className="w-3 h-3 text-accent-1 flex-shrink-0" />
                        <span className="text-secondary-text truncate">
                          {experiment.independent_variable?.name || 'Input Variable'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-3 h-3 text-accent-2 flex-shrink-0" />
                        <span className="text-secondary-text truncate">
                          {experiment.dependent_variable?.name || 'Output Variable'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
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
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show more experiments indicator */}
            {activeExperiments.length > 2 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllExperiments}
                  className="text-primary hover:text-primary/80"
                >
                  +{activeExperiments.length - 2} more experiment{activeExperiments.length - 2 !== 1 ? 's' : ''}
                </Button>
              </div>
            )}

            {/* Create new experiment button */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateExperiment}
                className="w-full bg-brand-button hover:bg-white hover:text-brand-button hover:border-brand-button border border-transparent transition-all duration-200 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Experiment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
}