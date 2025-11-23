import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumCategoryModel } from '@/models/forum/Forum';

export async function GET() {
  try {
    await dbConnect();
    
    const categories = await ForumCategoryModel.find({}).sort({ name: 1 });
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
