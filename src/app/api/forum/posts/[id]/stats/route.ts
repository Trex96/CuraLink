import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id: postId } = await context.params;
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }
    const { Types } = await import('mongoose');
    if (!Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    // Get the post
    const post = await ForumPostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Get comment count
    const commentCount = await ForumCommentModel.countDocuments({ postId });
    
    // Get upvote count
    const upvoteCount = post.upvotes.length;
    
    // In a real application, you might also track views
    // For now, we'll use a placeholder
    const viewCount = Math.floor(Math.random() * 100) + 10;
    
    return NextResponse.json({ 
      stats: {
        upvotes: upvoteCount,
        replies: commentCount,
        views: viewCount
      }
    });
  } catch (error) {
    console.error('Error fetching post stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}