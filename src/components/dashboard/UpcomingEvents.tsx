'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: Date;
  location?: string;
  description?: string;
  type: 'trial' | 'meeting' | 'deadline' | 'other';
  onClick?: () => void;
}

interface UpcomingEventsProps {
  events: Event[];
  loading?: boolean;
  title?: string;
  description?: string;
  onViewAll?: () => void;
  emptyState?: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
}

export function UpcomingEvents({ 
  events, 
  loading = false,
  title = "Upcoming Events",
  description = "Your scheduled events and deadlines",
  onViewAll,
  emptyState
}: UpcomingEventsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trial': return 'Trial';
      case 'meeting': return 'Meeting';
      case 'deadline': return 'Deadline';
      default: return 'Event';
    }
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            {emptyState?.icon && (
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                {emptyState.icon}
              </div>
            )}
            <h3 className="mt-2 text-sm font-medium">{emptyState?.title || "No upcoming events"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyState?.description || "You don't have any upcoming events scheduled."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div 
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${event.onClick ? 'hover:bg-accent cursor-pointer' : ''}`}
                  onClick={event.onClick}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-medium">
                      {format(event.date, 'MMM')}
                    </div>
                    <div className="text-lg font-bold">
                      {format(event.date, 'd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(event.date)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{event.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(event.type)}`}>
                        {getTypeLabel(event.type)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.location}
                      </p>
                    )}
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