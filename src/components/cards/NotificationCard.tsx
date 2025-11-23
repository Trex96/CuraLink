'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  actor?: {
    name: string;
    avatar?: string;
  };
  actions?: {
    label: string;
    onClick: () => void;
  }[];
  onMarkAsRead?: (id: string) => void;
}

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

const typeColors = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const {
    title,
    description,
    timestamp,
    isRead,
    type,
    actor,
    actions,
    onMarkAsRead
  } = notification;

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: "var(--accent)" }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className={`border-0 shadow-none ${!isRead ? 'bg-muted' : ''}`}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {actor ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={actor.avatar} alt={actor.name} />
                  <AvatarFallback>{actor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ) : (
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${typeColors[type]}`}>
                  <Clock className="h-4 w-4" />
                </div>
              )}
              <div>
                <h3 className={`text-sm font-medium ${!isRead ? 'font-bold' : ''}`}>
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(timestamp)}
                </p>
              </div>
            </div>
            {!isRead && onMarkAsRead && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className={`text-sm ${!isRead ? '' : 'text-muted-foreground'}`}>
            {description}
          </p>
        </CardContent>
        {actions && actions.length > 0 && (
          <CardFooter className="p-4 pt-0 flex space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
              >
                {action.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onMarkAsRead) onMarkAsRead(notification.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}