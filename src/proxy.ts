import { withAuth } from 'next-auth/middleware';

// Proxy enforcing auth and role-based gating.
export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (!token) return false;
      const role = (token as { role?: string }).role;

      if (pathname.startsWith('/dashboard/researcher')) return role === 'researcher';
      if (pathname.startsWith('/dashboard/patient')) return role === 'patient';
      return true;
    },
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/messages/:path*',
    '/forum/:path*',
  ],
};