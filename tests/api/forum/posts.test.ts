import { NextRequest } from 'next/server';

// Mock next/server to control NextResponse
jest.mock('next/server', () => ({
  NextRequest: class { },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

// Mock mongoose Types and transactions
jest.mock('mongoose', () => ({
  __esModule: true,
  Types: {
    ObjectId: class {
      private _id: string | undefined;
      constructor(id?: string) { this._id = id; }
      toString() { return this._id || 'mock-object-id'; }
      static isValid() { return true; }
    }
  },
  default: {
    startSession: jest.fn(async () => ({
      withTransaction: async (fn: () => Promise<void>) => { await fn(); },
      endSession: () => { },
    })),
  },
}));

// Mock auth and DB connect
jest.mock('@/lib/auth/auth', () => ({ authOptions: {} }));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/db/connect', () => ({ __esModule: true, default: jest.fn(async () => { }) }));

// Forum models mocks
const findOne = jest.fn();
const countDocuments = jest.fn();
const aggregate = jest.fn();
const distinct = jest.fn();

class ForumPostModelMock {
  _data: Record<string, unknown>;
  _id: string;
  constructor(data: Record<string, unknown>) {
    this._data = data;
    // Assign fields to mimic Mongoose doc field access
    Object.assign(this, data);
    this._id = 'new_post_id';
  }
  async save() { return this; }
  toObject() { return { ...this._data, _id: this._id }; }
  static find() {
    const chain = {
      sort: () => chain,
      limit: () => chain,
      skip: () => chain,
      populate: () => [{ _id: 'p1', toObject: () => ({ _id: 'p1', title: 't', content: 'c', category: 'General', upvotes: [] }) }],
    };
    return chain;
  }
  static async findById(_id: string) {
    // Return a doc with authorId matching the test user for update route
    return new ForumPostModelMock({
      _id,
      title: 'Old Title',
      content: 'Old Content',
      category: 'General',
      tags: ['old'],
      authorId: { toString: () => 'user123' },
      populate: async () => { },
      upvotes: [],
    });
  }
  static countDocuments = countDocuments;
}

jest.mock('@/models/forum/Forum', () => ({
  ForumPostModel: ForumPostModelMock,
  ForumCommentModel: { aggregate, distinct },
  ForumCategoryModel: { findOne },
}));

// Import route handlers after mocks
import { getServerSession } from 'next-auth/next';
import * as postsRoute from '@/app/api/forum/posts/route';
import mongoose from 'mongoose';

describe('Forum posts API routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  test('POST creates a new post successfully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user123' } });
    findOne.mockResolvedValue({ name: 'General' });

    const req = { json: async () => ({ title: 'Hello World', content: 'This is a forum content.', category: 'General', tags: ['tag1'] }) } as unknown as NextRequest;
    const res = await postsRoute.POST(req);
    const data = await res.json();
    console.log('POST payload:', data);

    expect(res.status).toBe(201);
    expect(data.post._id).toBeDefined();
    expect(data.post.title).toBe('Hello World');
  });

  test('POST fails with 401 when unauthorized', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = { json: async () => ({ title: 't', content: 'c', category: 'General' }) } as unknown as NextRequest;
    const res = await postsRoute.POST(req);
    expect(res.status).toBe(401);
  });

  test('POST fails with 422 on validation errors', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user123' } });
    findOne.mockResolvedValue({ name: 'General' });

    const req = { json: async () => ({ title: 'a', content: 'short', category: '' }) } as unknown as NextRequest;
    const res = await postsRoute.POST(req);
    const data = await res.json();
    expect(res.status).toBe(422);
    expect(data.errors).toBeTruthy();
  });

  test('GET returns posts list with counts', async () => {
    aggregate.mockResolvedValue([]);
    countDocuments.mockResolvedValue(1);

    const res = await postsRoute.GET({ url: 'http://localhost/api/forum/posts?limit=1&offset=0' } as unknown as NextRequest);
    const data = await res.json();
    console.log('GET failure payload:', data);
    expect(res.status).toBe(200);
    expect(Array.isArray(data.posts)).toBe(true);
    expect(data.total).toBe(1);
  });

  test('POST falls back when transactions unsupported', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user123' } });
    findOne.mockResolvedValue({ name: 'General' });
    const original = process.env.FORUM_USE_TRANSACTIONS;
    process.env.FORUM_USE_TRANSACTIONS = 'true';
    (mongoose as unknown as { startSession: jest.Mock }).startSession.mockRejectedValueOnce(new Error('Standalone topology'));
    const req = { json: async () => ({ title: 'Hello World', content: 'This is a forum content.', category: 'General', tags: ['tag1'] }) } as unknown as NextRequest;
    const res = await postsRoute.POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.post._id).toBeDefined();
    process.env.FORUM_USE_TRANSACTIONS = original;
  });

  test('PUT updates a post when authorized and owner', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user123' } });
    const req = { json: async () => ({ title: 'Updated Title', content: 'Updated Content', category: 'General', tags: ['new'] }) } as unknown as NextRequest;
    const res = await (await import('@/app/api/forum/posts/[id]/route')).PUT(req, { params: Promise.resolve({ id: 'post123' }) });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.post.title).toBe('Updated Title');
    expect(data.post.content).toBe('Updated Content');
  });
});