'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserForumStats } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

export function UserForumStats() {
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    upvotesGiven: 0,
    upvotesReceived: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserForumStats();
  }, []);
  
  const fetchUserForumStats = async () => {
    try {
      setLoading(true);
      const userStats = await getUserForumStats();
      setStats(userStats);
    } catch (error) {
      console.error('Error fetching user forum stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forum Activity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Forum Activity</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.posts}</p>
          <p className="text-sm text-muted-foreground">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.comments}</p>
          <p className="text-sm text-muted-foreground">Comments</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.upvotesGiven}</p>
          <p className="text-sm text-muted-foreground">Upvotes Given</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.upvotesReceived}</p>
          <p className="text-sm text-muted-foreground">Upvotes Received</p>
        </div>
      </CardContent>
    </Card>
  );
}