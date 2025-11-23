import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';

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

    // Safely read expertise; typings for the User model return a base IUser
    // which doesn’t include researcher-specific fields. Avoid TS errors here.
    const expertise: string[] = Array.isArray((user as unknown as { expertise?: string[] }).expertise)
      ? ((user as unknown as { expertise?: string[] }).expertise as string[])
      : [];

    const trials = await TrialModel.find({
      conditions: { $in: expertise }
    })
      .sort({ lastUpdated: -1 })
      .limit(10)
      .select('nctNumber title conditions phase status locations lastUpdated')
      .lean();

    return NextResponse.json(trials);
  } catch (error) {
    console.error('Error fetching dashboard trials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}