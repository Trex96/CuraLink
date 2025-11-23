import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import TrialModel from '@/models/trial/Trial';
// Assuming there's an Enrollment model or we check Trial.participants
// For now, we'll simulate checking if the user is in any trial's participant list
// or if there's a specific Enrollment collection.
// Since I don't see an Enrollment model in the file list, I'll check TrialModel for now
// or create a placeholder logic that can be expanded.

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await connectDB();

        // TODO: Replace with actual enrollment check once Enrollment model is defined
        // For now, we'll return a mock response based on user role or a flag
        // In a real scenario: const enrollments = await EnrollmentModel.find({ userId: session.user.id, status: 'active' });

        // Mocking active enrollment for demonstration purposes if the user is a patient
        const hasActiveEnrollment = (session.user as any).role === 'patient';

        // If we had real data, we would fetch the trials details here
        const enrolledTrials = hasActiveEnrollment ? await TrialModel.find({ status: 'Recruiting' }).limit(1).lean() : [];

        return NextResponse.json({
            hasActiveEnrollment,
            enrolledTrials: enrolledTrials.map(trial => ({
                _id: trial._id,
                title: trial.title,
                status: trial.status,
                nextVisit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Mock next visit 7 days from now
            }))
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }
}
