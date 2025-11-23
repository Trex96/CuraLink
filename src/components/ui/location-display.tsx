import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface LocationDisplayProps {
  address?: string;
  coordinates?: [number, number];
  className?: string;
}

export function LocationDisplay({ address, coordinates, className }: LocationDisplayProps) {
  if (!address && !coordinates) {
    return null;
  }

  return (
    <div className={cn('flex items-center text-sm text-muted-foreground', className)}>
      <MapPin className="mr-1 h-4 w-4" />
      {address ? (
        <span>{address}</span>
      ) : coordinates ? (
        <span>
          {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
        </span>
      ) : null}
    </div>
  );
}