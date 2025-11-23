import { NextRequest } from 'next/server';
// Mock next/server to avoid environment-specific Request implementation
jest.mock('next/server', () => ({
  NextRequest: class { },
  NextResponse: {
    json: (data: object, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));
// Mock mongoose Types to avoid loading mongodb ESM modules
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: class {
      private _id: string | undefined;
      constructor(id?: string) { this._id = id; }
      toString() { return this._id || 'mock-object-id'; }
      static isValid() { return true; }
    }
  }
}));

// Mock auth and DB connect
jest.mock('@/lib/auth/auth', () => ({ authOptions: {} }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/db/connect', () => ({ __esModule: true, default: jest.fn(async () => { }) }));

// Mock models
const updateOne = jest.fn();
const exists = jest.fn();
const findById = jest.fn();

jest.mock('@/models/forum/Forum', () => ({
  ForumCommentModel: { updateOne, exists, findById },
  ForumPostModel: { updateOne, exists, findById },
}));

import { getServerSession } from 'next-auth/next';
import * as commentUpvoteRoute from '@/app/api/forum/comments/[id]/upvote/route';
import * as postUpvoteRoute from '@/app/api/forum/posts/[id]/upvote/route';

describe('Voting routes toggle behavior', () => {
  const userId = 'user_test_id';
  const commentId = 'comment_test_id';
  const postId = 'post_test_id';

  beforeEach(() => {
    jest.resetAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: userId } });
  });

  test('Comment upvote: adds a single vote when not yet upvoted', async () => {
    // First exists(): not upvoted yet; second exists(): now upvoted
    (exists as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: commentId });
    (updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
    (findById as jest.Mock).mockReturnValueOnce({ select: () => Promise.resolve({ upvotes: [userId] }) });

    const res = await commentUpvoteRoute.POST(
      {} as NextRequest,
      { params: Promise.resolve({ id: commentId }) }
    );

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(updateOne).toHaveBeenCalledWith(
      { _id: commentId },
      expect.objectContaining({ $addToSet: expect.any(Object), $push: expect.any(Object) })
    );
    expect(data.upvoted).toBe(true);
    expect(data.upvoteCount).toBe(1);
  });

  test('Comment upvote: toggles to unvote on second attempt', async () => {
    // First exists(): already upvoted; second exists(): now not upvoted
    (exists as jest.Mock).mockResolvedValueOnce({ _id: commentId }).mockResolvedValueOnce(null);
    (updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
    (findById as jest.Mock).mockReturnValueOnce({ select: () => Promise.resolve({ upvotes: [] }) });

    const res = await commentUpvoteRoute.POST(
      {} as NextRequest,
      { params: Promise.resolve({ id: commentId }) }
    );

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(updateOne).toHaveBeenCalledWith(
      { _id: commentId },
      expect.objectContaining({ $pull: expect.any(Object), $push: expect.any(Object) })
    );
    expect(data.upvoted).toBe(false);
    expect(data.upvoteCount).toBe(0);
  });

  test('Post upvote: adds a single vote when not yet upvoted', async () => {
    // First exists(): not upvoted yet; second exists(): now upvoted
    (exists as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: postId });
    (updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
    (findById as jest.Mock).mockReturnValueOnce({ select: () => Promise.resolve({ upvotes: [userId] }) });

    const res = await postUpvoteRoute.PUT(
      {} as NextRequest,
      { params: Promise.resolve({ id: postId }) }
    );

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(updateOne).toHaveBeenCalledWith(
      { _id: postId },
      expect.objectContaining({ $addToSet: expect.any(Object), $push: expect.any(Object) })
    );
    expect(data.upvoted).toBe(true);
    expect(data.upvoteCount).toBe(1);
  });

  test('Post upvote: toggles to unvote on second attempt', async () => {
    // First exists(): already upvoted; second exists(): now not upvoted
    (exists as jest.Mock).mockResolvedValueOnce({ _id: postId }).mockResolvedValueOnce(null);
    (updateOne as jest.Mock).mockResolvedValueOnce({ modifiedCount: 1 });
    (findById as jest.Mock).mockReturnValueOnce({ select: () => Promise.resolve({ upvotes: [] }) });

    const res = await postUpvoteRoute.PUT(
      {} as NextRequest,
      { params: Promise.resolve({ id: postId }) }
    );

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(updateOne).toHaveBeenCalledWith(
      { _id: postId },
      expect.objectContaining({ $pull: expect.any(Object), $push: expect.any(Object) })
    );
    expect(data.upvoted).toBe(false);
    expect(data.upvoteCount).toBe(0);
  });
});