import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import CollaborationModel from '@/models/collaboration/Collaboration';
import UserModel from '@/models/user/User';
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

interface CollaborationDocument {
  _id: Types.ObjectId;
  requesterId: Types.ObjectId;
  receiverId: Types.ObjectId;
  context: string;
  status: string;
  createdAt: Date;
  acceptedAt?: Date;
}

export async function GET() {
  try {
    // Connect to database
    await dbConnect();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a researcher
    const user = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch active collaborations where user is either requester or receiver
    const collaborations = await CollaborationModel.find({
      $or: [
        { requesterId: user._id as Types.ObjectId },
        { receiverId: user._id as Types.ObjectId }
      ],
      status: 'accepted'
    })
      .populate('requesterId', 'firstName lastName institution')
      .populate('receiverId', 'firstName lastName institution')
      .sort({ acceptedAt: -1 })
      .lean();

    // Transform collaborations data
    const transformedCollaborations = collaborations.map(collab => ({
      _id: (collab as unknown as CollaborationDocument)._id.toString(),
      requesterId: (collab.requesterId as unknown as UserDocument)._id.toString(),
      receiverId: (collab.receiverId as unknown as UserDocument)._id.toString(),
      requesterName: `${(collab.requesterId as unknown as UserDocument).firstName} ${(collab.requesterId as unknown as UserDocument).lastName}`,
      receiverName: `${(collab.receiverId as unknown as UserDocument).firstName} ${(collab.receiverId as unknown as UserDocument).lastName}`,
      requesterInstitution: (collab.requesterId as unknown as UserDocument).institution,
      receiverInstitution: (collab.receiverId as unknown as UserDocument).institution,
      context: (collab as unknown as CollaborationDocument).context,
      status: (collab as unknown as CollaborationDocument).status,
      createdAt: (collab as unknown as CollaborationDocument).createdAt.toISOString(),
      ...((collab as unknown as CollaborationDocument).acceptedAt && { acceptedAt: (collab as unknown as CollaborationDocument).acceptedAt!.toISOString() }),
    }));

    return NextResponse.json(transformedCollaborations);
  } catch (error) {
    console.error('Error fetching active collaborations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}