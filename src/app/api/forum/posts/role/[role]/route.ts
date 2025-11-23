import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';
import User from '@/models/user/User';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ role: string }> }
) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get users with the specified role
    const { role } = await context.params;
    const users = await User.find({ role }).select('_id');
    const userIds = users.map(user => user._id as Types.ObjectId);

    const posts = await ForumPostModel.find({
      authorId: { $in: userIds }
    })
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

    const total = await ForumPostModel.countDocuments({
      authorId: { $in: userIds }
    });

    return NextResponse.json({
      posts: postsWithCounts,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching posts by author role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}