import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel, ForumCategoryModel } from '@/models/forum/Forum';

export async function GET() {
  try {
    await dbConnect();
    
    // Get total posts count
    const totalPosts = await ForumPostModel.countDocuments();
    
    // Get total comments count
    const totalComments = await ForumCommentModel.countDocuments();
    
    // Get total categories count
    const totalCategories = await ForumCategoryModel.countDocuments();
    
    // Get total users who have posted
    const activeUsers = await ForumPostModel.distinct('authorId');
    const totalActiveUsers = activeUsers.length;
    
    return NextResponse.json({ 
      stats: {
        totalPosts,
        totalComments,
        totalCategories,
        totalActiveUsers
      }
    });
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}