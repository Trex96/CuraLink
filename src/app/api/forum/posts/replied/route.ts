import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel, IForumPost } from '@/models/forum/Forum';
import { Types } from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // First get reply counts for all posts
    const replyCounts = await ForumCommentModel.aggregate([
      { $group: { _id: '$postId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
    
    // Get the post IDs with most replies
    const postIds = replyCounts.map(item => item._id);
    
    // Get the actual posts
    const posts = await ForumPostModel.find({
      _id: { $in: postIds }
    })
      .populate('authorId', 'firstName lastName role');
    
    // Create a map for quick lookup
    interface PostMap {
      [key: string]: IForumPost;
    }
    
    const postMap = posts.reduce((acc: PostMap, post) => {
      acc[(post._id as Types.ObjectId).toString()] = post;
      return acc;
    }, {} as PostMap);
    
    // Add counts and sort by reply count (alias of comment count)
    const postsWithCounts = replyCounts.map(item => {
      const post = postMap[item._id.toString()];
      if (post) {
        return {
          ...post.toObject(),
          replyCount: item.count,
          commentCount: item.count
        };
      }
      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.replyCount - a.replyCount);
    
    return NextResponse.json({ 
      posts: postsWithCounts
    });
  } catch (error) {
    console.error('Error fetching most replied posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}