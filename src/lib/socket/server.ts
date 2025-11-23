import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import dbConnect from '../db/connect';
import MessageModel from '../../../models/message/Message';
import CollaborationModel from '../../../models/collaboration/Collaboration';
import { Types } from 'mongoose';

interface UserData {
  senderId: string;
  receiverId: string;
  content: string;
  collaborationId: string;
}

interface CollaborationData {
  receiverId: string;
  requesterId: string;
}

interface TransformedMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  collaborationId: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export const initSocketIO = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Store user socket connections
  const userSockets = new Map<string, string>();
  // Store user online status
  const userStatus = new Map<string, boolean>();

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room ${room}`);
    });

    // User joins with their user ID
    socket.on('user-join', (userId: string) => {
      userSockets.set(userId, socket.id);
      userStatus.set(userId, true);
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined with socket ${socket.id}`);
      
      // Notify other users that this user is online
      socket.broadcast.emit('user-online', { userId });
    });

    socket.on('send-message', async (data: UserData) => {
      try {
        await dbConnect();
        
        // Verify collaboration exists and is accepted
        const collaboration = await CollaborationModel.findOne({
          _id: data.collaborationId,
          status: 'accepted',
          $or: [
            { requesterId: data.senderId, receiverId: data.receiverId },
            { requesterId: data.receiverId, receiverId: data.senderId }
          ]
        });
        
        if (!collaboration) {
          socket.emit('message-error', { error: 'Collaboration not found or not accepted' });
          return;
        }
        
        // Create the message in database
        const message = await MessageModel.create({
          senderId: new Types.ObjectId(data.senderId),
          receiverId: new Types.ObjectId(data.receiverId),
          content: data.content,
          collaborationId: new Types.ObjectId(data.collaborationId),
          read: false
        });
        
        // Transform message for response
        const messageObject = message.toObject();
        const transformedMessage: TransformedMessage = {
          ...messageObject,
          _id: (messageObject._id as unknown as Types.ObjectId).toString(),
          senderId: (messageObject.senderId as unknown as Types.ObjectId).toString(),
          receiverId: (messageObject.receiverId as unknown as Types.ObjectId).toString(),
          collaborationId: (messageObject.collaborationId as unknown as Types.ObjectId).toString(),
          createdAt: messageObject.createdAt as Date,
          updatedAt: messageObject.updatedAt as Date
        };
        
        // Broadcast message to receiver's room
        const receiverSocketId = userSockets.get(data.receiverId);
        if (receiverSocketId) {
          socket.to(`user-${data.receiverId}`).emit('receive-message', transformedMessage);
        }
        
        // Also emit to sender for confirmation
        socket.emit('message-sent', transformedMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data: UserData) => {
      // Notify receiver that sender is typing
      socket.to(`user-${data.receiverId}`).emit('user-typing', { 
        senderId: data.senderId, 
        collaborationId: data.collaborationId,
        isTyping: true 
      });
    });

    socket.on('typing-stop', (data: UserData) => {
      // Notify receiver that sender stopped typing
      socket.to(`user-${data.receiverId}`).emit('user-typing', { 
        senderId: data.senderId, 
        collaborationId: data.collaborationId,
        isTyping: false 
      });
    });

    // Handle collaboration events
    socket.on('collaboration-request', (data: CollaborationData) => {
      // Notify the receiver of a new collaboration request
      const { receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        socket.to(`user-${receiverId}`).emit('new-collaboration-request', data);
      }
    });

    socket.on('collaboration-accepted', (data: CollaborationData) => {
      // Notify the requester that their collaboration was accepted
      const { requesterId } = data;
      const requesterSocketId = userSockets.get(requesterId);
      if (requesterSocketId) {
        socket.to(`user-${requesterId}`).emit('collaboration-accepted', data);
      }
    });

    socket.on('collaboration-declined', (data: CollaborationData) => {
      // Notify the requester that their collaboration was declined
      const { requesterId } = data;
      const requesterSocketId = userSockets.get(requesterId);
      if (requesterSocketId) {
        socket.to(`user-${requesterId}`).emit('collaboration-declined', data);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Find and remove user from sockets map
      let userId = '';
      const entries = Array.from(userSockets.entries());
      for (const [id, socketId] of entries) {
        if (socketId === socket.id) {
          userId = id;
          userSockets.delete(id);
          userStatus.set(id, false);
          break;
        }
      }
      
      // Notify other users that this user is offline
      if (userId) {
        socket.broadcast.emit('user-offline', { userId });
      }
    });
  });

  return io;
};