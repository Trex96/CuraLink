import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user/User';
import Publication from '@/models/publication/Publication';
import Trial from '@/models/trial/Trial';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import Favorite from '@/models/favorite/Favorite';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
      const { id } = await params;
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch researcher data
    const researcher = await User.findById(id).lean();
    if (!researcher || researcher.role !== 'researcher') {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      );
    }
    
    // Fetch researcher's publications
    const publications = await Publication.find({ researcherId: id }).lean();
    
    // Fetch researcher's active trials with eligibility criteria
    const trials = await Trial.find({ 
      researcher: id,
      status: { $in: ['recruiting', 'active', 'enrolling'] }
    }).select('title nctNumber status phase conditions locations eligibilityCriteria').lean();
    
    // Check if researcher is in user's favorites
    const favorite = await Favorite.findOne({
      userId: (session.user as SessionUser).id,
      itemType: 'researcher',
      itemId: id
    });
    
    const isFavorite = !!favorite;
    
    return NextResponse.json({
      researcher,
      publications,
      trials,
      isFavorite
    });
  } catch (error) {
    console.error('Error fetching researcher data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}