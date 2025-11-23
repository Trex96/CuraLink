'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getForumNotifications } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  postId?: string;
}

export function ForumNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchForumNotifications();
  }, []);
  
  const fetchForumNotifications = async () => {
    try {
      setLoading(true);
      const forumNotifications = await getForumNotifications();
      setNotifications(forumNotifications);
    } catch (error) {
      console.error('Error fetching forum notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Forum Notifications</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Forum Notifications</h3>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Card key={notification.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-base">{notification.title}</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-sm mb-2">{notification.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No forum notifications at the moment.</p>
      )}
    </div>
  );
}