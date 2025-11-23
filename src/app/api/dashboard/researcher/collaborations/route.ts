import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import CollaborationModel from '@/models/collaboration/Collaboration';
import { Types } from 'mongoose';

interface SessionUser {
  id: string;
  role?: string;
}

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as SessionUser).id;
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const collaborations = await CollaborationModel.find({
      $or: [
        { requesterId: user._id as Types.ObjectId },
        { receiverId: user._id as Types.ObjectId }
      ],
      status: { $in: ['pending', 'accepted'] }
    })
      .populate('requesterId', 'firstName lastName institution')
      .populate('receiverId', 'firstName lastName institution')
      .sort({ createdAt: -1 })
      .lean();

    const transformed = collaborations.map((c: { _id: Types.ObjectId; requesterId?: { _id?: Types.ObjectId; firstName?: string; lastName?: string; institution?: string }; receiverId?: { _id?: Types.ObjectId; firstName?: string; lastName?: string; institution?: string }; context?: string; status?: string; createdAt?: Date; acceptedAt?: Date }) => ({
      _id: c._id.toString(),
      requesterId: c.requesterId?._id?.toString?.() ?? '',
      receiverId: c.receiverId?._id?.toString?.() ?? '',
      requesterName: c.requesterId ? `${c.requesterId.firstName} ${c.requesterId.lastName}` : '',
      requesterInstitution: c.requesterId?.institution ?? '',
      receiverName: c.receiverId ? `${c.receiverId.firstName} ${c.receiverId.lastName}` : '',
      receiverInstitution: c.receiverId?.institution ?? '',
      context: c.context,
      status: c.status,
      createdAt: c.createdAt?.toISOString?.() ?? new Date().toISOString(),
      acceptedAt: c.acceptedAt?.toISOString?.() ?? undefined,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching dashboard collaborations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}