import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { PopulatedUserDocument } from '@/types/mongoose';
import UserModel from '@/models/user/User';
import { Types } from 'mongoose';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get researcher's expertise
    const researcher = await UserModel.findById((session.user as UserSession).id);
    const expertise = (researcher as unknown as PopulatedUserDocument)?.expertise || [];

    // Find posts in researcher's expertise areas that are marked as researcher discussions
    const query = {
      category: 'researcher-discussion',
      $or: [
        { tags: { $in: expertise } },
        { category: { $in: expertise } }
      ]
    };

    const posts = await ForumPostModel.find(query as unknown as Record<string, unknown>)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('authorId', 'firstName lastName role');

    // Get reply counts for each post
    const postIds = posts.map(post => post._id);
    const replyCounts = await ForumCommentModel.aggregate([
      { $match: { postId: { $in: postIds } } },
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

    const total = await ForumPostModel.countDocuments(query);

    return NextResponse.json({
      posts: postsWithCounts,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching researcher threads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}