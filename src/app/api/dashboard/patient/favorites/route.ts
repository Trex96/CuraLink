import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import FavoriteModel from '@/models/favorite/Favorite';
import UserModel from '@/models/user/User';
import TrialModel from '@/models/trial/Trial';
import PublicationModel from '@/models/publication/Publication';
import { ForumPostModel } from '@/models/forum/Forum';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const favorites = await FavoriteModel.find({ userId: (session.user as any).id }).lean();

        const result: {
            researchers: any[];
            trials: any[];
            publications: any[];
            posts: any[];
        } = {
            researchers: [],
            trials: [],
            publications: [],
            posts: []
        };

        // Populate details based on itemType
        // This is a bit inefficient doing it one by one or grouping, but for now it works.
        // Better approach: Group by itemType and do bulk queries.

        const researcherIds = favorites.filter(f => f.itemType === 'researcher').map(f => f.itemId);
        const trialIds = favorites.filter(f => f.itemType === 'trial').map(f => f.itemId);
        const publicationIds = favorites.filter(f => f.itemType === 'publication').map(f => f.itemId);
        const postIds = favorites.filter(f => f.itemType === 'post').map(f => f.itemId);

        if (researcherIds.length > 0) {
            result.researchers = await UserModel.find({ _id: { $in: researcherIds } })
                .select('firstName lastName institution specialty location')
                .lean();
        }

        if (trialIds.length > 0) {
            result.trials = await TrialModel.find({ _id: { $in: trialIds } })
                .select('title status condition phase locations')
                .lean();
        }

        if (publicationIds.length > 0) {
            result.publications = await PublicationModel.find({ _id: { $in: publicationIds } })
                .select('title authors journal publicationDate')
                .lean();
        }

        if (postIds.length > 0) {
            result.posts = await ForumPostModel.find({ _id: { $in: postIds } })
                .select('title category authorId replies views createdAt')
                .populate('authorId', 'firstName lastName')
                .lean();
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}
