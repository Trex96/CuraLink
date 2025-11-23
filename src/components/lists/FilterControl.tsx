'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';

interface FilterControlProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function FilterControl({
  filters,
  onFilterChange,
  onClearFilters
}: FilterControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // This is a simplified example. In a real implementation,
  // you would render actual filter controls based on your data model
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {Object.keys(filters).length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {Object.keys(filters).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filters</h4>
            <p className="text-sm text-muted-foreground">
              Refine your search results
            </p>
          </div>
          
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="search">Search</label>
              <Input
                id="search"
                placeholder="Keywords..."
                className="col-span-2 h-8"
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
              />
            </div>
            
            {/* Add more filter controls as needed */}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onClearFilters}
            >
              Clear All
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}