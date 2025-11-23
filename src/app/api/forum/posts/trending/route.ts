import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // For trending posts, we'll sort by a combination of recent activity and engagement
    // In a real application, you might have a more sophisticated algorithm
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const posts = await ForumPostModel.find({
      createdAt: { $gte: oneWeekAgo }
    })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(limit)
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
    
    // Add reply/comment counts to posts
    const postsWithCounts = posts.map(post => {
      const count = replyCountMap[(post._id as Types.ObjectId).toString()] || 0;
      return {
        ...post.toObject(),
        replyCount: count,
        commentCount: count
      };
    });
    
    return NextResponse.json({ 
      posts: postsWithCounts
    });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}