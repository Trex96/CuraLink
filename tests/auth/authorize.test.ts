import { authorizeCredentials } from '@/lib/auth/auth';
import * as bcrypt from 'bcryptjs';

jest.mock('@/lib/db/connect', () => ({ __esModule: true, default: jest.fn(async () => { }) }));
jest.mock('@/models/user/User', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));
jest.mock('bcryptjs');

describe('NextAuth authorize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects missing credentials', async () => {
    await expect(authorizeCredentials({})).rejects.toThrow('Missing credentials');
  });

  it('rejects invalid credentials', async () => {
    const UserMock = jest.requireMock('@/models/user/User').default as { findOne: jest.Mock };
    UserMock.findOne.mockResolvedValue(null);
    const res = await authorizeCredentials({ email: 'a@b.com', password: 'x' });
    expect(res).toBeNull();
  });

  it('accepts valid credentials', async () => {
    const UserMock = jest.requireMock('@/models/user/User').default as { findOne: jest.Mock };
    UserMock.findOne.mockResolvedValue({
      _id: 'uid1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      role: 'patient',
      password: 'hash',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const user = await authorizeCredentials({ email: 'jane@example.com', password: 'secret' });
    expect(user).not.toBeNull();
    if (user) {
      expect(user.email).toBe('jane@example.com');
      expect(user.role).toBe('patient');
    }
  });
});