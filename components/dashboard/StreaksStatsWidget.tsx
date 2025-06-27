'use client';

import React from 'react';
import { Flame, Target, BarChart3 } from 'lucide-react';

interface StreaksStatsWidgetProps {
  currentStreak: number;
  totalMetrics: number;
  totalEntries: number;
  loading: boolean;
}

export function StreaksStatsWidget({ 
  currentStreak, 
  totalMetrics, 
  totalEntries, 
  loading 
}: StreaksStatsWidgetProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="font-heading text-2xl text-white">Streaks & Stats</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 bg-white/10 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 group">
      <div className="mb-6">
        <h2 className="font-heading text-2xl text-white">Streaks & Stats</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Current Streak */}
        <div className="text-center group/streak">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400/80 to-red-500/80 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform transition-all duration-300 group-hover/streak:scale-110 group-hover:shadow-orange-500/30">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1 transition-all duration-300 group-hover:text-shadow-glow">{currentStreak}</p>
          <p className="text-sm text-white/80 transition-all duration-300 group-hover:text-white">Day Streak</p>
        </div>

        {/* Total Metrics */}
        <div className="text-center group/metrics">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400/80 to-indigo-500/80 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform transition-all duration-300 group-hover/metrics:scale-110 group-hover:shadow-blue-500/30">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1 transition-all duration-300 group-hover:text-shadow-glow">{totalMetrics}</p>
          <p className="text-sm text-white/80 transition-all duration-300 group-hover:text-white">Active Metrics</p>
        </div>

        {/* Total Entries */}
        <div className="text-center group/entries">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400/80 to-teal-500/80 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 transform transition-all duration-300 group-hover/entries:scale-110 group-hover:shadow-green-500/30">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1 transition-all duration-300 group-hover:text-shadow-glow">{totalEntries}</p>
          <p className="text-sm text-white/80 transition-all duration-300 group-hover:text-white">Total Logs</p>
        </div>
      </div>

      {/* Custom CSS for text glow effects */}
      <style jsx>{`
        .group:hover .group-hover\\:text-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}