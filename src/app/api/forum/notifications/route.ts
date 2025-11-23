import { NextRequest, NextResponse } from 'next/server';
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

interface Author {
  firstName: string;
  lastName: string;
  _id: Types.ObjectId;
}

interface Post {
  title: string;
  _id: Types.ObjectId;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
  postId?: string;
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
    
    // Get posts where the user is the author and there are new comments
    const userPosts = await ForumPostModel.find({
      authorId: userId
    }).select('_id');
    
    const userPostIds = userPosts.map(post => post._id);
    
    // Get recent comments on user's posts
    const recentComments = await ForumCommentModel.find({
      postId: { $in: userPostIds },
      authorId: { $ne: userId } // Exclude user's own comments
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('authorId', 'firstName lastName')
      .populate('postId', 'title');
    
    // Format notifications
    const notifications: Notification[] = recentComments.map(comment => {
      const author = comment.authorId as unknown as Author;
      const post = comment.postId as unknown as Post;
      
      return {
        id: (comment._id as Types.ObjectId).toString(),
        type: 'FORUM_COMMENT',
        title: 'New comment on your post',
        message: `${author?.firstName} ${author?.lastName} commented on your post: ${post?.title}`,
        createdAt: comment.createdAt,
        postId: post?._id.toString()
      };
    });
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching forum notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}