import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import PublicationModel from '@/models/publication/Publication';
import UserModel, { IUser } from '@/models/user/User';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function GET() {
  try {
    // Connect to database
    await dbConnect();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a researcher
    const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch publications for this researcher
    const publications = await PublicationModel.find({
      researcherId: user._id
    })
      .sort({ publicationDate: -1 })
      .lean();

    return NextResponse.json(publications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}