'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info, X, Scale, Hash, Check, FileText } from 'lucide-react';

interface DataTypeInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataTypeInfoDialog({ isOpen, onClose }: DataTypeInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl z-[9999]" style={{ zIndex: 9999 }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-400/20">
                <Info className="w-6 h-6 text-white animate-pulse" />
              </div>
              <DialogTitle className="font-heading text-2xl text-primary-text bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Data Type Guide
              </DialogTitle>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-2">
          <div className="text-center max-w-2xl mx-auto">
            <h4 className="font-medium text-primary-text mb-3 text-xl">What kind of data do you want to track?</h4>
            <p className="text-secondary-text mb-6 text-base">
              Choose the format that best fits the metric you are measuring. This will determine the type of input you use each day.
            </p>
          </div>
          
          {/* 2x2 Grid Layout with enhanced animations */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-green-200/50 hover:-translate-y-1 group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-400/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-semibold text-green-900 text-lg transition-all duration-300 group-hover:tracking-wide">
                  Scale (1-10)
                </h5>
              </div>
              <p className="text-green-800 mb-3 text-base pl-13">
                Best for subjective ratings.
              </p>
              <div className="bg-white/70 rounded-lg p-3 border border-green-200 transition-all duration-300 group-hover:bg-white group-hover:shadow-sm">
                <p className="text-green-700 text-sm italic">
                  Examples: "Mood", "Energy Level", "Stress Level"
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-1 group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-400/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-semibold text-blue-900 text-lg transition-all duration-300 group-hover:tracking-wide">
                  Number
                </h5>
              </div>
              <p className="text-blue-800 mb-3 text-base pl-13">
                Best for any measurable quantity.
              </p>
              <div className="bg-white/70 rounded-lg p-3 border border-blue-200 transition-all duration-300 group-hover:bg-white group-hover:shadow-sm">
                <p className="text-blue-700 text-sm italic">
                  Examples: "Hours of Sleep", "Workout Duration (minutes)", "Cups of Coffee"
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/50 hover:-translate-y-1 group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-purple-400/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-semibold text-purple-900 text-lg transition-all duration-300 group-hover:tracking-wide">
                  Yes/No
                </h5>
              </div>
              <p className="text-purple-800 mb-3 text-base pl-13">
                Best for simple, daily check-ins.
              </p>
              <div className="bg-white/70 rounded-lg p-3 border border-purple-200 transition-all duration-300 group-hover:bg-white group-hover:shadow-sm">
                <p className="text-purple-700 text-sm italic">
                  Examples: "Did you meditate?", "Workout Complete?", "Took Vitamins?"
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-1 group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-400/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h5 className="font-semibold text-orange-900 text-lg transition-all duration-300 group-hover:tracking-wide">
                  Text
                </h5>
              </div>
              <p className="text-orange-800 mb-3 text-base pl-13">
                Best for short notes or journal entries.
              </p>
              <div className="bg-white/70 rounded-lg p-3 border border-orange-200 transition-all duration-300 group-hover:bg-white group-hover:shadow-sm">
                <p className="text-orange-700 text-sm italic">
                  Examples: "Daily Highlight", "Reasons for Stress", "Workout Notes"
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/30 group">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-md shadow-indigo-400/20 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base text-indigo-900 font-medium mb-1">
                  <span className="text-xl">💡</span> <strong>Tip:</strong> Choose the data type that feels most natural for how you want to track this metric daily.
                </p>
                <p className="text-sm text-indigo-700">
                  You can always create multiple metrics if you need different tracking methods. For example, you might track "Workout Duration" (number) and "Workout Completed" (yes/no) as separate metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}