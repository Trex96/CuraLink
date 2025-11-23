'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MatchBadge } from '@/components/ui/match-badge';
import { LocationDisplay } from '@/components/ui/location-display';
import { DistanceDisplay } from '@/components/distance-display';
import { Calendar, FlaskConical, MapPin, Users } from 'lucide-react';

interface TrialResult {
  id: string;
  title: string;
  nctNumber: string;
  summary: string;
  status: string;
  phase: string;
  locations?: Array<{
    coordinates: [number, number];
    address?: string;
  }>;
  distance?: number;
  conditions?: string[];
  matchPercentage: number;
  eligibilityMatch?: number; // 0-100 percentage
}

interface TrialResultCardProps {
  trial: TrialResult;
  onView?: (id: string) => void;
}

export function TrialResultCard({ trial, onView }: TrialResultCardProps) {
  // Determine eligibility badge color
  const getEligibilityColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center">
              {trial.title}
              <MatchBadge percentage={trial.matchPercentage} className="ml-2" />
            </CardTitle>
            <CardDescription className="mt-1">
              {trial.nctNumber} • {trial.phase} • {trial.status}
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            onClick={() => onView?.(trial.id)}
          >
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{trial.summary}</p>
        
        {trial.eligibilityMatch !== undefined && (
          <div className="mt-3">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Eligibility Match:</span>
              <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getEligibilityColor(trial.eligibilityMatch)}`}>
                {trial.eligibilityMatch}%
              </span>
            </div>
          </div>
        )}
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Status: {trial.status}</span>
          </div>
          <div className="flex items-center">
            <FlaskConical className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Phase: {trial.phase}</span>
          </div>
        </div>
        
        {trial.locations && trial.locations.length > 0 && (
          <div className="mt-3">
            <div className="flex items-start">
              <MapPin className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <LocationDisplay 
                  coordinates={trial.locations[0].coordinates} 
                  address={trial.locations[0].address}
                />
                {trial.distance !== undefined && (
                  <div className="mt-1">
                    <DistanceDisplay 
                      distanceKm={trial.distance} 
                      unit="mi" 
                      precision={1}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {trial.conditions && trial.conditions.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {trial.conditions.slice(0, 3).map((condition, index) => (
                <span 
                  key={index} 
                  className="rounded-full bg-secondary px-2 py-1 text-xs"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}