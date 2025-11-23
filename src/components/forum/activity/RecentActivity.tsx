'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecentActivity } from '@/lib/services/forum';
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
    authorId?: {
      firstName?: string;
      lastName?: string;
    };
  };
  createdAt: string;
}

export function RecentActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecentActivity();
  }, []);
  
  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const recentActivity = await getRecentActivity();
      setActivity(recentActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
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
                {item.type === 'post' ? 'New Post' : 'New Comment'}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-sm mb-2">
                {item.type === 'post' 
                  ? item.data.title 
                  : `Re: ${item.data.postId?.title || 'Untitled Post'}`}
              </p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  by {item.data.authorId?.firstName} {item.data.authorId?.lastName}
                </span>
                <span>
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No recent activity.</p>
      )}
    </div>
  );
}