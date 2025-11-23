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

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
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
    
    // Determine badges based on activity
    const badges: Badge[] = [];
    
    if (postCount >= 1) {
      badges.push({
        id: 'first-post',
        name: 'First Post',
        description: 'Created your first forum post',
        icon: '📝',
        earned: true
      });
    }
    
    if (postCount >= 10) {
      badges.push({
        id: 'prolific-poster',
        name: 'Prolific Poster',
        description: 'Created 10 forum posts',
        icon: '✍️',
        earned: true
      });
    }
    
    if (postCount >= 50) {
      badges.push({
        id: 'forum-veteran',
        name: 'Forum Veteran',
        description: 'Created 50 forum posts',
        icon: '🏆',
        earned: true
      });
    }
    
    if (commentCount >= 1) {
      badges.push({
        id: 'first-comment',
        name: 'First Comment',
        description: 'Made your first forum comment',
        icon: '💬',
        earned: true
      });
    }
    
    if (commentCount >= 25) {
      badges.push({
        id: 'active-commenter',
        name: 'Active Commenter',
        description: 'Made 25 forum comments',
        icon: '🗣️',
        earned: true
      });
    }
    
    if (receivedUpvotes >= 10) {
      badges.push({
        id: 'appreciated-author',
        name: 'Appreciated Author',
        description: 'Received 10 upvotes on your posts',
        icon: '👍',
        earned: true
      });
    }
    
    if (upvoteCount >= 50) {
      badges.push({
        id: 'community-supporter',
        name: 'Community Supporter',
        description: 'Upvoted 50 forum posts',
        icon: '👏',
        earned: true
      });
    }
    
    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}