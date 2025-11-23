import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: postId } = await context.params;
    
    if (!Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    // Fetch the post with author information
    const post = await ForumPostModel.findById(postId)
      .populate('authorId', 'firstName lastName role');
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Get counts for the post
    const count = await ForumCommentModel.countDocuments({ postId: post._id });
    
    // Transform the post data
    const postData = {
      ...post.toObject(),
      replyCount: count,
      commentCount: count
    };
    
    return NextResponse.json({ post: postData });
  } catch (error) {
    console.error('Error fetching forum post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: postId } = await context.params;
    
    if (!Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    const { title, content, category, tags } = await req.json();
    
    // Find the post
    const post = await ForumPostModel.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Check if the user is the author
    if (post.authorId.toString() !== (session.user as UserSession).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Update the post
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    
    await post.save();
    
    // Populate author information
    await post.populate('authorId', 'firstName lastName role');
    
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating forum post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: postId } = await context.params;
    
    if (!Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    // Find the post
    const post = await ForumPostModel.findById(postId);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Check if the user is the author
    if (post.authorId.toString() !== (session.user as UserSession).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete the post
    await ForumPostModel.findByIdAndDelete(postId);
    
    // Also delete all comments for this post
    await ForumCommentModel.deleteMany({ postId: post._id });
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}