import { NextResponse } from 'next/server';
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

        const trialData = await request.json();

        // Validate required fields
        if (!trialData.nctNumber || !trialData.title || !trialData.summary) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if NCT number already exists
        const existing = await TrialModel.findOne({ nctNumber: trialData.nctNumber });
        if (existing) {
            return NextResponse.json(
                { error: 'Trial with this NCT number already exists' },
                { status: 409 }
            );
        }

        // Create trial with researcher role
        const trial = await TrialModel.create({
            ...trialData,
            linkedResearchers: [user._id],
            researcherRoles: [{
                researcherId: user._id,
                role: trialData.researcherRole || 'PI',
                addedAt: new Date()
            }],
            lastUpdated: new Date(),
            importedFrom: 'manual'
        });

        return NextResponse.json({ trial }, { status: 201 });
    } catch (error) {
        console.error('Error creating trial:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
