'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortableListProps<T> {
  items: T[];
  sortOptions: SortOption[];
  defaultSort?: string;
  onSortChange?: (sortBy: string, direction: 'asc' | 'desc') => void;
  children: (sortedItems: T[]) => React.ReactNode;
}

export function SortableList<T>({
  items,
  sortOptions,
  defaultSort,
  onSortChange,
  children
}: SortableListProps<T>) {
  const [sortBy, setSortBy] = useState(defaultSort || sortOptions[0]?.value || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value, sortDirection);
  };

  const toggleSortDirection = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    onSortChange?.(sortBy, newDirection);
  };

  // In a real implementation, you would sort the items
  // This is a simplified version for demonstration
  const sortedItems = items;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortDirection}
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </div>
      
      {children(sortedItems)}
    </div>
  );
}