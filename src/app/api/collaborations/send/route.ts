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
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface RequestData {
  receiverId: string;
  context: string;
}

interface UserDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    // Connect to database
    await dbConnect();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const requester = await UserModel.findById((session.user as SessionUser).id);
    if (!requester) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get request data
    const { receiverId, context } = await request.json() as RequestData;

    if (!receiverId || !context) {
      return NextResponse.json({ error: 'Receiver ID and context are required' }, { status: 400 });
    }

    // Check if receiver exists
    const receiver = await UserModel.findById(receiverId);
    if (!receiver) {
      return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
    }
    // Prevent sending a collaboration request to self
    if ((receiver as any)._id.equals((requester as any)._id)) {
      return NextResponse.json({ error: 'Cannot send collaboration request to yourself' }, { status: 400 });
    }

    // Check if collaboration request already exists
    const existingCollaboration = await CollaborationModel.findOne({
      requesterId: (requester as unknown as UserDocument)._id,
      receiverId: (receiver as unknown as UserDocument)._id,
    });

    if (existingCollaboration) {
      // Instagram-style: If declined, allow resending by deleting old and creating new
      if (existingCollaboration.status === 'declined') {
        await CollaborationModel.findByIdAndDelete(existingCollaboration._id);
        // Continue to create new collaboration below
      } else if (existingCollaboration.status === 'pending') {
        return NextResponse.json({ error: 'Connection request already sent' }, { status: 400 });
      } else if (existingCollaboration.status === 'accepted') {
        return NextResponse.json({ error: 'Already connected' }, { status: 400 });
      }
    }

    // Create collaboration request
    const collaboration = await CollaborationModel.create({
      requesterId: (requester as unknown as UserDocument)._id,
      receiverId: (receiver as unknown as UserDocument)._id,
      context,
    });

    // Create notification in DB
    const notification = await NotificationModel.create({
      userId: (receiver as unknown as UserDocument)._id,
      type: 'COLLABORATION_REQUEST',
      title: 'Collaboration Request',
      message: `${(requester as unknown as UserDocument).firstName} ${(requester as unknown as UserDocument).lastName} has sent you a collaboration request`,
      referenceId: (collaboration as unknown as { _id: Types.ObjectId })._id.toString(),
      read: false
    });

    // Emit real-time socket event
    try {
      const io = (global as any).io as IOServer | undefined;
      if (io) {
        io.to(`user-${(receiver as unknown as UserDocument)._id.toString()}`).emit('new-notification', {
          ...notification.toObject(),
          _id: (notification as any)._id.toString(),
          userId: (notification as any).userId.toString(),
          createdAt: (notification as any).createdAt || new Date().toISOString()
        });

        io.to(`user-${(receiver as unknown as UserDocument)._id.toString()}`).emit('new-collaboration-request', {
          message: `${(requester as unknown as UserDocument).firstName} ${(requester as unknown as UserDocument).lastName} sent you a connection request`
        });
      }
    } catch (error) {
      console.error('Error emitting socket event:', error);
    }

    // Transform collaboration data
    const collaborationObject = collaboration.toObject();
    const transformedCollaboration = {
      _id: (collaborationObject._id as unknown as Types.ObjectId).toString(),
      requesterId: (collaborationObject.requesterId as unknown as Types.ObjectId).toString(),
      receiverId: (collaborationObject.receiverId as unknown as Types.ObjectId).toString(),
      requesterName: `${(requester as unknown as UserDocument).firstName} ${(requester as unknown as UserDocument).lastName}`,
      receiverName: `${(receiver as unknown as UserDocument).firstName} ${(receiver as unknown as UserDocument).lastName}`,
      requesterInstitution: (requester as unknown as UserDocument).institution,
      receiverInstitution: (receiver as unknown as UserDocument).institution,
      context: collaborationObject.context,
      status: collaborationObject.status,
      createdAt: (collaborationObject.createdAt as Date).toISOString(),
    };

    return NextResponse.json({ collaboration: transformedCollaboration });
  } catch (error) {
    console.error('Error sending collaboration request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}