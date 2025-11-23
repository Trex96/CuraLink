'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MatchBadge } from '@/components/ui/match-badge';
import { Calendar, BookOpen } from 'lucide-react';

interface PublicationResult {
  id: string;
  title: string;
  authors?: string[];
  journal: string;
  abstract: string;
  publicationDate: string;
  citations: number;
  matchPercentage: number;
  doi?: string;
}

interface PublicationResultCardProps {
  publication: PublicationResult;
  onView?: (id: string) => void;
}

export function PublicationResultCard({ publication, onView }: PublicationResultCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center">
              {publication.title}
              <MatchBadge percentage={publication.matchPercentage} className="ml-2" />
            </CardTitle>
            <CardDescription className="mt-1">
              {publication.authors?.slice(0, 3).join(', ')}
              {publication.authors && publication.authors.length > 3 ? ' et al.' : ''}
              {publication.authors && publication.authors.length > 0 ? ' • ' : ''}
              {publication.journal}
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            onClick={() => onView?.(publication.id)}
          >
            View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{publication.abstract}</p>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(publication.publicationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{publication.citations} citations</span>
          </div>
        </div>
        
        {publication.doi && (
          <div className="mt-3 text-sm">
            <span className="font-medium">DOI:</span> {publication.doi}
          </div>
        )}
      </CardContent>
    </Card>
  );
}