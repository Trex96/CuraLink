'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Eye } from 'lucide-react';
import Link from 'next/link';

interface ProfileViewStat {
  date: string;
  count: number;
}

export function ProfileStats({ stats, loading, error }: { 
  stats: ProfileViewStat[]; 
  loading: boolean; 
  error: string | null;
}) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Profile Views
          </CardTitle>
          <CardDescription>Your profile view statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
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
            <BarChart3 className="mr-2 h-5 w-5" />
            Profile Views
          </CardTitle>
          <CardDescription>Your profile view statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load profile views: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total views
  const totalViews = stats.reduce((sum, stat) => sum + stat.count, 0);
  
  // Get last 7 days of data
  const last7Days = stats.slice(-7);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Profile Views
        </CardTitle>
        <CardDescription>Your profile view statistics</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No profile views yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your profile hasn&apos;t been viewed yet.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <div className="text-2xl font-bold">{totalViews}</div>
              <p className="text-xs text-muted-foreground">
                Total profile views
              </p>
            </div>
            
            <div className="space-y-2">
              {last7Days.map((stat, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-xs text-muted-foreground">
                    {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="flex items-center">
                      <div 
                        className="h-2 bg-primary rounded-sm" 
                        style={{ width: `${Math.min(100, (stat.count / Math.max(1, ...last7Days.map(s => s.count))) * 100)}%` }}
                      />
                      <span className="ml-2 text-xs text-muted-foreground">{stat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/researcher/analytics">
              View Detailed Analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}