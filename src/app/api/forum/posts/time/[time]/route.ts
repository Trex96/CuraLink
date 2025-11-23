import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ time: string }> }
) {
  try {
    await dbConnect();
      const { time } = await params;
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    interface QueryType {
      $expr?: {
        $and?: Array<{
          $gte?: [{$hour: string}, number];
          $lt?: [{$hour: string}, number];
        }>;
        $or?: Array<{
          $lt?: [{$hour: string}, number];
          $gte?: [{$hour: string}, number];
        }>;
      };
    }
    
    const query: QueryType = {};
    
    // Filter by time of day based on createdAt
    if (time === 'morning') {
      // 6 AM to 12 PM
      query.$expr = {
        $and: [
          { $gte: [{ $hour: '$createdAt' }, 6] },
          { $lt: [{ $hour: '$createdAt' }, 12] }
        ]
      };
    } else if (time === 'afternoon') {
      // 12 PM to 6 PM
      query.$expr = {
        $and: [
          { $gte: [{ $hour: '$createdAt' }, 12] },
          { $lt: [{ $hour: '$createdAt' }, 18] }
        ]
      };
    } else if (time === 'evening') {
      // 6 PM to 12 AM
      query.$expr = {
        $and: [
          { $gte: [{ $hour: '$createdAt' }, 18] },
          { $lt: [{ $hour: '$createdAt' }, 24] }
        ]
      };
    } else if (time === 'night') {
      // 12 AM to 6 AM
      query.$expr = {
        $or: [
          { $lt: [{ $hour: '$createdAt' }, 6] },
          { $gte: [{ $hour: '$createdAt' }, 24] } // This will never be true, but keeping for completeness
        ]
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
    console.error('Error fetching posts by time of day:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}