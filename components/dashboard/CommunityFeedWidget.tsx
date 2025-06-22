'use client';

import React from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommunityFindings } from '@/lib/community';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-heading text-lg text-primary-text">Community Insights</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-primary-text">Community Insights</h3>
              <p className="text-sm text-secondary-text">Top discoveries from the community</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewCommunity}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {topFindings.length === 0 ? (
          // No findings available
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-heading text-lg text-primary-text mb-2">
              No Community Findings Yet
            </h4>
            <p className="text-secondary-text text-sm mb-6 max-w-sm mx-auto">
              Be the first to share your insights and discoveries with the community!
            </p>
            <Button onClick={handleViewCommunity} className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              Explore Community
            </Button>
          </div>
        ) : (
          // Show top findings
          <div className="space-y-4">
            {topFindings.map((finding, index) => (
              <div 
                key={finding.id} 
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => handleFindingClick(finding.id)}
              >
                <div className="space-y-3">
                  {/* Header with ranking */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-primary-text truncate group-hover:text-primary transition-colors">
                        {finding.title}
                      </h4>
                      <p className="text-sm text-secondary-text mt-1">
                        {truncateContent(finding.content)}
                      </p>
                    </div>
                  </div>

                  {/* Meta information */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-secondary-text" />
                        <span className="text-secondary-text">
                          {getAuthorName(finding)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-secondary-text" />
                        <span className="text-secondary-text">
                          {formatDate(finding.created_at)}
                        </span>
                      </div>
                      {finding.share_data && (
                        <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                          Data
                        </Badge>
                      )}
                    </div>

                    {/* Vote summary */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <ChevronUp className="w-3 h-3 text-green-600" />
                        <span className="text-secondary-text">{finding.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChevronDown className="w-3 h-3 text-red-600" />
                        <span className="text-secondary-text">{finding.downvotes}</span>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        finding.score > 0 ? 'bg-green-100 text-green-700' :
                        finding.score < 0 ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
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
                  className="text-primary hover:text-primary/80"
                >
                  +{findings.length - 3} more finding{findings.length - 3 !== 1 ? 's' : ''}
                </Button>
              </div>
            )}

            {/* Trending insights footer */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewCommunity}
                className="w-full"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Discover More Insights
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}