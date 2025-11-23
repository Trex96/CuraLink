import { NextRequest, NextResponse } from 'next/server';
import { getSearchSuggestions } from '@/lib/services/search';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    
    const suggestions = await getSearchSuggestions(query);
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}