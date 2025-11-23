import { NextRequest, NextResponse } from 'next/server';
import { PipelineStage } from 'mongoose';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel } from '@/models/forum/Forum';


export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const queryText = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const authorRole = searchParams.get('authorRole');
    const isVerified = searchParams.get('isVerified');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sort = searchParams.get('sort') || 'relevance'; // relevance, date, upvotes, replies
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build the match stage for aggregation
    const matchStage: Record<string, unknown> = {};

    if (queryText) {
      matchStage.$or = [
        { title: { $regex: queryText, $options: 'i' } },
        { content: { $regex: queryText, $options: 'i' } }
      ];
    }

    if (category) {
      matchStage.category = category;
    }

    if (tags && tags.length > 0) {
      matchStage.tags = { $in: tags };
    }

    if (startDate || endDate) {
      const createdAtFilter: Record<string, Date> = {};
      if (startDate) createdAtFilter.$gte = new Date(startDate);
      if (endDate) createdAtFilter.$lte = new Date(endDate);
      matchStage.createdAt = createdAtFilter;
    }

    // If filtering by author role or verification, we need to look up users first or use $lookup
    // Using $lookup in aggregation is better for performance than two separate queries

    const pipeline: PipelineStage[] = [];

    // 1. Match basic post fields first to reduce set
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // 2. Lookup author details
    pipeline.push({
      $lookup: {
        from: 'users', // Assuming collection name is 'users'
        localField: 'authorId',
        foreignField: '_id',
        as: 'author'
      }
    });

    // 3. Unwind author (preserve posts without authors? likely not needed for valid posts)
    pipeline.push({ $unwind: '$author' });

    // 4. Filter by author attributes
    const authorMatch: Record<string, unknown> = {};
    if (authorRole) {
      authorMatch['author.role'] = authorRole;
    }
    // Assuming isVerified is on the user profile, or maybe on the post? 
    // If it's on the post, it should be in the initial match. 
    // If it's "verified user", it's here. Let's assume user verification for now.
    if (isVerified === 'true') {
      authorMatch['author.isVerified'] = true; // Adjust field name as per User schema
    }

    if (Object.keys(authorMatch).length > 0) {
      pipeline.push({ $match: authorMatch });
    }

    // 5. Lookup reply counts (optimization: do this only if needed for sort or display)
    // We always display it, so we need it.
    pipeline.push({
      $lookup: {
        from: 'forumcomments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments'
      }
    });

    pipeline.push({
      $addFields: {
        replyCount: { $size: '$comments' }
      }
    });

    // 6. Sort
    let sortStage: Record<string, 1 | -1> = {};
    const sortDir = order === 'asc' ? 1 : -1;

    switch (sort) {
      case 'date':
      case 'createdAt':
        sortStage = { createdAt: sortDir };
        break;
      case 'upvotes':
        // Assuming upvotes is an array of IDs
        pipeline.push({
          $addFields: {
            upvotesCount: { $size: { $ifNull: ['$upvotes', []] } }
          }
        });
        sortStage = { upvotesCount: sortDir };
        break;
      case 'replies':
        sortStage = { replyCount: sortDir };
        break;
      case 'relevance':
      default:
        // Regex search doesn't provide a textScore, so default to newest first
        sortStage = { createdAt: -1 };
        break;
    }

    pipeline.push({ $sort: sortStage });

    // 7. Pagination
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: offset },
          { $limit: limit },
          {
            $project: {
              comments: 0, // Remove heavy comments array
              'author.password': 0, // Security: remove sensitive user data
              'author.email': 0
            }
          }
        ]
      }
    });

    const result = await ForumPostModel.aggregate(pipeline);

    const metadata = result[0].metadata[0] || { total: 0 };
    const posts = result[0].data || [];

    // Transform author back to expected format if needed by frontend
    const formattedPosts = posts.map((post: Record<string, unknown>) => ({
      ...post,
      authorId: post.author // The frontend likely expects populated authorId
    }));

    return NextResponse.json({
      posts: formattedPosts,
      total: metadata.total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error searching forum posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}