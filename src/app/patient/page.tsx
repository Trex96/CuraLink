'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FlaskConical, BookOpen, MessageSquare, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';

export default function PatientHomePage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Your Health Journey Starts Here</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with leading researchers, find clinical trials, and access patient-friendly medical information
        </p>
      </div>

      {/* Quick Search */}
      <div className="mb-12 max-w-2xl mx-auto">
        <SearchBar
          placeholder="Search researchers, trials, or publications..."
          onSearch={handleSearch}
          className="w-full"
        />
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Find Top Researchers</CardTitle>
            <CardDescription>Connect with experts in your condition area</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/search?tab=researchers">Explore Researchers</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <FlaskConical className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Discover Clinical Trials</CardTitle>
            <CardDescription>Find trials near you matching your conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/search?tab=trials">Browse Trials</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <BookOpen className="h-10 w-10 text-primary mb-2" />
            <CardTitle>Access Publications</CardTitle>
            <CardDescription>Read patient-friendly medical research</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/search?tab=publications">View Publications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Patient Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Community Forum
            </CardTitle>
            <CardDescription>Join discussions with other patients</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Share experiences, ask questions, and connect with others who understand your journey.
            </p>
            <Button asChild>
              <Link href="/forum">Visit Forum</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Expert Requests
            </CardTitle>
            <CardDescription>Connect directly with researchers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Request consultations with top researchers in your field of interest.
            </p>
            <Button asChild>
              <Link href="/dashboard/patient">View Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Ready to take the next step?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join our community today and take control of your health journey with access to the latest research and expert connections.
        </p>
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard/patient">Go to Dashboard</Link>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/signup/patient">Sign Up as Patient</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}