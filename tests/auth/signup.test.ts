jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: object, init?: { status?: number }) => ({ ...body, status: init?.status ?? 200 }),
  },
}));

import * as signupRoute from '@/app/api/auth/signup/route';
const getPOST = () => signupRoute.POST as unknown as (req: { json: () => Promise<object>; headers: Map<string, string> }) => Promise<{ status: number }>;
import { UserRole } from '@/types';

jest.mock('@/lib/db/connect', () => ({ __esModule: true, default: jest.fn(async () => { }) }));
jest.mock('@/models/user/User', () => ({ __esModule: true, default: jest.fn() }));

describe('Signup API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
    const UserMock = jest.requireMock('@/models/user/User').default as { findOne: jest.Mock };
    UserMock.findOne = jest.fn().mockResolvedValue(null);
  });

  function makeReq(body: object, origin = 'http://localhost:3000') {
    return {
      json: async () => body,
      headers: new Map([['origin', origin]]),
    } as { json: () => Promise<object>; headers: Map<string, string> };
  }

  it('rejects invalid origin', async () => {
    const POST = getPOST();
    const res = await POST(makeReq({ role: UserRole.PATIENT }, 'http://malicious.example'));
    expect(res.status).toBe(403);
  });

  it('allows when ALLOWED_ORIGINS unset', async () => {
    delete process.env.ALLOWED_ORIGINS;
    const POST = getPOST();
    const res = await POST(makeReq({ role: UserRole.PATIENT }));
    // Will fail validation due to missing fields, but not origin
    expect(res.status).toBe(400);
  });

  it('validates basic fields', async () => {
    const POST = getPOST();
    const res = await POST(makeReq({ firstName: '', lastName: '', email: 'bad', password: '123', role: 'other' }));
    expect(res.status).toBe(400);
  });

  it('creates patient and hashes password via model pre-save', async () => {
    const save = jest.fn(async () => { });
    const UserMock = jest.requireMock('@/models/user/User').default as jest.Mock;
    UserMock.mockImplementation(() => ({ save }));

    const POST = getPOST();
    const res = await POST(makeReq({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'secret123',
      role: UserRole.PATIENT,
      dateOfBirth: '1990-01-01',
    }));
    expect(res.status).toBe(201);
    expect(UserMock).toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
  });

  it('requires institution and bio for researcher', async () => {
    const POST = getPOST();
    const res = await POST(makeReq({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
      role: UserRole.RESEARCHER,
    }));
    expect(res.status).toBe(400);
  });
});