import dbConnect from '@/lib/db/connect';
import MessageModel from '@/models/message/Message';
import CollaborationModel from '@/models/collaboration/Collaboration';
import UserModel from '@/models/user/User';
import { Types } from 'mongoose';

export interface MessageData {
  senderId: string;
  receiverId: string;
  content: string;
  collaborationId: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  replyTo?: string;
  metadata?: {
    size?: number;
    duration?: number;
    mimeType?: string;
    fileName?: string;
  };
  attachments?: {
    url: string;
    type: 'image' | 'video' | 'file';
    name: string;
  }[];
}

export interface ConversationData {
  collaborationId: string;
  requesterId: string;
  receiverId: string;
  requesterName: string;
  receiverName: string;
  requesterInstitution: string;
  receiverInstitution: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  isMuted: boolean;
}

interface UserDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
}

// Send a new message
export async function sendMessage(messageData: MessageData) {
  await dbConnect();

  try {
    // Verify collaboration exists and is accepted
    const collaboration = await CollaborationModel.findOne({
      _id: messageData.collaborationId,
      status: 'accepted',
      $or: [
        { requesterId: messageData.senderId, receiverId: messageData.receiverId },
        { requesterId: messageData.receiverId, receiverId: messageData.senderId }
      ]
    });

    if (!collaboration) {
      throw new Error('Collaboration not found or not accepted');
    }

    // Create the message
    const message = await MessageModel.create({
      senderId: new Types.ObjectId(messageData.senderId),
      receiverId: new Types.ObjectId(messageData.receiverId),
      content: messageData.content,
      collaborationId: new Types.ObjectId(messageData.collaborationId),
      status: 'sent',
      read: false,
      type: messageData.type || 'text',
      replyTo: messageData.replyTo ? new Types.ObjectId(messageData.replyTo) : undefined,
      metadata: messageData.metadata,
      attachments: messageData.attachments || []
    });

    const messageObject = message.toObject();
    return {
      ...messageObject,
      _id: (messageObject._id as unknown as Types.ObjectId).toString(),
      senderId: (messageObject.senderId as unknown as Types.ObjectId).toString(),
      receiverId: (messageObject.receiverId as unknown as Types.ObjectId).toString(),
      collaborationId: (messageObject.collaborationId as unknown as Types.ObjectId).toString(),
      createdAt: messageObject.createdAt,
      updatedAt: messageObject.updatedAt
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Get messages for a conversation
export async function getMessages(collaborationId: string, userId: string, limit: number = 50, offset: number = 0) {
  await dbConnect();

  try {
    const messages = await MessageModel.find({
      collaborationId: new Types.ObjectId(collaborationId),
      deletedFor: { $ne: new Types.ObjectId(userId) } // Exclude messages deleted for this user
    })
      .sort({ createdAt: 1 }) // Sort by oldest first for chat history
      .skip(offset)
      .limit(limit)
      .populate('replyTo', 'content senderId type') // Populate replied message
      .lean();

    return messages.map(message => ({
      ...message,
      _id: (message._id as unknown as Types.ObjectId).toString(),
      senderId: (message.senderId as unknown as Types.ObjectId).toString(),
      receiverId: (message.receiverId as unknown as Types.ObjectId).toString(),
      collaborationId: (message.collaborationId as unknown as Types.ObjectId).toString(),
      replyTo: message.replyTo ? {
        ...message.replyTo,
        _id: ((message.replyTo as any)._id as Types.ObjectId).toString(),
        senderId: ((message.replyTo as any).senderId as Types.ObjectId).toString()
      } : undefined,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: string, userId: string) {
  await dbConnect();

  try {
    const message = await MessageModel.findOneAndUpdate(
      { _id: new Types.ObjectId(messageId), receiverId: new Types.ObjectId(userId) },
      { read: true, status: 'read' },
      { new: true }
    );

    if (!message) {
      throw new Error('Message not found or unauthorized');
    }

    const messageObject = message.toObject();
    return {
      ...messageObject,
      _id: (messageObject._id as unknown as Types.ObjectId).toString(),
      senderId: (messageObject.senderId as unknown as Types.ObjectId).toString(),
      receiverId: (messageObject.receiverId as unknown as Types.ObjectId).toString(),
      collaborationId: (messageObject.collaborationId as unknown as Types.ObjectId).toString(),
      createdAt: messageObject.createdAt,
      updatedAt: messageObject.updatedAt
    };
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

// Add reaction
export async function addReaction(messageId: string, userId: string, emoji: string) {
  await dbConnect();

  try {
    // Remove existing reaction from this user if any (to toggle or replace)
    await MessageModel.updateOne(
      { _id: new Types.ObjectId(messageId) },
      { $pull: { reactions: { userId: new Types.ObjectId(userId) } } }
    );

    const message = await MessageModel.findOneAndUpdate(
      { _id: new Types.ObjectId(messageId) },
      { $push: { reactions: { emoji, userId: new Types.ObjectId(userId) } } },
      { new: true }
    );

    if (!message) throw new Error('Message not found');
    return message.toObject();
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
}

// Remove reaction
export async function removeReaction(messageId: string, userId: string, emoji: string) {
  await dbConnect();

  try {
    const message = await MessageModel.findOneAndUpdate(
      { _id: new Types.ObjectId(messageId) },
      { $pull: { reactions: { userId: new Types.ObjectId(userId), emoji } } },
      { new: true }
    );

    if (!message) throw new Error('Message not found');
    return message.toObject();
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
}

// Get conversations for a user
export async function getUserConversations(userId: string) {
  await dbConnect();

  try {
    // Find accepted collaborations where user is either requester or receiver
    const collaborations = await CollaborationModel.find({
      status: 'accepted',
      $or: [
        { requesterId: new Types.ObjectId(userId) },
        { receiverId: new Types.ObjectId(userId) }
      ]
    }).lean();

    // Get user details for all collaborators
    const userIds = new Set<string>();
    collaborations.forEach(collab => {
      userIds.add(collab.requesterId.toString());
      userIds.add(collab.receiverId.toString());
    });

    const users = await UserModel.find({
      _id: { $in: Array.from(userIds).map(id => new Types.ObjectId(id)) }
    }).lean();

    const userMap = new Map<string, Record<string, unknown>>();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });

    // Get last message and unread count for each conversation
    const conversationData: ConversationData[] = [];

    for (const collaboration of collaborations) {
      // Check if archived by current user
      const isArchived = collaboration.archivedBy?.some(id => id.toString() === userId) || false;
      const isPinned = collaboration.pinnedBy?.some(id => id.toString() === userId) || false;
      const isMuted = collaboration.mutedBy?.some(id => id.toString() === userId) || false;

      const requester = userMap.get(collaboration.requesterId.toString());
      const receiver = userMap.get(collaboration.receiverId.toString());

      if (!requester || !receiver) continue;

      // Get last message
      const lastMessage = await MessageModel.findOne({
        collaborationId: collaboration._id,
        deletedFor: { $ne: new Types.ObjectId(userId) }
      }).sort({ createdAt: -1 }).lean();

      // Get unread count for current user
      const unreadCount = await MessageModel.countDocuments({
        collaborationId: collaboration._id,
        receiverId: new Types.ObjectId(userId),
        read: false,
        deletedFor: { $ne: new Types.ObjectId(userId) }
      });

      conversationData.push({
        collaborationId: collaboration._id.toString(),
        requesterId: collaboration.requesterId.toString(),
        receiverId: collaboration.receiverId.toString(),
        requesterName: `${(requester as unknown as UserDocument).firstName} ${(requester as unknown as UserDocument).lastName}`,
        receiverName: `${(receiver as unknown as UserDocument).firstName} ${(receiver as unknown as UserDocument).lastName}`,
        requesterInstitution: (requester as unknown as UserDocument).institution || '',
        receiverInstitution: (receiver as unknown as UserDocument).institution || '',
        lastMessage: lastMessage?.content || (lastMessage?.attachments?.length ? 'Attachment' : ''),
        lastMessageTime: lastMessage?.createdAt,
        unreadCount,
        isArchived,
        isPinned,
        isMuted
      });
    }

    // Sort by pinned first, then last message time
    return conversationData.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

// Get unread message count for a user
export async function getUnreadMessageCount(userId: string) {
  await dbConnect();

  try {
    return await MessageModel.countDocuments({
      receiverId: new Types.ObjectId(userId),
      read: false,
      deletedFor: { $ne: new Types.ObjectId(userId) }
    });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    throw error;
  }
}

// Archive a conversation
export async function archiveConversation(collaborationId: string, userId: string) {
  await dbConnect();

  try {
    await CollaborationModel.findByIdAndUpdate(
      collaborationId,
      { $addToSet: { archivedBy: new Types.ObjectId(userId) } }
    );
    return { success: true };
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
}

// Unarchive a conversation
export async function unarchiveConversation(collaborationId: string, userId: string) {
  await dbConnect();

  try {
    await CollaborationModel.findByIdAndUpdate(
      collaborationId,
      { $pull: { archivedBy: new Types.ObjectId(userId) } }
    );
    return { success: true };
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    throw error;
  }
}

// Delete a message (Delete for everyone or just for me)
export async function deleteMessage(messageId: string, userId: string, deleteForEveryone: boolean = false) {
  await dbConnect();

  try {
    const message = await MessageModel.findOne({ _id: messageId });

    if (!message) {
      throw new Error('Message not found');
    }

    if (deleteForEveryone) {
      if (message.senderId.toString() !== userId) {
        throw new Error('Unauthorized to delete this message for everyone');
      }
      // Hard delete or soft delete content? WhatsApp usually shows "This message was deleted"
      // Let's update content to "This message was deleted" and type to 'system'
      await MessageModel.findByIdAndUpdate(messageId, {
        content: 'This message was deleted',
        type: 'system',
        attachments: [],
        deletedFor: [] // Reset deletedFor since it's now deleted for everyone
      });
    } else {
      // Delete for me only
      await MessageModel.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: new Types.ObjectId(userId) }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}