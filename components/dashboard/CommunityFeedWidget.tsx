'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommunityFindings } from '@/lib/community';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronUp, ChevronDown, User, Calendar, ArrowRight, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function CommunityFeedWidget() {
  const { user } = useAuth();
  const router = useRouter();

  // Fetch community findings
  const { data: findings = [], isLoading } = useQuery({
    queryKey: ['communityFindings'],
    queryFn: () => getCommunityFindings(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get top 3 findings by score (upvotes - downvotes)
  const topFindings = findings
    .map(finding => ({
      ...finding,
      score: finding.upvotes - finding.downvotes
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAuthorName = (finding: any) => {
    if (!finding.author) return 'Anonymous';
    const { first_name, last_name } = finding.author;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    } else if (first_name) {
      return first_name;
    } else if (last_name) {
      return last_name;
    }
    return 'Anonymous';
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const handleViewCommunity = () => {
    router.push('/community');
  };

  const handleFindingClick = (findingId: string) => {
    router.push(`/community/${findingId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-heading text-lg text-white">Community Insights</h3>
        </div>

        {/* Loading State */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 group">
      {/* Header - WITH REDUCED GLOW ON ICON */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Icon with reduced glow and size increase */}
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-white/30 flex-shrink-0">
            <Users className="w-4 h-4 text-primary transition-all duration-300 group-hover:scale-110" />
          </div>
          
          {/* Text content moved to the right with enhanced effects */}
          <div className="transition-all duration-300 group-hover:translate-x-2">
            {/* Heading with glow and size increase */}
            <h3 className="font-heading text-lg text-white transition-all duration-300 group-hover:scale-105 group-hover:text-shadow-glow">
              Community Insights
            </h3>
            {/* Description with glow and size increase */}
            <p className="text-sm transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:text-shadow-glow-subtle" style={{ color: '#e6e2eb' }}>
              Top discoveries from the community
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewCommunity}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Content */}
      {topFindings.length === 0 ? (
        // No findings available
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-heading text-lg text-primary-text mb-2">
            No Community Findings Yet
          </h4>
          <p className="text-secondary-text text-sm mb-6 max-w-sm mx-auto">
            Be the first to share your insights and discoveries with the community!
          </p>
          <Button 
            onClick={handleViewCommunity} 
            className="w-full sm:w-auto bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200"
            style={{ color: '#4a2a6d' }}
          >
            <Users className="w-4 h-4 mr-2" />
            Explore Community
          </Button>
        </div>
      ) : (
        // Show top findings - Enhanced individual items with premium styling
        <div className="space-y-6">
          {topFindings.map((finding, index) => (
            <div 
              key={finding.id} 
              className="group/finding relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/25 hover:z-10 cursor-pointer"
              onClick={() => handleFindingClick(finding.id)}
              style={{
                // Add margin to prevent overlap when rising
                marginBottom: index < topFindings.length - 1 ? '1.5rem' : '0'
              }}
            >
              {/* Gradient overlay for premium feel */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-blue-50/30 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500"></div>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              {/* Content container */}
              <div className="relative p-5 space-y-4">
                {/* Header with ranking badge */}
                <div className="flex items-start space-x-4">
                  {/* Enhanced ranking badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover/finding:scale-110 group-hover/finding:rotate-3 shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-200' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-gray-200' :
                      'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-200'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Content area */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Title with enhanced styling */}
                    <h4 className="font-semibold text-lg text-primary-text group-hover/finding:text-purple-700 transition-all duration-300 leading-tight">
                      {finding.title}
                    </h4>
                    
                    {/* Content preview with better typography */}
                    <p className="text-sm text-gray-600 group-hover/finding:text-gray-700 transition-colors duration-300 leading-relaxed">
                      {truncateContent(finding.content, 120)}
                    </p>
                    
                    {/* Enhanced meta information */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs">
                        {/* Author with icon */}
                        <div className="flex items-center space-x-1.5 text-gray-500 group-hover/finding:text-purple-600 transition-colors duration-300">
                          <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                            <User className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="font-medium">{getAuthorName(finding)}</span>
                        </div>
                        
                        {/* Date with icon */}
                        <div className="flex items-center space-x-1.5 text-gray-500 group-hover/finding:text-purple-600 transition-colors duration-300">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(finding.created_at)}</span>
                        </div>
                        
                        {/* Data badge */}
                        {finding.share_data && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 group-hover/finding:bg-blue-100 group-hover/finding:border-blue-300 transition-all duration-300">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Data
                          </Badge>
                        )}
                      </div>

                      {/* Enhanced vote summary */}
                      <div className="flex items-center space-x-3">
                        {/* Upvotes */}
                        <div className="flex items-center space-x-1.5 bg-green-50 px-2.5 py-1 rounded-lg group-hover/finding:bg-green-100 transition-colors duration-300">
                          <ChevronUp className="w-3.5 h-3.5 text-green-600 group-hover/finding:scale-110 transition-transform duration-300" />
                          <span className="text-sm font-medium text-green-700">{finding.upvotes}</span>
                        </div>
                        
                        {/* Downvotes */}
                        <div className="flex items-center space-x-1.5 bg-red-50 px-2.5 py-1 rounded-lg group-hover/finding:bg-red-100 transition-colors duration-300">
                          <ChevronDown className="w-3.5 h-3.5 text-red-600 group-hover/finding:scale-110 transition-transform duration-300" />
                          <span className="text-sm font-medium text-red-700">{finding.downvotes}</span>
                        </div>
                        
                        {/* Score badge */}
                        <div className={`text-sm font-bold px-3 py-1.5 rounded-xl transition-all duration-300 group-hover/finding:scale-105 shadow-sm ${
                          finding.score > 0 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 group-hover/finding:from-green-200 group-hover/finding:to-green-300' :
                          finding.score < 0 ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 group-hover/finding:from-red-200 group-hover/finding:to-red-300' :
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 group-hover/finding:from-gray-200 group-hover/finding:to-gray-300'
                        }`}>
                          {finding.score > 0 ? '+' : ''}{finding.score}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subtle bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 rounded-b-2xl"></div>
              </div>
            </div>
          ))}

          {/* Show more findings indicator */}
          {findings.length > 3 && (
            <div className="text-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewCommunity}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                +{findings.length - 3} more finding{findings.length - 3 !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Enhanced Discover More Insights Button */}
          <div className="pt-2">
            <button
              onClick={handleViewCommunity}
              className="group/discover w-full relative overflow-hidden rounded-xl bg-white/30 backdrop-blur-md border-2 border-white/50 p-4 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/30 hover:border-white/70 hover:bg-white/40"
            >
              {/* Animated background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-blue-400/30 to-indigo-400/30 opacity-0 group-hover/discover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Sliding highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/discover:translate-x-full transition-transform duration-700 ease-out"></div>
              
              {/* Content */}
              <div className="relative flex items-center justify-center space-x-3">
                {/* Text with enhanced styling */}
                <span className="font-Medium text-white text-lg group-hover/discover:text-white transition-all duration-300 group-hover/discover:drop-shadow-lg tracking-wide">
                  Discover More Insights
                </span>
                
                {/* Arrow with slide animation */}
                <div className="transform group-hover/discover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="w-6 h-6 text-white/90 group-hover/discover:text-white transition-colors duration-300" />
                </div>
              </div>
              
              {/* Pulse effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/discover:opacity-100 group-hover/discover:animate-pulse transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Custom CSS for text glow effects */}
      <style jsx>{`
        .group:hover .group-hover\\:text-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4);
        }
        .group:hover .group-hover\\:text-shadow-glow-subtle {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}