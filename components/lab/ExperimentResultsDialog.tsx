'use client';

import React from 'react';
import { ExperimentResults } from '@/lib/experiments';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Calendar, Target, FlaskConical, Share2, CheckCircle, XCircle, X } from 'lucide-react';

interface ExperimentResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: ExperimentResults | null;
  onShare: (results: ExperimentResults) => void;
}

export function ExperimentResultsDialog({ 
  isOpen, 
  onClose, 
  results,
  onShare 
}: ExperimentResultsDialogProps) {
  if (!results) return null;

  const { experiment, positiveConditionAverage, negativeConditionAverage, 
          positiveConditionCount, negativeConditionCount, totalDays, daysWithData,
          missingDays, loggedDays } = results;

  // Calculate the difference and determine impact
  const difference = positiveConditionAverage !== null && negativeConditionAverage !== null 
    ? positiveConditionAverage - negativeConditionAverage 
    : null;

  const getImpactStrength = (diff: number | null): string => {
    if (diff === null) return 'Insufficient Data';
    const absDiff = Math.abs(diff);
    if (absDiff >= 2) return 'Strong';
    if (absDiff >= 1) return 'Moderate';
    if (absDiff >= 0.5) return 'Weak';
    return 'Minimal';
  };

  const getImpactDirection = (diff: number | null): string => {
    if (diff === null) return '';
    if (diff > 0) return 'Positive';
    if (diff < 0) return 'Negative';
    return 'No';
  };

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const dataCompleteness = totalDays > 0 ? (daysWithData / totalDays) * 100 : 0;

  const handleShare = () => {
    onShare(results);
  };

  // Check if this is an active experiment with insufficient data for analysis
  const isActiveExperiment = experiment.status === 'ACTIVE';
  const hasInsufficientData = daysWithData < 3;

  // Determine dialog title based on experiment status
  const dialogTitle = isActiveExperiment ? 'Experiment Progress' : 'Experiment Results';

  // Get impact color based on strength and direction
  const getImpactColor = () => {
    if (difference === null) return 'bg-gray-100 text-gray-800 border-gray-300';
    
    const strength = getImpactStrength(difference);
    const direction = getImpactDirection(difference);
    
    if (direction === 'Positive') {
      if (strength === 'Strong') return 'bg-green-100 text-green-800 border-green-300';
      if (strength === 'Moderate') return 'bg-green-50 text-green-700 border-green-200';
      return 'bg-green-50 text-green-600 border-green-200';
    } else if (direction === 'Negative') {
      if (strength === 'Strong') return 'bg-red-100 text-red-800 border-red-300';
      if (strength === 'Moderate') return 'bg-red-50 text-red-700 border-red-200';
      return 'bg-red-50 text-red-600 border-red-200';
    }
    
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mr-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="font-heading text-2xl text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {dialogTitle}
                </DialogTitle>
                <p className="text-sm text-secondary-text mt-1 line-clamp-1">{experiment.title}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 transition-all duration-300 hover:bg-gray-100 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Share Button - Only show for completed experiments or active experiments with sufficient data */}
          {(!isActiveExperiment || !hasInsufficientData) && (
            <div className="flex justify-start pt-2">
              <button
                onClick={handleShare}
                className="group/share relative overflow-hidden px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-purple-600 bg-white transition-all duration-300 hover:bg-purple-50 hover:border-purple-200 hover:scale-105 hover:shadow-lg"
              >
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover/share:translate-x-full transition-transform duration-500 ease-out"></div>
                
                {/* Content */}
                <div className="relative flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium transition-all duration-300 group-hover/share:tracking-wide">
                    Share Finding
                  </span>
                  <div className="transform group-hover/share:translate-x-1 transition-transform duration-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-lg bg-purple-100/20 opacity-0 group-hover/share:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          {/* Experiment Overview - Enhanced with animations */}
          <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md group/overview">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 p-3 bg-white/80 rounded-lg transition-all duration-300 group-hover/overview:bg-white group-hover/overview:shadow-sm">
                <Calendar className="w-4 h-4 text-purple-500 transition-all duration-300 group-hover/overview:scale-110 group-hover/overview:text-purple-600" />
                <div>
                  <span className="font-medium text-primary-text block mb-1">Period:</span>
                  <span className="text-secondary-text">
                    {formatDate(experiment.start_date)} - {formatDate(experiment.end_date)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/80 rounded-lg transition-all duration-300 group-hover/overview:bg-white group-hover/overview:shadow-sm">
                <Calendar className="w-4 h-4 text-purple-500 transition-all duration-300 group-hover/overview:scale-110 group-hover/overview:text-purple-600" />
                <div>
                  <span className="font-medium text-primary-text block mb-1">Duration:</span>
                  <span className="text-secondary-text">{totalDays} days</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/80 rounded-lg transition-all duration-300 group-hover/overview:bg-white group-hover/overview:shadow-sm">
                <Target className="w-4 h-4 text-orange-500 transition-all duration-300 group-hover/overview:scale-110 group-hover/overview:text-orange-600" />
                <div>
                  <span className="font-medium text-primary-text block mb-1">Independent Variable:</span>
                  <span className="text-secondary-text">{experiment.independent_variable?.name}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white/80 rounded-lg transition-all duration-300 group-hover/overview:bg-white group-hover/overview:shadow-sm">
                <TrendingUp className="w-4 h-4 text-green-500 transition-all duration-300 group-hover/overview:scale-110 group-hover/overview:text-green-600" />
                <div>
                  <span className="font-medium text-primary-text block mb-1">Dependent Variable:</span>
                  <span className="text-secondary-text">{experiment.dependent_variable?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Completeness - Enhanced with animations */}
          <div className="space-y-4 group/data">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 transition-all duration-300 group-hover/data:scale-110 group-hover/data:rotate-6">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-medium text-lg text-primary-text bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover/data:tracking-wider">
                Data Completeness
              </h3>
            </div>
            <div className="space-y-3 p-5 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 group-hover/data:shadow-md">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-text">Days with complete data:</span>
                <span className="font-medium text-primary-text">{daysWithData} of {totalDays} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${dataCompleteness}%` }}
                ></div>
              </div>
              <p className="text-xs text-secondary-text">
                {dataCompleteness.toFixed(1)}% data completeness
              </p>

              {/* Data Tracking Details - Enhanced with animations */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Logged Days */}
                <div className="group/logged p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-green-200/30 hover:-translate-y-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-sm shadow-green-400/20 transition-all duration-300 group-hover/logged:scale-110 group-hover/logged:rotate-6">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-green-900 transition-all duration-300 group-hover/logged:tracking-wide">
                      Days with Data ({loggedDays.length})
                    </h4>
                  </div>
                  {loggedDays.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {loggedDays.map(date => (
                          <span key={date} className="text-xs bg-white text-green-800 px-2 py-1 rounded-full shadow-sm transition-all duration-300 hover:bg-green-200 hover:shadow-md">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-green-700">No complete data days</p>
                  )}
                </div>

                {/* Missing Days */}
                <div className="group/missing p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-red-200/30 hover:-translate-y-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center shadow-sm shadow-red-400/20 transition-all duration-300 group-hover/missing:scale-110 group-hover/missing:rotate-6">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-red-900 transition-all duration-300 group-hover/missing:tracking-wide">
                      Missing Data Days ({missingDays.length})
                    </h4>
                  </div>
                  {missingDays.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {missingDays.map(date => (
                          <span key={date} className="text-xs bg-white text-red-800 px-2 py-1 rounded-full shadow-sm transition-all duration-300 hover:bg-red-200 hover:shadow-md">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-700">No missing days - perfect tracking!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Analysis - Enhanced with animations */}
          {daysWithData >= 3 ? (
            <div className="space-y-4 group/results">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-400/20 transition-all duration-300 group-hover/results:scale-110 group-hover/results:rotate-6">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium text-lg text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover/results:tracking-wider">
                  {isActiveExperiment ? 'Progress Analysis' : 'Results Analysis'}
                </h3>
              </div>

              {/* Condition Comparison - Enhanced with animations */}
              <div className="grid grid-cols-2 gap-4">
                {/* Positive Condition */}
                <div className="group/positive bg-gradient-to-br from-green-50 to-green-100 rounded-xl overflow-hidden border border-green-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-green-200/30 hover:-translate-y-1">
                  <div className="p-5 text-center">
                    <h4 className="font-medium text-green-900 mb-3 transition-all duration-300 group-hover/positive:tracking-wide">
                      {getConditionLabel(true)} {experiment.independent_variable?.name}
                    </h4>
                    <div className="text-3xl font-bold text-green-700 mb-2 transition-all duration-300 group-hover/positive:scale-110 group-hover/positive:text-green-800">
                      {positiveConditionAverage !== null ? positiveConditionAverage.toFixed(1) : 'N/A'}
                    </div>
                    <p className="text-sm text-green-700 mb-1">
                      Average {experiment.dependent_variable?.name}
                    </p>
                    <div className="bg-white/70 px-3 py-1 rounded-full text-sm text-green-700 shadow-sm inline-block transition-all duration-300 group-hover/positive:bg-white group-hover/positive:shadow-md">
                      {positiveConditionCount} day{positiveConditionCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Negative Condition */}
                <div className="group/negative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-gray-200/30 hover:-translate-y-1">
                  <div className="p-5 text-center">
                    <h4 className="font-medium text-gray-900 mb-3 transition-all duration-300 group-hover/negative:tracking-wide">
                      {getConditionLabel(false)} {experiment.independent_variable?.name}
                    </h4>
                    <div className="text-3xl font-bold text-gray-700 mb-2 transition-all duration-300 group-hover/negative:scale-110 group-hover/negative:text-gray-800">
                      {negativeConditionAverage !== null ? negativeConditionAverage.toFixed(1) : 'N/A'}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      Average {experiment.dependent_variable?.name}
                    </p>
                    <div className="bg-white/70 px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm inline-block transition-all duration-300 group-hover/negative:bg-white group-hover/negative:shadow-md">
                      {negativeConditionCount} day{negativeConditionCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Summary - Enhanced with animations */}
              {difference !== null && (
                <div className="group/impact bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-blue-200/30 hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 flex-shrink-0 transition-all duration-300 group-hover/impact:scale-110 group-hover/impact:rotate-6">
                      {difference > 0 ? (
                        <TrendingUp className="w-5 h-5 text-white" />
                      ) : difference < 0 ? (
                        <TrendingDown className="w-5 h-5 text-white" />
                      ) : (
                        <BarChart3 className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <h4 className="font-medium text-blue-900 text-lg transition-all duration-300 group-hover/impact:tracking-wide group-hover/impact:text-indigo-900">
                          {getImpactStrength(difference)} {getImpactDirection(difference)} Impact
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`transition-all duration-300 group-hover/impact:scale-105 ${getImpactColor()}`}
                        >
                          {Math.abs(difference).toFixed(1)} point difference
                        </Badge>
                      </div>
                      <p className="text-blue-800 leading-relaxed transition-all duration-300 group-hover/impact:text-indigo-800">
                        {isActiveExperiment ? 'So far in this experiment, on' : 'During your experiment, on'} days when you had {getConditionLabel(true).toLowerCase()} {experiment.independent_variable?.name?.toLowerCase()}, 
                        your average {experiment.dependent_variable?.name} was <strong>{positiveConditionAverage?.toFixed(1)}</strong>. 
                        On days when you had {getConditionLabel(false).toLowerCase()} {experiment.independent_variable?.name?.toLowerCase()}, 
                        your average {experiment.dependent_variable?.name} was <strong>{negativeConditionAverage?.toFixed(1)}</strong>.
                      </p>
                      {isActiveExperiment && (
                        <p className="text-blue-700 mt-3 italic bg-blue-50/50 p-2 rounded-lg transition-all duration-300 group-hover/impact:bg-blue-50">
                          Note: This is preliminary data. Continue logging to get more reliable results.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 group/insufficient">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover/insufficient:scale-110 group-hover/insufficient:shadow-lg">
                <Calendar className="w-10 h-10 text-gray-400 transition-all duration-500 group-hover/insufficient:text-gray-600" />
              </div>
              <h3 className="font-medium text-xl text-primary-text mb-3 transition-all duration-500 group-hover/insufficient:scale-105">
                {isActiveExperiment ? 'Keep Logging for Analysis' : 'Insufficient Data'}
              </h3>
              <p className="text-secondary-text max-w-lg mx-auto transition-all duration-500 group-hover/insufficient:text-gray-700">
                {isActiveExperiment 
                  ? `You need at least 3 days of complete data to see meaningful analysis. You currently have ${daysWithData} day${daysWithData !== 1 ? 's' : ''} logged.`
                  : "No data was logged for both variables during the experiment period. Make sure to log your metrics consistently to see meaningful results."
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}