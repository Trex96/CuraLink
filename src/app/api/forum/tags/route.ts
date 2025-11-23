import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel } from '@/models/forum/Forum';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all unique tags from all posts
    const tags = await ForumPostModel.distinct('tags');
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}