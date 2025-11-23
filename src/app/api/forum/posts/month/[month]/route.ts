import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ month: string }> }
) {
  try {
    await dbConnect();

    const { month } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    interface QueryType {
      $expr?: {
        $eq: [{ $month: string }, number];
      };
    }

    const query: QueryType = {};

    // Filter by month based on createdAt
    const months: Record<string, number> = {
      'january': 0,
      'february': 1,
      'march': 2,
      'april': 3,
      'may': 4,
      'june': 5,
      'july': 6,
      'august': 7,
      'september': 8,
      'october': 9,
      'november': 10,
      'december': 11
    };

    if (months[month] !== undefined) {
      query.$expr = {
        $eq: [{ $month: '$createdAt' }, months[month] + 1] // MongoDB uses 1-12 for Jan-Dec
      };
    }

    const posts = await ForumPostModel.find(query)
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
    console.error('Error fetching posts by month:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}