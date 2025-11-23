import { NextRequest, NextResponse } from 'next/server';
import { searchTrials } from '@/lib/services/search';
import connectDB from '@/lib/db/connect';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const filters = await req.json();
    
    const results = await searchTrials(filters);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search trials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}