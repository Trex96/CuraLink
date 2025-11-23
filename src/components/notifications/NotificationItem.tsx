'use client';

// import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  User,
  FlaskConical,
  BookOpen,
  Bell,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Notification } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClose
}: NotificationItemProps) {
  const router = useRouter();
  const { user } = useAuth();
  // const [isDeleting, setIsDeleting] = useState(false);

  const handleNotificationClick = () => {
    // Mark as read when clicked
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }

    const role = user?.role || 'patient';
    const dashboardPath = role === 'researcher' ? '/dashboard/researcher' : '/dashboard/patient';

    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case 'COLLABORATION_REQUEST':
      case 'COLLABORATION_ACCEPTED':
      case 'COLLABORATION_DECLINED':
        router.push(`${dashboardPath}/collaborations`);
        break;
      case 'NEW_MESSAGE':
        router.push(`${dashboardPath}/messages?collaboration=${notification.referenceId}`);
        break;
      case 'FORUM_REPLY':
        router.push(`/forum/${notification.referenceId}`);
        break;
      case 'EXPERT_REQUEST':
        router.push(`/researchers/${notification.referenceId}`);
        break;
      case 'NEW_PUBLICATION':
        router.push(`/publications/${notification.referenceId}`);
        break;
      case 'NEW_TRIAL':
        router.push(`/trials/${notification.referenceId}`);
        break;
      default:
        break;
    }

    onClose();
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification._id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // setIsDeleting(true);
    try {
      // TODO: Implement delete notification API call
      // await deleteNotification(notification._id);
      onClose();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      // setIsDeleting(false);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'COLLABORATION_REQUEST':
      case 'COLLABORATION_ACCEPTED':
      case 'COLLABORATION_DECLINED':
        return <User className="h-4 w-4" />;
      case 'NEW_MESSAGE':
        return <MessageCircle className="h-4 w-4" />;
      case 'FORUM_REPLY':
        return <MessageCircle className="h-4 w-4" />;
      case 'EXPERT_REQUEST':
        return <User className="h-4 w-4" />;
      case 'NEW_PUBLICATION':
        return <BookOpen className="h-4 w-4" />;
      case 'NEW_TRIAL':
        return <FlaskConical className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (notification.type) {
      case 'COLLABORATION_REQUEST':
        return 'Collaboration Request';
      case 'COLLABORATION_ACCEPTED':
        return 'Collaboration Accepted';
      case 'COLLABORATION_DECLINED':
        return 'Collaboration Declined';
      case 'NEW_MESSAGE':
        return 'New Message';
      case 'FORUM_REPLY':
        return 'New Forum Reply';
      case 'EXPERT_REQUEST':
        return 'Expert Request';
      case 'NEW_PUBLICATION':
        return 'New Publication';
      case 'NEW_TRIAL':
        return 'New Trial Near You';
      default:
        return notification.title || 'Notification';
    }
  };

  return (
    <div
      className={`p-4 hover:bg-muted cursor-pointer transition-colors ${!notification.read ? 'bg-muted/50' : ''
        }`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-full ${!notification.read ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm truncate">
              {getTitle()}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-2"
              onClick={handleDelete}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>

            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={handleMarkAsRead}
              >
                Mark as read
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}