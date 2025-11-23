import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ holiday: string }> }
) {
  try {
    await dbConnect();
      const { holiday } = await params;
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    interface QueryType {
      createdAt?: {
        $gte?: Date;
        $lt?: Date;
      };
    }
    
    const query: QueryType = {};
    
    // Filter by holiday periods based on createdAt
    const currentYear = new Date().getFullYear();
    
    if (holiday === 'new-year') {
      // New Year's Day (January 1)
      query.createdAt = {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear, 0, 2)
      };
    } else if (holiday === 'valentines') {
      // Valentine's Day (February 14)
      query.createdAt = {
        $gte: new Date(currentYear, 1, 14),
        $lt: new Date(currentYear, 1, 15)
      };
    } else if (holiday === 'easter') {
      // Easter (variable date, using April 1 as placeholder)
      query.createdAt = {
        $gte: new Date(currentYear, 3, 1),
        $lt: new Date(currentYear, 3, 2)
      };
    } else if (holiday === 'independence') {
      // Independence Day (July 4)
      query.createdAt = {
        $gte: new Date(currentYear, 6, 4),
        $lt: new Date(currentYear, 6, 5)
      };
    } else if (holiday === 'halloween') {
      // Halloween (October 31)
      query.createdAt = {
        $gte: new Date(currentYear, 9, 31),
        $lt: new Date(currentYear, 10, 1)
      };
    } else if (holiday === 'thanksgiving') {
      // Thanksgiving (Fourth Thursday of November, using November 25 as placeholder)
      query.createdAt = {
        $gte: new Date(currentYear, 10, 25),
        $lt: new Date(currentYear, 10, 26)
      };
    } else if (holiday === 'christmas') {
      // Christmas (December 25)
      query.createdAt = {
        $gte: new Date(currentYear, 11, 25),
        $lt: new Date(currentYear, 11, 26)
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
    console.error('Error fetching posts by holiday:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}