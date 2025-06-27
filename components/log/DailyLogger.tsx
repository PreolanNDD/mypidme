'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getTrackableItems } from '@/lib/trackable-items';
import { getLoggedEntriesForDate, upsertLoggedEntry } from '@/lib/logged-entries';
import { TrackableItem, LoggedEntryWithItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LogEntryField } from '@/components/log/LogEntryField';
import { Calendar, Save, Target, TrendingUp, Plus, Minus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const getDefaultValue = (dataType: string) => {
  switch (dataType) {
    case 'BOOLEAN': return false;
    case 'TEXT': return '';
    case 'SCALE_1_10': return 5;
    case 'NUMERIC': return null;
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

export function DailyLogger({ trackableItems, loading }: { trackableItems: TrackableItem[]; loading: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => {
    const defaultDate = new Date().toISOString().split('T')[0];
    return defaultDate;
  });
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  // NEW ROBUST USEEFFECT - Replace all existing data loading useEffect hooks with this single one
  useEffect(() => {
    // Depend only on stable values to prevent loops
    if (!user?.id || trackableItems.length === 0) {
      return;
    }

    let isCanceled = false; // Cleanup flag to prevent state updates on unmounted components

    const loadEntries = async () => {
      setLoadingEntries(true);
      setError('');
      
      try {
        const entries = await getLoggedEntriesForDate(user.id, selectedDate);
        
        if (isCanceled) {
          return; // Exit if the component has re-rendered for a new date
        }

        const newFormData: Record<string, any> = {};
        trackableItems.forEach(item => {
          const existingEntry = entries.find(e => e.trackable_item_id === item.id);
          if (existingEntry) {
            const value = existingEntry.numeric_value ?? existingEntry.text_value ?? existingEntry.boolean_value;
            newFormData[item.id] = value;
          } else {
            const defaultValue = getDefaultValue(item.type);
            newFormData[item.id] = defaultValue;
          }
        });
        
        if (!isCanceled) {
          setFormData(newFormData);
        }

      } catch (err: any) {
        if (!isCanceled) {
          setError('Failed to load entries.');
        }
      } finally {
        if (!isCanceled) {
          setLoadingEntries(false);
        }
      }
    };

    loadEntries();

    return () => {
      isCanceled = true;
    };
  }, [user?.id, selectedDate, trackableItems.length]); // Dependency array with only stable primitives

  // Save mutation with comprehensive cache invalidation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || trackableItems.length === 0) {
        throw new Error("User not found or no trackable items");
      }

      const savePromises = trackableItems.map(item => {
        const value = formData[item.id];
        const entryData = {
          user_id: user.id,
          trackable_item_id: item.id,
          entry_date: selectedDate,
          numeric_value: (item.type === 'NUMERIC' || item.type === 'SCALE_1_10') ? (value !== '' && value !== null ? value : null) : null,
          text_value: item.type === 'TEXT' ? (value || null) : null,
          boolean_value: item.type === 'BOOLEAN' ? value : null,
        };
        return upsertLoggedEntry(entryData);
      });
      
      return Promise.all(savePromises);
    },
    onSuccess: () => {
      setMessage('All data saved successfully!');
      setError('');
      
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
    onError: (err: any) => {
      setError(`Failed to save data: ${err.message}`);
      setMessage('');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    },
  });

  const handleFieldChange = useCallback((itemId: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [itemId]: value };
      return newData;
    });
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    
    if (saveMutation.isPending) {
      return;
    }
    
    setSelectedDate(newDate);
    setFormData({});
    setMessage('');
    setError('');
  }, [saveMutation.isPending, selectedDate]);

  const handleSave = useCallback(() => {
    if (saveMutation.isPending || trackableItems.length === 0) {
      return;
    }
    saveMutation.mutate();
  }, [saveMutation, trackableItems.length]);

  // Function to open the date picker when clicking anywhere in the date container
  const handleDateContainerClick = useCallback(() => {
    if (dateInputRef.current && !saveMutation.isPending) {
      dateInputRef.current.showPicker();
    }
  }, [saveMutation.isPending]);

  if (loading || loadingEntries) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Daily Logger Header - Increased size */}
      <div className="mb-6 group">
        <h2 className="font-heading text-4xl text-white transition-all duration-300 group-hover:scale-105">Daily Logger</h2>
        <p className="text-xl" style={{ color: '#e6e2eb' }}>Log your daily habits and goals</p>
      </div>

      {/* Date Selection Card - Enhanced styling with clickable area */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-3xl hover:shadow-white/20">
        <div className="p-6">
          <div className="relative flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 transform transition-transform duration-300 hover:scale-110">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <label className="block text-lg font-heading text-primary-text mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Select Date
              </label>
              {/* Make the entire input container clickable */}
              <div 
                className="relative cursor-pointer" 
                onClick={handleDateContainerClick}
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-lg font-medium bg-white hover:bg-white hover:shadow-md cursor-pointer"
                  disabled={saveMutation.isPending}
                />
                {/* Overlay to ensure the entire area is clickable */}
                <div className="absolute inset-0 opacity-0">
                  {/* This invisible overlay ensures the entire area is clickable */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-xl text-sm transition-all duration-300 ${
          message 
            ? 'bg-green-50 border-2 border-green-200 text-green-600 shadow-lg shadow-green-500/20' 
            : 'bg-red-50 border-2 border-red-200 text-red-600 shadow-lg shadow-red-500/20'
        }`}>
          <p className="font-medium">{message || error}</p>
        </div>
      )}

      {trackableItems.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/20">
          <p className="text-secondary-text mb-4">No metrics to track yet. Create some metrics first!</p>
        </div>
      ) : (
        <>
          {/* Habits Section - Enhanced styling matching dashboard */}
          {trackableItems.filter(item => item.category === 'INPUT').length > 0 && (
            <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px]">
              <div className="space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-400/20 transform transition-transform duration-300 hover:scale-110">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-heading text-xl text-white bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">Habits</h3>
                </div>
                <div className="space-y-6">
                  {trackableItems.filter(item => item.category === 'INPUT').map(item => (
                    <div key={item.id} className="bg-white rounded-xl p-5 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-orange-200">
                      <EnhancedLogEntryField 
                        key={`${item.id}-${selectedDate}`} 
                        item={item} 
                        value={formData[item.id]} 
                        onChange={handleFieldChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Goals Section - Enhanced styling matching dashboard */}
          {trackableItems.filter(item => item.category === 'OUTPUT').length > 0 && (
            <div className="space-y-6 transform transition-all duration-500 hover:translate-y-[-5px]">
              <div className="space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-400/20 transform transition-transform duration-300 hover:scale-110">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-heading text-xl text-white bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">Goals</h3>
                </div>
                <div className="space-y-6">
                  {trackableItems.filter(item => item.category === 'OUTPUT').map(item => (
                    <div key={item.id} className="bg-white rounded-xl p-5 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-green-200">
                      <EnhancedLogEntryField 
                        key={`${item.id}-${selectedDate}`} 
                        item={item} 
                        value={formData[item.id]} 
                        onChange={handleFieldChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Save Button - Styled like "Discover More Insights" button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="group/save relative overflow-hidden w-full px-6 py-4 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-white/60 text-gray-800 shadow-lg transition-all duration-300 hover:bg-white hover:border-white hover:shadow-xl hover:shadow-white/30"
            >
              {/* Sliding highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover/save:translate-x-full transition-transform duration-500 ease-out"></div>
              
              {/* Content */}
              <div className="relative flex items-center justify-center space-x-3">
                {/* Icon with animation */}
                <div className="transform group-hover/save:scale-110 group-hover/save:rotate-12 transition-transform duration-300">
                  {saveMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                
                {/* Text with enhanced styling */}
                <span className="font-semibold text-lg transition-all duration-300 group-hover/save:tracking-wide text-gray-800">
                  {saveMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                </span>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl bg-purple-100/20 opacity-0 group-hover/save:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}