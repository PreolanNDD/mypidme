'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { upsertLoggedEntry } from '@/lib/logged-entries';
import { TrackableItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LogEntryField } from '@/components/log/LogEntryField';
import { Calendar, Save, CheckCircle, Target, TrendingUp, Edit, Plus, Minus, BookOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormState, useFormStatus } from 'react-dom';

interface TodaysLogWidgetProps {
  trackableItems: TrackableItem[];
  todaysEntries: Record<string, any>;
  loading: boolean;
}

const getDefaultValue = (dataType: string) => {
  switch (dataType) {
    case 'BOOLEAN': return false;
    case 'TEXT': return '';
    case 'SCALE_1_10': return 5;
    case 'NUMERIC': return 0;
    default: return null;
  }
};

// Custom Numeric Input Component
function NumericInput({ value, onChange, disabled }: { 
  value: number; 
  onChange: (value: number) => void; 
  disabled?: boolean;
}) {
  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleDecrement = () => {
    onChange(Math.max(0, value - 1));
  };

  const handleDirectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    onChange(Math.max(0, newValue));
  };

  return (
    <div className="flex items-center space-x-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= 0}
        className="w-8 h-8 p-0 rounded-full"
      >
        <Minus className="w-4 h-4" />
      </Button>
      
      <div className="flex-1 text-center">
        <input
          type="number"
          value={value}
          onChange={handleDirectChange}
          disabled={disabled}
          min="0"
          className="w-full text-center text-2xl font-bold bg-transparent border-none outline-none text-primary-text"
        />
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled}
        className="w-8 h-8 p-0 rounded-full"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Enhanced LogEntryField with custom numeric input
function EnhancedLogEntryField({ item, value, onChange }: {
  item: TrackableItem;
  value: any;
  onChange: (itemId: string, value: any) => void;
}) {
  const handleChange = useCallback((newValue: any) => {
    onChange(item.id, newValue);
  }, [item.id, onChange]);

  if (item.type === 'NUMERIC') {
    const numericValue = value === null || value === undefined ? 0 : Number(value);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-primary-text">
            {item.name}
          </label>
        </div>
        <NumericInput
          value={numericValue}
          onChange={handleChange}
        />
      </div>
    );
  }

  // For all other types, use the original LogEntryField
  return (
    <LogEntryField 
      item={item} 
      value={value} 
      onChange={onChange}
    />
  );
}

export function TodaysLogWidget({ trackableItems, todaysEntries, loading }: TodaysLogWidgetProps) {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize form data with existing entries or defaults
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Update form data when trackableItems or todaysEntries change
  useEffect(() => {
    if (trackableItems.length > 0) {
      const newFormData: Record<string, any> = {};
      trackableItems.forEach(item => {
        if (todaysEntries[item.id] !== undefined) {
          newFormData[item.id] = todaysEntries[item.id];
        } else {
          const defaultValue = getDefaultValue(item.type);
          newFormData[item.id] = defaultValue;
        }
      });
      setFormData(newFormData);
    }
  }, [trackableItems, todaysEntries]);

  // Calculate progress metrics
  const progressMetrics = useMemo(() => {
    const totalMetrics = trackableItems.length;
    const completedMetrics = trackableItems.filter(item => 
      todaysEntries[item.id] !== undefined
    ).length;
    const progressPercentage = totalMetrics > 0 ? (completedMetrics / totalMetrics) * 100 : 0;
    
    return {
      total: totalMetrics,
      completed: completedMetrics,
      percentage: progressPercentage
    };
  }, [trackableItems, todaysEntries]);

  // Save mutation with comprehensive cache invalidation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not found");
      
      const savePromises = trackableItems.map(item => {
        const value = formData[item.id];
        const entryData = {
          user_id: user.id,
          trackable_item_id: item.id,
          entry_date: today,
          numeric_value: (item.type === 'NUMERIC' || item.type === 'SCALE_1_10') ? (value !== '' && value !== null ? value : null) : null,
          text_value: item.type === 'TEXT' ? (value || null) : null,
          boolean_value: item.type === 'BOOLEAN' ? value : null,
        };
        
        return upsertLoggedEntry(entryData);
      });
      
      const results = await Promise.all(savePromises);
      return results;
    },
    onSuccess: () => {
      setMessage('All data saved successfully!');
      setIsEditing(false);
      
      // Invalidate all relevant queries that depend on logged entries
      queryClient.invalidateQueries({ queryKey: ['todaysEntries', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?.id] });
      
      // Invalidate chart data queries for all possible combinations
      queryClient.invalidateQueries({ queryKey: ['chartData'] });
      queryClient.invalidateQueries({ queryKey: ['dualMetricChartData'] });
      queryClient.invalidateQueries({ queryKey: ['multiMetricChartData'] });
      
      // Invalidate experiment-related queries
      queryClient.invalidateQueries({ queryKey: ['experimentResults'] });
      queryClient.invalidateQueries({ queryKey: ['experiments', user?.id] });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    },
    onError: (error: any) => {
      setMessage(`Failed to save data: ${error.message}`);
      
      setTimeout(() => {
        setMessage('');
      }, 5000);
    },
  });

  const handleFieldChange = useCallback((itemId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: value
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (saveMutation.isPending || trackableItems.length === 0) {
      return;
    }
    saveMutation.mutate();
  }, [saveMutation, trackableItems.length]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setMessage('');
  }, []);

  // Check if all metrics have been saved to the database
  const allMetricsSaved = useMemo(() => {
    if (trackableItems.length === 0) return false;
    
    return trackableItems.every(item => {
      return todaysEntries[item.id] !== undefined;
    });
  }, [trackableItems, todaysEntries]);

  if (loading) {
    return (
      <div className="space-y-6 group">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl text-white">Today's Log</h3>
            <p className="text-base" style={{ color: '#e6e2eb' }}>
              Log your daily habits and goals
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
          <CardContent className="p-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </div>
      </div>
    );
  }

  if (trackableItems.length === 0) {
    return (
      <div className="space-y-6 group">
        {/* Header - Matching Active Experiments styling */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
          </div>
          
          <div className="transition-all duration-300 group-hover:translate-x-1">
            <h3 className="font-heading text-xl text-white transition-all duration-300 group-hover:scale-105 group-hover:text-shadow-glow">
              Today's Log
            </h3>
            <p className="text-base transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:text-shadow-glow-subtle" style={{ color: '#e6e2eb' }}>
              Log your daily habits and goals
            </p>
          </div>
        </div>

        {/* No metrics state - Matching Active Experiments styling */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl pt-12 pb-12 px-8 text-center border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-3xl hover:shadow-white/20">
          {/* Centered Icon with Enhanced Styling */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg border border-blue-200/50 group-hover:scale-105 transition-all duration-300">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          {/* Enhanced Text Styling */}
          <div className="mb-8 space-y-4">
            <h4 className="font-heading text-2xl text-primary-text mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ready to Start Tracking?
            </h4>
            <div className="max-w-md mx-auto">
              <p className="text-lg font-medium text-gray-700 leading-relaxed mb-2">
                Create some metrics first to start logging your daily data and track your progress!
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full"></div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/log'}
            className="group/metric relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
          >
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 opacity-0 group-hover/metric:opacity-100 transition-opacity duration-500"></div>
            
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
                Create Your First Metric
              </span>
            </div>
            
            {/* Pulse ring effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/metric:opacity-100 group-hover/metric:scale-110 transition-all duration-500"></div>
          </button>
        </div>

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

  // Show completion state only if all metrics are saved AND we're not in edit mode
  if (allMetricsSaved && !isEditing) {
    return (
      <div className="space-y-6 group">
        {/* Header - Matching Active Experiments styling */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg flex-shrink-0">
            <BookOpen className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
          </div>
          
          <div className="transition-all duration-300 group-hover:translate-x-1">
            <h3 className="font-heading text-xl text-white transition-all duration-300 group-hover:scale-105 group-hover:text-shadow-glow">
              Today's Log
            </h3>
            <p className="text-base transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:text-shadow-glow-subtle" style={{ color: '#e6e2eb' }}>
              Log your daily habits and goals
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-accent-2 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-primary-text mb-2">Great job!</h3>
                  <p className="text-secondary-text">You've logged all your metrics for today. Keep up the excellent work!</p>
                </div>
                <div className="flex space-x-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/data'}
                  >
                    View Your Progress
                  </Button>
                  <Button 
                    onClick={handleEditClick}
                    variant="ghost"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Today's Log
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </div>

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

  const inputItems = trackableItems.filter(item => item.category === 'INPUT');
  const outputItems = trackableItems.filter(item => item.category === 'OUTPUT');

  return (
    <div className="space-y-6 group">
      {/* Header - Matching Active Experiments styling */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg flex-shrink-0">
          <BookOpen className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
        </div>
        
        <div className="transition-all duration-300 group-hover:translate-x-1">
          <h3 className="font-heading text-xl text-white transition-all duration-300 group-hover:scale-105 group-hover:text-shadow-glow">
            Today's Log
          </h3>
          <p className="text-base transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:text-shadow-glow-subtle" style={{ color: '#e6e2eb' }}>
            Log your daily habits and goals
          </p>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-2xl text-primary-text">Today's Log</h2>
                <p className="text-secondary-text">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="bg-primary hover:bg-primary/90 text-white border-primary hover:border-primary/90"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-text">Today's Progress</span>
                <span className="text-sm text-secondary-text">
                  {progressMetrics.completed}/{progressMetrics.total} metrics logged
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    progressMetrics.percentage === 100 
                      ? 'bg-accent-2' 
                      : progressMetrics.percentage > 0 
                        ? 'bg-primary' 
                        : 'bg-gray-300'
                  }`}
                  style={{ width: `${progressMetrics.percentage}%` }}
                ></div>
              </div>
              {progressMetrics.percentage > 0 && progressMetrics.percentage < 100 && (
                <p className="text-xs text-secondary-text mt-1">
                  {Math.round(progressMetrics.percentage)}% complete
                </p>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-50 border border-green-200 text-green-600' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <p>{message}</p>
              </div>
            )}

            {/* Two-column layout for metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Input Metrics */}
              <div className="space-y-6">
                {inputItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent-1 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-heading text-lg text-primary-text">Inputs</h3>
                    </div>
                    <div className="space-y-4">
                      {inputItems.map(item => (
                        <EnhancedLogEntryField 
                          key={item.id}
                          item={item} 
                          value={formData[item.id]} 
                          onChange={handleFieldChange}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Output Metrics */}
              <div className="space-y-6">
                {outputItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-accent-2 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-heading text-lg text-primary-text">Outputs</h3>
                    </div>
                    <div className="space-y-4">
                      {outputItems.map(item => (
                        <EnhancedLogEntryField 
                          key={item.id}
                          item={item} 
                          value={formData[item.id]} 
                          onChange={handleFieldChange}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              loading={saveMutation.isPending}
              className="w-full bg-brand-button hover:bg-white hover:text-brand-button hover:border-brand-button border border-transparent transition-all duration-200 text-white" 
              size="lg"
              disabled={saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Today's Log
            </Button>
          </div>
        </CardContent>
      </div>

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