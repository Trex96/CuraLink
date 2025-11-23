import dbConnect from '@/lib/db/connect';
import NotificationModel from '@/models/notification/Notification';
import { Types } from 'mongoose';
import { Notification } from '@/types';

/**
 * Server-side notification creation - directly saves to database
 * Use this in API routes, server components, and Socket.IO handlers
 */
export async function createNotificationServer(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    referenceId?: string
): Promise<Notification> {
    try {
        await dbConnect();

        const notification = await NotificationModel.create({
            userId: new Types.ObjectId(userId),
            type,
            title,
            message,
            referenceId,
            read: false,
        });

        const notificationObject = notification.toObject();
        return {
            _id: (notificationObject._id as Types.ObjectId).toString(),
            userId: (notificationObject.userId as Types.ObjectId).toString(),
            type: notificationObject.type as Notification['type'],
            title: notificationObject.title,
            message: notificationObject.message,
            read: notificationObject.read,
            link: notificationObject.link,
            referenceId: notificationObject.referenceId,
            createdAt: notificationObject.createdAt,
            updatedAt: notificationObject.updatedAt,
        };
    } catch (error) {
        console.error('Error creating notification on server:', error);
        throw error;
    }
}

/**
 * Send message notification (server-side)
 */
export async function sendMessageNotificationServer(
    userId: string,
    message: string,
    conversationId: string
): Promise<Notification> {
    return createNotificationServer(
        userId,
        'NEW_MESSAGE',
        'New Message',
        message,
        conversationId
    );
}

/**
 * Send collaboration notification (server-side)
 */
export async function sendCollaborationNotificationServer(
    userId: string,
    type: 'COLLABORATION_REQUEST' | 'COLLABORATION_ACCEPTED' | 'COLLABORATION_DECLINED',
    message: string,
    collaborationId: string
): Promise<Notification> {
    return createNotificationServer(
        userId,
        type,
        type === 'COLLABORATION_REQUEST' ? 'Collaboration Request' :
            type === 'COLLABORATION_ACCEPTED' ? 'Collaboration Accepted' :
                'Collaboration Declined',
        message,
        collaborationId
    );
}

/**
 * Send forum reply notification (server-side)
 */
export async function sendForumReplyNotificationServer(
    userId: string,
    message: string,
    postId: string
): Promise<Notification> {
    return createNotificationServer(
        userId,
        'FORUM_REPLY',
        'New Forum Reply',
        message,
        postId
    );
}
