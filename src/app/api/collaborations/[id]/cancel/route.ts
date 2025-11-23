import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import CollaborationModel from '@/models/collaboration/Collaboration';
import UserModel from '@/models/user/User';
import NotificationModel from '@/models/notification/Notification';
import { Types } from 'mongoose';

interface SessionUser {
    id: string;
    role: string;
}

interface CollaborationDocument {
    _id: Types.ObjectId;
    requesterId: Types.ObjectId;
    receiverId: Types.ObjectId;
    status: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Connect to database
        await dbConnect();
        const { id } = await params;

        // Get user session
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as SessionUser).id;

        // Find collaboration request
        const collaboration = await CollaborationModel.findById(id) as CollaborationDocument | null;
        if (!collaboration) {
            return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
        }

        // Check if user is the requester of this collaboration request
        if (collaboration.requesterId.toString() !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if collaboration is pending
        if (collaboration.status !== 'pending') {
            return NextResponse.json({ error: `Cannot cancel request with status: ${collaboration.status}` }, { status: 400 });
        }

        // Delete collaboration request
        await CollaborationModel.findByIdAndDelete(id);

        // Delete associated notification
        await NotificationModel.findOneAndDelete({
            referenceId: id,
            type: 'COLLABORATION_REQUEST'
        });

        return NextResponse.json({ message: 'Request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling collaboration request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
