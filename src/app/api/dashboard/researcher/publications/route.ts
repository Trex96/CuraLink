import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import PublicationModel from '@/models/publication/Publication';
import UserModel from '@/models/user/User';

export async function GET() {
  try {
    // Connect to database
    await dbConnect();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Type assertion to access the id property added by our JWT callback
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch recent publications (last 30 days)
    const publications = await PublicationModel.find({
      researcherId: user._id,
      publicationDate: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    })
      .sort({ publicationDate: -1 })
      .select('title authors journal publicationDate citations')
      .lean();

    return NextResponse.json(publications);
  } catch (error) {
    console.error('Error fetching researcher publications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}