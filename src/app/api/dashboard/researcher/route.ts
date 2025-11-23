import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import { PopulatedUserDocument } from '@/types/mongoose';
import { Types } from 'mongoose';
import PublicationModel from '@/models/publication/Publication';
import CollaborationModel from '@/models/collaboration/Collaboration';
import { ForumPostModel } from '@/models/forum/Forum';
import TrialModel from '@/models/trial/Trial';

export async function GET() {
  try {
    // Connect to database
    await dbConnect();

    // Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a researcher
    const user = await UserModel.findById((session.user as unknown as { id: string }).id) as unknown as PopulatedUserDocument;
    if (!user || user.role !== 'researcher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all dashboard data in parallel
    const [
      publications,
      collaborations,
      trials,
      forumPosts,
      profileViews
    ] = await Promise.all([
      // Recent publications (last 30 days)
      PublicationModel.find({
        researcherId: user._id as Types.ObjectId,
        publicationDate: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      })
        .sort({ publicationDate: -1 })
        .limit(5)
        .select('title authors journal publicationDate')
        .lean(),

      // Collaboration requests (pending and accepted)
      CollaborationModel.find({
        $or: [
          { requesterId: user._id as Types.ObjectId },
          { receiverId: user._id as Types.ObjectId }
        ],
        status: { $in: ['pending', 'accepted'] }
      })
        .populate('requesterId', 'firstName lastName institution')
        .populate('receiverId', 'firstName lastName institution')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Relevant trials (simplified - would need more complex matching logic)
      TrialModel.find({
        conditions: { $in: (user as PopulatedUserDocument).expertise || [] }
      })
        .sort({ lastUpdated: -1 })
        .limit(5)
        .select('nctNumber title condition phase status locations')
        .lean(),

      // Forum activity in expertise areas
      ForumPostModel.find({
        category: { $in: (user as PopulatedUserDocument).expertise || [] }
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category author replies lastActivity')
        .lean(),

      // Profile views (mock data - would be from analytics in real implementation)
      Promise.resolve([
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), count: 5 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), count: 3 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), count: 8 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), count: 2 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), count: 7 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), count: 4 },
        { date: new Date().toISOString(), count: 6 },
      ])
    ]);

    // Transform collaborations data
    const transformedCollaborations = collaborations.map(collab => ({
      _id: collab._id.toString(),
      requesterName: ((collab.requesterId as unknown) as PopulatedUserDocument)?.firstName + ' ' + ((collab.requesterId as unknown) as PopulatedUserDocument)?.lastName,
      requesterInstitution: ((collab.requesterId as unknown) as PopulatedUserDocument)?.institution,
      context: collab.context,
      status: collab.status,
      createdAt: collab.createdAt.toISOString(),
    }));

    return NextResponse.json({
      publications,
      collaborations: transformedCollaborations,
      trials,
      forumPosts,
      profileViews
    });
  } catch (error) {
    console.error('Error fetching researcher dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}