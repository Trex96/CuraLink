'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationDisplay } from '@/components/ui/location-display';
import { MapPin } from 'lucide-react';
import { ClinicalTrial } from '@/types';
import { calculateDistance, kilometersToMiles } from '@/lib/utils/location';

interface LocationsListProps {
  locations: ClinicalTrial['locations'];
  userLocation?: { lat: number; lng: number };
}

export function LocationsList({ locations, userLocation }: LocationsListProps) {
  // Sort locations by distance if user location is provided
  const sortedLocations = [...(locations || [])].sort((a, b) => {
    if (!userLocation || !a.coordinates || !b.coordinates) return 0;
    
    const distanceA = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      a.coordinates[1],
      a.coordinates[0]
    );
    
    const distanceB = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      b.coordinates[1],
      b.coordinates[0]
    );
    
    return distanceA - distanceB;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locations</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedLocations && sortedLocations.length > 0 ? (
          <div className="space-y-4">
            {sortedLocations.map((location, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
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
  );
}