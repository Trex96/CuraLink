'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TrialResultSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}