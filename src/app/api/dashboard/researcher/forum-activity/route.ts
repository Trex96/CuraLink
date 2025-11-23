import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import { ForumPostModel } from '@/models/forum/Forum';

interface SessionUser {
  id: string;
  role?: string;
}

export async function GET() {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as SessionUser).id;
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Safely read expertise to avoid TypeScript mismatch between base IUser and researcher fields
    const expertise: string[] = Array.isArray((user as unknown as { expertise?: string[] }).expertise)
      ? ((user as unknown as { expertise?: string[] }).expertise as string[])
      : [];

    const forumPosts = await ForumPostModel.find({
      $or: [
        { category: { $in: expertise } },
        { tags: { $in: expertise } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category tags authorId createdAt replyCount')
      .lean();

    return NextResponse.json(forumPosts);
  } catch (error) {
    console.error('Error fetching dashboard forum activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}