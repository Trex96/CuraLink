import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { 
      minReplies = 0, 
      minUpvotes = 0, 
      minViews = 0,
      limit = 10, 
      offset = 0 
    } = await req.json();
    
    // Get all posts
    const posts = await ForumPostModel.find({})
      .sort({ createdAt: -1 })
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
    
    // Filter posts by engagement metrics
    const filteredPosts = posts
      .map(post => {
        const replyCount = replyCountMap[(post._id as Types.ObjectId).toString()] || 0;
        const upvoteCount = post.upvotes.length;
        // In a real application, you would have view counts stored
        const viewCount = Math.floor(Math.random() * 1000); // Placeholder
        
        return {
          ...post.toObject(),
          replyCount,
          upvoteCount,
          viewCount
        };
      })
      .filter(post => 
        post.replyCount >= minReplies && 
        post.upvoteCount >= minUpvotes && 
        post.viewCount >= minViews
      )
      .slice(offset, offset + limit);
    
    return NextResponse.json({ posts: filteredPosts });
  } catch (error) {
    console.error('Error fetching posts by engagement metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}