import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumCategoryModel } from '@/models/forum/Forum';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query) {
      return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
    }
    
    const categories = await ForumCategoryModel.find({
      $text: { $search: query }
    })
      .sort({ name: 1 })
      .limit(limit);
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error searching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}