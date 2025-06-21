'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { CommunityFinding } from '@/lib/community';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface UserProfileClientProps {
  userProfile: UserProfile;
  userFindings: CommunityFinding[];
}

export function UserProfileClient({ userProfile, userFindings }: UserProfileClientProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  console.log('🎨 [UserProfileClient] === CLIENT COMPONENT RENDERED ===');
  console.log('🎨 [UserProfileClient] Props received:', {
    userProfile: {
      id: userProfile.id,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      created_at: userProfile.created_at
    },
    userFindingsCount: userFindings.length,
    userFindingsData: userFindings.map(f => ({
      id: f.id,
      title: f.title,
      status: f.status,
      upvotes: f.upvotes,
      downvotes: f.downvotes,
      created_at: f.created_at
    })),
    currentUserId: currentUser?.id,
    timestamp: new Date().toISOString()
  });

  const getDisplayName = (profile: UserProfile) => {
    const { first_name, last_name } = profile;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    } else if (first_name) {
      return first_name;
    } else if (last_name) {
      return last_name;
    }
    return 'Anonymous User';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatJoinDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const displayName = getDisplayName(userProfile);
  const isOwnProfile = currentUser?.id === userProfile.id;

  console.log('🎨 [UserProfileClient] Display calculations:', {
    displayName,
    isOwnProfile,
    currentUserId: currentUser?.id,
    profileUserId: userProfile.id
  });

  // Calculate stats
  const totalFindings = userFindings.length;
  const totalUpvotes = userFindings.reduce((sum, finding) => sum + finding.upvotes, 0);
  const totalScore = userFindings.reduce((sum, finding) => sum + (finding.upvotes - finding.downvotes), 0);

  console.log('📊 [UserProfileClient] Stats calculated:', {
    totalFindings,
    totalUpvotes,
    totalScore,
    findingBreakdown: userFindings.map(f => ({
      id: f.id,
      title: f.title,
      upvotes: f.upvotes,
      downvotes: f.downvotes,
      score: f.upvotes - f.downvotes
    }))
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => {
              console.log('🔙 [UserProfileClient] Back button clicked');
              router.back();
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {/* User Profile Header */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-heading text-3xl text-primary-text mb-2">
                {displayName}
                {isOwnProfile && (
                  <span className="text-lg text-secondary-text ml-2">(You)</span>
                )}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-secondary-text">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatJoinDate(userProfile.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{totalFindings}</div>
                <div className="text-sm text-secondary-text">
                  Finding{totalFindings !== 1 ? 's' : ''} Published
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{totalUpvotes}</div>
                <div className="text-sm text-secondary-text">Total Upvotes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold mb-2 ${totalScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalScore > 0 ? '+' : ''}{totalScore}
                </div>
                <div className="text-sm text-secondary-text">Total Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Findings Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl text-primary-text">
                {isOwnProfile ? 'Your Findings' : `${displayName}'s Findings`}
              </h2>
              <div className="text-sm text-secondary-text">
                {totalFindings} finding{totalFindings !== 1 ? 's' : ''}
              </div>
            </div>

            {userFindings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-heading text-xl text-primary-text mb-2">
                    {isOwnProfile ? 'No Findings Yet' : 'No Findings Published'}
                  </h3>
                  <p className="text-secondary-text">
                    {isOwnProfile 
                      ? "You haven't published any findings yet. Share your insights from the Data or Lab pages!"
                      : "This user hasn't published any findings yet."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userFindings.map((finding, index) => {
                  const score = finding.upvotes - finding.downvotes;

                  console.log(`🎨 [UserProfileClient] Rendering finding ${index + 1}:`, {
                    id: finding.id,
                    title: finding.title,
                    status: finding.status,
                    upvotes: finding.upvotes,
                    downvotes: finding.downvotes,
                    score,
                    share_data: finding.share_data
                  });

                  return (
                    <Card key={finding.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <Link href={`/community/${finding.id}`} className="block">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-heading text-xl text-primary-text hover:text-primary transition-colors mb-2">
                                  {finding.title}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-secondary-text">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(finding.created_at)}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Score: {score > 0 ? '+' : ''}{score}
                                  </Badge>
                                  {finding.share_data && (
                                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                                      Data Shared
                                    </Badge>
                                  )}
                                  {finding.status !== 'visible' && (
                                    <Badge variant="outline" className="text-gray-600 border-gray-300">
                                      {finding.status === 'hidden_by_community' ? 'Hidden' : finding.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Content Preview */}
                            <div className="prose prose-sm max-w-none">
                              <p className="text-primary-text leading-relaxed">
                                {truncateContent(finding.content)}
                              </p>
                            </div>

                            {/* Vote Summary */}
                            <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
                              <div className="flex items-center space-x-2 text-sm text-secondary-text">
                                <ChevronUp className="w-4 h-4 text-green-600" />
                                <span>{finding.upvotes}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-secondary-text">
                                <ChevronDown className="w-4 h-4 text-red-600" />
                                <span>{finding.downvotes}</span>
                              </div>
                              <div className="text-sm font-medium text-primary-text">
                                Score: {score > 0 ? '+' : ''}{score}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}