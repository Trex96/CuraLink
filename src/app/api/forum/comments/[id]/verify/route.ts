import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { verifyCommentAsAnswer } from '@/lib/services/comments';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is researcher
    const userRole = (session.user as UserSession).role;
    if (userRole !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id: commentId } = await context.params;
    
    if (!commentId) {
      return NextResponse.json({ error: 'Missing comment ID' }, { status: 400 });
    }
    
    // Validate comment id format
    const { Types } = await import('mongoose');
    if (!Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }
    
    // Verify the comment
    const result = await verifyCommentAsAnswer(commentId, (session.user as UserSession).id);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying forum comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}