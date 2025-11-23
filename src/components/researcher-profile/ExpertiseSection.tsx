'use client';

import { Badge } from '@/components/ui/badge';
import { Researcher } from './types';

interface ExpertiseSectionProps {
  expertise: Researcher['expertise'];
}

export function ExpertiseSection({ expertise }: ExpertiseSectionProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {expertise.map((exp, index) => (
        <Badge key={index} variant="secondary">
          {exp}
        </Badge>
      ))}
    </div>
  );
}