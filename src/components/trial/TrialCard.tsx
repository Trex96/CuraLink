'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, HeartOff, Share } from 'lucide-react';
import { MatchBadge } from '@/components/ui/match-badge';
import { LocationDisplay } from '@/components/ui/location-display';
import Link from 'next/link';
import { ClinicalTrial } from '@/types';

import { TrialSourceBadge } from '@/components/trial/TrialSourceBadge';

interface TrialCardProps {
  trial: ClinicalTrial & {
    distance?: number;
    isFavorite?: boolean;
    matchPercentage?: number;
  };
  onFavoriteToggle?: (trialId: string) => void;
  onShare?: (trialId: string) => void;
}

export function TrialCard({ trial, onFavoriteToggle, onShare }: TrialCardProps) {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">
            {trial.nctNumber ? (
              <Link href={`/trials/${trial.nctNumber}`} className="hover:underline">
                {trial.title}
              </Link>
            ) : (
              <span>{trial.title}</span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFavoriteToggle?.(trial._id)}
            className="shrink-0"
          >
            {trial.isFavorite ? (
              <HeartOff className="h-4 w-4 text-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="line-clamp-1">
          {trial.conditions.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <TrialSourceBadge importedFrom={trial.importedFrom} />
            <Badge variant="outline">Phase {trial.phase}</Badge>
            <Badge variant="outline" className="capitalize">
              {trial.status}
            </Badge>
          </div>

          {trial.matchPercentage !== undefined && (
            <MatchBadge percentage={trial.matchPercentage} />
          )}

          {trial.distance !== undefined && (
            <div className="text-sm text-muted-foreground">
              {Math.round(trial.distance)} miles away
            </div>
          )}

          {trial.locations && trial.locations.length > 0 && (
            <LocationDisplay
              address={trial.locations[0].address}
              coordinates={trial.locations[0].coordinates}
              className="text-sm"
            />
          )}

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium">NCT: {trial.nctNumber}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onShare?.(trial._id)}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}