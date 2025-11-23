'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { markForumNotificationAsRead } from '@/lib/services/forum';

interface MarkNotificationAsReadButtonProps {
  notificationId: string;
  onMarkAsRead: () => void;
}

export function MarkNotificationAsReadButton({ 
  notificationId, 
  onMarkAsRead 
}: MarkNotificationAsReadButtonProps) {
  const [loading, setLoading] = useState(false);
  
  const handleMarkAsRead = async () => {
    try {
      setLoading(true);
      await markForumNotificationAsRead(notificationId);
      onMarkAsRead();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleMarkAsRead}
      disabled={loading}
    >
      {loading ? 'Processing...' : 'Mark as Read'}
    </Button>
  );
}