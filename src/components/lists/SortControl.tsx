'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortControlProps {
  options: SortOption[];
  value: string;
  direction: 'asc' | 'desc';
  onChange: (value: string) => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;
}

export function SortControl({
  options,
  value,
  direction,
  onChange,
  onDirectionChange
}: SortControlProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
  );
}