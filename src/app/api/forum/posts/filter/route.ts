import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const authorId = searchParams.get('authorId');
    const sort = searchParams.get('sort') || 'createdAt';
    
    interface QueryType {
      category?: string;
      tags?: string;
      authorId?: string;
    }
    
    const query: QueryType = {};
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (authorId) {
      query.authorId = authorId;
    }
    
    interface SortOption {
      [key: string]: 1 | -1;
    }
    
    let sortOption: SortOption = {};
    switch (sort) {
      case 'upvotes':
        sortOption = { upvotes: -1 };
        break;
      case 'replies':
        // We'll sort by reply count after fetching
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
    interface PostWithCount {
      [key: string]: unknown;
      replyCount: number;
    }
    
    const postsWithCounts: PostWithCount[] = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        replyCount: replyCountMap[(post._id as Types.ObjectId).toString()] || 0
      };
    });
    
    // If sorting by replies, sort after adding reply counts
    let sortedPosts = postsWithCounts;
    if (sort === 'replies') {
      sortedPosts = [...postsWithCounts].sort((a, b) => b.replyCount - a.replyCount);
    }
    
    const total = await ForumPostModel.countDocuments(query);
    
    return NextResponse.json({ 
      posts: sort === 'replies' ? sortedPosts : postsWithCounts,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error filtering forum posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}