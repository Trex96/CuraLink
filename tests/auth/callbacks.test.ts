jest.mock('@/lib/db/connect', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/user/User', () => ({
  __esModule: true,
  default: {},
  UserRole: { PATIENT: 'patient', RESEARCHER: 'researcher' },
}));
jest.mock('bcryptjs', () => ({ __esModule: true, compare: jest.fn() }));

import { authOptions } from '@/lib/auth/auth';

describe('NextAuth callbacks', () => {
  it('jwt includes id and role when user present', async () => {
    const token = {};
    const user = { id: 'abc123', role: 'researcher' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await authOptions.callbacks!.jwt!({ token, user: user as any, account: null, profile: undefined, trigger: 'signIn', session: null });
    expect(res.id).toBe('abc123');
    expect(res.role).toBe('researcher');
  });

  it('session includes id and role from token', async () => {
    const token = { id: 'xyz789', role: 'patient' };
    const session = { user: { name: 'John', email: 'john@example.com' }, expires: '2099-01-01T00:00:00.000Z' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await authOptions.callbacks!.session!({ session, token: token as any, user: { id: 'u1' } as any, newSession: null, trigger: 'update' });
    interface SessionUser {
      id?: string;
      role?: string;
    }
    expect((res.user as SessionUser).id).toBe('xyz789');
    expect((res.user as SessionUser).role).toBe('patient');
  });
});