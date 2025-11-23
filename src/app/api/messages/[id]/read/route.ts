import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import { markMessageAsRead } from '@/lib/services/messages';
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

export async function PUT(
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

    // Check if user is a researcher
    const user = await UserModel.findById((session.user as SessionUser).id) as UserDocument | null;
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate message ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    // Mark message as read
    const message = await markMessageAsRead(id, (session.user as SessionUser).id);

    return NextResponse.json(message);
  } catch (error: unknown) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}