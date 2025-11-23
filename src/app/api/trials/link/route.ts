import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';
import { fetchTrialDetails } from '@/lib/services/clinicaltrials';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { nctNumber } = await request.json();

    if (!nctNumber) {
      return NextResponse.json({ error: 'NCT Number is required' }, { status: 400 });
    }

    // Check if trial exists in DB
    let trial = await TrialModel.findOne({ nctNumber });

    // If not, fetch from ClinicalTrials.gov and create it
    if (!trial) {
      try {
        const trialData = await fetchTrialDetails(nctNumber);
        trial = await TrialModel.create({
          ...trialData,
          linkedResearchers: [user._id]
        });
      } catch (error) {
        console.error('Error fetching trial details:', error);
        return NextResponse.json({ error: 'Invalid NCT Number or Trial not found' }, { status: 404 });
      }
    } else {
      // If trial exists, check if already linked
      if (trial.linkedResearchers && trial.linkedResearchers.includes(user._id as unknown as Types.ObjectId)) {
        return NextResponse.json({ message: 'Trial already linked', trial });
      }

      // Link researcher
      trial.linkedResearchers = trial.linkedResearchers || [];
      trial.linkedResearchers.push(user._id as unknown as Types.ObjectId);
      await trial.save();
    }

    return NextResponse.json({ message: 'Trial linked successfully', trial });
  } catch (error) {
    console.error('Error linking trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}