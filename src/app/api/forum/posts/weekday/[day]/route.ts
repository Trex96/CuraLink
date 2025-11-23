import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ day: string }> }
) {
  try {
    await dbConnect();
      const { day } = await params;
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    interface QueryType {
      $expr?: {
        $eq: [{$dayOfWeek: string}, number];
      };
    }
    
    const query: QueryType = {};
    
    // Filter by day of week based on createdAt
    const days: Record<string, number> = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    
    if (days[day] !== undefined) {
      query.$expr = {
        $eq: [{ $dayOfWeek: '$createdAt' }, days[day] + 1] // MongoDB uses 1-7 for Sun-Sat
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
    console.error('Error fetching posts by day of week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}