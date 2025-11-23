import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumCategoryModel, ForumPostModel } from '@/models/forum/Forum';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get categories with post counts
    const categoryStats = await ForumPostModel.aggregate([
      {
        $group: {
          _id: '$category',
          postCount: { $sum: 1 }
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $limit: limit
      }
    ]);
    
    // Get category details
    const categoryNames = categoryStats.map(stat => stat._id);
    const categories = await ForumCategoryModel.find({
      name: { $in: categoryNames }
    });
    
    // Combine stats with category details
    const popularCategories = categoryStats.map(stat => {
      const category = categories.find(cat => cat.name === stat._id);
      return {
        ...category?.toObject(),
        postCount: stat.postCount
      };
    });
    
    return NextResponse.json({ categories: popularCategories });
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}