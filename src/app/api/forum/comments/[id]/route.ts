import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Update a comment
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
    
    const userId = (session.user as UserSession).id;
    const { id: commentId } = await context.params;
    
    if (!commentId) {
      return NextResponse.json({ error: 'Missing comment ID' }, { status: 400 });
    }
    if (!Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }
    
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Missing comment content' }, { status: 400 });
    }
    
    // Find the comment and check if user is the author
    const comment = await ForumCommentModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(commentId),
        authorId: new Types.ObjectId(userId)
      },
      { content },
      { new: true }
    ).populate('authorId', 'firstName lastName role');
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Error updating forum comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a comment
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
    
    const userId = (session.user as UserSession).id;
    const { id: commentId } = await context.params;
    
    if (!commentId) {
      return NextResponse.json({ error: 'Missing comment ID' }, { status: 400 });
    }
    if (!Types.ObjectId.isValid(commentId)) {
      return NextResponse.json({ error: 'Invalid comment ID' }, { status: 400 });
    }
    
    // Check if the comment exists and belongs to the user
    const comment = await ForumCommentModel.findOne({
      _id: new Types.ObjectId(commentId),
      authorId: new Types.ObjectId(userId)
    });
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found or unauthorized' }, { status: 404 });
    }
    
    // Comment-only system: hard delete without parent/replies adjustments
    await ForumCommentModel.findByIdAndDelete(commentId);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Error deleting forum comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}