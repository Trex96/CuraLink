'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, HeartOff, Share, MapPin } from 'lucide-react';
import { MatchBadge } from '@/components/ui/match-badge';
import { LocationDisplay } from '@/components/ui/location-display';
import { ClinicalTrial } from '@/types';
import { calculateDistance, kilometersToMiles } from '@/lib/utils/location';
import { ApplyToTrialButton } from '@/components/trial/ApplyToTrialButton';

interface TrialDetailsProps {
  trial: ClinicalTrial & {
    distance?: number;
    isFavorite?: boolean;
    matchPercentage?: number;
  };
  onFavoriteToggle?: (trialId: string) => void;
  onShare?: (trialId: string) => void;
  userLocation?: { lat: number; lng: number };
}

export function TrialDetails({ trial, onFavoriteToggle, onShare, userLocation }: TrialDetailsProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{trial.title}</h1>
          <p className="text-muted-foreground">{trial.nctNumber}</p>
        </div>
        <div className="flex gap-2">
          <ApplyToTrialButton trial={trial} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFavoriteToggle?.(trial._id)}
          >
            {trial.isFavorite ? (
              <HeartOff className="h-4 w-4 text-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onShare?.(trial._id)}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Match Percentage */}
      {trial.matchPercentage !== undefined && (
        <MatchBadge percentage={trial.matchPercentage} className="text-lg py-2 px-3" />
      )}

      {/* Key Information */}
      <Card>
        <CardHeader>
          <CardTitle>Key Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Status</h3>
            <Badge variant="outline" className="capitalize">
              {trial.status}
            </Badge>
          </div>
          <div>
            <h3 className="font-medium mb-2">Phase</h3>
            <Badge variant="outline">Phase {trial.phase}</Badge>
          </div>
          <div>
            <h3 className="font-medium mb-2">Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {trial.conditions.map((condition, index) => (
                <Badge key={index} variant="secondary">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
          {trial.studyType && (
            <div>
              <h3 className="font-medium mb-2">Study Type</h3>
              <Badge variant="outline">{trial.studyType}</Badge>
            </div>
          )}
          {trial.enrollment && (
            <div>
              <h3 className="font-medium mb-2">Enrollment</h3>
              <p>{trial.enrollment} participants</p>
            </div>
          )}
          {trial.startDate && (
            <div>
              <h3 className="font-medium mb-2">Start Date</h3>
              <p>{trial.startDate}</p>
            </div>
          )}
          {trial.endDate && (
            <div>
              <h3 className="font-medium mb-2">Completion Date</h3>
              <p>{trial.endDate}</p>
            </div>
          )}
          {trial.sponsors && trial.sponsors.length > 0 && (
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-medium mb-2">Sponsors</h3>
              <p>{trial.sponsors.join(', ')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={showFullSummary ? '' : 'line-clamp-3'}>
            {trial.summary}
          </div>
          {trial.summary.length > 200 && (
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setShowFullSummary(!showFullSummary)}
            >
              {showFullSummary ? 'Show less' : 'Show more'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Eligibility Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Criteria</CardTitle>
          <CardDescription>
            Criteria that participants must meet to join this trial
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trial.eligibilityCriteria && trial.eligibilityCriteria.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {trial.eligibilityCriteria.map((criteria, index) => (
                <li key={index}>{criteria}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No eligibility criteria specified</p>
          )}
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {trial.locations && trial.locations.length > 0 ? (
            <div className="space-y-4">
              {trial.locations.map((location, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <LocationDisplay
                        address={location.address}
                        coordinates={location.coordinates}
                      />
                      {userLocation && location.coordinates && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {Math.round(
                            kilometersToMiles(
                              calculateDistance(
                                userLocation.lat,
                                userLocation.lng,
                                location.coordinates[1],
                                location.coordinates[0]
                              )
                            )
                          )}{' '}
                          miles away
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No locations specified</p>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          {trial.contactInfo ? (
            <p>{trial.contactInfo}</p>
          ) : (
            <p className="text-muted-foreground">No contact information available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}