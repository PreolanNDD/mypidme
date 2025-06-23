'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommunityFindings, getUserFindings, getUserVotes } from '@/lib/community';
import { castVoteAction, reportFindingAction } from '@/lib/actions/community-actions';
import { CommunityFinding, FindingVote } from '@/lib/community';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronUp, ChevronDown, Flag, User, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  loading: boolean;
}

function ReportDialog({ isOpen, onClose, onSubmit, loading }: ReportDialogProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
    setReason('');
  };

  const handleClose = () => {
    if (loading) return;
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-primary-text">
            Report Finding
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary-text">
              Reason for reporting (optional)
            </Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why you're reporting this finding..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CommunityFeedProps {
  activeTab: 'community' | 'my-findings';
}

export function CommunityFeed({ activeTab }: CommunityFeedProps) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reportingFindingId, setReportingFindingId] = useState<string | null>(null);

  // Fetch community findings (visible only)
  const { data: communityFindings = [], isLoading: loadingCommunity } = useQuery<CommunityFinding[]>({
    queryKey: ['communityFindings'],
    queryFn: () => getCommunityFindings(),
    enabled: activeTab === 'community',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch user's personal findings (all statuses)
  const { data: userFindings = [], isLoading: loadingUser } = useQuery<CommunityFinding[]>({
    queryKey: ['userFindings', user?.id],
    queryFn: () => getUserFindings(user!.id),
    enabled: activeTab === 'my-findings' && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Determine which findings to display
  const findings = activeTab === 'community' ? communityFindings : userFindings;
  const isLoading = activeTab === 'community' ? loadingCommunity : loadingUser;

  // Fetch user votes for all findings
  const findingIds = useMemo(() => findings.map(f => f.id), [findings]);
  const { data: userVotes = [] } = useQuery<FindingVote[]>({
    queryKey: ['userVotes', user?.id, findingIds],
    queryFn: () => getUserVotes(user!.id, findingIds),
    enabled: !!user?.id && findingIds.length > 0 && activeTab === 'community',
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Create a map of finding ID to user's vote
  const userVoteMap = useMemo(() => {
    const map = new Map<string, 'upvote' | 'downvote'>();
    userVotes.forEach(vote => {
      map.set(vote.finding_id, vote.vote_type);
    });
    return map;
  }, [userVotes]);

  // Optimistic vote mutation with immediate UI updates
  const voteMutation = useMutation({
    mutationFn: async ({ findingId, voteType }: { findingId: string; voteType: 'upvote' | 'downvote' }) => {
      // Call the server action
      const result = await castVoteAction(user!.id, findingId, voteType);
      if (result?.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async ({ findingId, voteType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['communityFindings'] });
      await queryClient.cancelQueries({ queryKey: ['userVotes', user?.id] });

      // Snapshot the previous values
      const previousFindings = queryClient.getQueryData<CommunityFinding[]>(['communityFindings']);
      const previousVotes = queryClient.getQueryData<FindingVote[]>(['userVotes', user?.id, findingIds]);

      // Get current user vote for this finding
      const currentVote = userVoteMap.get(findingId);

      // Optimistically update the findings
      if (previousFindings) {
        const updatedFindings = previousFindings.map(finding => {
          if (finding.id === findingId) {
            let newUpvotes = finding.upvotes;
            let newDownvotes = finding.downvotes;

            // Handle vote logic
            if (currentVote === voteType) {
              // User clicked same vote - remove it
              if (voteType === 'upvote') {
                newUpvotes = Math.max(0, newUpvotes - 1);
              } else {
                newDownvotes = Math.max(0, newDownvotes - 1);
              }
            } else if (currentVote) {
              // User clicked different vote - switch it
              if (currentVote === 'upvote') {
                newUpvotes = Math.max(0, newUpvotes - 1);
                newDownvotes = newDownvotes + 1;
              } else {
                newDownvotes = Math.max(0, newDownvotes - 1);
                newUpvotes = newUpvotes + 1;
              }
            } else {
              // No previous vote - add new vote
              if (voteType === 'upvote') {
                newUpvotes = newUpvotes + 1;
              } else {
                newDownvotes = newDownvotes + 1;
              }
            }

            return {
              ...finding,
              upvotes: newUpvotes,
              downvotes: newDownvotes
            };
          }
          return finding;
        });

        queryClient.setQueryData(['communityFindings'], updatedFindings);
      }

      // Optimistically update the user votes
      if (previousVotes) {
        const updatedVotes = previousVotes.filter(vote => vote.finding_id !== findingId);
        
        // Add new vote if it's different from current or if no current vote
        if (currentVote !== voteType) {
          updatedVotes.push({
            id: `temp-${Date.now()}`,
            user_id: user!.id,
            finding_id: findingId,
            vote_type: voteType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        queryClient.setQueryData(['userVotes', user?.id, findingIds], updatedVotes);
      }

      // Return a context object with the previous values
      return { previousFindings, previousVotes };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFindings) {
        queryClient.setQueryData(['communityFindings'], context.previousFindings);
      }
      if (context?.previousVotes) {
        queryClient.setQueryData(['userVotes', user?.id, findingIds], context.previousVotes);
      }
      
      // Show error message
      alert(`Failed to cast vote: ${err.message}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['communityFindings'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes', user?.id] });
    },
  });

  // Report mutation using Server Action
  const reportMutation = useMutation({
    mutationFn: ({ findingId, reason }: { findingId: string; reason: string }) =>
      reportFindingAction(user!.id, findingId, reason),
    onSuccess: () => {
      setReportingFindingId(null);
      alert('Finding reported successfully. Thank you for helping keep our community safe.');
    },
    onError: (error: any) => {
      alert(`Failed to report finding: ${error.message}`);
    },
  });

  const handleVote = (findingId: string, voteType: 'upvote' | 'downvote') => {
    if (!user || activeTab !== 'community') {
      return;
    }
    
    voteMutation.mutate({ findingId, voteType });
  };

  const handleReport = (findingId: string) => {
    setReportingFindingId(findingId);
  };

  const handleSubmitReport = (reason: string) => {
    if (!reportingFindingId || !user) return;
    reportMutation.mutate({ findingId: reportingFindingId, reason });
  };

  const handleAuthorClick = (e: React.MouseEvent, authorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/community/user/${authorId}`);
  };

  // Prefetch finding details on hover for faster navigation
  const handleFindingHover = (findingId: string) => {
    // Prefetch the finding detail data
    queryClient.prefetchQuery({
      queryKey: ['communityFinding', findingId],
      queryFn: async () => {
        // Import the function dynamically to avoid circular dependencies
        const { getCommunityFindingById } = await import('@/lib/community');
        return getCommunityFindingById(findingId);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Optimistic navigation with immediate UI feedback
  const handleFindingClick = (findingId: string) => {
    // Pre-populate the cache with the current finding data for instant loading
    const currentFinding = findings.find(f => f.id === findingId);
    if (currentFinding) {
      queryClient.setQueryData(['communityFinding', findingId], currentFinding);
    }
    
    // Navigate immediately
    router.push(`/community/${findingId}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAuthorName = (finding: CommunityFinding) => {
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visible':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Published</Badge>;
      case 'hidden_by_community':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Hidden by Community</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
        <CardContent className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-heading text-xl text-primary-text mb-2">
            {activeTab === 'community' ? 'No Community Findings Yet' : 'No Findings Yet'}
          </h3>
          <p className="text-secondary-text">
            {activeTab === 'community' 
              ? 'Be the first to share your insights with the community!'
              : 'You haven\'t submitted any findings yet. Share your insights from the Data or Lab pages!'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {findings.map((finding, index) => {
          const userVote = userVoteMap.get(finding.id);
          const score = finding.upvotes - finding.downvotes;
          const authorName = getAuthorName(finding);

          return (
            <Card 
              key={finding.id} 
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 cursor-pointer"
              onMouseEnter={() => handleFindingHover(finding.id)}
              onClick={() => handleFindingClick(finding.id)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-heading text-xl text-primary-text hover:text-primary transition-colors flex-1">
                          {finding.title}
                        </h3>
                        {/* Status badge - only show in My Findings view */}
                        {activeTab === 'my-findings' && getStatusBadge(finding.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-secondary-text">
                        {/* Only show author info in community view */}
                        {activeTab === 'community' && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span 
                              className="hover:text-primary transition-colors cursor-pointer"
                              onClick={(e) => handleAuthorClick(e, finding.author_id)}
                            >
                              {authorName}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(finding.created_at)}</span>
                        </div>
                        {finding.share_data && (
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            Data Shared
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-secondary-text hover:text-primary transition-colors flex-shrink-0 ml-4" />
                  </div>

                  {/* Content Preview */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-primary-text leading-relaxed">
                      {truncateContent(finding.content)}
                    </p>
                  </div>

                  {/* Actions - Outside the link to prevent nested interactive elements */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                    {/* Voting - only show in community view */}
                    {activeTab === 'community' && (
                      <div className="flex items-center space-x-2">
                        {/* Upvote */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleVote(finding.id, 'upvote');
                          }}
                          disabled={!user}
                          className={`flex items-center space-x-1 transition-all duration-200 ${
                            userVote === 'upvote' 
                              ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                              : 'text-secondary-text hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>

                        {/* Score */}
                        <div className="px-2 py-1 text-sm font-medium text-primary-text min-w-[3rem] text-center">
                          {score > 0 ? '+' : ''}{score}
                        </div>

                        {/* Downvote */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleVote(finding.id, 'downvote');
                          }}
                          disabled={!user}
                          className={`flex items-center space-x-1 transition-all duration-200 ${
                            userVote === 'downvote' 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                              : 'text-secondary-text hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* My Findings view - show score without voting */}
                    {activeTab === 'my-findings' && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-sm text-secondary-text">
                          <ChevronUp className="w-4 h-4 text-green-600" />
                          <span>{finding.upvotes}</span>
                        </div>
                        <div className="px-2 py-1 text-sm font-medium text-primary-text">
                          {score > 0 ? '+' : ''}{score}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-secondary-text">
                          <ChevronDown className="w-4 h-4 text-red-600" />
                          <span>{finding.downvotes}</span>
                        </div>
                      </div>
                    )}

                    {/* Report Button - only show in community view for other users' posts */}
                    {activeTab === 'community' && user && user.id !== finding.author_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReport(finding.id);
                        }}
                        disabled={reportMutation.isPending}
                        className="text-secondary-text hover:text-red-600 hover:bg-red-50"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={!!reportingFindingId}
        onClose={() => setReportingFindingId(null)}
        onSubmit={handleSubmitReport}
        loading={reportMutation.isPending}
      />
    </>
  );
}