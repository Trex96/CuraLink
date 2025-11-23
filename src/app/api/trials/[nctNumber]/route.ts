import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';
import FavoriteModel from '@/models/favorite/Favorite';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ nctNumber: string }> }
) {
  try {
    await dbConnect();
    const { nctNumber } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let trial: any = await TrialModel.findOne({ nctNumber }).lean();
    let isExternal = false;

    if (!trial) {
      // Try fetching from ClinicalTrials.gov
      try {
        const { fetchTrialDetails } = await import('@/lib/services/clinicaltrials');
        const externalTrial = await fetchTrialDetails(nctNumber);
        if (externalTrial) {
          trial = externalTrial;
          isExternal = true;
        }
      } catch (err) {
        console.error(`Failed to fetch external trial ${nctNumber}:`, err);
      }
    }

    if (!trial) {
      return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
    }

    // Add importedFrom flag
    const trialWithSource = {
      ...trial,
      importedFrom: isExternal ? 'clinicaltrials.gov' : 'manual'
    };

    let isFavorite = false;
    const session = await getServerSession(authOptions);

    if (session?.user) {
      const favorite = await FavoriteModel.findOne({
        userId: (session.user as SessionUser).id,
        itemType: 'trial',
        itemId: isExternal ? nctNumber : trial._id // Use nctNumber as ID for external trials if needed, or handle differently. 
        // Wait, FavoriteModel expects itemId to be ObjectId usually if ref is used.
        // If external, we don't have an _id. 
        // We might need to save it to DB first or handle favorites for external trials differently.
        // For now, let's assume favorites only work for internal trials or we skip favorite check for external.
      });
      // If trial is external, it doesn't have an _id compatible with ObjectId if we strictly enforce it.
      // However, let's check if we can just return isFavorite=false for external for now to avoid errors.
      if (!isExternal) {
        isFavorite = !!favorite;
      }
    }

    return NextResponse.json({ trial: trialWithSource, isFavorite });
  } catch (error) {
    console.error('Error fetching trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ nctNumber: string }> }
) {
  try {
    await dbConnect();

    const { nctNumber } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData = await request.json();

    const trial = await TrialModel.findOne({ nctNumber });

    if (!trial) {
      return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
    }

    // Check authorization: User must be the creator or a linked researcher
    // We assume 'createdBy' field exists or we check linkedResearchers
    // Since I didn't add 'createdBy' explicitly to the schema in my previous step (I only added linkedResearchers),
    // I should rely on linkedResearchers. If the trial was imported by someone else but this researcher is linked, they can edit?
    // Let's assume yes for now, or strict ownership.
    // Given the prompt "Edit trial information (if PI)", implying ownership or role.
    // I'll check if the user is in linkedResearchers.

    const isLinked = trial.linkedResearchers && trial.linkedResearchers.some(id => id.toString() === user._id!.toString());

    // Also check if they are the PI listed in the trial contact info or similar? 
    // That's hard to verify string matching.
    // Let's stick to: if they linked it, they can edit it (or at least their version of it in our DB).

    if (!isLinked) {
      return NextResponse.json({ error: 'You are not authorized to edit this trial' }, { status: 403 });
    }

    // Prevent updating nctNumber
    delete updateData.nctNumber;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedTrial = await TrialModel.findOneAndUpdate(
      { nctNumber },
      { $set: { ...updateData, lastUpdated: new Date() } },
      { new: true }
    );

    return NextResponse.json({ trial: updatedTrial });
  } catch (error) {
    console.error('Error updating trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}