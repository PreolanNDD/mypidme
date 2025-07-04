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
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg flex-shrink-0">
            <FlaskConical className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
          </div>
          
          {/* Text content moved to the right with enhanced effects */}
          <div className="transition-all duration-300 group-hover:translate-x-1">
            {/* Heading with glow and size increase */}
            <h3 className="font-heading text-xl text-white transition-all duration-300 group-hover:scale-105 group-hover:text-shadow-glow">
              Active Experiments
            </h3>
            {/* Description with glow and size increase */}
            <p className="text-base transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:text-shadow-glow-subtle" style={{ color: '#e6e2eb' }}>
              Track your ongoing experiments
            </p>
          </div>
        </div>
        {activeExperiments.length > 0 && (
          <button
            onClick={handleViewAllExperiments}
            className="group/viewall relative overflow-hidden px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
          >
            {/* Sliding highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/viewall:translate-x-full transition-transform duration-500 ease-out"></div>
            
            {/* Content */}
            <div className="relative flex items-center space-x-2">
              <span className="text-sm font-medium transition-all duration-300 group-hover/viewall:tracking-wide">
                View All
              </span>
              <div className="transform group-hover/viewall:translate-x-1 transition-transform duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover/viewall:opacity-100 transition-opacity duration-300"></div>
          </button>
        )}
      </div>

      {/* Content */}
      {activeExperiments.length === 0 ? (
        // No active experiments - show create experiment CTA
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/empty">
          <div className="text-center py-16 px-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover/empty:scale-110 group-hover/empty:rotate-12 group-hover/empty:shadow-xl">
              <FlaskConical className="w-12 h-12 text-purple-400 transition-all duration-500 group-hover/empty:text-indigo-500" />
            </div>
            <h3 className="font-heading text-2xl text-primary-text mb-4 transition-all duration-500 group-hover/empty:scale-105 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Ready to Start Experimenting?
            </h3>
            <p className="text-secondary-text mb-8 max-w-lg mx-auto text-lg">
              Design controlled experiments to test what really works for your optimization goals.
            </p>
            <button
              onClick={handleCreateExperiment}
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
                  <Plus className="w-5 h-5" />
                </div>
                
                {/* Text with enhanced styling */}
                <span className="tracking-wide group-hover/button:tracking-wider transition-all duration-300">
                  Create Your First Experiment
                </span>
              </div>
              
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/button:opacity-100 group-hover/button:scale-105 transition-all duration-500"></div>
            </button>
          </div>
        </div>
      ) : (
        // Show active experiments - Enhanced individual items with better styling
        <div className="space-y-6">
          {activeExperiments.slice(0, 2).map((experiment, index) => {
            const progress = getExperimentProgress(experiment.start_date, experiment.end_date);
            
            return (
              <div 
                key={experiment.id} 
                className="group/experiment relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10"
                onClick={handleViewAllExperiments}
                style={{
                  // Add margin to prevent overlap when rising
                  marginBottom: index < activeExperiments.slice(0, 2).length - 1 ? '1.5rem' : '0'
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover/experiment:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover/experiment:opacity-100 transition-opacity duration-500 blur-sm"></div>
                
                <div className="relative p-6 space-y-5">
                  {/* Enhanced Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-lg text-primary-text group-hover/experiment:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                        {experiment.title}
                      </h4>
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className="bg-primary text-white group-hover/experiment:bg-purple-600 transition-colors duration-300">
                          ACTIVE
                        </Badge>
                        <span className="text-sm text-secondary-text group-hover/experiment:text-gray-700 transition-colors duration-300">
                          {formatDate(experiment.start_date)} - {formatDate(experiment.end_date)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="flex-shrink-0 transform group-hover/experiment:translate-x-1 group-hover/experiment:scale-110 transition-all duration-300">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover/experiment:text-purple-600" />
                    </div>
                  </div>

                  {/* Enhanced Progress Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-primary-text group-hover/experiment:text-purple-700 transition-colors duration-300">Progress</span>
                      <span className="text-secondary-text group-hover/experiment:text-purple-600 transition-colors duration-300">
                        {progress.status === 'upcoming' 
                          ? 'Starts soon'
                          : progress.status === 'completed'
                          ? 'Completed'
                          : `Day ${progress.daysElapsed} of ${progress.totalDays}`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 group-hover/experiment:bg-gray-300 transition-colors duration-300 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ease-out ${
                          progress.status === 'completed' 
                            ? 'bg-gradient-to-r from-green-400 to-teal-500 group-hover/experiment:from-green-500 group-hover/experiment:to-teal-600' 
                            : progress.status === 'active'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 group-hover/experiment:from-purple-600 group-hover/experiment:to-indigo-600' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 group-hover/experiment:from-gray-500 group-hover/experiment:to-gray-600'
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-secondary-text group-hover/experiment:text-purple-600 transition-colors duration-300">
                      {progress.percentage.toFixed(0)}% complete
                    </p>
                  </div>

                  {/* Variables */}
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

                  {/* Hypothesis */}
                  {experiment.hypothesis && (
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg transition-all duration-300 group-hover/experiment:bg-indigo-100 group-hover/experiment:border-indigo-200 group-hover/experiment:shadow-sm">
                      <p className="text-sm text-indigo-800 italic line-clamp-2 group-hover/experiment:text-indigo-900 transition-colors duration-300">
                        "{experiment.hypothesis}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show more experiments indicator */}
          {activeExperiments.length > 2 && (
            <div className="text-center pt-2">
              <button
                onClick={handleViewAllExperiments}
                className="group/more relative overflow-hidden px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
              >
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/more:translate-x-full transition-transform duration-500 ease-out"></div>
                
                {/* Content */}
                <div className="relative">
                  <span className="text-sm font-medium transition-all duration-300 group-hover/more:tracking-wide">
                    +{activeExperiments.length - 2} more experiment{activeExperiments.length - 2 !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover/more:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}

          {/* Start New Experiment Button - Matching Community Insights style */}
          <div className="pt-2">
            <button
              onClick={handleCreateExperiment}
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
                  <Plus className="w-5 h-5" />
                </div>
                
                {/* Text with enhanced styling */}
                <span className="tracking-wide group-hover/button:tracking-wider transition-all duration-300">
                  Start New Experiment
                </span>
              </div>
              
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/button:opacity-100 group-hover/button:scale-105 transition-all duration-500"></div>
            </button>
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}