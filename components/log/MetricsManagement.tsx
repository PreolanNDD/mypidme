'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { 
  getTrackableItems, 
  deleteTrackableItem, 
  reactivateTrackableItem, 
  permanentlyDeleteTrackableItem,
  createTrackableItem,
  updateTrackableItem,
  findExistingMetricByName
} from '@/lib/trackable-items';
import { TrackableItem, DataType, Category } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTypeInfoDialog } from './DataTypeInfoDialog';
import { ReactivateMetricDialog } from '@/components/trackable-items/ReactivateMetricDialog';
import { Edit2, Trash2, Plus, Loader2, RotateCw, X, Save, Check, AlertTriangle, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DATA_TYPE_LABELS: Record<DataType, string> = {
  'SCALE_1_10': 'Scale (1-10)',
  'NUMERIC': 'Number',
  'BOOLEAN': 'Yes/No',
  'TEXT': 'Text'
};

const CATEGORY_LABELS: Record<Category, string> = {
  'INPUT': 'Habits',
  'OUTPUT': 'Goals'
};

export function MetricsManagement({ onRefresh }: { onRefresh?: () => void }) {
  const { user } = useAuth();
  
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<'soft' | 'hard' | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '' as Category | '',
    type: '' as DataType | ''
  });
  const [editFormError, setEditFormError] = useState('');

  // Add metric form state
  const [addFormData, setAddFormData] = useState({
    name: '',
    category: '' as Category | '',
    type: '' as DataType | ''
  });
  const [addFormError, setAddFormError] = useState('');

  // Dialog states
  const [showDataTypeInfo, setShowDataTypeInfo] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [metricToReactivate, setMetricToReactivate] = useState<TrackableItem | null>(null);
  const operationRef = useRef<string>('');

  const { 
    data: allTrackableItems,
    isLoading: loading,
    refetch
  } = useQuery<TrackableItem[]>({
    queryKey: ['allTrackableItems', user?.id],
    queryFn: async () => {
      // Fetch both active and archived items
      const supabase = createClient();
      const { data, error } = await supabase
        .from('trackable_items')
        .select('id, user_id, name, category, type, is_active, created_at')
        .eq('user_id', user!.id)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch all trackable items: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; category: Category; type: DataType }) => {
      if (!user) throw new Error("User not found");
      
      const result = await createTrackableItem({
        user_id: user.id,
        name: data.name.trim(),
        category: data.category,
        type: data.type,
        is_active: true
      });
      
      return result;
    },
    onSuccess: () => {
      setAddFormData({ name: '', category: '', type: '' });
      setAddFormError('');
      queryClient.invalidateQueries({ queryKey: ['allTrackableItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['trackableItems', user?.id] });
      if (onRefresh) {
        onRefresh();
      }
    },
    onError: (error: any) => {
      if (error.message && (error.message.includes('duplicate') || error.message.includes('unique'))) {
        setAddFormError('You already have a metric with this name.');
      } else {
        setAddFormError(error.message || 'Failed to create metric');
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; category: Category; type: DataType }) => {
      const result = await updateTrackableItem(data.id, {
        name: data.name.trim(),
        category: data.category,
        type: data.type,
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTrackableItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['trackableItems', user?.id] });
      if (onRefresh) {
        onRefresh();
      }
      setEditingItemId(null);
      setEditFormData({ name: '', category: '', type: '' });
      setEditFormError('');
    },
    onError: (error: any) => {
      if (error.message && (error.message.includes('duplicate') || error.message.includes('unique'))) {
        setEditFormError('You already have a metric with this name.');
      } else {
        setEditFormError(error.message || 'Failed to update metric');
      }
    },
  });

  // Reactivate mutation
  const reactivateMutation = useMutation({
    mutationFn: (id: string) => {
      return reactivateTrackableItem(id);
    },
    onSuccess: () => {
      setShowReactivateDialog(false);
      setMetricToReactivate(null);
      setAddFormData({ name: '', category: '', type: '' });
      setAddFormError('');
      queryClient.invalidateQueries({ queryKey: ['allTrackableItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['trackableItems', user?.id] });
      if (onRefresh) {
        onRefresh();
      }
    },
    onError: (error) => {
      setAddFormError(error.message || 'Failed to reactivate metric');
      setShowReactivateDialog(false);
      setMetricToReactivate(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return deleteTrackableItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTrackableItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['trackableItems', user?.id] });
      if (onRefresh) {
        onRefresh();
      }
      setDeletingItemId(null);
      setDeleteMode(null);
    },
    onError: (error) => {
      alert(`Failed to archive metric: ${error.message}`);
      setDeletingItemId(null);
      setDeleteMode(null);
    },
  });
  
  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => {
      return permanentlyDeleteTrackableItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTrackableItems', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['trackableItems', user?.id] });
      if (onRefresh) {
        onRefresh();
      }
      setDeletingItemId(null);
      setDeleteMode(null);
    },
    onError: (error) => {
      alert(`Failed to permanently delete metric: ${error.message}`);
      setDeletingItemId(null);
      setDeleteMode(null);
    },
  });

  const checkForDuplicateName = useCallback((name: string, excludeId?: string): boolean => {
    if (!name.trim() || !allTrackableItems) return false;
    
    const trimmedName = name.trim().toLowerCase();
    
    return allTrackableItems.some(item => 
      item.id !== excludeId &&
      item.name.toLowerCase() === trimmedName
    );
  }, [allTrackableItems]);

  // Add metric handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !addFormData.name || !addFormData.category || !addFormData.type) return;

    // Prevent multiple simultaneous operations
    if (createMutation.isPending || reactivateMutation.isPending) {
      return;
    }

    operationRef.current = 'checking';
    setAddFormError('');

    try {
      // First, search for any existing metric with this name (active or inactive)
      const existingMetric = await findExistingMetricByName(user.id, addFormData.name);
      
      if (existingMetric) {
        if (existingMetric.is_active) {
          // Scenario B: Active metric with same name exists
          setAddFormError('You already have a metric with this name.');
          return;
        } else {
          // Found an inactive metric - now check if category and type match
          const categoryMatches = existingMetric.category === addFormData.category;
          const typeMatches = existingMetric.type === addFormData.type;
          
          if (categoryMatches && typeMatches) {
            // Scenario A: Names match AND category/type are the same - offer reactivation
            setMetricToReactivate(existingMetric);
            setShowReactivateDialog(true);
            return;
          } else {
            // Scenario B: Names match BUT category or type is different - show error
            setAddFormError('A metric with this name already exists in your archive with a different type. Please choose a new name.');
            return;
          }
        }
      }

      // Scenario C: No existing metric found - create new one
      
      // Additional client-side check against active items (backup validation)
      if (checkForDuplicateName(addFormData.name)) {
        setAddFormError('You already have a metric with this name.');
        return;
      }

      operationRef.current = 'creating';
      createMutation.mutate({
        name: addFormData.name,
        category: addFormData.category as Category,
        type: addFormData.type as DataType,
      });

    } catch (err: any) {
      // Handle database constraint errors as well
      if (err.message && (err.message.includes('duplicate') || err.message.includes('unique'))) {
        setAddFormError('You already have a metric with this name.');
      } else {
        setAddFormError(err.message || 'Failed to create metric');
      }
    } finally {
      operationRef.current = '';
    }
  };

  const handleAddNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setAddFormData({ ...addFormData, name: newName });
    
    // Clear error if user is typing and no longer has a duplicate
    if (addFormError && !checkForDuplicateName(newName)) {
      setAddFormError('');
    }
  };

  // Edit metric handlers
  const handleEdit = useCallback((item: TrackableItem) => {
    setEditingItemId(item.id);
    setEditFormData({
      name: item.name,
      category: item.category,
      type: item.type
    });
    setEditFormError('');
    // Cancel any delete operations when editing
    setDeletingItemId(null);
    setDeleteMode(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingItemId(null);
    setEditFormData({ name: '', category: '', type: '' });
    setEditFormError('');
  }, []);

  const handleSaveEdit = useCallback(async (itemId: string) => {
    if (!editFormData.name || !editFormData.category || !editFormData.type) return;

    if (updateMutation.isPending) {
      return;
    }

    setEditFormError('');

    // Check for duplicate names (excluding the current item)
    if (checkForDuplicateName(editFormData.name, itemId)) {
      setEditFormError('You already have a metric with this name.');
      return;
    }

    updateMutation.mutate({
      id: itemId,
      name: editFormData.name,
      category: editFormData.category as Category,
      type: editFormData.type as DataType,
    });
  }, [editFormData, updateMutation, checkForDuplicateName]);

  // Delete handlers
  const handleDelete = useCallback((id: string) => {
    setDeletingItemId(id);
    setDeleteMode('soft');
    // Cancel any edit operations when deleting
    setEditingItemId(null);
    setEditFormData({ name: '', category: '', type: '' });
    setEditFormError('');
  }, []);
  
  const handleHardDelete = useCallback((id: string) => {
    setDeletingItemId(id);
    setDeleteMode('hard');
    // Cancel any edit operations when deleting
    setEditingItemId(null);
    setEditFormData({ name: '', category: '', type: '' });
    setEditFormError('');
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingItemId || !deleteMode) return;

    if (deleteMode === 'soft') {
      deleteMutation.mutate(deletingItemId);
    } else {
      hardDeleteMutation.mutate(deletingItemId);
    }
  }, [deletingItemId, deleteMode, deleteMutation, hardDeleteMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeletingItemId(null);
    setDeleteMode(null);
  }, []);
  
  const handleReactivate = useCallback((id: string) => {
    reactivateMutation.mutate(id);
  }, [reactivateMutation]);

  const handleReactivateConfirm = () => {
    if (!metricToReactivate || reactivateMutation.isPending) {
      return;
    }

    operationRef.current = 'reactivating';
    reactivateMutation.mutate(metricToReactivate.id);
  };

  const handleReactivateClose = () => {
    if (reactivateMutation.isPending) {
      return;
    }
    setShowReactivateDialog(false);
    setMetricToReactivate(null);
  };

  const handleEditFormNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setEditFormData({ ...editFormData, name: newName });
    
    // Clear error if user is typing and no longer has a duplicate
    if (editFormError && !checkForDuplicateName(newName, editingItemId || undefined)) {
      setEditFormError('');
    }
  };

  if (loading || !allTrackableItems) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl text-white">Manage Metrics</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeItems = allTrackableItems.filter(item => item.is_active);
  const archivedItems = allTrackableItems.filter(item => !item.is_active);
  const itemsToDisplay = activeTab === 'active' ? activeItems : archivedItems;

  // Separate items by category
  const inputItems = itemsToDisplay.filter(item => item.category === 'INPUT');
  const outputItems = itemsToDisplay.filter(item => item.category === 'OUTPUT');

  const renderMetricCard = (item: TrackableItem) => {
    const isEditing = editingItemId === item.id;
    const isDeleting = deletingItemId === item.id;
    const isMutating = deleteMutation.isPending && deleteMutation.variables === item.id ||
                       hardDeleteMutation.isPending && hardDeleteMutation.variables === item.id ||
                       reactivateMutation.isPending && reactivateMutation.variables === item.id ||
                       updateMutation.isPending;
    
    return (
      <Card 
        key={item.id} 
        className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg ${isEditing || isDeleting ? 'ring-2 ring-primary ring-opacity-30' : ''} transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] group`}
      >
        <CardContent className="p-4">
          {isDeleting ? (
            // Delete confirmation mode - expanded form
            <div className="space-y-4">
              <div className={`p-4 border rounded-lg ${deleteMode === 'hard' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${deleteMode === 'hard' ? 'text-red-600' : 'text-yellow-600'} animate-pulse`} />
                  <div className="flex-1">
                    <h4 className={`font-medium mb-2 ${deleteMode === 'hard' ? 'text-red-800' : 'text-yellow-800'}`}>
                      {deleteMode === 'hard' ? 'Permanently Delete Metric?' : 'Archive Metric?'}
                    </h4>
                    <p className={`text-sm mb-3 ${deleteMode === 'hard' ? 'text-red-700' : 'text-yellow-700'}`}>
                      {deleteMode === 'hard' 
                        ? `Are you sure you want to permanently delete "${item.name}"?`
                        : `Are you sure you want to archive "${item.name}"?`
                      }
                    </p>
                    {deleteMode === 'hard' && (
                      <p className="text-sm text-red-600 font-medium">
                        Warning: This action cannot be undone. All historical data for this metric will be permanently erased.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelDelete}
                  disabled={isMutating}
                  className="h-8 px-3 text-xs transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmDelete}
                  disabled={isMutating}
                  loading={isMutating}
                  className={`h-8 px-3 text-xs transition-all duration-300 hover:scale-105 ${deleteMode === 'hard' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white'}`}
                >
                  {deleteMode === 'hard' ? 'Delete Permanently' : 'Archive'}
                </Button>
              </div>
            </div>
          ) : isEditing ? (
            // Edit mode - expanded form
            <div className="space-y-4">
              {editFormError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-pulse">
                  {editFormError}
                </div>
              )}
              
              <Input
                label="Metric Name"
                value={editFormData.name}
                onChange={handleEditFormNameChange}
                placeholder="Enter metric name"
                disabled={isMutating}
                className="text-sm transition-all duration-300 focus:scale-[1.02]"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-primary-text">Category</label>
                  <Select
                    value={editFormData.category}
                    onValueChange={(value: Category) => setEditFormData({ ...editFormData, category: value })}
                    disabled={isMutating}
                  >
                    <SelectTrigger className="h-9 text-sm transition-all duration-300 hover:border-primary/50">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-sm">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-primary-text">Type</label>
                  <Select
                    value={editFormData.type}
                    onValueChange={(value: DataType) => setEditFormData({ ...editFormData, type: value })}
                    disabled={isMutating}
                  >
                    <SelectTrigger className="h-9 text-sm transition-all duration-300 hover:border-primary/50">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DATA_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-sm">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isMutating}
                  className="h-8 px-3 text-xs transition-all duration-300 hover:scale-105"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(item.id)}
                  disabled={!editFormData.name || !editFormData.category || !editFormData.type || isMutating}
                  loading={updateMutation.isPending}
                  className="h-8 px-3 text-xs bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-all duration-300 hover:scale-105 text-white"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            // View mode - compact display with enhanced animations
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0 group/metric">
                <h4 className="font-medium text-primary-text text-sm truncate transition-all duration-300 group-hover:text-primary">{item.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/30"
                  >
                    {DATA_TYPE_LABELS[item.type]}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {isMutating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  item.is_active ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 transition-all duration-300 hover:bg-primary/10 hover:scale-110" 
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 transition-all duration-300 hover:bg-red-50 hover:scale-110" 
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4 transition-transform duration-300 hover:text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 transition-all duration-300 hover:bg-green-50 hover:scale-110" 
                        onClick={() => handleReactivate(item.id)}
                      >
                        <RotateCw className="w-4 h-4 transition-transform duration-300 hover:text-green-500 hover:rotate-180" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-400 transition-all duration-300 hover:bg-red-50 hover:scale-110 hover:text-red-600" 
                        onClick={() => handleHardDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const isAddFormLoading = createMutation.isPending || reactivateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Manage Metrics Header - Removed hover animation */}
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Manage Metrics
        </h2>
        <p style={{ color: '#e6e2eb' }}>
          Create and organize your trackable habits and goals
        </p>
      </div>

      {/* Add Metric Container - Enhanced with animations */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200/30 group/add">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transform transition-transform duration-300 group-hover/add:scale-110 group-hover/add:rotate-[360deg]">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-heading text-xl text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover/add:tracking-wider">
              Add New Metric
            </h3>
          </div>
          
          <form onSubmit={handleAddSubmit} className="space-y-5">
            {addFormError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-pulse">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {addFormError}
                </p>
              </div>
            )}

            <Input
              label="Metric Name"
              value={addFormData.name}
              onChange={handleAddNameChange}
              placeholder="e.g., Sleep Quality, Caffeine Intake"
              required
              disabled={isAddFormLoading}
              className="transition-all duration-300 focus:scale-[1.01] bg-white/80 border-gray-200 focus:border-primary focus:ring-primary/20"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary-text">
                  Habit/Goal
                </label>
                <Select
                  value={addFormData.category}
                  onValueChange={(value: Category) => setAddFormData({ ...addFormData, category: value })}
                  disabled={isAddFormLoading}
                >
                  <SelectTrigger className="bg-white/80 border-gray-200 transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-primary/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="transition-colors duration-200 hover:bg-primary/10">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-medium text-primary-text">
                    Data Type
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowDataTypeInfo(true)}
                    className="text-blue-500 hover:text-blue-700 transition-all duration-300 hover:scale-125"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <Select
                  value={addFormData.type}
                  onValueChange={(value: DataType) => setAddFormData({ ...addFormData, type: value })}
                  disabled={isAddFormLoading}
                >
                  <SelectTrigger className="bg-white/80 border-gray-200 transition-all duration-300 hover:border-primary/50 focus:border-primary focus:ring-primary/20">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DATA_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="transition-colors duration-200 hover:bg-primary/10">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!addFormData.name || !addFormData.category || !addFormData.type || isAddFormLoading}
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
                  {isAddFormLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
                
                {/* Text with enhanced styling */}
                <span className="tracking-wide group-hover/button:tracking-wider transition-all duration-300">
                  {isAddFormLoading ? 'Creating...' : 'Add Metric'}
                </span>
              </div>
              
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/button:opacity-100 group-hover/button:scale-105 transition-all duration-500"></div>
            </button>
          </form>
        </div>
      </div>

      {/* Tabs - Enhanced with animations */}
      <div className="flex space-x-1 p-1 rounded-lg transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: '#cdc1db' }}>
        <button
          onClick={() => {
            setActiveTab('active');
            handleCancelEdit(); // Cancel any ongoing edits when switching tabs
            handleCancelDelete(); // Cancel any ongoing deletes when switching tabs
          }}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
            activeTab === 'active'
              ? 'bg-white shadow-md transform scale-105'
              : 'hover:bg-white/50 hover:scale-105'
          }`}
          style={{ 
            color: activeTab === 'active' ? '#4a2a6d' : '#9992a2'
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>Active ({activeItems.length})</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('archived');
            handleCancelEdit(); // Cancel any ongoing edits when switching tabs
            handleCancelDelete(); // Cancel any ongoing deletes when switching tabs
          }}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
            activeTab === 'archived'
              ? 'bg-white shadow-md transform scale-105'
              : 'hover:bg-white/50 hover:scale-105'
          }`}
          style={{ 
            color: activeTab === 'archived' ? '#4a2a6d' : '#9992a2'
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>Archived ({archivedItems.length})</span>
          </div>
        </button>
      </div>

      {itemsToDisplay.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/20 transition-all duration-500 hover:shadow-purple-500/20 hover:border-purple-200/30">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-500 hover:scale-110 hover:rotate-12">
            {activeTab === 'active' ? (
              <Plus className="w-8 h-8 text-purple-400" />
            ) : (
              <RotateCw className="w-8 h-8 text-purple-400" />
            )}
          </div>
          <p className="text-secondary-text text-sm">
            {activeTab === 'archived' ? "No archived metrics." : "No active metrics created yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Habits Section - Enhanced with animations */}
          {inputItems.length > 0 && (
            <div className="space-y-3 group/habits">
              <div className="flex items-center space-x-3">
                <h3 className="font-heading text-lg text-white bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent transition-all duration-300 group-hover/habits:tracking-wider">Habits</h3>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-orange-300/30 transition-all duration-300 group-hover/habits:scale-110">{inputItems.length}</Badge>
              </div>
              <div className="space-y-3">
                {inputItems.map(renderMetricCard)}
              </div>
            </div>
          )}

          {/* Goals Section - Enhanced with animations */}
          {outputItems.length > 0 && (
            <div className="space-y-3 group/goals">
              <div className="flex items-center space-x-3">
                <h3 className="font-heading text-lg text-white bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent transition-all duration-300 group-hover/goals:tracking-wider">Goals</h3>
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-green-300/30 transition-all duration-300 group-hover/goals:scale-110">{outputItems.length}</Badge>
              </div>
              <div className="space-y-3">
                {outputItems.map(renderMetricCard)}
              </div>
            </div>
          )}

          {/* Show message if only one category has items */}
          {inputItems.length === 0 && outputItems.length > 0 && (
            <div className="space-y-3 group/empty-habits">
              <div className="flex items-center space-x-3">
                <h3 className="font-heading text-lg text-gray-400 transition-all duration-300 group-hover/empty-habits:tracking-wider">Habits</h3>
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-400/30 transition-all duration-300 group-hover/empty-habits:scale-110">0</Badge>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300 group-hover/empty-habits:bg-white/30">
                <p className="text-sm text-white/70 text-center">No habits yet. Add your first habit using the form above.</p>
              </div>
            </div>
          )}

          {outputItems.length === 0 && inputItems.length > 0 && (
            <div className="space-y-3 group/empty-goals">
              <div className="flex items-center space-x-3">
                <h3 className="font-heading text-lg text-gray-400 transition-all duration-300 group-hover/empty-goals:tracking-wider">Goals</h3>
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-400/30 transition-all duration-300 group-hover/empty-goals:scale-110">0</Badge>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300 group-hover/empty-goals:bg-white/30">
                <p className="text-sm text-white/70 text-center">No goals yet. Add your first goal using the form above.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Type Info Dialog */}
      <DataTypeInfoDialog
        isOpen={showDataTypeInfo}
        onClose={() => setShowDataTypeInfo(false)}
      />

      {/* Reactivate Metric Dialog */}
      <ReactivateMetricDialog
        isOpen={showReactivateDialog}
        onClose={handleReactivateClose}
        onConfirm={handleReactivateConfirm}
        metric={metricToReactivate}
        loading={reactivateMutation.isPending}
      />
    </div>
  );
}