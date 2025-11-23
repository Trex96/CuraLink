import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';
import { seedTrialsIfEmpty } from '@/lib/utils/seedTrials';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function GET() {
  try {
    await dbConnect();

    // Auto-seed trials if database is empty
    await seedTrialsIfEmpty();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find trials where the researcher is the owner (created by them) or linked to them
    // Assuming we have a way to link trials to researchers. 
    // For now, let's assume we'll add a 'researcherId' field to the Trial model or use a separate Link model.
    // Given the requirements, "Link existing trials to profile", a separate link or array in User/Trial is needed.
    // Let's assume Trial model has a 'researcherId' field for simplicity if they imported it, 
    // OR we check if the user's ID is in a 'linkedResearchers' array in Trial model.

    // Let's check the Trial model first. I'll assume for now we can add 'linkedResearchers' to Trial schema if not present.
    // Or simpler: The requirement says "Link existing trials to profile".
    // Let's assume we store linked trials in the User model or Trial model.
    // Storing in Trial model as 'linkedResearchers' (array of user IDs) seems scalable.

    const trials = await TrialModel.find({
      $or: [
        { createdBy: user._id }, // If they imported it
        { linkedResearchers: user._id } // If they linked it
      ]
    }).sort({ lastUpdated: -1 });

    return NextResponse.json({ trials });
  } catch (error) {
    console.error('Error fetching researcher trials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}