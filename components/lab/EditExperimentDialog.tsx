'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { updateExperiment, Experiment } from '@/lib/experiments';
import { TrackableItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, FlaskConical, Calendar, Target, TrendingUp, X, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EditExperimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: Experiment | null;
  inputMetrics: TrackableItem[];
  outputMetrics: TrackableItem[];
}

export function EditExperimentDialog({ 
  isOpen, 
  onClose, 
  experiment,
  inputMetrics, 
  outputMetrics 
}: EditExperimentDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    hypothesis: '',
    independent_variable_id: '',
    dependent_variable_id: '',
    start_date: '',
    end_date: ''
  });

  // Initialize form data when experiment changes
  useEffect(() => {
    if (experiment) {
      setFormData({
        title: experiment.title,
        hypothesis: experiment.hypothesis,
        independent_variable_id: experiment.independent_variable_id,
        dependent_variable_id: experiment.dependent_variable_id,
        start_date: experiment.start_date,
        end_date: experiment.end_date
      });
      setError('');
    }
  }, [experiment]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!experiment) throw new Error("No experiment to update");
      
      // Determine status based on dates
      const today = new Date().toISOString().split('T')[0];
      const status = data.end_date < today ? 'COMPLETED' : 'ACTIVE';
      
      return updateExperiment(experiment.id, {
        title: data.title.trim(),
        hypothesis: data.hypothesis.trim(),
        independent_variable_id: data.independent_variable_id,
        dependent_variable_id: data.dependent_variable_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status
      });
    },
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['experiments', user?.id] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update experiment');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !experiment || !formData.title || !formData.hypothesis || !formData.independent_variable_id || 
        !formData.dependent_variable_id || !formData.start_date || !formData.end_date) {
      setError('Please fill in all fields');
      return;
    }

    // Validate date range
    if (formData.end_date < formData.start_date) {
      setError('End date must be after start date');
      return;
    }

    // Validate that variables are different
    if (formData.independent_variable_id === formData.dependent_variable_id) {
      setError('Independent and dependent variables must be different');
      return;
    }

    setError('');
    updateMutation.mutate(formData);
  };

  const handleClose = () => {
    if (updateMutation.isPending) return;
    setError('');
    onClose();
  };

  const isLoading = updateMutation.isPending;

  return (
    <Dialog open={isOpen && !!experiment} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto mr-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="font-heading text-2xl text-primary-text bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Experiment
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 transition-all duration-300 hover:bg-gray-100 hover:scale-110"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Title with enhanced styling */}
            <div className="space-y-2 group/title">
              <Label className="text-sm font-medium text-primary-text transition-all duration-300 group-hover/title:text-blue-700">
                Experiment Title
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Does meditation improve my focus?"
                required
                disabled={isLoading}
                className="bg-white transition-all duration-300 focus:scale-[1.01] border-gray-200 focus:border-blue-400 focus:ring-blue-200"
              />
            </div>

            {/* Hypothesis with enhanced styling */}
            <div className="space-y-2 group/hypothesis">
              <Label className="text-sm font-medium text-primary-text transition-all duration-300 group-hover/hypothesis:text-blue-700">
                Hypothesis
              </Label>
              <textarea
                value={formData.hypothesis}
                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                placeholder="What do you expect to happen? e.g., I believe that meditating daily will increase my focus scores by at least 2 points."
                className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition-all duration-300 focus:scale-[1.01]"
                rows={4}
                required
                disabled={isLoading}
              />
            </div>

            {/* Variables Section with enhanced styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Independent Variable (Cause) */}
              <div className="space-y-3 group/cause">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm shadow-orange-400/20 transition-all duration-300 group-hover/cause:scale-110 group-hover/cause:rotate-6">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <Label className="text-sm font-medium text-primary-text transition-all duration-300 group-hover/cause:text-orange-700">
                    Independent Variable (The Cause)
                  </Label>
                </div>
                <Select
                  value={formData.independent_variable_id}
                  onValueChange={(value) => setFormData({ ...formData, independent_variable_id: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-200 transition-all duration-300 hover:border-orange-300 focus:border-orange-400 focus:ring-orange-200">
                    <SelectValue placeholder="Select an input metric" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                    {inputMetrics.map((metric) => (
                      <SelectItem 
                        key={metric.id} 
                        value={metric.id}
                        className="transition-colors duration-200 hover:bg-orange-50 focus:bg-orange-50 rounded-lg my-1"
                      >
                        {metric.name} ({metric.type === 'BOOLEAN' ? 'Yes/No' : 
                                     metric.type === 'SCALE_1_10' ? 'Scale 1-10' : 'Numeric'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dependent Variable (Effect) */}
              <div className="space-y-3 group/effect">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm shadow-green-400/20 transition-all duration-300 group-hover/effect:scale-110 group-hover/effect:rotate-6">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <Label className="text-sm font-medium text-primary-text transition-all duration-300 group-hover/effect:text-green-700">
                    Dependent Variable (The Effect)
                  </Label>
                </div>
                <Select
                  value={formData.dependent_variable_id}
                  onValueChange={(value) => setFormData({ ...formData, dependent_variable_id: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-200 transition-all duration-300 hover:border-green-300 focus:border-green-400 focus:ring-green-200">
                    <SelectValue placeholder="Select an output metric" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
                    {outputMetrics.map((metric) => (
                      <SelectItem 
                        key={metric.id} 
                        value={metric.id}
                        className="transition-colors duration-200 hover:bg-green-50 focus:bg-green-50 rounded-lg my-1"
                      >
                        {metric.name} ({metric.type === 'SCALE_1_10' ? 'Scale 1-10' : 'Numeric'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range with enhanced styling */}
            <div className="space-y-3 group/dates">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-blue-400/20 transition-all duration-300 group-hover/dates:scale-110 group-hover/dates:rotate-6">
                  <Calendar className="w-3 h-3 text-white" />
                </div>
                <Label className="text-sm font-medium text-primary-text transition-all duration-300 group-hover/dates:text-blue-700">
                  Experiment Duration
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-secondary-text transition-all duration-300 group-hover/dates:text-blue-600">
                    Start Date
                  </Label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition-all duration-300 hover:border-blue-300"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-secondary-text transition-all duration-300 group-hover/dates:text-blue-600">
                    End Date
                  </Label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white transition-all duration-300 hover:border-blue-300"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons with enhanced styling */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-white border border-gray-300 text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={!formData.title || !formData.hypothesis || !formData.independent_variable_id || 
                         !formData.dependent_variable_id || !formData.start_date || !formData.end_date || 
                         inputMetrics.length === 0 || outputMetrics.length === 0 || isLoading}
                className="group/button relative overflow-hidden flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-medium shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Animated background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 opacity-0 group-hover/button:opacity-100 transition-opacity duration-500"></div>
                
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700 ease-out"></div>
                
                {/* Content */}
                <div className="relative flex items-center justify-center space-x-2">
                  {/* Icon with animation */}
                  <div className="transform group-hover/button:scale-110 group-hover/button:rotate-12 transition-transform duration-300">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Text with enhanced styling */}
                  <span className="tracking-wide group-hover/button:tracking-wider transition-all duration-300">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}