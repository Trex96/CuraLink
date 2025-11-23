'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function SignInContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl');

  // Redirect if already signed in
  useEffect(() => {
    if (status === 'authenticated') {
      const redirectAuthenticated = async () => {
        const { getSession } = await import('next-auth/react');
        const s = await getSession();
        const role = (s?.user as { role?: string })?.role;
        const roleTarget = role === 'patient' ? '/dashboard/patient' : role === 'researcher' ? '/dashboard/researcher' : '/';
        router.push(callbackUrl || roleTarget);
      };
      // no floating promises
      void redirectAuthenticated();
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Error', {
          description: result.error,
        });
        setErrorMessage(result.error);
      } else {
        const { getSession } = await import('next-auth/react');
        const s = await getSession();
        const role = (s?.user as { role?: string })?.role;
        const roleTarget = role === 'patient' ? '/dashboard/patient' : role === 'researcher' ? '/dashboard/researcher' : '/';
        const target = callbackUrl || roleTarget;
        toast.success('Success', {
          description: 'Signed in successfully',
        });
        router.push(target);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Error', {
        description: 'An unexpected error occurred',
      });
      setErrorMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Don't show the form if already authenticated
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign in to your CuraLink account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && (
              <div className="text-sm text-red-600" role="alert">Error: {errorMessage}</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm">
              <Link href="/auth/forgot-password" className="text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup/patient" className="text-indigo-600 hover:underline">
                Sign up as Patient
              </Link>{' '}
              or{' '}
              <Link href="/auth/signup/researcher" className="text-indigo-600 hover:underline">
                Researcher
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}