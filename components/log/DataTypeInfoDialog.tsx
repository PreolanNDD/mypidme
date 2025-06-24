'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';

interface DataTypeInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataTypeInfoDialog({ isOpen, onClose }: DataTypeInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl z-[9999]" style={{ zIndex: 9999 }}>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-heading text-xl text-primary-text">
              Data Type Guide
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-primary-text mb-2 text-lg">What kind of data do you want to track?</h4>
            <p className="text-secondary-text mb-6 text-base">
              Choose the format that best fits the metric you are measuring. This will determine the type of input you use each day.
            </p>
          </div>
          
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-3 text-lg">Scale (1-10):</h5>
              <p className="text-green-800 mb-3 text-base">
                Best for subjective ratings.
              </p>
              <p className="text-green-700 text-sm italic">
                Examples: "Mood", "Energy Level", "Stress Level"
              </p>
            </div>
            
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-3 text-lg">Number:</h5>
              <p className="text-blue-800 mb-3 text-base">
                Best for any measurable quantity.
              </p>
              <p className="text-blue-700 text-sm italic">
                Examples: "Hours of Sleep", "Workout Duration (minutes)", "Cups of Coffee"
              </p>
            </div>
            
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-3 text-lg">Yes/No:</h5>
              <p className="text-purple-800 mb-3 text-base">
                Best for simple, daily check-ins.
              </p>
              <p className="text-purple-700 text-sm italic">
                Examples: "Did you meditate?", "Workout Complete?", "Took Vitamins?"
              </p>
            </div>
            
            <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-3 text-lg">Text:</h5>
              <p className="text-orange-800 mb-3 text-base">
                Best for short notes or journal entries.
              </p>
              <p className="text-orange-700 text-sm italic">
                Examples: "Daily Highlight", "Reasons for Stress", "Workout Notes"
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-base text-gray-700">
              💡 <strong>Tip:</strong> Choose the data type that feels most natural for how you want to track this metric daily. You can always create multiple metrics if you need different tracking methods.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}