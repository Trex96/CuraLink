import { NextRequest, NextResponse } from 'next/server';
import { searchTrials } from '@/lib/services/clinicaltrials';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';

interface SearchRequest {
  disease?: string;
  location?: string;
  status?: string;
  phase?: string;
  studyType?: string;
  page?: number;
  pageSize?: number;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const searchParams: SearchRequest = await req.json();
    
    // Validate required parameters
    if (!searchParams.disease && !searchParams.location) {
      return NextResponse.json({ error: 'Disease or location is required' }, { status: 400 });
    }
    
    // Search trials
    const trials = await searchTrials(searchParams);
    
    return NextResponse.json({ trials });
  } catch (error) {
    console.error('Error searching trials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}