import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';

interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export async function DELETE(
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

        // Find the trial
        const trial = await TrialModel.findOne({ nctNumber });
        if (!trial) {
            return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
        }

        // Check if user is authorized to delete (must be linked researcher)
        const isLinked = trial.linkedResearchers.some(
            (id) => id.toString() === (user._id as Types.ObjectId).toString()
        );

        if (!isLinked) {
            return NextResponse.json(
                { error: 'You are not authorized to delete this trial' },
                { status: 403 }
            );
        }

        // Only allow deletion of manually created trials
        if (trial.importedFrom === 'clinicaltrials.gov') {
            return NextResponse.json(
                { error: 'Cannot delete trials imported from ClinicalTrials.gov' },
                { status: 403 }
            );
        }

        await TrialModel.deleteOne({ nctNumber });

        return NextResponse.json({ message: 'Trial deleted successfully' });
    } catch (error) {
        console.error('Error deleting trial:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
