import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumPostModel, ForumCommentModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { forumPostSchema } from '@/lib/validations/postSchemas';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface QueryType {
  category?: string;
  _id?: { $nin: Types.ObjectId[] };
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    let limit = parseInt(searchParams.get('limit') || '10');
    let offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'createdAt';
    const filter = searchParams.get('filter') || 'all'; // all, unanswered, trending, recent

    // Clamp pagination to safe bounds
    if (Number.isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;
    if (Number.isNaN(offset) || offset < 0) offset = 0;

    const query: QueryType = {};

    if (category) {
      query.category = category;
    }

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

    // Add reply/comment counts to posts
    const postsWithCounts = posts.map(post => {
      const count = replyCountMap[(post._id as Types.ObjectId).toString()] || 0;
      return {
        ...post.toObject(),
        replyCount: count,
        commentCount: count
      };
    });

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

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const raw = await req.json();
    const parsed = forumPostSchema.safeParse({
      title: String(raw?.title ?? ''),
      content: String(raw?.content ?? ''),
      category: String(raw?.category ?? ''),
      tags: Array.isArray(raw?.tags) ? raw.tags.map((t: unknown) => String(t).trim()).filter(Boolean) : []
    });

    if (!parsed.success) {
      const errors = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 422 });
    }

    const { title, content, category, tags } = parsed.data;

    // Validate category exists
    const { ForumCategoryModel } = await import('@/models/forum/Forum');
    const categoryExists = await ForumCategoryModel.findOne({ name: category });
    if (!categoryExists) {
      return NextResponse.json({ error: 'Validation failed', errors: [{ path: 'category', message: 'Invalid category' }] }, { status: 422 });
    }

    // Validate attachments separately
    type SafeAttachment = { url: string; name: string; size: number };
    let safeAttachments: SafeAttachment[] = [];
    if (Array.isArray(raw?.attachments)) {
      safeAttachments = (raw.attachments as unknown[])
        .map((a: unknown): SafeAttachment => {
          const attachment = a as Record<string, unknown>;
          return {
            url: String(attachment?.url || ''),
            name: String(attachment?.name || ''),
            size: Number(attachment?.size || 0)
          };
        })
        .filter((a: SafeAttachment) => a.url && a.name && Number.isFinite(a.size) && a.size >= 0 && a.size <= 5 * 1024 * 1024);
      if (safeAttachments.length > 10) {
        return NextResponse.json({ error: 'Validation failed', errors: [{ path: 'attachments', message: 'Too many attachments (max 10)' }] }, { status: 422 });
      }
    }

    let post;
    // Only use transactions when explicitly enabled and supported
    const wantTransaction = process.env.FORUM_USE_TRANSACTIONS === 'true';
    const isTestEnv = process.env.NODE_ENV === 'test';
    if (wantTransaction && !isTestEnv) {
      try {
        const sessionDb = await mongoose.startSession();
        try {
          await sessionDb.withTransaction(async () => {
            const doc = new ForumPostModel({
              authorId: (session.user as UserSession).id,
              title: title.trim(),
              content: content.trim(),
              category,
              tags,
              upvotes: [],
              attachments: safeAttachments
            });
            await doc.save({ session: sessionDb });
            post = doc;
          });
        } finally {
          sessionDb.endSession();
        }
      } catch (txErr) {
        console.warn('Transactions unsupported or failed; falling back to non-transactional save.', txErr);
        const doc = new ForumPostModel({
          authorId: (session.user as UserSession).id,
          title: title.trim(),
          content: content.trim(),
          category,
          tags,
          upvotes: [],
          attachments: safeAttachments
        });
        await doc.save();
        post = doc;
      }
    } else {
      const doc = new ForumPostModel({
        authorId: (session.user as UserSession).id,
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        upvotes: [],
        attachments: safeAttachments
      });
      await doc.save();
      post = doc;
    }

    // Send notifications to researchers with matching expertise (best-effort, post-commit)
    if (post && post._id) {
      try {
        await notifyResearchersWithMatchingExpertise((post._id as Types.ObjectId).toString(), title, category, tags || []);
      } catch (notifyErr) {
        console.error('Notification dispatch failed for post creation:', notifyErr);
      }
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating forum post:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Function to notify researchers with matching expertise
async function notifyResearchersWithMatchingExpertise(
  postId: string,
  title: string,
  category: string,
  tags: string[]
) {
  try {
    // Import here to avoid circular dependencies
    const { default: UserModel } = await import('@/models/user/User');
    const { sendNewQuestionInFieldNotification } = await import('@/lib/services/notifications');

    // Find researchers with matching expertise
    const expertiseKeywords = [category, ...tags];

    const researchers = await UserModel.find({
      role: 'researcher',
      expertise: { $in: expertiseKeywords }
    });

    // Send notifications to each matching researcher
    for (const researcher of researchers) {
      const message = `A new question in your field of expertise has been posted: "${title}"`;
      await sendNewQuestionInFieldNotification(
        (researcher._id as Types.ObjectId).toString(),
        message,
        postId
      );
    }
  } catch (error) {
    console.error('Error notifying researchers:', error);
  }
}
