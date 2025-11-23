'use client';

import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface ResultGridProps {
  children: React.ReactNode;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function ResultGrid({ children, viewMode, onViewModeChange }: ResultGridProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {/* Results count would be passed here in a real implementation */}
          Showing results
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
        {children}
      </div>
    </div>
  );
}