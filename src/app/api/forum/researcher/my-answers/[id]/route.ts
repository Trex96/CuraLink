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
  role?: string;
}

export async function GET(
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
    
    // Check if the researcher is requesting their own data
    const { id } = await context.params;
    if ((session.user as UserSession).id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Find posts where the researcher has commented
    const comments = await ForumCommentModel.find({
      authorId: new Types.ObjectId(id)
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .populate('postId');
    
    // Get unique post IDs
    const postIds = [...new Set(comments.map(comment => comment.postId.toString()))];
    
    // Get the posts
    const posts = await ForumPostModel.find({
      _id: { $in: postIds.map(id => new Types.ObjectId(id)) }
    })
    .populate('authorId', 'firstName lastName role');
    
    // Get reply counts for each post
    const replyCounts = await ForumCommentModel.aggregate([
      { $match: { postId: { $in: posts.map(post => post._id) } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ]);
    
    const replyCountMap = replyCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);
    
    // Add reply counts to posts
    const postsWithCounts = posts.map(post => ({
      ...post.toObject(),
      replyCount: replyCountMap[(post._id as Types.ObjectId).toString()] || 0
    }));
    
    // Count distinct posts where the researcher has commented
    const total = await ForumCommentModel.countDocuments({
      authorId: new Types.ObjectId(id)
    }).distinct('postId');
    
    return NextResponse.json({ 
      posts: postsWithCounts,
      total: Array.isArray(total) ? total.length : 0,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching researcher answers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}