'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin } from 'lucide-react';
import Link from 'next/link';
import { MatchBadge } from '@/components/ui/match-badge';

interface Researcher {
  _id: string;
  firstName: string;
  lastName: string;
  institution: string;
  specialty: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  matchPercentage: number;
}

export function TopResearchersSection({ researchers, loading, error }: {
  researchers: Researcher[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full border-muted bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Top Researchers
          </CardTitle>
          <CardDescription>Experts in your condition area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
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
            <Users className="mr-2 h-5 w-5 text-primary" />
            Top Researchers
          </CardTitle>
          <CardDescription>Experts in your condition area</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load researchers: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-muted bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Top Researchers
        </CardTitle>
        <CardDescription>Experts in your condition area</CardDescription>
      </CardHeader>
      <CardContent>
        {researchers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-sm font-medium">No researchers found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn&apos;t find any researchers matching your profile.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {researchers.map((researcher) => (
              <div key={researcher._id} className="flex items-start space-x-4 group pb-6 border-b last:border-0 last:pb-0">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {researcher.firstName.charAt(0)}
                    {researcher.lastName.charAt(0)}
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <Link href={`/researchers/${researcher._id}`} className="block">
                      <p className="font-semibold truncate group-hover:text-primary transition-colors">
                        {researcher.firstName} {researcher.lastName}
                      </p>
                    </Link>
                    <MatchBadge percentage={researcher.matchPercentage} className="ml-2" />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {researcher.institution}
                  </p>
                  <p className="text-xs text-primary/80 font-medium">
                    {researcher.specialty}
                  </p>

                  {researcher.location && (
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{researcher.location.address || 'Location available'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 pt-4 border-t">
          <Button variant="ghost" className="w-full text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
            <Link href="/search?tab=researchers">
              View All Researchers
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}