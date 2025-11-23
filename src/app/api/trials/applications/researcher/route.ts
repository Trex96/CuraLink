import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import TrialApplicationModel from '@/models/trialApplication/TrialApplication';
import TrialModel from '@/models/trial/Trial';

interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export async function GET() {
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

        // Get all trials linked to this researcher
        const trials = await TrialModel.find({
            linkedResearchers: user._id,
        }).select('_id nctNumber title');

        const trialIds = trials.map(t => t._id);

        // Get all applications for these trials
        const applications = await TrialApplicationModel.find({
            trialId: { $in: trialIds },
        })
            .populate('patientId', 'firstName lastName email')
            .populate('trialId', 'nctNumber title status')
            .sort({ createdAt: -1 });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
