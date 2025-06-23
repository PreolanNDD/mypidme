'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Experiment } from '@/lib/experiments';
import { AlertTriangle, X } from 'lucide-react';

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
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="font-heading text-xl text-primary-text">
                Delete Experiment?
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-2">
              Are you sure you want to delete <span className="font-semibold">"{experiment?.title}"</span>?
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Warning: This action cannot be undone.
                </p>
                <p className="text-sm text-yellow-700">
                  The experiment and all its configuration will be permanently deleted. Your logged data will remain intact.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              loading={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
            >
              Yes, Delete Experiment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}