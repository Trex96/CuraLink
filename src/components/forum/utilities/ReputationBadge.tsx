'use client';

import { Badge } from '@/components/ui/badge';

interface ReputationBadgeProps {
  reputation: number;
}

export function ReputationBadge({ reputation }: ReputationBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
  let label = 'New';
  
  if (reputation >= 1000) {
    variant = 'default';
    label = 'Expert';
  } else if (reputation >= 500) {
    variant = 'secondary';
    label = 'Experienced';
  } else if (reputation >= 100) {
    variant = 'outline';
    label = 'Helpful';
  }

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}