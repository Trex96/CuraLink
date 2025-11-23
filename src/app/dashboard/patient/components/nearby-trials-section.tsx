'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FlaskConical, MapPin } from 'lucide-react';
import Link from 'next/link';
import { MatchBadge } from '@/components/ui/match-badge';
import { TrialSourceBadge } from '@/components/trial/TrialSourceBadge';
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
  importedFrom?: 'clinicaltrials.gov' | 'manual';
}

export function NearbyTrialsSection({ trials, loading, error }: {
  trials: Trial[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full border-muted bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="mr-2 h-5 w-5 text-primary" />
            Nearby Trials
          </CardTitle>
          <CardDescription>Clinical trials within 100 miles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-muted bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="mr-2 h-5 w-5 text-primary" />
            Nearby Trials
          </CardTitle>
          <CardDescription>Clinical trials within 100 miles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load trials: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-muted bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FlaskConical className="mr-2 h-5 w-5 text-primary" />
          Nearby Trials
        </CardTitle>
        <CardDescription>Clinical trials within 100 miles</CardDescription>
      </CardHeader>
      <CardContent>
        {trials.length === 0 ? (
          <div className="text-center py-8">
            <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-sm font-medium">No trials found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn&apos;t find any trials near you.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {trials.map((trial) => (
              <div key={trial._id} className="group space-y-3 pb-6 border-b last:border-0 last:pb-0">
                <div className="space-y-1">
                  <Link href={`/trials/${trial._id}`} className="block">
                    <h4 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {trial.title}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {trial.condition} • <span className="text-foreground/80">Phase {trial.phase}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <MatchBadge percentage={trial.matchPercentage} />

                  {trial.distance && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {Math.round(trial.distance)} mi
                    </span>
                  )}

                  <TrialSourceBadge importedFrom={trial.importedFrom} />
                </div>

                {trial.location && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{trial.location.address || 'Location available'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" className="w-full text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
            <Link href="/search?tab=trials">
              View All Trials
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}