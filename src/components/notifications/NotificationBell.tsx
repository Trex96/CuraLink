import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/types';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, refreshNotifications, markAllAsRead, markAsRead } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);

  // Handle real-time updates
  useEffect(() => {
    // Refresh notifications when dropdown opens
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refreshNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {unreadCount > 0 ? (
            <>
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-in zoom-in duration-300"
              >
                {unreadCount}
              </Badge>
            </>
          ) : (
            <BellOff
              className={`h-5 w-5 transition-opacity ${isHovered ? 'opacity-70' : 'opacity-100'}`}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-96 p-0"
        align="end"
        forceMount
      >
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : recentNotifications.length > 0 ? (
            <div className="divide-y">
              {recentNotifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-muted-foreground">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Bell className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium text-foreground mb-1">No notifications</p>
              <p className="text-sm">You&apos;re all caught up! Check back later for updates.</p>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t bg-muted/30">
          <Button
            variant="ghost"
            className="w-full text-sm h-9"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}