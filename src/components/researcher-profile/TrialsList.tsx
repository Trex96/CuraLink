'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trial } from './types';

interface TrialsListProps {
  trials: Trial[];
}

export function TrialsList({ trials }: TrialsListProps) {
  if (trials.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No active trials found for this researcher.
      </p>
    );
  }
  
  return (
    <div className="space-y-4">
      {trials.map((trial) => (
        <div key={trial._id} className="border-b pb-4 last:border-0 last:pb-0">
          <h3 className="font-medium">{trial.title}</h3>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="mr-2">
              {trial.status}
            </Badge>
            <Badge variant="outline">
              Phase {trial.phase}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            NCT#: {trial.nctNumber}
          </p>
          
          <div className="mt-2">
            <p className="text-sm font-medium">Conditions:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {trial.conditions.slice(0, 3).map((condition, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {condition}
                </Badge>
              ))}
              {trial.conditions.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{trial.conditions.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {trial.eligibilityCriteria && trial.eligibilityCriteria.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Eligibility Criteria:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {trial.eligibilityCriteria.slice(0, 3).map((criteria, index) => (
                  <li key={index}>{criteria}</li>
                ))}
                {trial.eligibilityCriteria.length > 3 && (
                  <li>+{trial.eligibilityCriteria.length - 3} more criteria</li>
                )}
              </ul>
            </div>
          )}
          
          {trial.locations.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Locations:</p>
              <p className="text-sm text-muted-foreground">
                {trial.locations[0].address || 'Location not specified'}
              </p>
            </div>
          )}
          
          <Button variant="link" className="p-0 h-auto mt-2" asChild>
            <Link href={`/trials/${trial._id}`}>
              View Trial Details
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}