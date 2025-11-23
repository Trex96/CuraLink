import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel, { IUser } from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';
import TrialApplicationModel from '@/models/trialApplication/TrialApplication';

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
        if (!user || user.role !== 'patient') {
            return NextResponse.json({ error: 'Only patients can apply to trials' }, { status: 403 });
        }

        const { trialId, message, patientInfo } = await request.json();

        if (!trialId || !message) {
            return NextResponse.json(
                { error: 'Trial ID and message are required' },
                { status: 400 }
            );
        }

        // Check if trial exists
        const trial = await TrialModel.findById(trialId);
        if (!trial) {
            return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
        }

        // Check if trial is from ClinicalTrials.gov (cannot apply to external trials)
        if (trial.importedFrom === 'clinicaltrials.gov') {
            return NextResponse.json(
                { error: 'Cannot apply to ClinicalTrials.gov trials. Please contact them directly.' },
                { status: 400 }
            );
        }

        // Check if already applied
        const existing = await TrialApplicationModel.findOne({
            trialId,
            patientId: user._id,
        });

        if (existing) {
            return NextResponse.json(
                { error: 'You have already applied to this trial' },
                { status: 409 }
            );
        }

        // Create application
        const application = await TrialApplicationModel.create({
            trialId,
            patientId: user._id,
            message,
            patientInfo: patientInfo || {},
            status: 'pending',
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (error) {
        console.error('Error applying to trial:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
