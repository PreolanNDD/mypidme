'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface RelationshipStoryProps {
  correlationScore: number;
  primaryMetricName: string;
  comparisonMetricName: string;
}

export function RelationshipStory({ 
  correlationScore, 
  primaryMetricName, 
  comparisonMetricName 
}: RelationshipStoryProps) {
  // Determine the relationship type based on correlation score
  const getRelationshipType = (score: number) => {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  };

  // Determine connection strength
  const getConnectionStrength = (score: number): string => {
    const absScore = Math.abs(score);
    if (absScore > 0.6) return 'Strong';
    if (absScore >= 0.3) return 'Moderate';
    return 'Weak';
  };

  const relationshipType = getRelationshipType(correlationScore);
  const connectionStrength = getConnectionStrength(correlationScore);

  // Get the appropriate content based on relationship type
  const getContent = () => {
    switch (relationshipType) {
      case 'positive':
        return {
          image: '/images/relationship_pos.webp',
          headline: 'They Move in Sync',
          description: `This means that when ${comparisonMetricName} goes up, ${primaryMetricName} also tends to go up.`,
          icon: <TrendingUp className="w-5 h-5 text-white" />
        };
      case 'negative':
        return {
          image: '/images/relationship_neg.webp',
          headline: "It's a See-Saw Effect",
          description: `This means that when ${comparisonMetricName} goes up, ${primaryMetricName} tends to go down.`,
          icon: <TrendingDown className="w-5 h-5 text-white" />
        };
      case 'neutral':
      default:
        return {
          image: '/images/relationship_neut.webp',
          headline: 'No Clear Pattern',
          description: "There doesn't appear to be a consistent relationship between these two metrics in the selected period.",
          icon: <Minus className="w-5 h-5 text-white" />
        };
    }
  };

  const content = getContent();

  // Get strength color
  const getStrengthColor = () => {
    switch (connectionStrength) {
      case 'Strong':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm shadow-green-200/50';
      case 'Moderate':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-sm shadow-yellow-200/50';
      case 'Weak':
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-sm shadow-gray-200/50';
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            {content.icon}
          </div>
          <h3 className="font-heading text-2xl text-primary-text bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
            Relationship Story
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Image and Content */}
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-lg hover:border-purple-100 group/content">
          {/* Relationship Image - Enhanced with animations */}
          <div className="flex-shrink-0 transition-all duration-500 group-hover/content:scale-105 group-hover/content:rotate-2">
            <div className="w-56 h-40 relative rounded-xl overflow-hidden bg-gray-100 shadow-md transition-all duration-500 group-hover/content:shadow-xl">
              <Image
                src={content.image}
                alt={content.headline}
                fill
                className="object-cover transition-all duration-700 group-hover/content:scale-110"
                sizes="(max-width: 768px) 224px, 224px"
              />
              <div className="absolute top-2 right-2">
                <Sparkles className="w-5 h-5 text-white drop-shadow-md animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content - Enhanced with animations */}
          <div className="flex-1 text-center md:text-left transition-all duration-500 group-hover/content:translate-x-2">
            <h4 className="font-heading text-2xl text-primary-text mb-3 transition-all duration-500 group-hover/content:text-purple-700">
              {content.headline}
            </h4>
            <p className="text-secondary-text leading-relaxed mb-4 text-lg transition-all duration-500 group-hover/content:text-gray-700">
              {content.description}
            </p>
            
            {/* Connection Strength - Enhanced with animations */}
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <span className="text-base font-medium text-primary-text transition-all duration-500 group-hover/content:text-purple-700">
                Connection Strength:
              </span>
              <Badge 
                variant="outline" 
                className={`text-base px-3 py-1 transition-all duration-500 hover:scale-105 ${getStrengthColor()}`}
              >
                {connectionStrength}
              </Badge>
            </div>
            
            {/* Correlation Score - Added for more detail */}
            <div className="mt-3 text-sm text-gray-500 transition-all duration-500 group-hover/content:text-gray-700">
              Correlation Score: <span className="font-mono font-medium">{correlationScore.toFixed(3)}</span>
              <span className="ml-2 text-xs text-gray-400">(-1.0 to +1.0 scale)</span>
            </div>
          </div>
        </div>
        
        {/* Additional Explanation Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm transition-all duration-500 hover:shadow-md hover:border-blue-200 group/explanation">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md shadow-blue-400/20 flex-shrink-0 mt-1 transition-all duration-500 group-hover/explanation:scale-110 group-hover/explanation:rotate-12">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 transition-all duration-500 group-hover/explanation:translate-x-1">
              <h5 className="font-medium text-blue-900 mb-2 transition-all duration-500 group-hover/explanation:text-indigo-700">
                What This Means For You
              </h5>
              <p className="text-blue-800 text-sm leading-relaxed transition-all duration-500 group-hover/explanation:text-indigo-800">
                {relationshipType === 'positive' ? (
                  <>
                    Your data suggests that <span className="font-medium">{comparisonMetricName}</span> may have a positive influence on <span className="font-medium">{primaryMetricName}</span>. 
                    Consider prioritizing this habit to potentially improve your results.
                  </>
                ) : relationshipType === 'negative' ? (
                  <>
                    Your data suggests that <span className="font-medium">{comparisonMetricName}</span> may have an inverse relationship with <span className="font-medium">{primaryMetricName}</span>. 
                    You might want to experiment with adjusting this habit to see if it affects your results.
                  </>
                ) : (
                  <>
                    Your data doesn't show a clear relationship between <span className="font-medium">{comparisonMetricName}</span> and <span className="font-medium">{primaryMetricName}</span>. 
                    Consider tracking for longer or exploring other habits that might have a stronger influence.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}