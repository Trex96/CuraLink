import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
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
    
    const userId = (session.user as UserSession).id;
    const { id: postId } = await context.params;
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }
    if (!Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }
    
    // Toggle vote/unvote atomically
    const userObjectId = new Types.ObjectId(userId);
    const alreadyUpvoted = await ForumPostModel.exists({ _id: postId, upvotes: userObjectId });

    let updateResult;
    if (alreadyUpvoted) {
      // Unvote: pull user's id from upvotes and log activity
      updateResult = await ForumPostModel.updateOne(
        { _id: postId },
        {
          $pull: { upvotes: userObjectId },
          $push: { upvoteLog: { userId: userObjectId, createdAt: new Date() } }
        }
      );
    } else {
      // Upvote: add uniquely and log activity
      updateResult = await ForumPostModel.updateOne(
        { _id: postId },
        {
          $addToSet: { upvotes: userObjectId },
          $push: { upvoteLog: { userId: userObjectId, createdAt: new Date() } }
        }
      );
    }

    if (updateResult.modifiedCount === 0) {
      console.warn(`[vote] no modification on post vote toggle`, { postId, userId });
      return NextResponse.json({ error: 'Unable to toggle vote' }, { status: 409 });
    }

    const updated = await ForumPostModel.findById(postId).select('upvotes');
    const upvoteCount = updated?.upvotes?.length || 0;
    const upvoted = !!(await ForumPostModel.exists({ _id: postId, upvotes: userObjectId }));
    console.info(`[vote] post ${upvoted ? 'upvoted' : 'unvoted'}`, { postId, userId, upvoteCount });
    return NextResponse.json({ success: true, upvoted, upvoteCount });
  } catch (error) {
    console.error('Error upvoting forum post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}