import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function GET() {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as UserSession).id;
    
    // Get user's post count
    const postCount = await ForumPostModel.countDocuments({
      authorId: userId
    });
    
    // Get user's comment count
    const commentCount = await ForumCommentModel.countDocuments({
      authorId: userId
    });
    
    // Get user's upvote count (posts they've upvoted)
    const upvotedPosts = await ForumPostModel.find({
      upvotes: userId
    });
    
    const upvoteCount = upvotedPosts.length;
    
    // Calculate engagement score (simple formula)
    const engagementScore = (postCount * 3) + (commentCount * 2) + upvoteCount;
    
    return NextResponse.json({ 
      engagement: {
        postCount,
        commentCount,
        upvoteCount,
        score: engagementScore
      }
    });
  } catch (error) {
    console.error('Error fetching user engagement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}