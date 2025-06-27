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
      {/* Header - Matching Active Experiments styling */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Medium Icon - matching Active Experiments */}
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg flex-shrink-0">
            <Users className="w-5 h-5 text-primary transition-all duration-300 group-hover:scale-110" />
          </div>
          
          {/* Medium Text Content - matching Active Experiments */}
          <div className="transition-all duration-300 group-hover:translate-x-1">
            {/* Medium Heading */}
            <h3 className="font-heading text-xl text-white transition-all duration-300 group-hover:scale-105 group-hover:text-shadow-glow">
              Community Insights
            </h3>
            {/* Medium Description */}
            <p className="text-base transition-all duration-300 group-hover:scale-105 group-hover:text-white group-hover:text-shadow-glow-subtle" style={{ color: '#e6e2eb' }}>
              Top discoveries from the community
            </p>
          </div>
        </div>
        {/* Enhanced View All Button */}
        <button
          onClick={handleViewCommunity}
          className="group/viewall relative overflow-hidden px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
        >
          {/* Sliding highlight effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/viewall:translate-x-full transition-transform duration-500 ease-out"></div>
          
          {/* Content */}
          <div className="relative flex items-center space-x-2">
            <span className="text-sm font-medium transition-all duration-300 group-hover/viewall:tracking-wide">
              View All
            </span>
            <div className="transform group-hover/viewall:translate-x-1 transition-transform duration-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover/viewall:opacity-100 transition-opacity duration-300"></div>
        </button>
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
        // Show top findings - Enhanced individual items
        <div className="space-y-6">
          {topFindings.map((finding, index) => (
            <div 
              key={finding.id} 
              className="group/finding relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10"
              onClick={() => handleFindingClick(finding.id)}
              style={{
                // Add margin to prevent overlap when rising
                marginBottom: index < topFindings.length - 1 ? '1.5rem' : '0'
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              <div className="relative p-5 space-y-4">
                {/* Enhanced Header with ranking badge */}
                <div className="flex items-start space-x-4">
                  {/* Ranking Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover/finding:scale-110 group-hover/finding:rotate-3 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-500/30' :
                      'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg text-primary-text group-hover/finding:text-purple-700 transition-colors duration-300 leading-tight mb-2 line-clamp-2">
                      {finding.title}
                    </h4>
                    <p className="text-sm text-secondary-text group-hover/finding:text-gray-700 transition-colors duration-300 leading-relaxed line-clamp-2">
                      {truncateContent(finding.content, 120)}
                    </p>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 transform group-hover/finding:translate-x-1 group-hover/finding:scale-110 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover/finding:text-purple-600" />
                  </div>
                </div>

                {/* Enhanced Meta information */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 group-hover/finding:border-purple-100 transition-colors duration-300">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Author */}
                    <div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-purple-50 group-hover/finding:shadow-sm">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-secondary-text group-hover/finding:text-purple-700 transition-colors duration-300 truncate max-w-[80px] sm:max-w-none">
                        {getAuthorName(finding)}
                      </span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center space-x-2 px-2 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-blue-50 group-hover/finding:shadow-sm">
                      <Calendar className="w-3 h-3 text-secondary-text group-hover/finding:text-blue-600 transition-colors duration-300" />
                      <span className="text-xs text-secondary-text group-hover/finding:text-blue-700 transition-colors duration-300">
                        {formatDate(finding.created_at)}
                      </span>
                    </div>
                    
                    {/* Data badge */}
                    {finding.share_data && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 group-hover/finding:bg-blue-100 group-hover/finding:border-blue-300 group-hover/finding:scale-105 transition-all duration-300">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Data
                      </Badge>
                    )}
                  </div>

                  {/* Enhanced Vote summary */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center group-hover/finding:bg-green-200 group-hover/finding:scale-110 transition-all duration-300">
                        <ChevronUp className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-secondary-text group-hover/finding:text-green-700 transition-colors duration-300">
                        {finding.upvotes}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center group-hover/finding:bg-red-200 group-hover/finding:scale-110 transition-all duration-300">
                        <ChevronDown className="w-3 h-3 text-red-600" />
                      </div>
                      <span className="text-xs font-medium text-secondary-text group-hover/finding:text-red-700 transition-colors duration-300">
                        {finding.downvotes}
                      </span>
                    </div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full transition-all duration-300 group-hover/finding:scale-105 ${
                      finding.score > 0 ? 'bg-green-100 text-green-700 group-hover/finding:bg-green-200' :
                      finding.score < 0 ? 'bg-red-100 text-red-700 group-hover/finding:bg-red-200' :
                      'bg-gray-100 text-gray-700 group-hover/finding:bg-gray-200'
                    }`}>
                      {finding.score > 0 ? '+' : ''}{finding.score}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Show more findings indicator */}
          {findings.length > 3 && (
            <div className="text-center pt-2">
              <button
                onClick={handleViewCommunity}
                className="group/more relative overflow-hidden px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:scale-105 hover:shadow-lg hover:shadow-white/20"
              >
                {/* Sliding highlight effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/more:translate-x-full transition-transform duration-500 ease-out"></div>
                
                {/* Content */}
                <div className="relative">
                  <span className="text-sm font-medium transition-all duration-300 group-hover/more:tracking-wide">
                    +{findings.length - 3} more finding{findings.length - 3 !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover/more:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}

          {/* Enhanced "Discover More Insights" button - More distinguishable from background */}
          <div className="pt-2">
            <button
              onClick={handleViewCommunity}
              className="group/discover relative overflow-hidden w-full px-6 py-4 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-white/60 text-gray-800 shadow-lg transition-all duration-300 hover:bg-white hover:border-white hover:shadow-xl hover:shadow-white/30"
            >
              {/* Sliding highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 to-transparent -translate-x-full group-hover/discover:translate-x-full transition-transform duration-500 ease-out"></div>
              
              {/* Content */}
              <div className="relative flex items-center justify-center space-x-3">
                <span className="font-semibold text-lg transition-all duration-300 group-hover/discover:tracking-wide text-gray-800">
                  Discover More Insights
                </span>
                <div className="transform group-hover/discover:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl bg-purple-100/20 opacity-0 group-hover/discover:opacity-100 transition-opacity duration-300"></div>
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}