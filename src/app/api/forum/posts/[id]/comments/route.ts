import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import dbConnect from '@/lib/db/connect';
import { ForumCommentModel, ForumPostModel } from '@/models/forum/Forum';
import { Types } from 'mongoose';

interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Get comments for a post with pagination and sorting
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const postId = id || getIdFromUrl(req.url);
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    
    // Verify the post exists
    const post = await ForumPostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const sortOption: { [key: string]: 1 | -1 } =
      sortBy === 'upvotes' ? { upvotes: -1 } : { createdAt: sortBy === 'oldest' ? 1 : -1 };

    // Flat comments (no threading) aligned with current schema
    const comments = await ForumCommentModel.find({
      postId: new Types.ObjectId(postId)
    })
      .sort(sortOption)
      .limit(limit)
      .skip(offset)
      .populate('authorId', 'firstName lastName role profilePicture')
      .lean();

    const total = await ForumCommentModel.countDocuments({
      postId: new Types.ObjectId(postId)
    });

    return NextResponse.json({ comments, total, limit, offset });
  } catch (error) {
    console.error('Error fetching forum comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Extract post ID defensively from URL when params are missing
function getIdFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const match = pathname.match(/\/api\/forum\/posts\/([^/]+)\/comments/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = (session.user as UserSession).id;
    const { id } = await params;
    const postId = id || getIdFromUrl(req.url);
    
    if (!postId) {
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }
    
    const body = await req.json().catch(() => null);
    const content = body?.content;
    
    if (!content || !String(content).trim()) {
      return NextResponse.json({ error: 'Missing comment content' }, { status: 400 });
    }
    
    // Verify the post exists
    const post = await ForumPostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Create the comment
    const comment = await ForumCommentModel.create({
      postId,
      authorId: userId,
      content: String(content).trim(),
      upvotes: []
    });
    
    // Populate author information
    await comment.populate('authorId', 'firstName lastName role');
    
    return NextResponse.json({ 
      success: true, 
      comment 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating forum comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}