import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';

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

    // Placeholder analytics data; replace with real tracking when available
    const now = Date.now();
    const days = Array.from({ length: 7 }).map((_, i) => new Date(now - (6 - i) * 24 * 60 * 60 * 1000));
    const profileViews = days.map((d, idx) => ({
      date: d.toISOString(),
      count: [5, 3, 8, 2, 7, 4, 6][idx]
    }));

    return NextResponse.json(profileViews);
  } catch (error) {
    console.error('Error fetching dashboard profile views:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}