import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { Socket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketWithServer extends Socket {
  server: NetServer & {
    io?: IOServer;
  };
}

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map<string, Set<string>>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as unknown as SocketWithServer;
  if (!socket || !socket.server) {
    res.status(500).json({ message: 'Socket server not available' });
    return;
  }

  const server = socket.server;

  if (!server.io) {
    const io = new IOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    server.io = io;

    io.on('connection', (socket) => {
      let currentUserId: string | null = null;

      // User joins with their ID
      socket.on('user-join', (userId: string) => {
        if (!userId) return;

        currentUserId = userId;
        socket.join(`user-${userId}`);

        // Track online status
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)?.add(socket.id);

        // Broadcast online status
        io.emit('user-online', { userId });

        // Send current online users to the new user
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit('online-users', onlineUserIds);
      });

      // Join conversation room
      socket.on('join-room', (room: string) => {
        socket.join(room);
      });

      socket.on('leave-room', (room: string) => {
        socket.leave(room);
      });

      // Messaging
      socket.on('send-message', async (data) => {
        const { conversationId, collaborationId, senderId, receiverId, content } = data || {};

        try {
          // Import required models dynamically to avoid circular dependencies
          const dbConnect = (await import('../../lib/db/connect')).default;
          const MessageModel = (await import('../../../models/message/Message')).default;
          const { Types } = await import('mongoose');

          await dbConnect();

          // Check if receiver is currently in the conversation room
          let isReceiverInRoom = false;
          const receiverSockets = onlineUsers.get(receiverId);
          if (receiverSockets) {
            for (const socketId of receiverSockets) {
              const receiverSocket = io.sockets.sockets.get(socketId);
              if (receiverSocket && receiverSocket.rooms.has(conversationId || collaborationId)) {
                isReceiverInRoom = true;
                break;
              }
            }
          }

          // Create the message in database
          const message = await MessageModel.create({
            senderId: new Types.ObjectId(senderId),
            receiverId: new Types.ObjectId(receiverId),
            content,
            collaborationId: new Types.ObjectId(collaborationId || conversationId),
            read: isReceiverInRoom // Auto-read if user is in room
          });

          // Transform message for response
          const messageObject = message.toObject();
          const transformedMessage = {
            ...messageObject,
            _id: (messageObject._id as any).toString(),
            senderId: (messageObject.senderId as any).toString(),
            receiverId: (messageObject.receiverId as any).toString(),
            collaborationId: (messageObject.collaborationId as any).toString(),
            createdAt: messageObject.createdAt,
            updatedAt: messageObject.updatedAt
          };

          // Emit to receiver in their user room
          socket.to(`user-${receiverId}`).emit('receive-message', transformedMessage);

          // Also broadcast to conversation room if someone is there
          if (conversationId || collaborationId) {
            socket.to(conversationId || collaborationId).emit('receive-message', transformedMessage);
          }

          // Confirm to sender
          socket.emit('message-sent', transformedMessage);

          // Get updated unread count for receiver and emit it
          try {
            const unreadCount = await MessageModel.countDocuments({
              receiverId: new Types.ObjectId(receiverId),
              read: false
            });

            // Emit unread count update to receiver
            io.to(`user-${receiverId}`).emit('unread-messages-update', { count: unreadCount });
          } catch (countError) {
            console.error('Failed to get unread message count:', countError);
          }
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message-error', { error: 'Failed to send message' });
        }
      });

      // Typing indicators
      socket.on('typing-start', (data) => {
        const { conversationId, userId } = data;
        if (conversationId) {
          socket.to(conversationId).emit('user-typing', { conversationId, userId, isTyping: true });
        }
      });

      socket.on('typing-stop', (data) => {
        const { conversationId, userId } = data;
        if (conversationId) {
          socket.to(conversationId).emit('user-typing', { conversationId, userId, isTyping: false });
        }
      });

      // Read receipts
      socket.on('message-read', async (data) => {
        const { conversationId, messageId, userId } = data;
        if (conversationId) {
          socket.to(conversationId).emit('message-read-update', { conversationId, messageId, userId });
        }

        // Update unread count for the user who read the message
        if (userId) {
          try {
            const MessageModel = (await import('../../../models/message/Message')).default;
            const { Types } = await import('mongoose');

            // Update the message to read: true
            if (messageId) {
              await MessageModel.findByIdAndUpdate(messageId, { read: true });
            }

            const unreadCount = await MessageModel.countDocuments({
              receiverId: new Types.ObjectId(userId),
              read: false
            });

            // Emit updated count to the user
            socket.emit('unread-messages-update', { count: unreadCount });
          } catch (error) {
            console.error('Failed to get unread message count:', error);
          }
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        if (currentUserId) {
          const userSockets = onlineUsers.get(currentUserId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              onlineUsers.delete(currentUserId);
              io.emit('user-offline', { userId: currentUserId });
            }
          }
        }
      });
    });
  }

  // Ensure global.io is always set, even if server.io already existed
  if (!(global as any).io && server.io) {
    (global as any).io = server.io;
  }

  res.end();
}