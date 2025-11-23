import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import CollaborationModel from '@/models/collaboration/Collaboration';
import { getMessages } from '@/lib/services/messages';
import { Types } from 'mongoose';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await dbConnect();
    const { id } = await params;

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists and has valid role
    const user = await UserModel.findById((session.user as SessionUser).id) as UserDocument | null;
    if (!user || !['researcher', 'patient'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify collaboration exists and user is part of it
    const collaboration = await CollaborationModel.findOne({
      _id: new Types.ObjectId(id),
      status: 'accepted',
      $or: [
        { requesterId: new Types.ObjectId((session.user as SessionUser).id) },
        { receiverId: new Types.ObjectId((session.user as SessionUser).id) }
      ]
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found or not accepted' }, { status: 404 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get messages for this collaboration
    const messages = await getMessages(id, limit, offset);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}