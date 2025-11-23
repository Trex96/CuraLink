'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface MessagePreview {
  id: string;
  sender: {
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  subject: string;
  preview: string;
  timestamp: Date;
  isUnread: boolean;
  unreadCount?: number;
}

interface MessagePreviewCardProps {
  message: MessagePreview;
  onClick?: () => void;
}

export function MessagePreviewCard({ message, onClick }: MessagePreviewCardProps) {
  const {
    sender,
    subject,
    preview,
    timestamp,
    isUnread,
    unreadCount
  } = message;

  // Format timestamp to show relative time or specific date
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: "var(--accent)" }}
      className={`cursor-pointer rounded-lg ${isUnread ? 'bg-muted' : ''}`}
      onClick={onClick}
    >
      <Card className={`border-0 shadow-none ${isUnread ? 'bg-muted' : ''}`}>
        <CardHeader className="p-4">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={sender.avatar} alt={sender.name} />
                <AvatarFallback>{sender.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {sender.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <CardTitle className={`text-sm font-medium truncate ${isUnread ? 'font-bold' : ''}`}>
                  {sender.name}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(timestamp)}
                  </span>
                  {isUnread && (
                    <Badge className="h-2 w-2 min-w-0 p-0 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <p className={`text-sm truncate ${isUnread ? 'font-medium' : 'text-muted-foreground'}`}>
                {subject}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {preview}
              </p>
            </div>
            {unreadCount && unreadCount > 0 && (
              <Badge className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}