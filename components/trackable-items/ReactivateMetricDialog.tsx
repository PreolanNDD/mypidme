'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrackableItem } from '@/lib/types';
import { RotateCcw, X } from 'lucide-react';

interface ReactivateMetricDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  metric: TrackableItem | null;
  loading: boolean;
}

const DATA_TYPE_LABELS: Record<string, string> = {
  'SCALE_1_10': 'Scale (1-10)',
  'NUMERIC': 'Number',
  'BOOLEAN': 'Yes/No',
  'TEXT': 'Text'
};

export function ReactivateMetricDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  metric, 
  loading 
}: ReactivateMetricDialogProps) {
  return (
    <Dialog open={isOpen && !!metric} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-400/20">
                <RotateCcw className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <DialogTitle className="font-heading text-xl text-primary-text bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
                Reactivate Metric
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
        <div className="space-y-4">
          <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg shadow-inner">
            <p className="text-sm text-blue-800 mb-3 font-medium">
              You have an archived metric with this name:
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-white/80 rounded-md">
                <span className="font-medium text-blue-900">Name:</span>
                <span className="text-blue-800 font-semibold">{metric?.name}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/80 rounded-md">
                <span className="font-medium text-blue-900">Category:</span>
                <span className="text-blue-800 font-semibold">{metric?.category}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/80 rounded-md">
                <span className="font-medium text-blue-900">Type:</span>
                <span className="text-blue-800 font-semibold">{metric ? DATA_TYPE_LABELS[metric.type] : ''}</span>
              </div>
            </div>
          </div>

          <p className="text-secondary-text text-sm text-center">
            Would you like to reactivate this metric instead of creating a new one?
          </p>

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02]"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              loading={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white border-none transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reactivate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}