import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import MessageModel from '@/models/message/Message';
import { Types } from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { conversationId } = body;

        if (!conversationId) {
            return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;

        // Update all unread messages in this conversation sent to the current user
        const result = await MessageModel.updateMany(
            {
                collaborationId: new Types.ObjectId(conversationId),
                receiverId: new Types.ObjectId(userId),
                read: false
            },
            {
                $set: { read: true }
            }
        );

        // Get updated unread count
        const unreadCount = await MessageModel.countDocuments({
            receiverId: new Types.ObjectId(userId),
            read: false
        });

        // Try to emit socket event if global io is available
        const io = (global as any).io;
        if (io) {
            io.to(`user-${userId}`).emit('unread-messages-update', { count: unreadCount });
        }

        return NextResponse.json({
            success: true,
            modifiedCount: result.modifiedCount,
            unreadCount
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}
