'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserEngagement } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

export function UserEngagementScore() {
  const [engagement, setEngagement] = useState({
    postCount: 0,
    commentCount: 0,
    upvoteCount: 0,
    score: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserEngagement();
  }, []);
  
  const fetchUserEngagement = async () => {
    try {
      setLoading(true);
      const userEngagement = await getUserEngagement();
      setEngagement(userEngagement);
    } catch (error) {
      console.error('Error fetching user engagement:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Engagement</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Engagement</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{engagement.score}</div>
        <p className="text-xs text-muted-foreground">
          {engagement.postCount} posts, {engagement.commentCount} comments, {engagement.upvoteCount} upvotes
        </p>
      </CardContent>
    </Card>
  );
}