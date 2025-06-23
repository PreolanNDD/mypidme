'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { upsertLoggedEntry } from '@/lib/logged-entries';
import { TrackableItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LogEntryField } from '@/components/log/LogEntryField';
import { Calendar, Save, CheckCircle, Target, TrendingUp, Edit, Plus, Minus } from 'lucide-react';
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

  // Save mutation
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
      queryClient.invalidateQueries({ queryKey: ['todaysEntries', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?.id] });
      
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
      <CardContent className="p-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </CardContent>
    );
  }

  if (trackableItems.length === 0) {
    return (
      <CardContent className="text-center py-12">
        <p className="text-primary-text mb-4">Create some metrics first to start logging your daily data!</p>
        <Button onClick={() => window.location.href = '/log'} className="bg-brand-button hover:bg-brand-button/90 text-white">
          Create Your First Metric
        </Button>
      </CardContent>
    );
  }

  // Show completion state only if all metrics are saved AND we're not in edit mode
  if (allMetricsSaved && !isEditing) {
    return (
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
    );
  }

  const inputItems = trackableItems.filter(item => item.category === 'INPUT');
  const outputItems = trackableItems.filter(item => item.category === 'OUTPUT');

  return (
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
          className="w-full bg-brand-button hover:bg-brand-button/90 text-white" 
          size="lg"
          disabled={saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Today's Log
        </Button>
      </div>
    </CardContent>
  );
}