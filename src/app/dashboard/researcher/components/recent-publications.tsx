'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Publication {
  _id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
}

export function RecentPublications({ publications, loading, error }: { 
  publications: Publication[]; 
  loading: boolean; 
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Recent Publications
          </CardTitle>
          <CardDescription>New publications in your field (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Recent Publications
          </CardTitle>
          <CardDescription>New publications in your field (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load publications: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Recent Publications
        </CardTitle>
        <CardDescription>New publications in your field (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {publications.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No recent publications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven&apos;t published any recent papers.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/dashboard/researcher/profile/edit#import-publications">
                  Import Publications
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {publications.map((publication) => (
              <div key={publication._id} className="border-b pb-4 last:border-0 last:pb-0">
                <h4 className="font-medium text-sm leading-tight">{publication.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {publication.authors.join(', ')}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium">{publication.journal}</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(publication.publicationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/researcher/publications">
              View All Publications
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}