'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCommunityFindings, getUserFindings, getUserVotes } from '@/lib/community';
import { castVoteAction, reportFindingAction } from '@/lib/actions/community-actions';
import { CommunityFinding, FindingVote } from '@/lib/community';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronUp, ChevronDown, Flag, User, Calendar, MessageSquare, ArrowRight, Sparkles, BarChart3, Share2, Plus } from 'lucide-react';
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-400/20">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-heading text-xl text-primary-text bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              Report Finding
            </DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary-text">
              Reason for reporting (optional)
            </Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why you're reporting this finding..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all duration-300"
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02]"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white border-none transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02]"
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);

  // Add animation delay for initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Fetch community findings with aggressive caching
  const { data: communityFindings = [], isLoading: loadingCommunity } = useQuery<CommunityFinding[]>({
    queryKey: ['communityFindings'],
    queryFn: () => getCommunityFindings(),
    enabled: activeTab === 'community',
    staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnMount: false, // Don't refetch if we have cached data
    refetchOnWindowFocus: false,
  });

  // Fetch user's personal findings with aggressive caching
  const { data: userFindings = [], isLoading: loadingUser } = useQuery<CommunityFinding[]>({
    queryKey: ['userFindings', user?.id],
    queryFn: () => getUserFindings(user!.id),
    enabled: activeTab === 'my-findings' && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Determine which findings to display
  const findings = activeTab === 'community' ? communityFindings : userFindings;
  const isLoading = activeTab === 'community' ? loadingCommunity : loadingUser;

  // Fetch user votes for all findings with caching
  const findingIds = useMemo(() => findings.map(f => f.id), [findings]);
  const { data: userVotes = [] } = useQuery<FindingVote[]>({
    queryKey: ['userVotes', user?.id, findingIds],
    queryFn: () => getUserVotes(user!.id, findingIds),
    enabled: !!user?.id && findingIds.length > 0 && activeTab === 'community',
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
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

  // Enhanced prefetch finding details on hover for faster navigation
  const handleFindingHover = (findingId: string) => {
    setHoveredFindingId(findingId);
    
    // Prefetch the finding detail data with longer cache time
    queryClient.prefetchQuery({
      queryKey: ['communityFinding', findingId],
      queryFn: async () => {
        // Import the function dynamically to avoid circular dependencies
        const { getCommunityFindingById } = await import('@/lib/community');
        return getCommunityFindingById(findingId);
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes
    });

    // Also prefetch related data that might be needed
    if (user?.id) {
      queryClient.prefetchQuery({
        queryKey: ['trackableItems', user.id],
        queryFn: async () => {
          const { getTrackableItems } = await import('@/lib/trackable-items');
          return getTrackableItems(user.id);
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      });
    }
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

  const handleNewFinding = () => {
    router.push('/community/new');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAuthorName = (finding: CommunityFinding) => {
    if (!finding.author) {
      return 'Anonymous';
    }

    const { first_name, last_name } = finding.author;
    
    // Handle different name combinations
    if (first_name && last_name) {
      const fullName = `${first_name.trim()} ${last_name.trim()}`;
      return fullName;
    } else if (first_name) {
      const firstName = first_name.trim();
      return firstName;
    } else if (last_name) {
      const lastName = last_name.trim();
      return lastName;
    }
    
    return 'Anonymous';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visible':
        return <Badge className="bg-green-100 text-green-800 border-green-300 shadow-sm">Published</Badge>;
      case 'hidden_by_community':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300 shadow-sm">Hidden by Community</Badge>;
      default:
        return null;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${i * 150}ms` }}>
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (findings.length === 0) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:shadow-3xl hover:shadow-white/20 group/empty`}>
        <div className="text-center py-16 px-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover/empty:scale-110 group-hover/empty:rotate-12 group-hover/empty:shadow-xl">
            <MessageSquare className="w-12 h-12 text-purple-400 transition-all duration-500 group-hover/empty:text-indigo-500" />
          </div>
          <h3 className="font-heading text-2xl text-primary-text mb-4 transition-all duration-500 group-hover/empty:scale-105 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {activeTab === 'community' ? 'No Community Findings Yet' : 'No Findings Yet'}
          </h3>
          <p className="text-secondary-text mb-8 max-w-lg mx-auto text-lg">
            {activeTab === 'community' 
              ? 'Be the first to share your insights with the community!'
              : 'You haven\'t submitted any findings yet. Share your insights from the Data or Lab pages!'
            }
          </p>
          {activeTab === 'my-findings' && (
            <button
              onClick={handleNewFinding}
              className="group/create relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              {/* Animated background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/create:opacity-100 transition-opacity duration-500"></div>
              
              {/* Sliding highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/create:translate-x-full transition-transform duration-700 ease-out"></div>
              
              {/* Content */}
              <div className="relative flex items-center justify-center space-x-3">
                {/* Icon with bounce animation */}
                <div className="transform group-hover/create:scale-110 group-hover/create:rotate-12 transition-transform duration-300">
                  <Plus className="w-6 h-6" />
                </div>
                
                {/* Text with enhanced styling */}
                <span className="tracking-wide group-hover/create:tracking-wider transition-all duration-300">
                  Create Your First Finding
                </span>
              </div>
              
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/create:opacity-100 group-hover/create:scale-110 transition-all duration-500"></div>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {findings.map((finding, index) => {
          const userVote = userVoteMap.get(finding.id);
          const score = finding.upvotes - finding.downvotes;
          const authorName = getAuthorName(finding);
          const isHovered = hoveredFindingId === finding.id;

          return (
            <div 
              key={finding.id} 
              className={`group/finding relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => handleFindingHover(finding.id)}
              onMouseLeave={() => setHoveredFindingId(null)}
              onClick={() => handleFindingClick(finding.id)}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-indigo-400/20 opacity-0 group-hover/finding:opacity-100 transition-opacity duration-500 blur-sm"></div>
              
              <div className="relative p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-xl text-primary-text group-hover/finding:text-purple-700 transition-colors duration-300 leading-tight mb-3">
                      {finding.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Only show author info in community view */}
                      {activeTab === 'community' && (
                        <div 
                          className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-purple-50 group-hover/finding:shadow-sm cursor-pointer"
                          onClick={(e) => handleAuthorClick(e, finding.author_id)}
                        >
                          <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-medium text-secondary-text group-hover/finding:text-purple-700 transition-colors duration-300">
                            {authorName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full transition-all duration-300 group-hover/finding:bg-blue-50 group-hover/finding:shadow-sm">
                        <Calendar className="w-3 h-3 text-secondary-text group-hover/finding:text-blue-600 transition-colors duration-300" />
                        <span className="text-xs text-secondary-text group-hover/finding:text-blue-700 transition-colors duration-300">
                          {formatDate(finding.created_at)}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${score > 0 ? 'bg-green-50 text-green-700 border-green-300' : score < 0 ? 'bg-red-50 text-red-700 border-red-300' : 'bg-gray-50 text-gray-700 border-gray-300'} group-hover/finding:scale-105 transition-all duration-300`}>
                        Score: {score > 0 ? '+' : ''}{score}
                      </Badge>
                      {finding.share_data && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300 group-hover/finding:scale-105 transition-all duration-300">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Data Shared
                        </Badge>
                      )}
                      {activeTab === 'my-findings' && finding.status !== 'visible' && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300 group-hover/finding:scale-105 transition-all duration-300">
                          {finding.status === 'hidden_by_community' ? 'Hidden' : finding.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="transform group-hover/finding:translate-x-1 transition-all duration-300 ml-4">
                    <ArrowRight className="w-5 h-5 text-secondary-text group-hover/finding:text-purple-600 transition-colors duration-300" />
                  </div>
                </div>

                {/* Content Preview */}
                <div className="prose prose-sm max-w-none">
                  <p className="text-primary-text leading-relaxed group-hover/finding:text-gray-700 transition-colors duration-300">
                    {truncateContent(finding.content)}
                  </p>
                </div>

                {/* Vote Summary */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 group-hover/finding:border-purple-100 transition-colors duration-300">
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
                        } hover:scale-110`}
                      >
                        <ChevronUp className="w-4 h-4" />
                        <span className="font-medium">{finding.upvotes}</span>
                      </Button>

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
                        } hover:scale-110`}
                      >
                        <ChevronDown className="w-4 h-4" />
                        <span className="font-medium">{finding.downvotes}</span>
                      </Button>
                      
                      {/* Score */}
                      <div className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                        score > 0 ? 'bg-green-100 text-green-700' :
                        score < 0 ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      } group-hover/finding:scale-105`}>
                        Score: {score > 0 ? '+' : ''}{score}
                      </div>
                    </div>
                  )}

                  {/* My Findings view - show score without voting */}
                  {activeTab === 'my-findings' && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center group-hover/finding:bg-green-200 transition-all duration-300">
                          <ChevronUp className="w-3 h-3 text-green-600" />
                        </div>
                        <span>{finding.upvotes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-secondary-text">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center group-hover/finding:bg-red-200 transition-all duration-300">
                          <ChevronDown className="w-3 h-3 text-red-600" />
                        </div>
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
                      className="text-secondary-text hover:text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-110"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* Share Button - only show in my-findings view */}
                  {activeTab === 'my-findings' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Copy share link to clipboard
                          navigator.clipboard.writeText(`${window.location.origin}/community/${finding.id}`);
                          alert('Share link copied to clipboard!');
                        }}
                        className="text-secondary-text hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Sparkle effect on hover */}
                {isHovered && (
                  <div className="absolute top-3 right-3">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Create New Finding button for My Findings tab */}
        {activeTab === 'my-findings' && findings.length > 0 && (
          <button
            onClick={handleNewFinding}
            className="group/create relative overflow-hidden w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-white font-medium text-base shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            {/* Animated background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover/create:opacity-100 transition-opacity duration-500"></div>
            
            {/* Sliding highlight effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/create:translate-x-full transition-transform duration-700 ease-out"></div>
            
            {/* Content */}
            <div className="relative flex items-center justify-center space-x-3">
              {/* Icon with bounce animation */}
              <div className="transform group-hover/create:scale-110 group-hover/create:rotate-12 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>
              
              {/* Text with enhanced styling */}
              <span className="tracking-wide group-hover/create:tracking-wider transition-all duration-300">
                Create New Finding
              </span>
            </div>
            
            {/* Pulse ring effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/create:opacity-100 group-hover/create:scale-110 transition-all duration-500"></div>
          </button>
        )}
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={!!reportingFindingId}
        onClose={() => setReportingFindingId(null)}
        onSubmit={handleSubmitReport}
        loading={reportMutation.isPending}
      />
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}