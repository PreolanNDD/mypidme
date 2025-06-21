'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { upsertLoggedEntry } from '@/lib/logged-entries';
import { TrackableItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LogEntryField } from '@/components/log/LogEntryField';
import { Calendar, Save, CheckCircle, Target, TrendingUp, Edit } from 'lucide-react';
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
    case 'NUMERIC': return null;
    default: return null;
  }
};

export function TodaysLogWidget({ trackableItems, todaysEntries, loading }: TodaysLogWidgetProps) {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  
  console.log('📊 [TodaysLogWidget] Rendering with props:', {
    trackableItemsCount: trackableItems.length,
    todaysEntriesCount: Object.keys(todaysEntries).length,
    loading,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    userId: user?.id,
    userProfileData: userProfile
  });
  
  // Initialize form data with existing entries or defaults
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false); // New state to control edit mode

  // Update form data when trackableItems or todaysEntries change
  useEffect(() => {
    console.log('🔄 [TodaysLogWidget] useEffect triggered - updating form data');
    console.log('🔄 [TodaysLogWidget] trackableItems.length:', trackableItems.length);
    console.log('🔄 [TodaysLogWidget] todaysEntries:', todaysEntries);
    
    if (trackableItems.length > 0) {
      const newFormData: Record<string, any> = {};
      trackableItems.forEach(item => {
        if (todaysEntries[item.id] !== undefined) {
          newFormData[item.id] = todaysEntries[item.id];
          console.log(`📝 [TodaysLogWidget] Setting existing value for ${item.name}:`, todaysEntries[item.id]);
        } else {
          const defaultValue = getDefaultValue(item.type);
          newFormData[item.id] = defaultValue;
          console.log(`📝 [TodaysLogWidget] Setting default value for ${item.name}:`, defaultValue);
        }
      });
      setFormData(newFormData);
      console.log('📝 [TodaysLogWidget] Form data updated:', newFormData);
    }
  }, [trackableItems, todaysEntries]);

  // Calculate progress metrics
  const progressMetrics = useMemo(() => {
    const totalMetrics = trackableItems.length;
    const completedMetrics = trackableItems.filter(item => 
      todaysEntries[item.id] !== undefined
    ).length;
    const progressPercentage = totalMetrics > 0 ? (completedMetrics / totalMetrics) * 100 : 0;
    
    const metrics = {
      total: totalMetrics,
      completed: completedMetrics,
      percentage: progressPercentage
    };
    
    console.log('📈 [TodaysLogWidget] Progress metrics calculated:', metrics);
    return metrics;
  }, [trackableItems, todaysEntries]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      console.log('💾 [TodaysLogWidget] Save mutation started');
      console.log('💾 [TodaysLogWidget] User ID:', user?.id);
      console.log('💾 [TodaysLogWidget] Form data:', formData);
      console.log('💾 [TodaysLogWidget] Trackable items count:', trackableItems.length);
      
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
        
        console.log(`💾 [TodaysLogWidget] Saving entry for ${item.name}:`, entryData);
        return upsertLoggedEntry(entryData);
      });
      
      const results = await Promise.all(savePromises);
      console.log('💾 [TodaysLogWidget] All entries saved successfully:', results);
      return results;
    },
    onSuccess: () => {
      console.log('✅ [TodaysLogWidget] Save mutation successful');
      setMessage('All data saved successfully!');
      setIsEditing(false); // Exit edit mode after successful save
      queryClient.invalidateQueries({ queryKey: ['todaysEntries', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?.id] });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('❌ [TodaysLogWidget] Save mutation failed:', error);
      setMessage(`Failed to save data: ${error.message}`);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    },
  });

  const handleFieldChange = useCallback((itemId: string, value: any) => {
    console.log(`📝 [TodaysLogWidget] Field changed - ${itemId}:`, value);
    setFormData(prev => ({
      ...prev,
      [itemId]: value
    }));
  }, []);

  const handleSave = useCallback(() => {
    console.log('💾 [TodaysLogWidget] Save button clicked');
    console.log('💾 [TodaysLogWidget] Current state:', {
      isPending: saveMutation.isPending,
      trackableItemsLength: trackableItems.length,
      hasUser: !!user?.id
    });
    
    if (saveMutation.isPending || trackableItems.length === 0) {
      console.log('⚠️ [TodaysLogWidget] Save blocked - mutation pending or no items');
      return;
    }
    saveMutation.mutate();
  }, [saveMutation, trackableItems.length, user?.id]);

  const handleEditClick = useCallback(() => {
    console.log('✏️ [TodaysLogWidget] Edit button clicked');
    setIsEditing(true);
    setMessage(''); // Clear any existing messages
  }, []);

  // Check if all metrics have been saved to the database (not just form state)
  const allMetricsSaved = useMemo(() => {
    if (trackableItems.length === 0) return false;
    
    const saved = trackableItems.every(item => {
      return todaysEntries[item.id] !== undefined;
    });
    
    console.log('✅ [TodaysLogWidget] All metrics saved check:', {
      trackableItemsLength: trackableItems.length,
      allSaved: saved,
      todaysEntriesKeys: Object.keys(todaysEntries)
    });
    
    return saved;
  }, [trackableItems, todaysEntries]);

  const firstName = userProfile?.first_name || 'there';
  console.log('👤 [TodaysLogWidget] User display name:', firstName);

  if (loading) {
    console.log('⏳ [TodaysLogWidget] Rendering loading state');
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-primary-text">Today's Log</h2>
              <p className="text-secondary-text">Loading your metrics...</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trackableItems.length === 0) {
    console.log('📭 [TodaysLogWidget] Rendering empty state - no trackable items');
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-2xl text-primary-text">Today's Log</h2>
              <p className="text-secondary-text">No metrics to track yet</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-secondary-text mb-4">Create some metrics first to start logging your daily data!</p>
          <Button onClick={() => window.location.href = '/log'}>
            Create Your First Metric
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show completion state only if all metrics are saved AND we're not in edit mode
  if (allMetricsSaved && !isEditing) {
    console.log('🎉 [TodaysLogWidget] Rendering completion state');
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-2 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-2xl text-primary-text">Today's Log</h2>
              <p className="text-secondary-text">All metrics completed for today!</p>
            </div>
          </div>
          
          {/* Progress Bar - Completed State */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-text">Progress</span>
              <span className="text-sm text-accent-2 font-medium">
                {progressMetrics.completed}/{progressMetrics.total} Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-accent-2 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
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
        </CardContent>
      </Card>
    );
  }

  console.log('📝 [TodaysLogWidget] Rendering main logging interface');

  const inputItems = trackableItems.filter(item => item.category === 'INPUT');
  const outputItems = trackableItems.filter(item => item.category === 'OUTPUT');

  console.log('📊 [TodaysLogWidget] Item categories:', {
    inputCount: inputItems.length,
    outputCount: outputItems.length
  });

  return (
    <Card>
      <CardHeader>
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
        <div className="mt-4">
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
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-600' 
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            <p>{message}</p>
          </div>
        )}

        {/* Input Metrics */}
        {inputItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-1 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-heading text-lg text-primary-text">Inputs</h3>
            </div>
            <div className="space-y-4 pl-11">
              {inputItems.map(item => (
                <LogEntryField 
                  key={item.id}
                  item={item} 
                  value={formData[item.id]} 
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* Output Metrics */}
        {outputItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-2 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-heading text-lg text-primary-text">Outputs</h3>
            </div>
            <div className="space-y-4 pl-11">
              {outputItems.map(item => (
                <LogEntryField 
                  key={item.id}
                  item={item} 
                  value={formData[item.id]} 
                  onChange={handleFieldChange}
                />
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleSave}
          loading={saveMutation.isPending}
          className="w-full" 
          size="lg"
          disabled={saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Today's Log
        </Button>
      </CardContent>
    </Card>
  );
}