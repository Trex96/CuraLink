'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';
import { RecentPublications, CollaborationRequests, RelevantTrials, ForumActivity, ProfileStats } from './components';
import { ResearcherTrialsWidget } from '@/components/dashboard/ResearcherTrialsWidget';

interface Publication {
  _id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
}

interface Collaboration {
  _id: string;
  requesterName: string;
  requesterInstitution: string;
  context: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
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

interface ForumPost {
  _id: string;
  title: string;
  category: string;
  author: string;
  replies: number;
  lastActivity: string;
}

interface ProfileViewStat {
  date: string;
  count: number;
}

export default function ResearcherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [profileViews, setProfileViews] = useState<ProfileViewStat[]>([]);
  const [loading, setLoading] = useState({
    publications: true,
    collaborations: true,
    trials: true,
    forum: true,
    profileViews: true
  });
  const [errors, setErrors] = useState({
    publications: '',
    collaborations: '',
    trials: '',
    forum: '',
    profileViews: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch recent publications
      try {
        const res = await fetch('/api/dashboard/researcher/publications');
        if (!res.ok) throw new Error('Failed to fetch publications');
        const data = await res.json();
        setPublications(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, publications: err instanceof Error ? err.message : 'Failed to load publications' }));
      } finally {
        setLoading(prev => ({ ...prev, publications: false }));
      }

      // Fetch collaboration requests
      try {
        const res = await fetch('/api/dashboard/researcher/collaborations');
        if (!res.ok) throw new Error('Failed to fetch collaborations');
        const data = await res.json();
        setCollaborations(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, collaborations: err instanceof Error ? err.message : 'Failed to load collaborations' }));
      } finally {
        setLoading(prev => ({ ...prev, collaborations: false }));
      }

      // Fetch relevant trials
      try {
        const res = await fetch('/api/dashboard/researcher/trials');
        if (!res.ok) throw new Error('Failed to fetch trials');
        const data = await res.json();
        setTrials(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, trials: err instanceof Error ? err.message : 'Failed to load trials' }));
      } finally {
        setLoading(prev => ({ ...prev, trials: false }));
      }

      // Fetch forum activity
      try {
        const res = await fetch('/api/dashboard/researcher/forum-activity');
        if (!res.ok) throw new Error('Failed to fetch forum activity');
        const data = await res.json();
        setForumPosts(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, forum: err instanceof Error ? err.message : 'Failed to load forum activity' }));
      } finally {
        setLoading(prev => ({ ...prev, forum: false }));
      }

      // Fetch profile view statistics
      try {
        const res = await fetch('/api/dashboard/researcher/profile-views');
        if (!res.ok) throw new Error('Failed to fetch profile views');
        const data = await res.json();
        setProfileViews(data);
      } catch (err) {
        setErrors(prev => ({ ...prev, profileViews: err instanceof Error ? err.message : 'Failed to load profile views' }));
      } finally {
        setLoading(prev => ({ ...prev, profileViews: false }));
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in as a researcher to view this dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
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
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, Dr. {user?.name?.split(' ')[1] || 'Researcher'}</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your research today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/dashboard/researcher/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/researcher/publications">
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Publications
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/researcher/collaborations">
              <Users className="mr-2 h-4 w-4" />
              Message Collaborators
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="mb-8">
        <SearchBar
          placeholder="Search researchers, trials, or publications..."
          onSearch={handleSearch}
          className="max-w-2xl"
        />
      </div>

      {/* Trials & Applications Widget */}
      <div className="mb-8">
        <ResearcherTrialsWidget />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RecentPublications
          publications={publications}
          loading={loading.publications}
          error={errors.publications}
        />
        <CollaborationRequests
          collaborations={collaborations}
          loading={loading.collaborations}
          error={errors.collaborations}
        />
        <RelevantTrials
          trials={trials}
          loading={loading.trials}
          error={errors.trials}
        />
        <ForumActivity
          posts={forumPosts}
          loading={loading.forum}
          error={errors.forum}
        />
        <ProfileStats
          stats={profileViews}
          loading={loading.profileViews}
          error={errors.profileViews}
        />
      </div>
    </div>
  );
}