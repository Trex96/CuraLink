import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user: IUser | null = await UserModel.findById((session.user as SessionUser).id);
        if (!user || user.role !== 'researcher') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { status } = await request.json();

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be "approved" or "rejected"' },
                { status: 400 }
            );
        }

        // Find application
        const application = await TrialApplicationModel.findById(id).populate('trialId');
        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Check if user is authorized (must be linked to the trial)
        const trial = await TrialModel.findById(application.trialId);
        if (!trial) {
            return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
        }

        const isLinked = trial.linkedResearchers.some(
            (resId) => resId.toString() === (user._id as Types.ObjectId).toString()
        );

        if (!isLinked) {
            return NextResponse.json(
                { error: 'You are not authorized to manage this application' },
                { status: 403 }
            );
        }

        // Update status
        application.status = status;
        await application.save();

        return NextResponse.json({ application });
    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
