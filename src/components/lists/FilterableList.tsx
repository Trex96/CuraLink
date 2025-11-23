'use client';

import { useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FilterableListProps<T> {
  items: T[];
  filterComponent: ReactNode;
  children: (filteredItems: T[]) => ReactNode;
}

export function FilterableList<T>({
  items,
  filterComponent,
  children
}: FilterableListProps<T>) {
  const [showFilters, setShowFilters] = useState(false);

  // In a real implementation, you would apply the filters to the items
  // This is a simplified version for demonstration
  const filteredItems = items;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
      
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            {filterComponent}
          </CardContent>
        </Card>
      )}
      
      {children(filteredItems)}
    </div>
  );
}