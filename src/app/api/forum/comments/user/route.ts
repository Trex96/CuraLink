import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumCommentModel } from '@/models/forum/Forum';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as UserSession).id;
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const comments = await ForumCommentModel.find({
      authorId: userId
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('postId', 'title')
      .populate('authorId', 'firstName lastName role');
    
    const total = await ForumCommentModel.countDocuments({
      authorId: userId
    });
    
    return NextResponse.json({ 
      comments,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}