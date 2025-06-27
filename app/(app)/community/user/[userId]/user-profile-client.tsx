'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { CommunityFinding } from '@/lib/community';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, MessageSquare, ChevronUp, ChevronDown, Sparkles, BarChart3, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);

  // Add animation delay for initial load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  // Calculate stats
  const totalFindings = userFindings.length;
  const totalUpvotes = userFindings.reduce((sum, finding) => sum + finding.upvotes, 0);
  const totalScore = userFindings.reduce((sum, finding) => sum + (finding.upvotes - finding.downvotes), 0);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Page Header - Enhanced with animations */}
          <div className={`flex items-center space-x-3 mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </Button>
            
            {/* User Profile Header */}
            <div className="flex items-start space-x-4 group/profile">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-500 group-hover/profile:scale-110 group-hover/profile:rotate-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="font-heading text-3xl text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent transition-all duration-300 group-hover/profile:tracking-wider">
                  {displayName}
                  {isOwnProfile && (
                    <span className="text-lg ml-2" style={{ color: '#e6e2eb' }}>(You)</span>
                  )}
                </h1>
                <div className="flex items-center space-x-4 text-sm" style={{ color: '#e6e2eb' }}>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatJoinDate(userProfile.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Enhanced with animations */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 hover:-translate-y-2 group/findings">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 mx-auto mb-3 transition-all duration-500 group-hover/findings:scale-110 group-hover/findings:rotate-6">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover/findings:scale-110">{totalFindings}</div>
                <div className="text-sm text-secondary-text transition-all duration-300 group-hover/findings:text-purple-700">
                  Finding{totalFindings !== 1 ? 's' : ''} Published
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 hover:-translate-y-2 group/upvotes">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 mx-auto mb-3 transition-all duration-500 group-hover/upvotes:scale-110 group-hover/upvotes:rotate-6">
                  <ChevronUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2 transition-all duration-300 group-hover/upvotes:scale-110 group-hover/upvotes:text-green-700">{totalUpvotes}</div>
                <div className="text-sm text-secondary-text transition-all duration-300 group-hover/upvotes:text-green-700">Total Upvotes</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 hover:-translate-y-2 group/score">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg transition-all duration-500 group-hover/score:scale-110 group-hover/score:rotate-6 ${
                  totalScore >= 0 
                    ? 'bg-gradient-to-br from-green-400 to-teal-500 shadow-green-500/20' 
                    : 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-500/20'
                }`}>
                  {totalScore >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-white" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className={`text-3xl font-bold mb-2 transition-all duration-300 group-hover/score:scale-110 ${totalScore >= 0 ? 'text-green-600 group-hover/score:text-green-700' : 'text-red-600 group-hover/score:text-red-700'}`}>
                  {totalScore > 0 ? '+' : ''}{totalScore}
                </div>
                <div className="text-sm text-secondary-text transition-all duration-300 group-hover/score:text-gray-700">Total Score</div>
              </CardContent>
            </Card>
          </div>

          {/* Findings Section - Enhanced with animations */}
          <div className={`space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {isOwnProfile ? 'Your Findings' : `${displayName}'s Findings`}
              </h2>
              <div className="text-sm px-3 py-1 bg-white/10 rounded-full" style={{ color: '#e6e2eb' }}>
                {totalFindings} finding{totalFindings !== 1 ? 's' : ''}
              </div>
            </div>

            {userFindings.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 transition-all duration-500 hover:shadow-3xl hover:shadow-white/20 group/empty">
                <CardContent className="text-center py-16 px-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover/empty:scale-110 group-hover/empty:rotate-12 group-hover/empty:shadow-xl">
                    <MessageSquare className="w-12 h-12 text-purple-400 transition-all duration-500 group-hover/empty:text-indigo-500" />
                  </div>
                  <h3 className="font-heading text-2xl text-primary-text mb-4 transition-all duration-500 group-hover/empty:scale-105 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {isOwnProfile ? 'No Findings Yet' : 'No Findings Published'}
                  </h3>
                  <p className="text-secondary-text mb-8 max-w-lg mx-auto text-lg">
                    {isOwnProfile 
                      ? "You haven't published any findings yet. Share your insights from the Data or Lab pages!"
                      : "This user hasn't published any findings yet."
                    }
                  </p>
                  {isOwnProfile && (
                    <Button 
                      onClick={() => router.push('/community/new')}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 px-8 py-3 text-lg"
                    >
                      Create Your First Finding
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover/empty:translate-x-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userFindings.map((finding, index) => {
                  const score = finding.upvotes - finding.downvotes;
                  const isHovered = hoveredFindingId === finding.id;

                  return (
                    <div 
                      key={finding.id} 
                      className="group/finding relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl cursor-pointer border border-white/20 transition-all duration-500 hover:transform hover:-translate-y-3 hover:shadow-3xl hover:shadow-white/20 hover:z-10"
                      style={{ transitionDelay: `${index * 100}ms` }}
                      onMouseEnter={() => setHoveredFindingId(finding.id)}
                      onMouseLeave={() => setHoveredFindingId(null)}
                      onClick={() => router.push(`/community/${finding.id}`)}
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
                              {finding.status !== 'visible' && (
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
                        <div className="flex items-center space-x-4 pt-3 border-t border-gray-100 group-hover/finding:border-purple-100 transition-colors duration-300">
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
              </div>
            )}
          </div>
        </div>
      </div>
      
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
    </div>
  );
}