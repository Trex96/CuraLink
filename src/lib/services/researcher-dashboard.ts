import dbConnect from '@/lib/db/connect';
import UserModel from '@/models/user/User';
import PublicationModel from '@/models/publication/Publication';
import CollaborationModel from '@/models/collaboration/Collaboration';
import { ForumPostModel } from '@/models/forum/Forum';
import TrialModel from '@/models/trial/Trial';
import { Types } from 'mongoose';

interface UserDocument {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
  expertise: string[];
}

interface ProfileView {
  date: string;
  count: number;
}

export interface ResearcherDashboardData {
  publications: Record<string, unknown>[];
  collaborations: Record<string, unknown>[];
  trials: Record<string, unknown>[];
  forumPosts: Record<string, unknown>[];
  profileViews: ProfileView[];
}

export async function getResearcherDashboardData(userId: string): Promise<ResearcherDashboardData> {
  try {
    // Connect to database
    await dbConnect();

    // Check if user is a researcher
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'researcher') {
      throw new Error('User is not a researcher');
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
        researcherId: user._id,
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
          { requesterId: user._id },
          { receiverId: user._id }
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
        conditions: { $in: (user as unknown as UserDocument).expertise || [] }
      })
      .sort({ lastUpdated: -1 })
      .limit(5)
      .select('nctNumber title condition phase status locations')
      .lean(),

      // Forum activity in expertise areas
      ForumPostModel.find({
        category: { $in: (user as unknown as UserDocument).expertise || [] }
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
      _id: (collab._id as unknown as Types.ObjectId).toString(),
      requesterName: (collab.requesterId as unknown as UserDocument)?.firstName + ' ' + (collab.requesterId as unknown as UserDocument)?.lastName,
      requesterInstitution: (collab.requesterId as unknown as UserDocument)?.institution,
      context: collab.context,
      status: collab.status,
      createdAt: (collab.createdAt as Date).toISOString(),
    }));

    return {
      publications: publications as Record<string, unknown>[],
      collaborations: transformedCollaborations,
      trials: trials as Record<string, unknown>[],
      forumPosts: forumPosts as Record<string, unknown>[],
      profileViews
    };
  } catch (error) {
    console.error('Error fetching researcher dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

export async function getRecentPublications(userId: string, days: number = 30) {
  try {
    await dbConnect();
    
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'researcher') {
      throw new Error('User is not a researcher');
    }

    const publications = await PublicationModel.find({ 
      researcherId: user._id,
      publicationDate: { 
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) 
      }
    })
    .sort({ publicationDate: -1 })
    .select('title authors journal publicationDate citations')
    .lean();

    return publications;
  } catch (error) {
    console.error('Error fetching recent publications:', error);
    throw new Error('Failed to fetch publications');
  }
}

export async function getCollaborationRequests(userId: string) {
  try {
    await dbConnect();
    
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'researcher') {
      throw new Error('User is not a researcher');
    }

    const collaborations = await CollaborationModel.find({
      $or: [
        { requesterId: user._id },
        { receiverId: user._id }
      ],
      status: { $in: ['pending', 'accepted'] }
    })
    .populate('requesterId', 'firstName lastName institution')
    .populate('receiverId', 'firstName lastName institution')
    .sort({ createdAt: -1 })
    .lean();

    // Transform collaborations data
    const transformedCollaborations = collaborations.map(collab => ({
      _id: (collab._id as unknown as Types.ObjectId).toString(),
      requesterName: (collab.requesterId as unknown as UserDocument)?.firstName + ' ' + (collab.requesterId as unknown as UserDocument)?.lastName,
      requesterInstitution: (collab.requesterId as unknown as UserDocument)?.institution,
      context: collab.context,
      status: collab.status,
      createdAt: (collab.createdAt as Date).toISOString(),
    }));

    return transformedCollaborations;
  } catch (error) {
    console.error('Error fetching collaboration requests:', error);
    throw new Error('Failed to fetch collaboration requests');
  }
}