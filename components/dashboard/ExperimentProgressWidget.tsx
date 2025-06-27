'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getExperiments } from '@/lib/experiments';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-heading text-lg text-white">Active Experiments</h3>
        </div>

        {/* Loading State */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 group">
      {/* Header - WITH REDUCED GLOW ON ICON */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Icon with reduced glow and size increase */}
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-white/30 flex-shrink-0">
            <FlaskConical className="w-4 h-4 text-primary transition-all duration-300 group-hover:scale-110" />
          </div>
          
          {/* Text content moved to the right with enhanced effects */}
          <div className="transition-all duration-300 group-hover:translate-x-2">
            {/* Heading with glow and size increase */}
            <h3 className="font-heading text-lg text-white transition-all duration-300 group-hover:scale-105 group-hover:text-shadow-glow">
              Active Experiments
            </h3>
            {/* Description with glow and size increase */}
            <p className="text-sm transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:text-shadow-glow-subtle" style={{ color: '#e6e2eb' }}>
              Track your ongoing experiments
            </p>
          </div>
        </div>
        {activeExperiments.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAllExperiments}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Content */}
      {activeExperiments.length === 0 ? (
        // No active experiments - show create experiment CTA
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-heading text-lg text-primary-text mb-2">
            Ready to Start Experimenting?
          </h4>
          <p className="text-secondary-text text-sm mb-6 max-w-sm mx-auto">
            Design controlled experiments to test what really works for your optimization goals.
          </p>
          <button
            onClick={handleCreateExperiment}
            className="group/experiment relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/experiment:opacity-100 transition-opacity duration-500"></div>
            
            {/* Sliding highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/experiment:translate-x-full transition-transform duration-700 ease-out"></div>
            
            {/* Content */}
            <div className="relative flex items-center justify-center space-x-3">
              {/* Icon with bounce animation */}
              <div className="transform group-hover/experiment:scale-110 group-hover/experiment:rotate-12 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>
              
              {/* Text with enhanced styling */}
              <span className="tracking-wide group-hover/experiment:tracking-wider transition-all duration-300">
                Create Your First Experiment
              </span>
            </div>
            
            {/* Pulse ring effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/experiment:opacity-100 group-hover/experiment:scale-110 transition-all duration-500"></div>
          </button>
        </div>
      ) : (
        // Show active experiments - Individual items as white containers with interactive effects
        <div className="space-y-6">
          {activeExperiments.slice(0, 2).map((experiment, index) => {
            const progress = getExperimentProgress(experiment.start_date, experiment.end_date);
            
            return (
              <div 
                key={experiment.id} 
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 cursor-pointer group/experiment border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-3xl hover:z-10 relative"
                onClick={handleViewAllExperiments}
                style={{
                  // Add margin to prevent overlap when rising
                  marginBottom: index < activeExperiments.slice(0, 2).length - 1 ? '1.5rem' : '0'
                }}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-primary-text truncate group-hover/experiment:text-primary transition-colors duration-300">
                        {experiment.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="default" className="text-xs group-hover/experiment:bg-primary/20 transition-colors duration-300">
                          {experiment.status}
                        </Badge>
                        <span className="text-xs text-secondary-text group-hover/experiment:text-primary-text transition-colors duration-300">
                          {formatDate(experiment.start_date)} - {formatDate(experiment.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Variables */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <Target className="w-3 h-3 text-accent-1 flex-shrink-0 group-hover/experiment:scale-110 transition-transform duration-300" />
                      <span className="text-secondary-text truncate group-hover/experiment:text-primary-text transition-colors duration-300">
                        {experiment.independent_variable?.name || 'Input Variable'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3 text-accent-2 flex-shrink-0 group-hover/experiment:scale-110 transition-transform duration-300" />
                      <span className="text-secondary-text truncate group-hover/experiment:text-primary-text transition-colors duration-300">
                        {experiment.dependent_variable?.name || 'Output Variable'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar - FIXED: Removed scale transform on hover */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-primary-text group-hover/experiment:text-primary transition-colors duration-300">Progress</span>
                      <span className="text-secondary-text group-hover/experiment:text-primary-text transition-colors duration-300">
                        {progress.status === 'upcoming' 
                          ? 'Starts soon'
                          : progress.status === 'completed'
                          ? 'Completed'
                          : `Day ${progress.daysElapsed} of ${progress.totalDays}`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 group-hover/experiment:bg-gray-300 transition-colors duration-300">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          progress.status === 'completed' 
                            ? 'bg-accent-2 group-hover/experiment:bg-accent-2/80' 
                            : progress.status === 'active'
                            ? 'bg-primary group-hover/experiment:bg-primary/80' 
                            : 'bg-gray-300 group-hover/experiment:bg-gray-400'
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
                className="text-white hover:bg-white/10 hover:text-white"
              >
                +{activeExperiments.length - 2} more experiment{activeExperiments.length - 2 !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Create new experiment button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateExperiment}
              className="w-full bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200"
              style={{ color: '#4a2a6d' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Experiment
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Custom CSS for text glow effects */}
      <style jsx>{`
        .group:hover .group-hover\\:text-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4);
        }
        .group:hover .group-hover\\:text-shadow-glow-subtle {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}