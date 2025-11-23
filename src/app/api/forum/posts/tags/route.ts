import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { tags, limit = 10, offset = 0 } = await req.json();
    
    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Missing or invalid tags array' }, { status: 400 });
    }
    
    const posts = await ForumPostModel.find({
      tags: { $in: tags }
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
      tags: { $in: tags }
    });
    
    return NextResponse.json({ 
      posts: postsWithCounts,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching posts by tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}