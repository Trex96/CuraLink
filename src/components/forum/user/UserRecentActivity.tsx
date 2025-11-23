'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserRecentActivity } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, FileText } from 'lucide-react';

interface ActivityItem {
  type: 'post' | 'comment';
  data: {
    _id: string;
    title?: string;
    postId?: {
      title?: string;
    };
  };
  createdAt: string;
}

export function UserRecentActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserRecentActivity();
  }, []);
  
  const fetchUserRecentActivity = async () => {
    try {
      setLoading(true);
      const userActivity = await getUserRecentActivity();
      setActivity(userActivity);
    } catch (error) {
      console.error('Error fetching user recent activity:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Recent Activity</h3>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Recent Activity</h3>
      {activity.length > 0 ? (
        activity.map((item) => (
          <Card key={item.data._id}>
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                {item.type === 'post' ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {item.type === 'post' ? 'Your Post' : 'Your Comment'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-sm mb-2">
                {item.type === 'post' 
                  ? item.data.title 
                  : `Re: ${item.data.postId?.title || 'Untitled Post'}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No recent activity.</p>
      )}
    </div>
  );
}