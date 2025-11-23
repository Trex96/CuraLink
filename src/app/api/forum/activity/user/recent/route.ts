import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel, IForumPost, IForumComment } from '@/models/forum/Forum';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ActivityItem {
  type: 'post' | 'comment';
  data: IForumPost | IForumComment;
  createdAt: Date;
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
    
    // Get user's recent posts
    const userPosts = await ForumPostModel.find({
      authorId: userId
    })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2));
    
    // Get user's recent comments
    const userComments = await ForumCommentModel.find({
      authorId: userId
    })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .populate('postId', 'title');
    
    // Combine and sort by date
    const activity: ActivityItem[] = [
      ...userPosts.map(post => ({
        type: 'post' as const,
        data: post,
        createdAt: post.createdAt
      })),
      ...userComments.map(comment => ({
        type: 'comment' as const,
        data: comment,
        createdAt: comment.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching user recent activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}