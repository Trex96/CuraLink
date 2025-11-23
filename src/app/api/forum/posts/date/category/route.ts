import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { category, startDate, endDate, limit = 10, offset = 0 } = await req.json();
    
    if (!category) {
      return NextResponse.json({ error: 'Missing category' }, { status: 400 });
    }
    
    interface QueryType {
      category: string;
      createdAt?: {
        $gte?: Date;
        $lte?: Date;
      };
    }
    
    const query: QueryType = { category };
    
    if (startDate || endDate) {
      query.createdAt = query.createdAt || {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
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
    
    interface ReplyCountItem {
      _id: Types.ObjectId;
      count: number;
    }
    
    const replyCountMap = replyCounts.reduce((acc, item: ReplyCountItem) => {
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
    console.error('Error fetching posts by date range and category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}