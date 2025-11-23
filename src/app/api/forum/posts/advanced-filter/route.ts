import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { 
      categories, 
      tags, 
      authorRole, 
      isVerified, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 10, 
      offset = 0 
    } = await req.json();
    
    interface QueryType {
      category?: { $in: string[] };
      tags?: { $in: string[] };
      isResearcherVerified?: boolean;
    }
    
    const query: QueryType = {};
    
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }
    
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (authorRole) {
      // This would require a join with the User collection
      // For simplicity, we'll skip this in this example
    }
    
    if (isVerified !== undefined) {
      query.isResearcherVerified = isVerified;
    }
    
    interface SortOption {
      [key: string]: 1 | -1;
    }
    
    let finalSortOption: SortOption = {};
    if (sortBy) {
      finalSortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      finalSortOption = { createdAt: -1 };
    }
    
    const posts = await ForumPostModel.find(query)
      .sort(finalSortOption)
      .limit(limit)
      .skip(offset)
      .populate('authorId', 'firstName lastName role');
    
    // Get reply counts for each post
    const postIds = posts.map(post => post._id);
    const replyCounts = await ForumCommentModel.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } }
    ]);
    
    interface ReplyCountItem {
      _id: Types.ObjectId;
      count: number;
    }
    
    const replyCountMap = replyCounts.reduce((acc, item: ReplyCountItem) => {
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
    console.error('Error filtering posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}