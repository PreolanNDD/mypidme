'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <Card className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ${className}`}>
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-heading text-xl text-primary-text mb-2">
          {title}
        </h3>
        <p className="text-secondary-text mb-6 max-w-md mx-auto">
          {description}
        </p>
        {action && (
          <Button 
            onClick={action.onClick}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}