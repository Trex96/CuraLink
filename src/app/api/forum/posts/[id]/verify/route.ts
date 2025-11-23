import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel } from '@/models/forum/Forum';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function PUT(
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
    
    const { id: postId } = await context.params;
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }
    const { Types } = await import('mongoose');
    if (!Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    // Update the post to mark it as researcher verified
    const post = await ForumPostModel.findByIdAndUpdate(
      postId,
      { isResearcherVerified: true },
      { new: true }
    );
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      post 
    });
  } catch (error) {
    console.error('Error verifying forum post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}