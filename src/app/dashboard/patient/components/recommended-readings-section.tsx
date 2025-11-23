'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { MatchBadge } from '@/components/ui/match-badge';

interface Publication {
  _id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  matchPercentage: number;
}

export function RecommendedReadingsSection({ publications, loading, error }: {
  publications: Publication[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full border-muted bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            Recommended Readings
          </CardTitle>
          <CardDescription>Patient-friendly publications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
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
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            Recommended Readings
          </CardTitle>
          <CardDescription>Patient-friendly publications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load publications: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-muted bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-primary" />
          Recommended Readings
        </CardTitle>
        <CardDescription>Patient-friendly publications</CardDescription>
      </CardHeader>
      <CardContent>
        {publications.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-sm font-medium">No publications found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn&apos;t find any recommended readings for you.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {publications.map((publication) => (
              <div key={publication._id} className="group space-y-3 pb-6 border-b last:border-0 last:pb-0">
                <div className="space-y-1">
                  <Link href={`/publications/${publication._id}`} className="block">
                    <h4 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {publication.title}
                    </h4>
                  </Link>
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <span className="font-medium text-primary/80">{publication.journal}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(publication.publicationDate).getFullYear()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[200px]">{publication.authors.slice(0, 2).join(', ')}{publication.authors.length > 2 ? ' et al.' : ''}</span>
                  </div>
                  <MatchBadge percentage={publication.matchPercentage} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" className="w-full text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
            <Link href="/search?tab=publications">
              View All Publications
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}