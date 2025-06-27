'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Experiment } from '@/lib/experiments';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteExperimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  experiment: Experiment | null;
  loading: boolean;
}

export function DeleteExperimentDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  experiment, 
  loading 
}: DeleteExperimentDialogProps) {
  return (
    <Dialog open={isOpen && !!experiment} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="font-heading text-2xl text-primary-text bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Delete Experiment?
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 transition-all duration-300 hover:bg-gray-100 hover:scale-110"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="p-5 bg-red-50 border border-red-200 rounded-lg shadow-inner">
            <p className="text-red-800 mb-3 font-medium text-lg">
              Are you sure you want to delete <span className="font-semibold">"{experiment?.title}"</span>?
            </p>
            <div className="bg-white/80 rounded-lg p-3 border border-red-200">
              <p className="text-red-700 text-sm">
                This experiment will be permanently removed from your account.
              </p>
            </div>
          </div>

          <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Warning: This action cannot be undone.
                </p>
                <p className="text-sm text-yellow-700">
                  The experiment and all its configuration will be permanently deleted. Your logged data will remain intact.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-300 text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
              disabled={loading}
            >
              Cancel
            </Button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="group/delete relative overflow-hidden flex-1 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-white font-medium shadow-md transition-all duration-500 hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {/* Animated background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-500 opacity-0 group-hover/delete:opacity-100 transition-opacity duration-500"></div>
              
              {/* Sliding highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/delete:translate-x-full transition-transform duration-700 ease-out"></div>
              
              {/* Content */}
              <div className="relative flex items-center justify-center space-x-2">
                {/* Icon with animation */}
                <div className="transform group-hover/delete:scale-110 group-hover/delete:rotate-12 transition-transform duration-300">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </div>
                
                {/* Text with enhanced styling */}
                <span className="tracking-wide group-hover/delete:tracking-wider transition-all duration-300">
                  {loading ? 'Deleting...' : 'Yes, Delete Experiment'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}