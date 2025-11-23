import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const minEngagement = parseInt(searchParams.get('minEngagement') || '10');
    
    // First get reply counts for all posts
    const replyCounts = await ForumCommentModel.aggregate([
      { $group: { _id: '$postId', replyCount: { $sum: 1 } } }
    ]);
    
    // Create a map of post IDs to reply counts
    interface ReplyCountItem {
      _id: Types.ObjectId;
      replyCount: number;
    }
    
    const replyCountMap = replyCounts.reduce((acc, item: ReplyCountItem) => {
      acc[item._id.toString()] = item.replyCount;
      return acc;
    }, {} as Record<string, number>);
    
    // Get posts with high engagement (replies + upvotes)
    const posts = await ForumPostModel.find({})
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName role');
    
    // Calculate engagement scores and filter
    const highEngagementPosts = posts
      .map(post => {
        const replyCount = replyCountMap[(post._id as Types.ObjectId).toString()] || 0;
        const upvoteCount = post.upvotes.length;
        const engagementScore = replyCount + upvoteCount;
        
        return {
          ...post.toObject(),
          replyCount,
          upvoteCount,
          engagementScore
        };
      })
      .filter(post => post.engagementScore >= minEngagement)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
    
    return NextResponse.json({ posts: highEngagementPosts });
  } catch (error) {
    console.error('Error fetching high engagement posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}