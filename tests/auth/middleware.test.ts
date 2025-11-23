jest.mock('next-auth/middleware', () => ({
  withAuth: (opts: { callbacks?: object }) => opts, // return options directly for import
}));

import { config } from '@/proxy';

describe('middleware', () => {
  it('protects dashboard routes via matcher', async () => {
    expect(config.matcher).toContain('/dashboard/:path*');
  });
});