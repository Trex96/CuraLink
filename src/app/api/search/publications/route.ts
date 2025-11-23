import { NextRequest, NextResponse } from 'next/server';
import { searchPublications } from '@/lib/services/search';
import connectDB from '@/lib/db/connect';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const filters = await req.json();
    
    const results = await searchPublications(filters);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search publications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}