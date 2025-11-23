'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';
import { TopResearchersSection } from './components/top-researchers-section';
import { NearbyTrialsSection } from './components/nearby-trials-section';
import { RecommendedReadingsSection } from './components/recommended-readings-section';
import { RecentForumActivity } from './components/recent-forum-activity';
import { Activity, Calendar, ChevronRight, Heart, Sparkles, User } from 'lucide-react';

interface Researcher {
  _id: string;
  firstName: string;
  lastName: string;
  institution: string;
  specialty: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  matchPercentage: number;
}

interface Trial {
  _id: string;
  title: string;
  condition: string;
  phase: string;
  status: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  matchPercentage: number;
  distance?: number;
}

interface Publication {
  _id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  matchPercentage: number;
}

interface ForumPost {
  _id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  lastActivity: string;
}

export default function PatientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({ hasActiveEnrollment: false, enrolledTrials: [] });
  const [loading, setLoading] = useState({
    researchers: true,
    trials: true,
    publications: true,
    forum: true,
    enrollment: true
  });
  const [errors, setErrors] = useState({
    researchers: '',
    trials: '',
    publications: '',
    forum: '',
    enrollment: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch researchers
      try {
        const res = await fetch('/api/dashboard/patient/researchers');
        if (!res.ok) throw new Error('Failed to fetch researchers');
        const data = await res.json();
        setResearchers(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, researchers: err instanceof Error ? err.message : 'Failed to load researchers' }));
      } finally {
        setLoading(prev => ({ ...prev, researchers: false }));
      }

      // Fetch trials
      try {
        const res = await fetch('/api/dashboard/patient/trials');
        if (!res.ok) throw new Error('Failed to fetch trials');
        const data = await res.json();
        setTrials(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, trials: err instanceof Error ? err.message : 'Failed to load trials' }));
      } finally {
        setLoading(prev => ({ ...prev, trials: false }));
      }

      // Fetch publications
      try {
        const res = await fetch('/api/dashboard/patient/publications');
        if (!res.ok) throw new Error('Failed to fetch publications');
        const data = await res.json();
        setPublications(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, publications: err instanceof Error ? err.message : 'Failed to load publications' }));
      } finally {
        setLoading(prev => ({ ...prev, publications: false }));
      }

      // Fetch forum activity
      try {
        const res = await fetch('/api/dashboard/patient/forum-activity');
        if (!res.ok) throw new Error('Failed to fetch forum activity');
        const data = await res.json();
        setForumPosts(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, forum: err instanceof Error ? err.message : 'Failed to load forum activity' }));
      } finally {
        setLoading(prev => ({ ...prev, forum: false }));
      }

      // Fetch enrollment status
      try {
        const res = await fetch('/api/dashboard/patient/enrollments');
        if (!res.ok) throw new Error('Failed to fetch enrollment status');
        const data = await res.json();
        setEnrollmentStatus(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, enrollment: err instanceof Error ? err.message : 'Failed to load enrollment status' }));
      } finally {
        setLoading(prev => ({ ...prev, enrollment: false }));
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 md:w-1/2" />
          <Skeleton className="h-6 w-1/2 md:w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-20 flex justify-center">
        <Card className="w-full max-w-md shadow-lg border-muted">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You need to be logged in as a patient to view this dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild size="lg" className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-b from-primary/5 via-background to-background pb-12 pt-8 md:pt-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Patient'}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Here&apos;s your personalized health overview. You have <span className="font-semibold text-foreground">3 new updates</span> today.
              </p>
            </div>

            {/* Conditional Schedule/Check-in Buttons */}
            {enrollmentStatus.hasActiveEnrollment && (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="gap-2 flex-1 md:flex-none">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all flex-1 md:flex-none">
                  <Sparkles className="h-4 w-4" />
                  Daily Check-in
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats / Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-muted hover:bg-card transition-colors cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Activity className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">Health Status</span>
              </CardContent>
            </Card>

            <Link href="/dashboard/patient/favorites" className="block">
              <Card className="bg-card/50 backdrop-blur-sm border-muted hover:bg-card transition-colors cursor-pointer group h-full">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-sm">Favorites</span>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-card/50 backdrop-blur-sm border-muted hover:bg-card transition-colors cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <User className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">Profile</span>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-muted hover:bg-card transition-colors cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">Appointments</span>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto relative z-10 -mb-8">
            <Card className="shadow-xl border-muted">
              <CardContent className="p-2">
                <SearchBar
                  placeholder="Search for researchers, clinical trials, or health topics..."
                  onSearch={handleSearch}
                  className="border-0 shadow-none focus-visible:ring-0 text-base h-12"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container px-4 md:px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column (Main Feed) */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Recommended for You
                </h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NearbyTrialsSection
                  trials={trials.slice(0, 4)}
                  loading={loading.trials}
                  error={errors.trials}
                />
                <TopResearchersSection
                  researchers={researchers.slice(0, 4)}
                  loading={loading.researchers}
                  error={errors.researchers}
                />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Latest Research</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  Browse Library <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <RecommendedReadingsSection
                publications={publications.slice(0, 4)}
                loading={loading.publications}
                error={errors.publications}
              />
            </section>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Community</h2>
              </div>
              <RecentForumActivity
                posts={forumPosts.slice(0, 4)}
                loading={loading.forum}
                error={errors.forum}
              />
            </section>

            {/* Promo / Info Card */}
            <Card className="bg-primary/5 border-primary/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Did you know?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Participating in clinical trials can give you access to new treatments before they are widely available.
                </p>
                <Button className="w-full" variant="outline">Learn More</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}