import { NextAuthOptions, User as NextAuthUser, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/connect';
import User, { IUser } from '@/models/user/User';
import { UserRole } from '@/types';
import { JWT } from 'next-auth/jwt';

// Extend the NextAuth User type to include our custom properties
interface UserWithRole extends NextAuthUser {
  id: string;
  role: UserRole;
  name: string;
}

export async function authorizeCredentials(credentials: Record<string, string> | undefined) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Missing credentials');
  }

  await connectDB();

  const user: IUser | null = await User.findOne({ email: credentials.email });

  if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
    // Return null to align with NextAuth semantics instead of throwing
    return null;
  }

  return {
    id: (user._id as unknown as string),
    name: user.firstName + ' ' + user.lastName,
    email: user.email,
    role: user.role,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        return authorizeCredentials(credentials);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        const u = user as UserWithRole;
        token.id = u.id;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as UserWithRole).id = token.id as string;
        (session.user as UserWithRole).role = token.role as UserRole;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup/patient', // Redirect new users to patient signup by default
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Do not export a NextAuth handler here. The API route
// `src/app/api/auth/[...nextauth]/route.ts` is responsible for creating
// the handler using `NextAuth(authOptions)`. Exporting the handler here
// causes NextAuth to initialize during tests when importing `authOptions`.