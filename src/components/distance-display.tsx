'use client';

import { MapPin } from 'lucide-react';

interface DistanceDisplayProps {
  distanceKm: number;
  unit?: 'km' | 'mi';
  className?: string;
  precision?: number;
}

export function DistanceDisplay({ 
  distanceKm, 
  unit = 'km', 
  className = '',
  precision = 1
}: DistanceDisplayProps) {
  // Convert to miles if requested
  const distance = unit === 'mi' 
    ? distanceKm * 0.621371 
    : distanceKm;
  
  // Format the distance based on magnitude
  let formattedDistance: string;
  if (distance < 0.1) {
    formattedDistance = '< 0.1';
  } else if (distance < 1) {
    formattedDistance = distance.toFixed(1);
  } else if (distance < 10) {
    formattedDistance = distance.toFixed(precision);
  } else {
    formattedDistance = Math.round(distance).toString();
  }
  
  return (
    <div className={`flex items-center text-sm text-muted-foreground ${className}`}>
      <MapPin className="mr-1 h-4 w-4" />
      <span>
        {formattedDistance} {unit}
      </span>
    </div>
  );
}