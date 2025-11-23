import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import CollaborationModel from '@/models/collaboration/Collaboration';

interface SessionUser {
    id: string;
    name?: string | null;
    email?: string | null;
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { otherUserId } = await request.json();
        if (!otherUserId) {
            return NextResponse.json({ error: 'otherUserId is required' }, { status: 400 });
        }

        const currentUserId = (session.user as SessionUser).id;

        // Find an accepted collaboration between these two users
        const collaboration = await CollaborationModel.findOne({
            status: 'accepted',
            $or: [
                { requesterId: currentUserId, receiverId: otherUserId },
                { requesterId: otherUserId, receiverId: currentUserId }
            ]
        }).populate('requesterId receiverId', 'firstName lastName profilePicture');

        if (!collaboration) {
            return NextResponse.json({ error: 'No active connection found' }, { status: 404 });
        }

        // Return collaboration ID which serves as conversation ID
        return NextResponse.json({
            collaborationId: (collaboration as any)._id.toString(),
            otherUser: (collaboration.requesterId as any)._id.toString() === currentUserId
                ? collaboration.receiverId
                : collaboration.requesterId
        });
    } catch (error) {
        console.error('Error getting conversation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
