'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { LocationPicker } from '@/components/location-picker';

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    location?: { lat: number; lng: number; address?: string };
    radius?: number;
    sortBy?: string;
  }) => void;
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [radius, setRadius] = useState<number | null>(null); // No default radius
  const [sortBy, setSortBy] = useState('relevance');

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange({
      location: location || undefined,
      radius: radius || undefined,
      sortBy
    });
  }, [location, radius, sortBy, onFiltersChange]);

  const handleLocationChange = (newLocation: { lat: number; lng: number; address?: string } | null) => {
    setLocation(newLocation);
  };

  const handleRadiusChange = (value: number | null) => {
    setRadius(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onFiltersChange({ sortBy: value });
  };
  
  // Convert miles to kilometers for display
  const milesToKm = (miles: number) => Math.round(miles * 1.60934);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Filter */}
        <div>
          <Label htmlFor="location">Location</Label>
          <div className="mt-1">
            <LocationPicker
              value={location || undefined}
              onChange={handleLocationChange}
              placeholder="Enter location or use current location"
            />
          </div>
          
          {/* Radius Filter */}
          <div className="mt-4">
            <Label>Radius Filter</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant={radius === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRadiusChange(null)}
              >
                All Distances
              </Button>
              <Button
                variant={radius === milesToKm(10) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRadiusChange(milesToKm(10))}
              >
                10 Miles
              </Button>
              <Button
                variant={radius === milesToKm(25) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRadiusChange(milesToKm(25))}
              >
                25 Miles
              </Button>
              <Button
                variant={radius === milesToKm(50) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRadiusChange(milesToKm(50))}
              >
                50 Miles
              </Button>
              <Button
                variant={radius === milesToKm(100) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRadiusChange(milesToKm(100))}
              >
                100 Miles
              </Button>
            </div>
            {radius !== null && (
              <div className="mt-2 text-sm text-muted-foreground">
                Showing results within {Math.round(radius / 1.60934)} miles
              </div>
            )}
          </div>
        </div>
        
        {/* Sort By Filter */}
        <div>
          <Label>Sort By</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant={sortBy === 'relevance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('relevance')}
            >
              Relevance
            </Button>
            <Button
              variant={sortBy === 'distance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('distance')}
              disabled={!location}
            >
              Distance
            </Button>
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('date')}
            >
              Date
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}