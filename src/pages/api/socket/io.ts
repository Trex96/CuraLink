import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'net';
import { sendMessage, markMessageAsRead, addReaction, removeReaction } from '@/lib/services/messages';

export type NextApiResponseServerIO = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    console.log('🌐 Socket.IO endpoint called');

    if (!res.socket.server.io) {
        console.log('⚡ Initializing Socket.IO server...');
        const path = '/api/socket/io';
        const httpServer: NetServer = res.socket.server as any;
        const io = new SocketIOServer(httpServer, {
            path: path,
            addTrailingSlash: false,
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        io.on('connection', (socket) => {
            console.log('✅ Socket connected:', socket.id);

            // Join a specific chat room
            socket.on('join-chat', (collaborationId: string) => {
                socket.join(collaborationId);
                console.log(`🚪 Socket ${socket.id} joined chat ${collaborationId}`);
            });

            // Leave a specific chat room
            socket.on('leave-chat', (collaborationId: string) => {
                socket.leave(collaborationId);
                console.log(`🚶 Socket ${socket.id} left chat ${collaborationId}`);
            });

            // Handle user joining (for global notifications)
            socket.on('user-join', (userId: string) => {
                socket.join(userId);
                console.log(`👤 User ${userId} joined room ${userId}`);
                // Broadcast online status
                socket.broadcast.emit('user-online', userId);
            });

            // Handle sending messages
            socket.on('send-message', async (data) => {
                console.log('📨 Received send-message event:', {
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    collaborationId: data.collaborationId,
                    contentLength: data.content?.length,
                    hasAttachments: !!data.attachments?.length
                });

                try {
                    // Save to DB
                    console.log('💾 Attempting to save message to database...');
                    const message = await sendMessage(data);
                    console.log('✅ Message saved successfully:', message._id);

                    // Emit to everyone in the chat room (including sender for confirmation)
                    console.log('📢 Broadcasting to room:', data.collaborationId);
                    io.to(data.collaborationId).emit('new-message', message);

                    // Also emit notification to receiver's personal room
                    console.log('🔔 Sending notification to receiver:', data.receiverId);
                    io.to(data.receiverId).emit('notification', {
                        type: 'message',
                        message: message
                    });

                    console.log('✅ Message sent successfully!');
                } catch (error) {
                    console.error('❌ Error processing message:', error);
                    console.error('Error details:', {
                        message: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                        data
                    });
                    socket.emit('error', { message: 'Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error') });
                }
            });

            // Handle typing indicators
            socket.on('typing-start', (data: { collaborationId: string; userId: string; userName: string }) => {
                console.log('⌨️ Typing start:', data.userId);
                socket.to(data.collaborationId).emit('typing-start', data);
            });

            socket.on('typing-stop', (data: { collaborationId: string; userId: string }) => {
                console.log('⏸️ Typing stop:', data.userId);
                socket.to(data.collaborationId).emit('typing-stop', data);
            });

            // Handle read receipts
            socket.on('mark-read', async (data: { messageId: string; userId: string; collaborationId: string; senderId: string }) => {
                console.log('👁️ Mark read:', data.messageId);
                try {
                    const updatedMessage = await markMessageAsRead(data.messageId, data.userId);

                    // Notify the sender that their message was read
                    io.to(data.senderId).emit('message-read', {
                        messageId: data.messageId,
                        collaborationId: data.collaborationId,
                        readBy: data.userId
                    });

                    // Also update the chat room
                    io.to(data.collaborationId).emit('message-updated', updatedMessage);
                } catch (error) {
                    console.error('Error marking read:', error);
                }
            });

            // Handle reactions
            socket.on('add-reaction', async (data: { messageId: string; userId: string; emoji: string; collaborationId: string }) => {
                console.log('😊 Add reaction:', data.emoji);
                try {
                    const updatedMessage = await addReaction(data.messageId, data.userId, data.emoji);
                    io.to(data.collaborationId).emit('message-updated', updatedMessage);
                } catch (error) {
                    console.error('Error adding reaction:', error);
                }
            });

            socket.on('remove-reaction', async (data: { messageId: string; userId: string; emoji: string; collaborationId: string }) => {
                console.log('😐 Remove reaction:', data.emoji);
                try {
                    const updatedMessage = await removeReaction(data.messageId, data.userId, data.emoji);
                    io.to(data.collaborationId).emit('message-updated', updatedMessage);
                } catch (error) {
                    console.error('Error removing reaction:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log('❌ Socket disconnected:', socket.id);
                // Ideally we would track which user this socket belonged to and emit 'user-offline'
            });
        });

        res.socket.server.io = io;
        console.log('✅ Socket.IO server initialized successfully');
    } else {
        console.log('ℹ️ Socket.IO server already initialized');
    }
    res.end();
};

export default ioHandler;
