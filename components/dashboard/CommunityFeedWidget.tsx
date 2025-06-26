'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommunityFindings } from '@/lib/community';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronUp, ChevronDown, User, Calendar, ArrowRight, MessageSquare, TrendingUp } from 'lucide-react';
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
          className="text-white hover:bg-white/10"
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
        // Show top findings - Individual items as white containers with interactive effects
        <div className="space-y-6">
          {topFindings.map((finding, index) => (
            <div 
              key={finding.id} 
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 cursor-pointer group/finding border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-3xl hover:z-10 relative"
              onClick={() => handleFindingClick(finding.id)}
              style={{
                // Add margin to prevent overlap when rising
                marginBottom: index < topFindings.length - 1 ? '1.5rem' : '0'
              }}
            >
              <div className="space-y-3">
                {/* Header with ranking */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 group-hover/finding:scale-110 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700 group-hover/finding:bg-yellow-200' :
                      index === 1 ? 'bg-gray-100 text-gray-700 group-hover/finding:bg-gray-200' :
                      'bg-orange-100 text-orange-700 group-hover/finding:bg-orange-200'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-primary-text truncate group-hover/finding:text-primary transition-colors duration-300">
                      {finding.title}
                    </h4>
                    <p className="text-sm text-secondary-text mt-1 group-hover/finding:text-primary-text transition-colors duration-300">
                      {truncateContent(finding.content)}
                    </p>
                  </div>
                </div>

                {/* Meta information */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-secondary-text group-hover/finding:text-primary transition-colors duration-300" />
                      <span className="text-secondary-text group-hover/finding:text-primary-text transition-colors duration-300">
                        {getAuthorName(finding)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-secondary-text group-hover/finding:text-primary transition-colors duration-300" />
                      <span className="text-secondary-text group-hover/finding:text-primary-text transition-colors duration-300">
                        {formatDate(finding.created_at)}
                      </span>
                    </div>
                    {finding.share_data && (
                      <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 group-hover/finding:bg-blue-50 transition-colors duration-300">
                        Data
                      </Badge>
                    )}
                  </div>

                  {/* Vote summary */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <ChevronUp className="w-3 h-3 text-green-600 group-hover/finding:scale-110 transition-transform duration-300" />
                      <span className="text-secondary-text group-hover/finding:text-primary-text transition-colors duration-300">{finding.upvotes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChevronDown className="w-3 h-3 text-red-600 group-hover/finding:scale-110 transition-transform duration-300" />
                      <span className="text-secondary-text group-hover/finding:text-primary-text transition-colors duration-300">{finding.downvotes}</span>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded transition-all duration-300 group-hover/finding:scale-105 ${
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewCommunity}
                className="text-white hover:bg-white/10"
              >
                +{findings.length - 3} more finding{findings.length - 3 !== 1 ? 's' : ''}
              </Button>
            </div>
          )}

          {/* Trending insights footer */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewCommunity}
              className="w-full bg-white hover:bg-[#cdc1db] border border-[#4a2a6d] transition-colors duration-200"
              style={{ color: '#4a2a6d' }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Discover More Insights
            </Button>
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
</invoke>