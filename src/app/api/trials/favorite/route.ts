import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import Favorite from '@/models/favorite/Favorite';
import Trial from '@/models/trial/Trial';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { trialId } = body;
    
    // Validate input
    if (!trialId) {
      return NextResponse.json(
        { error: 'Trial ID is required' },
        { status: 400 }
      );
    }
    
    // Check if trial exists
    const trial = await Trial.findById(trialId);
    if (!trial) {
      return NextResponse.json(
        { error: 'Trial not found' },
        { status: 404 }
      );
    }
    
    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      userId: (session.user as SessionUser).id,
      itemType: 'trial',
      itemId: trialId
    });
    
    let isFavorite = false;
    
    if (existingFavorite) {
      // Remove favorite
      await Favorite.findByIdAndDelete(existingFavorite._id);
    } else {
      // Add favorite
      const favorite = new Favorite({
        userId: (session.user as SessionUser).id,
        itemType: 'trial',
        itemId: trialId
      });
      await favorite.save();
      isFavorite = true;
    }
    
    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error('Error toggling trial favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}