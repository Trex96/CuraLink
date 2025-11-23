'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { MatchBadge } from '@/components/ui/match-badge';
import { LocationDisplay } from '@/components/ui/location-display';

interface Trial {
  _id: string;
  title: string;
  condition: string;
  phase: string;
  status: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  matchPercentage: number;
  distance?: number;
}

export function RelevantTrials({ trials, loading, error }: { 
  trials: Trial[]; 
  loading: boolean; 
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="mr-2 h-5 w-5" />
            Relevant Clinical Trials
          </CardTitle>
          <CardDescription>Clinical trials matching your expertise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="mr-2 h-5 w-5" />
            Relevant Clinical Trials
          </CardTitle>
          <CardDescription>Clinical trials matching your expertise</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load trials: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FlaskConical className="mr-2 h-5 w-5" />
          Relevant Clinical Trials
        </CardTitle>
        <CardDescription>Clinical trials matching your expertise</CardDescription>
      </CardHeader>
      <CardContent>
        {trials.length === 0 ? (
          <div className="text-center py-8">
            <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No relevant trials</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No clinical trials currently match your expertise.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trials.map((trial) => (
              <div key={trial._id} className="border-b pb-4 last:border-0 last:pb-0">
                <h4 className="font-medium text-sm leading-tight">{trial.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {trial.condition} • {trial.phase} • {trial.status}
                </p>
                <div className="flex items-center mt-2">
                  <MatchBadge percentage={trial.matchPercentage} className="text-xs" />
                </div>
                {trial.location && (
                  <div className="mt-2">
                    <LocationDisplay 
                      coordinates={trial.location.coordinates} 
                      address={trial.location.address}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/search?tab=trials">
              View All Trials
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}