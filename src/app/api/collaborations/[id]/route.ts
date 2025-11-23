import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import CollaborationModel from '@/models/collaboration/Collaboration';
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

        // Find collaboration
        const collaboration = await CollaborationModel.findById(id) as CollaborationDocument | null;
        if (!collaboration) {
            return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
        }

        // Check if user is part of this collaboration
        if (
            collaboration.requesterId.toString() !== userId &&
            collaboration.receiverId.toString() !== userId
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete collaboration
        await CollaborationModel.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Collaboration removed successfully' });
    } catch (error) {
        console.error('Error removing collaboration:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
