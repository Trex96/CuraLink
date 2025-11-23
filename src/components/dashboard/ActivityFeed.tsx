'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  title?: string;
  description?: string;
  emptyState?: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
}

export function ActivityFeed({ 
  activities, 
  loading = false,
  title = "Recent Activity",
  description = "Your latest actions and updates",
  emptyState
}: ActivityFeedProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            {emptyState?.icon && (
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                {emptyState.icon}
              </div>
            )}
            <h3 className="mt-2 text-sm font-medium">{emptyState?.title || "No recent activity"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyState?.description || "There is no recent activity to show."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div 
                  className={`flex items-start space-x-3 ${activity.onClick ? 'cursor-pointer hover:bg-accent p-2 rounded-lg' : ''}`}
                  onClick={activity.onClick}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}