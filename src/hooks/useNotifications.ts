'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { Notification } from '@/types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === id
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notification => notification._id !== id)
        );
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n._id === id);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) {
      console.log('useNotifications: No socket available');
      return;
    }

    console.log('useNotifications: Setting up socket listener');

    const handleNewNotification = (notification: Notification) => {
      console.log('🔔 Received new notification via socket:', notification);
      setNotifications(prev => {
        console.log('Current notifications:', prev.length);
        return [notification, ...prev];
      });
      setUnreadCount(prev => {
        console.log('Incrementing unread count from', prev, 'to', prev + 1);
        return prev + 1;
      });

      // Play notification sound
      if (typeof window !== 'undefined') {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.log('Notification sound error:', e));
      }
    };

    // Listen for the event name that API routes emit
    socket.on('new-notification', handleNewNotification);
    console.log('useNotifications: Subscribed to new-notification event');

    return () => {
      console.log('useNotifications: Cleaning up socket listener');
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket]);

  // Initial fetch - only run once on mount
  useEffect(() => {
    console.log('useNotifications: Initial fetch');
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array to run only once

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}