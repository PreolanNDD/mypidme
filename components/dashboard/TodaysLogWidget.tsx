'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { upsertLoggedEntry } from '@/lib/logged-entries';
import { TrackableItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LogEntryField } from '@/components/log/LogEntryField';
import { Calendar, Save, CheckCircle, Target, TrendingUp, Edit, Plus, Minus, BookOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
        className="w-10 h-10 p-0 rounded-full bg-white hover:bg-gray-50 border-gray-200 hover:border-primary/50 hover:text-primary transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
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
          className="w-full text-center text-3xl font-bold bg-transparent border-none outline-none text-primary-text transition-all duration-300 focus:scale-110"
        />
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled}
        className="w-10 h-10 p-0 rounded-full bg-white hover:bg-gray-50 border-gray-200 hover:border-primary/50 hover:text-primary transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
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
    // Ensure numeric value is a number, defaulting to 0 if invalid
    const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    
    return (
      <div className="space-y-3 group">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-primary-text group-hover:text-primary transition-colors duration-300">
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
    <div className="group">
      <LogEntryField 
        item={item} 
        value={value} 
        onChange={onChange}
      />
    </div>
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
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded-full w-full"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </div>
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
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* No metrics state - Matching Active Experiments styling */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl pt-12 pb-12 px-8 text-center border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-3xl hover:shadow-white/20">
          {/* Centered Icon with Enhanced Styling */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg border border-purple-200/50 group-hover:scale-105 transition-all duration-300">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          
          {/* Enhanced Text Styling */}
          <div className="mb-8 space-y-4">
            <h4 className="font-heading text-2xl text-primary-text mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Ready to Start Tracking?
            </h4>
            <div className="max-w-md mx-auto">
              <p className="text-lg font-medium text-gray-700 leading-relaxed mb-2">
                Create some metrics first to start logging your daily data and track your progress!
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 mx-auto rounded-full"></div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.href = '/log'}
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
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-400/20 animate-pulse">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-heading text-2xl text-primary-text mb-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Great job!</h3>
                  <p className="text-lg text-gray-700 max-w-md mx-auto">You've logged all your metrics for today. Keep up the excellent work!</p>
                  <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-teal-400 mx-auto rounded-full"></div>
                </div>
                <div className="flex space-x-3 justify-center pt-4">
                  <button 
                    onClick={() => window.location.href = '/data'}
                    className="group/view relative overflow-hidden rounded-lg bg-white px-6 py-3 text-gray-800 font-medium border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/30"
                  >
                    {/* Sliding highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover/view:translate-x-full transition-transform duration-700 ease-out"></div>
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                      <span className="tracking-wide group-hover/view:tracking-wider transition-all duration-300 group-hover/view:text-primary">
                        View Your Progress
                      </span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleEditClick}
                    className="group/edit relative overflow-hidden rounded-lg bg-transparent px-6 py-3 text-gray-600 font-medium border border-transparent hover:border-gray-200 transition-all duration-300 hover:bg-white/50 hover:shadow-md"
                  >
                    {/* Content */}
                    <div className="relative flex items-center justify-center space-x-2">
                      <Edit className="w-4 h-4 group-hover/edit:scale-110 transition-transform duration-300" />
                      <span className="tracking-wide group-hover/edit:tracking-wider transition-all duration-300 group-hover/edit:text-primary">
                        Edit Today's Log
                      </span>
                    </div>
                  </button>
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
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
        <div className="space-y-6">
          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-600 animate-fadeIn' 
                : 'bg-red-50 border border-red-200 text-red-600 animate-fadeIn'
            }`}>
              <p className="flex items-center">
                {message.includes('successfully') ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <div className="w-4 h-4 mr-2 text-red-500">!</div>
                )}
                {message}
              </p>
            </div>
          )}

          {/* Two-column layout for metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Input Metrics */}
            <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px]">
              {inputItems.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-400/20 transform transition-transform duration-300 hover:scale-110">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-heading text-xl text-primary-text bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Habits</h3>
                  </div>
                  <div className="space-y-6">
                    {inputItems.map(item => (
                      <div key={item.id} className="bg-white rounded-xl p-5 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-orange-200 hover:bg-orange-50/20">
                        <EnhancedLogEntryField 
                          key={`${item.id}-field`}
                          item={item} 
                          value={formData[item.id]} 
                          onChange={handleFieldChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Output Metrics */}
            <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px]">
              {outputItems.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-400/20 transform transition-transform duration-300 hover:scale-110">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-heading text-xl text-primary-text bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">Goals</h3>
                  </div>
                  <div className="space-y-6">
                    {outputItems.map(item => (
                      <div key={item.id} className="bg-white rounded-xl p-5 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-green-200 hover:bg-green-50/20">
                        <EnhancedLogEntryField 
                          key={`${item.id}-field`}
                          item={item} 
                          value={formData[item.id]} 
                          onChange={handleFieldChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* FIXED: Save button without scale transform on hover */}
          <button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="group/save relative overflow-hidden w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/save:opacity-100 transition-opacity duration-500"></div>
            
            {/* Sliding highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/save:translate-x-full transition-transform duration-700 ease-out"></div>
            
            {/* Content */}
            <div className="relative flex items-center justify-center space-x-3">
              {/* Icon with animation */}
              <div className="transform group-hover/save:scale-110 group-hover/save:rotate-12 transition-transform duration-300">
                {saveMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </div>
              
              {/* Text with enhanced styling - NO SCALE TRANSFORM */}
              <span className="tracking-wide group-hover/save:tracking-wider transition-all duration-300">
                {saveMutation.isPending ? 'Saving...' : 'Save Today\'s Log'}
              </span>
            </div>
            
            {/* Pulse ring effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/save:opacity-100 group-hover/save:scale-110 transition-all duration-500"></div>
          </button>
        </div>
      </div>

      {/* Enhanced Custom CSS for text glow effects and animations */}
      <style jsx>{`
        .group:hover .group-hover\\:text-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4);
        }
        .group:hover .group-hover\\:text-shadow-glow-subtle {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.2);
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}