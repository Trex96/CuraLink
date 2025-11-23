import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

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
    
    // Get user's received upvotes (upvotes on their posts)
    const userPosts = await ForumPostModel.find({
      authorId: userId
    });
    
    const receivedUpvotes = userPosts.reduce((total, post) => {
      return total + (post.upvotes as Types.ObjectId[]).length;
    }, 0);
    
    return NextResponse.json({ 
      stats: {
        posts: postCount,
        comments: commentCount,
        upvotesGiven: upvoteCount,
        upvotesReceived: receivedUpvotes
      }
    });
  } catch (error) {
    console.error('Error fetching user forum stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}