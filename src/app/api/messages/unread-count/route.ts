import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import MessageModel from '@/models/message/Message';
import UserModel from '@/models/user/User';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Verify session
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user matches the requested ID (privacy) or is an admin (optional, but good practice)
        // For now, just ensure they are logged in and have a valid role
        const user = await UserModel.findById((session.user as { id: string }).id);
        if (!user || !['researcher', 'patient'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Optional: Ensure user is checking their own count
        if ((session.user as { id: string }).id !== userId) {
            return NextResponse.json({ error: 'Forbidden: Can only check own unread count' }, { status: 403 });
        }

        const count = await MessageModel.countDocuments({
            receiverId: new Types.ObjectId(userId),
            read: false
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread message count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unread message count' },
            { status: 500 }
        );
    }
}
