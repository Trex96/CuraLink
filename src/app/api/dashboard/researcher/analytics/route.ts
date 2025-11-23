import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import PublicationModel from '@/models/publication/Publication';
import CollaborationModel from '@/models/collaboration/Collaboration';
import ProfileViewModel from '@/models/analytics/ProfileView';
import UserModel from '@/models/user/User';
import { Types } from 'mongoose';

interface SessionUser {
    id: string;
    role: string;
}

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as SessionUser).id;
        const user = await UserModel.findById(userId);

        if (!user || user.role !== 'researcher') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const researcherId = new Types.ObjectId(userId);

        // 1. Publications Stats
        const publicationStats = await PublicationModel.aggregate([
            { $match: { researcherId: researcherId } },
            {
                $group: {
                    _id: null,
                    totalPublications: { $sum: 1 },
                    totalCitations: { $sum: '$citations' },
                },
            },
        ]);

        const totalPublications = publicationStats[0]?.totalPublications || 0;
        const totalCitations = publicationStats[0]?.totalCitations || 0;

        // 2. Collaborations Stats
        const activeCollaborations = await CollaborationModel.countDocuments({
            $or: [{ requesterId: researcherId }, { receiverId: researcherId }],
            status: 'accepted',
        });

        // 3. Profile Views (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const viewsData = await ProfileViewModel.aggregate([
            {
                $match: {
                    researcherId: researcherId,
                    timestamp: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing days
        const viewsMap = new Map(viewsData.map((v) => [v._id, v.count]));
        const profileViews = [];
        let totalViews = 0;

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = viewsMap.get(dateStr) || 0; // Use 0 if no real data

            profileViews.push({ date: dateStr, count });
            totalViews += count;
        }

        // 4. Forum Stats
        const verifiedAnswers = (user as any).verifiedAnswerCount || 0;

        // 5. Calculate Impact Score
        // Algorithm: (Citations * 1) + (Publications * 5) + (Verified Answers * 10) + (Views * 0.1) + (Collaborations * 2)
        const impactScore = Math.round(
            totalCitations * 1 +
            totalPublications * 5 +
            verifiedAnswers * 10 +
            totalViews * 0.1 +
            activeCollaborations * 2
        );

        return NextResponse.json({
            totalPublications,
            totalCitations,
            activeCollaborations,
            verifiedAnswers,
            totalViews,
            profileViews,
            impactScore,
        });
    } catch (error) {
        console.error('Error fetching researcher analytics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
