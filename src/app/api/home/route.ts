import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import PublicationModel from '@/models/publication/Publication';
import TrialModel from '@/models/trial/Trial';
import { ForumPostModel } from '@/models/forum/Forum';
import { UserRole } from '@/types';

export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        // @ts-ignore - Session user id type extension
        const userId = session?.user?.id;

        // Fetch Featured Researchers (limit 4)
        // In a real app, this might be based on matching algorithms
        const researchers = await UserModel.find({
            role: UserRole.RESEARCHER,
            openForCollaboration: true
        })
            .select('firstName lastName institution expertise location bio verifiedAnswerCount')
            .limit(4)
            .lean();

        // Fetch Recent Publications (limit 4)
        const publications = await PublicationModel.find({})
            .sort({ publicationDate: -1 })
            .limit(4)
            .lean();

        // Fetch Active Clinical Trials (limit 4)
        const trials = await TrialModel.find({ status: 'Recruiting' })
            .sort({ lastUpdated: -1 })
            .limit(4)
            .lean();

        // Fetch Recent Forum Posts (limit 4)
        const forumPosts = await ForumPostModel.find({})
            .populate('authorId', 'firstName lastName role')
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        // Transform data for frontend
        const transformedResearchers = researchers.map((r: any) => ({
            id: r._id.toString(),
            name: `${r.firstName} ${r.lastName}`,
            institution: r.institution,
            expertise: r.expertise || [],
            location: r.location?.address || 'Unknown',
            matchPercentage: Math.floor(Math.random() * 30) + 70, // Mock match percentage for now
            isFavorite: false // TODO: Implement favorite check
        }));

        const transformedPublications = publications.map(p => ({
            id: p._id.toString(),
            title: p.title,
            authors: p.authors,
            journal: p.journal,
            publicationDate: p.publicationDate,
            abstract: p.abstract,
            doi: p.doi,
            citations: p.citations,
            isFavorite: false // TODO: Implement favorite check
        }));

        const transformedTrials = trials.map(t => ({
            id: t._id.toString(),
            nctNumber: t.nctNumber, // Add nctNumber for navigation
            title: t.title,
            description: t.summary,
            status: t.status,
            phase: t.phase,
            condition: t.conditions[0] || 'General',
            location: t.locations[0]?.address || 'Multiple Locations',
            eligibility: (t.eligibilityCriteria || []).slice(0, 3),
            startDate: t.startDate,
            endDate: t.endDate,
            participantsNeeded: t.enrollment || 0,
            participantsEnrolled: 0 // Not tracked in current model
        }));

        const transformedForumPosts = forumPosts.map(p => ({
            id: p._id.toString(),
            title: p.title,
            content: p.content,
            author: {
                name: `${(p.authorId as any).firstName} ${(p.authorId as any).lastName}`,
                isResearcher: (p.authorId as any).role === UserRole.RESEARCHER
            },
            category: p.category,
            tags: p.tags,
            createdAt: p.createdAt,
            views: p.views || 0,
            likes: p.upvotes?.length || 0,
            comments: 0 // TODO: Count comments
        }));

        return NextResponse.json({
            researchers: transformedResearchers,
            publications: transformedPublications,
            trials: transformedTrials,
            forumPosts: transformedForumPosts
        });

    } catch (error) {
        console.error('Error fetching home data:', error);
        return NextResponse.json({ error: 'Failed to fetch home data' }, { status: 500 });
    }
}
