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

export async function POST(
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
    
    // Toggle vote/unvote atomically
    const userObjectId = new Types.ObjectId(userId);
    const alreadyUpvoted = await ForumCommentModel.exists({ _id: commentId, upvotes: userObjectId });

    let updateResult;
    if (alreadyUpvoted) {
      // Unvote
      updateResult = await ForumCommentModel.updateOne(
        { _id: commentId },
        {
          $pull: { upvotes: userObjectId },
          $push: { upvoteLog: { userId: userObjectId, createdAt: new Date() } }
        }
      );
    } else {
      // Upvote
      updateResult = await ForumCommentModel.updateOne(
        { _id: commentId },
        {
          $addToSet: { upvotes: userObjectId },
          $push: { upvoteLog: { userId: userObjectId, createdAt: new Date() } }
        }
      );
    }

    if (updateResult.modifiedCount === 0) {
      console.warn(`[vote] no modification on comment vote toggle`, { commentId, userId });
      return NextResponse.json({ error: 'Unable to toggle vote' }, { status: 409 });
    }

    const updated = await ForumCommentModel.findById(commentId).select('upvotes');
    const upvoteCount = updated?.upvotes?.length || 0;
    const upvoted = !!(await ForumCommentModel.exists({ _id: commentId, upvotes: userObjectId }));
    console.info(`[vote] comment ${upvoted ? 'upvoted' : 'unvoted'}`, { commentId, userId, upvoteCount });
    return NextResponse.json({ success: true, upvoted, upvoteCount });
  } catch (error) {
    console.error('Error upvoting forum comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}