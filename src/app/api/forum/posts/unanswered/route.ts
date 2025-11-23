import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get posts that don't have any comments
    const postsWithComments = await ForumCommentModel.distinct('postId');
    
    const posts = await ForumPostModel.find({
      _id: { $nin: postsWithComments }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('authorId', 'firstName lastName role');
    
    // Add reply counts (which will be 0 for unanswered posts)
    const postsWithCounts = posts.map(post => ({
      ...post.toObject(),
      replyCount: 0
    }));
    
    return NextResponse.json({ 
      posts: postsWithCounts
    });
  } catch (error) {
    console.error('Error fetching unanswered posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}