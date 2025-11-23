import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import { getUserConversations } from '@/lib/services/messages';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserDocument {
  _id: string;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
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

    // Check if user exists and has valid role
    const user = await UserModel.findById((session.user as SessionUser).id) as UserDocument | null;
    if (!user || !['researcher', 'patient'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get user conversations
    const conversations = await getUserConversations((session.user as SessionUser).id);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}