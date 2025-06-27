'use client';

import React, { useCallback } from 'react';
import { TrackableItem } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface LogEntryFieldProps {
  item: TrackableItem;
  value: any;
  onChange: (itemId: string, value: any) => void;
}

export function LogEntryField({ item, value, onChange }: LogEntryFieldProps) {
  const handleSliderChange = useCallback((values: number[]) => {
    onChange(item.id, values[0]);
  }, [item.id, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value ? parseFloat(e.target.value) : null;
    onChange(item.id, newValue);
  }, [item.id, onChange]);

  const handleSwitchChange = useCallback((checked: boolean) => {
    onChange(item.id, checked);
  }, [item.id, onChange]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(item.id, e.target.value);
  }, [item.id, onChange]);

  const renderField = () => {
    switch (item.type) {
      case 'SCALE_1_10':
        // Ensure value is a number between 1-10, defaulting to 5 if invalid
        const sliderValue = typeof value === 'number' && !isNaN(value) && value >= 1 && value <= 10 
          ? value 
          : 5;
        
        return (
          <div className="space-y-3 group">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-primary-text group-hover:text-primary transition-colors duration-300">
                {item.name}
              </Label>
              <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-full transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                {sliderValue}
              </span>
            </div>
            <div className="isolate pt-2 pb-4">
              <Slider
                value={[sliderValue]}
                onValueChange={handleSliderChange}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-secondary-text">
              <span className="px-2 py-1 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">1</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300">10</span>
            </div>
          </div>
        );

      case 'NUMERIC':
        const numericValue = value === null || value === undefined ? '' : value;
        return (
          <div className="group">
            <Input
              label={item.name}
              type="number"
              value={numericValue}
              onChange={handleInputChange}
              placeholder="Enter a number"
              className="transition-all duration-300 group-hover:border-primary/50 focus:ring-4 focus:ring-primary/20"
            />
          </div>
        );

      case 'BOOLEAN':
        // Ensure value is a boolean, defaulting to false if invalid
        const booleanValue = typeof value === 'boolean' ? value : false;
        
        return (
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg group transition-all duration-300 hover:border-primary/30 hover:bg-primary/5">
            <Label className="text-sm font-medium text-primary-text group-hover:text-primary transition-colors duration-300">
              {item.name}
            </Label>
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              <Switch
                checked={booleanValue}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        );

      case 'TEXT':
        const textValue = value === null || value === undefined ? '' : value;
        return (
          <div className="space-y-2 group">
            <Label className="text-sm font-medium text-primary-text group-hover:text-primary transition-colors duration-300">
              {item.name}
            </Label>
            <textarea
              value={textValue}
              onChange={handleTextChange}
              placeholder="Enter your notes..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-sm"
              rows={3}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {renderField()}
    </div>
  );
}