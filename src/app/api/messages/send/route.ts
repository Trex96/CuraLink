import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import { sendMessage } from '@/lib/services/messages';
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

interface SendMessageRequest {
  receiverId: string;
  content: string;
  collaborationId: string;
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

    // Check if user exists and has valid role
    const user = await UserModel.findById((session.user as SessionUser).id) as UserDocument | null;
    if (!user || !['researcher', 'patient'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const body: SendMessageRequest = await request.json();
    const { receiverId, content, collaborationId } = body;

    // Validate required fields
    if (!receiverId || !content || !collaborationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(receiverId) || !Types.ObjectId.isValid(collaborationId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // Send message
    const message = await sendMessage({
      senderId: (session.user as SessionUser).id,
      receiverId,
      content,
      collaborationId
    });

    return NextResponse.json(message);
  } catch (error: unknown) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal server error' }, { status: 500 });
  }
}