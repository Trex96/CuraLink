import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import CollaborationModel from '@/models/collaboration/Collaboration';
import UserModel from '@/models/user/User';
import NotificationModel from '@/models/notification/Notification';
import { Types } from 'mongoose';
import { Server as IOServer } from 'socket.io';

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

interface CollaborationDocument {
  _id: Types.ObjectId;
  requesterId: Types.ObjectId;
  receiverId: Types.ObjectId;
  context: string;
  status: string;
  createdAt: Date;
  save: () => Promise<void>;
  toObject: () => Record<string, unknown>;
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

    // Get user from database
    const user = await UserModel.findById((session.user as SessionUser).id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find collaboration request
    const collaboration = await CollaborationModel.findById(id) as CollaborationDocument | null;
    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    // Check if user is the receiver of this collaboration request
    if (collaboration.receiverId.toString() !== (user._id as Types.ObjectId).toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if collaboration is already accepted or declined
    if (collaboration.status !== 'pending') {
      return NextResponse.json({ error: `Collaboration is already ${collaboration.status}` }, { status: 400 });
    }

    // Decline collaboration request (silent - no notification to requester)
    collaboration.status = 'declined';
    await collaboration.save();

    // Instagram-style: No notification sent to requester about decline
    // They will still see as "Pending" and can cancel/resend

    // Get requester info for response data
    const requester = await UserModel.findById(collaboration.requesterId);

    // Transform collaboration data
    const requesterData = requester ? {
      requesterName: `${(requester as unknown as UserDocument).firstName} ${(requester as unknown as UserDocument).lastName}`,
      requesterInstitution: (requester as unknown as UserDocument).institution,
    } : {
      requesterName: 'Unknown User',
      requesterInstitution: '',
    };

    const receiverData = {
      receiverName: `${(user as unknown as UserDocument).firstName} ${(user as unknown as UserDocument).lastName}`,
      receiverInstitution: (user as unknown as UserDocument).institution,
    };

    const transformedCollaboration = {
      _id: collaboration._id.toString(),
      requesterId: collaboration.requesterId.toString(),
      receiverId: collaboration.receiverId.toString(),
      ...requesterData,
      ...receiverData,
      context: collaboration.context,
      status: collaboration.status,
      createdAt: collaboration.createdAt.toISOString(),
    };

    return NextResponse.json(transformedCollaboration);
  } catch (error) {
    console.error('Error declining collaboration request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}