import { Notification } from '@/types';
import socketClient from '../socket/client';
import { Socket } from 'socket.io-client';

// Create a new notification
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  referenceId?: string
): Promise<Notification> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type,
        title,
        message,
        referenceId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    const notification = await response.json();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Send real-time notification via socket
export function sendRealTimeNotification(socket: Socket, notification: Notification): void {
  if (socket && socket.connected) {
    socket.emit('notification', notification);
  }
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Delete a notification
export async function deleteNotification(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// Get notifications for a user
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const response = await fetch(`/api/notifications?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

// Send collaboration notification
export async function sendCollaborationNotification(
  userId: string,
  type: 'COLLABORATION_REQUEST' | 'COLLABORATION_ACCEPTED' | 'COLLABORATION_DECLINED',
  message: string,
  collaborationId: string
): Promise<void> {
  try {
    // Create the notification
    const notification = await createNotification(
      userId,
      type,
      type === 'COLLABORATION_REQUEST' ? 'Collaboration Request' :
      type === 'COLLABORATION_ACCEPTED' ? 'Collaboration Accepted' :
      'Collaboration Declined',
      message,
      collaborationId
    );
    
    // Send real-time notification
    const socket = socketClient.getSocket();
    if (socket) {
      sendRealTimeNotification(socket, notification);
    }
  } catch (error) {
    console.error('Error sending collaboration notification:', error);
    throw error;
  }
}

// Send message notification
export async function sendMessageNotification(
  userId: string,
  message: string,
  conversationId: string
): Promise<void> {
  try {
    // Create the notification
    const notification = await createNotification(
      userId,
      'NEW_MESSAGE',
      'New Message',
      message,
      conversationId
    );
    
    // Send real-time notification
    const socket = socketClient.getSocket();
    if (socket) {
      sendRealTimeNotification(socket, notification);
    }
  } catch (error) {
    console.error('Error sending message notification:', error);
    throw error;
  }
}

// Send forum reply notification
export async function sendForumReplyNotification(
  userId: string,
  message: string,
  postId: string
): Promise<void> {
  try {
    // Create the notification
    const notification = await createNotification(
      userId,
      'FORUM_REPLY',
      'New Forum Reply',
      message,
      postId
    );
    
    // Send real-time notification
    const socket = socketClient.getSocket();
    if (socket) {
      sendRealTimeNotification(socket, notification);
    }
  } catch (error) {
    console.error('Error sending forum reply notification:', error);
    throw error;
  }
}

// Send expert request notification
export async function sendExpertRequestNotification(
  userId: string,
  message: string,
  researcherId: string
): Promise<void> {
  try {
    // Create the notification
    const notification = await createNotification(
      userId,
      'EXPERT_REQUEST',
      'Expert Request',
      message,
      researcherId
    );
    
    // Send real-time notification
    const socket = socketClient.getSocket();
    if (socket) {
      sendRealTimeNotification(socket, notification);
    }
  } catch (error) {
    console.error('Error sending expert request notification:', error);
    throw error;
  }
}

// Send new publication notification
export async function sendNewPublicationNotification(
  userId: string,
  message: string,
  publicationId: string
): Promise<void> {
  try {
    // Create the notification
    const notification = await createNotification(
      userId,
      'NEW_PUBLICATION',
      'New Publication',
      message,
      publicationId
    );
    
    // Send real-time notification
    const socket = socketClient.getSocket();
    if (socket) {
      sendRealTimeNotification(socket, notification);
    }
  } catch (error) {
    console.error('Error sending new publication notification:', error);
    throw error;
  }
}

// Send new trial notification
export async function sendNewTrialNotification(
  userId: string,
  message: string,
  trialId: string
): Promise<void> {
  try {
    // Create the notification
    const notification = await createNotification(
      userId,
      'NEW_TRIAL',
      'New Trial Near You',
      message,
      trialId
    );
    
    // Send real-time notification
    const socket = socketClient.getSocket();
    if (socket) {
      sendRealTimeNotification(socket, notification);
    }
  } catch (error) {
    console.error('Error sending new trial notification:', error);
    throw error;
  }
}

// Send new question in field notification
export async function sendNewQuestionInFieldNotification(
  userId: string,
  message: string,
  postId: string
): Promise<void> {
  try {
    // Create the notification
    const notification = await createNotification(
      userId,
      'NEW_QUESTION_IN_FIELD',
      'New Question in Your Field',
      message,
      postId
    );
    
    // Send real-time notification
    const socket = socketClient.getSocket();
    if (socket) {
      sendRealTimeNotification(socket, notification);
    }
  } catch (error) {
    console.error('Error sending new question in field notification:', error);
    throw error;
  }
}
