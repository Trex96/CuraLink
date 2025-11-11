export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patient/:path*',
    '/researcher/:path*',
    '/forum/:path*',
    '/search/:path*',
  ],
};
