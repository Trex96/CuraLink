import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

interface QueryType {
  category: string;
  _id?: { $nin: Types.ObjectId[] };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'createdAt';
    const filter = searchParams.get('filter') || 'all'; // all, unanswered, trending, recent
    
    const { category } = await params;
    const query: QueryType = {
      category
    };
    
    if (filter === 'unanswered') {
      // For unanswered posts, we need to check if they have comments
      const postsWithComments = await ForumCommentModel.distinct('postId');
      query._id = { $nin: postsWithComments };
    }
    
    let sortOption: { [key: string]: 1 | -1 } | string = {};
    switch (sort) {
      case 'upvotes':
        sortOption = { upvotes: -1 };
        break;
      case 'replies':
        // We'll need to populate reply counts
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
        break;
    }
    
    const posts = await ForumPostModel.find(query)
      .sort(sortOption)
      .limit(limit)
      .skip(offset)
      .populate('authorId', 'firstName lastName role');
    
    // Get reply counts for each post
    const postIds = posts.map(post => post._id);
    const replyCounts = await ForumCommentModel.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ]);
    
    const replyCountMap = replyCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);
    
    // Add reply counts to posts
    const postsWithCounts = posts.map(post => ({
      ...post.toObject(),
      replyCount: replyCountMap[(post._id as Types.ObjectId).toString()] || 0
    }));
    
    const total = await ForumPostModel.countDocuments(query);
    
    return NextResponse.json({ 
      posts: postsWithCounts,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}