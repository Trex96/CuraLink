import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db/connect';
import { ForumPostModel } from '@/models/forum/Forum';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch recent forum posts
        // In a real app, this might filter by user's interests or followed categories
        // For now, we'll just return the most recent posts
        const posts = await ForumPostModel.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('authorId', 'firstName lastName role')
            .lean();

        const formattedPosts = posts.map((post: any) => ({
            _id: post._id,
            title: post.title,
            category: post.category,
            author: post.authorId ? `${post.authorId.firstName} ${post.authorId.lastName}` : 'Unknown',
            replies: post.replies?.length || 0,
            lastActivity: new Date(post.updatedAt || post.createdAt).toLocaleDateString(),
            views: post.views || 0
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching forum activity:', error);
        return NextResponse.json({ error: 'Failed to fetch forum activity' }, { status: 500 });
    }
}
