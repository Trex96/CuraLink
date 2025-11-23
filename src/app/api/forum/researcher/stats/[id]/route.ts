import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import UserModel from '@/models/user/User';
import { PopulatedUserDocument } from '@/types/mongoose';
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

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is researcher
    const userRole = (session.user as UserSession).role;
    if (userRole !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if the researcher is requesting their own data
    const { id } = await context.params;
    if ((session.user as UserSession).id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get researcher's verified answer count from user model
    const researcher = await UserModel.findById(id);
    const verifiedAnswers = (researcher as unknown as PopulatedUserDocument)?.verifiedAnswerCount || 0;

    // Calculate reputation points (simplified formula)
    // 1 point per verified answer, 0.5 points per upvoted comment
    const upvotedComments = await ForumCommentModel.aggregate([
      { $match: { authorId: new Types.ObjectId(id) } },
      { $project: { upvoteCount: { $size: "$upvotes" } } },
      { $group: { _id: null, totalUpvotes: { $sum: "$upvoteCount" } } }
    ]);

    const totalUpvotes = upvotedComments.length > 0 ? upvotedComments[0].totalUpvotes : 0;
    const reputation = verifiedAnswers * 10 + Math.floor(totalUpvotes * 0.5);

    // Count unanswered questions in researcher's expertise
    const expertise = (researcher as unknown as PopulatedUserDocument)?.expertise || [];
    let unansweredCount = 0;

    if (expertise && expertise.length > 0) {
      const query = {
        replyCount: 0, // Posts with no replies
        $or: [
          { category: { $in: expertise } },
          { tags: { $in: expertise } }
        ]
      };

      unansweredCount = await ForumPostModel.countDocuments(query as unknown as Record<string, unknown>);
    }

    // Count researcher's answers (comments)
    const answerCount = await ForumCommentModel.countDocuments({
      authorId: new Types.ObjectId(id)
    });

    return NextResponse.json({
      stats: {
        reputation,
        answered: answerCount,
        unanswered: unansweredCount
      }
    });
  } catch (error) {
    console.error('Error fetching researcher stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}