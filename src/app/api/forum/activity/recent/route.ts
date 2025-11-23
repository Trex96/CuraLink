import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get recent posts
    const recentPosts = await ForumPostModel.find({})
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .populate('authorId', 'firstName lastName role');
    
    // Get recent comments
    const recentComments = await ForumCommentModel.find({})
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .populate('authorId', 'firstName lastName role')
      .populate('postId', 'title');
    
    // Combine and sort by date
    const activity = [
      ...recentPosts.map(post => ({
        type: 'post',
        data: post,
        createdAt: post.createdAt
      })),
      ...recentComments.map(comment => ({
        type: 'comment',
        data: comment,
        createdAt: comment.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}