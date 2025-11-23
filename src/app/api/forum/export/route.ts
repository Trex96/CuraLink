import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel, ForumCategoryModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all forum data
    const categories = await ForumCategoryModel.find({}).sort({ name: 1 });
    const posts = await ForumPostModel.find({})
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
    
    return NextResponse.json({ 
      categories,
      posts: postsWithCounts
    });
  } catch (error) {
    console.error('Error exporting forum data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}