'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocation } from '@/lib/utils/location';
import { toast } from 'sonner';

interface TrialFiltersProps {
  onFilterChange: (filters: {
    condition: string;
    status: string;
    phase: string;
    location: string;
    radius: number;
    sortBy: string;
  }) => void;
}

export function TrialFilters({ onFilterChange }: TrialFiltersProps) {
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState('');
  const [phase, setPhase] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(50);
  const [sortBy, setSortBy] = useState('relevance');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Check if location is required but not provided when using distance-based filters
  useEffect(() => {
    if ((sortBy === 'distance' || radius < 100) && !location) {
      // Show warning that location is needed for distance-based filtering
      const timeout = setTimeout(() => {
        if (sortBy === 'distance' || radius < 100) {
          toast.warning('Location Required', {
            description: 'Please enable location access to use distance-based filters.',
            action: {
              label: 'Enable Location',
              onClick: handleUseCurrentLocation,
            },
            duration: 5000,
          });
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [sortBy, radius, location]);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange({
      condition,
      status,
      phase,
      location,
      radius,
      sortBy
    });
  }, [condition, status, phase, location, radius, sortBy, onFilterChange]);

  const handleUseCurrentLocation = async () => {
    try {
      const position = await getCurrentLocation();
      setLocation(`${position.latitude},${position.longitude}`);
      setUseCurrentLocation(true);
      toast.success('Location enabled', {
        description: 'Your location has been set successfully.',
      });
    } catch (error) {
      console.error('Error getting location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      toast.error('Location Access Denied', {
        description: 'Please grant location permission in your browser settings to use this feature.',
        action: {
          label: 'Try Again',
          onClick: handleUseCurrentLocation,
        },
        duration: 8000,
      });

      // Reset location-based filters if location access is denied
      if (sortBy === 'distance') {
        setSortBy('relevance');
      }
    }
  };

  const handleResetFilters = () => {
    setCondition('');
    setStatus('');
    setPhase('');
    setLocation('');
    setRadius(50);
    setSortBy('relevance');
    setUseCurrentLocation(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Refine your clinical trial search</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="condition">Condition/Disease</Label>
          <Input
            id="condition"
            placeholder="e.g., Cancer, Diabetes"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recruiting">Recruiting</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="enrolling">Enrolling</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phase">Phase</Label>
          <Select value={phase} onValueChange={setPhase}>
            <SelectTrigger>
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Phase 1</SelectItem>
              <SelectItem value="2">Phase 2</SelectItem>
              <SelectItem value="3">Phase 3</SelectItem>
              <SelectItem value="4">Phase 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter location or use current"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={useCurrentLocation}
            />
            <Button
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={useCurrentLocation}
            >
              Use Current
            </Button>
          </div>
          <div className="pt-2">
            <Label>Radius: {radius} miles</Label>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[radius]}
              onValueChange={([value]) => setRadius(value)}
              className="pt-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}