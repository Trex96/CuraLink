'use client';

import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  onClearFilters?: () => void;
}

export function EmptyState({ title, description, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2">{description}</p>
      {onClearFilters && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}