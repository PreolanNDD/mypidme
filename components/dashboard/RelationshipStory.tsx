'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
          icon: <TrendingUp className="w-4 h-4 text-green-600" />
        };
      case 'negative':
        return {
          image: '/images/relationship_neg.webp',
          headline: "It's a See-Saw Effect",
          description: `This means that when ${comparisonMetricName} goes up, ${primaryMetricName} tends to go down.`,
          icon: <TrendingDown className="w-4 h-4 text-red-600" />
        };
      case 'neutral':
      default:
        return {
          image: '/images/relationship_neut.webp',
          headline: 'No Clear Pattern',
          description: "There doesn't appear to be a consistent relationship between these two metrics in the selected period.",
          icon: <Minus className="w-4 h-4 text-gray-500" />
        };
    }
  };

  const content = getContent();

  // Get strength color
  const getStrengthColor = () => {
    switch (connectionStrength) {
      case 'Strong':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Weak':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            {content.icon}
          </div>
          <h3 className="font-heading text-lg text-primary-text">Relationship Story</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image and Content */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Relationship Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 relative rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={content.image}
                alt={content.headline}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 128px, 128px"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-heading text-xl text-primary-text mb-3">
              {content.headline}
            </h4>
            <p className="text-secondary-text leading-relaxed mb-4">
              {content.description}
            </p>
            
            {/* Connection Strength */}
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="text-sm font-medium text-primary-text">
                Connection Strength:
              </span>
              <Badge 
                variant="outline" 
                className={`text-sm ${getStrengthColor()}`}
              >
                {connectionStrength}
              </Badge>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-primary-text">
              Correlation Score:
            </span>
            <span className="font-mono text-secondary-text">
              {correlationScore.toFixed(3)}
            </span>
          </div>
          <div className="mt-2 text-xs text-secondary-text">
            Scores range from -1.0 (perfect negative correlation) to +1.0 (perfect positive correlation)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}