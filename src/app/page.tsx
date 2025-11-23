'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Users,
  BookOpen,
  FlaskConical,
  MessageCircle,
  Trophy,
  TrendingUp,
  Star,
  MessageSquare,
  Heart,
  Bell,
  UserCheck,
  Loader2
} from 'lucide-react';
import GlobalSearchBar from '@/components/search/GlobalSearchBar';
import { ResearcherCard } from '@/components/cards/ResearcherCard';
import { PublicationCard } from '@/components/cards/PublicationCard';
import { TrialCard } from '@/components/cards/TrialCard';
import { ForumPostCard } from '@/components/cards/ForumPostCard';
import { useToast } from '@/components/ui/use-toast';

interface HomeData {
  researchers: any[];
  publications: any[];
  trials: any[];
  forumPosts: any[];
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>({
    researchers: [],
    publications: [],
    trials: [],
    forumPosts: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/home');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching home data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load home page data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to CuraLink</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connecting patients with medical research, clinical trials, and healthcare professionals
        </p>

        {/* Global Search Bar Demo */}
        <div className="max-w-2xl mx-auto mt-8">
          <GlobalSearchBar />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Researchers
            </CardTitle>
            <CardDescription>Find healthcare professionals and researchers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with experts in your field of interest
            </p>
            <Button asChild>
              <Link href="/search?tab=researchers">Browse Researchers</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Publications
            </CardTitle>
            <CardDescription>Access medical research and publications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover the latest research in healthcare
            </p>
            <Button asChild variant="outline">
              <Link href="/search?tab=publications">Browse Publications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="mr-2 h-5 w-5" />
              Clinical Trials
            </CardTitle>
            <CardDescription>Find ongoing clinical trials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Participate in cutting-edge medical research
            </p>
            <Button asChild variant="outline">
              <Link href="/search?tab=trials">Browse Trials</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Researchers Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Researchers</h2>
          <Button variant="outline" asChild>
            <Link href="/search?tab=researchers">
              <Users className="mr-2 h-4 w-4" />
              View All Researchers
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.researchers.map((researcher) => (
            <ResearcherCard
              key={researcher.id}
              researcher={researcher}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Recent Publications Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recent Publications</h2>
          <Button variant="outline" asChild>
            <Link href="/publications">
              <BookOpen className="mr-2 h-4 w-4" />
              View All Publications
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.publications.map((publication) => (
            <PublicationCard
              key={publication.id}
              publication={publication}
            />
          ))}
        </div>
      </div>

      {/* Active Clinical Trials Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Active Clinical Trials</h2>
          <Button variant="outline" asChild>
            <Link href="/trials">
              <FlaskConical className="mr-2 h-4 w-4" />
              View All Trials
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.trials.map((trial) => (
            <TrialCard
              key={trial.id}
              trial={trial}
            />
          ))}
        </div>
      </div>

      {/* Community Forum Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Community Forum</h2>
          <Button variant="outline" asChild>
            <Link href="/forum">
              <MessageCircle className="mr-2 h-4 w-4" />
              Visit Forum
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.forumPosts.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
            />
          ))}
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Advanced Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Powerful search capabilities to find researchers, publications, and trials
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Researcher Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verified researcher profiles with expertise and credentials
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Personalized Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI-powered matching based on your interests and conditions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-orange-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Community Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Active forum for discussions between patients and researchers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Platform Capabilities */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Platform Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Forum Commenting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Forum Commenting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Engage in discussions with rich commenting features including mentions, threaded replies, and upvoting.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Mention users with @username</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Threaded comment replies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Upvote valuable contributions</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/forum">Explore Forum</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Researcher Profiles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-500" />
                Researcher Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive researcher profiles with verified credentials, expertise, and contact information.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>ORCID integration for verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Detailed expertise and publications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Contact researchers directly</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/search?tab=researchers">View Researchers</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Publication Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Publication Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access to thousands of medical publications with advanced search and filtering capabilities.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Full-text search capabilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Citation tracking and metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>DOI integration for access</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/search?tab=publications">Browse Publications</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Clinical Trial Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-orange-500" />
                Clinical Trial Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Find relevant clinical trials with advanced filtering by condition, location, and eligibility criteria.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Location-based trial matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Eligibility checker</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Real-time enrollment status</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/search?tab=trials">Search Trials</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Messaging System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-teal-500" />
                Messaging System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Secure messaging between patients and researchers with real-time notifications.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>End-to-end encrypted messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Real-time notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>File sharing capabilities</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/messages">Open Messages</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Favorites & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <Bell className="h-5 w-5 text-yellow-500" />
                Personalization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Save favorite items and receive personalized notifications based on your interests.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Save researchers, trials, publications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Custom notification preferences</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>AI-powered recommendations</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href="/favorites">View Favorites</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How CuraLink Works */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">How CuraLink Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-muted rounded-lg">
            <Search className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Search</h3>
            <p className="text-sm text-muted-foreground">
              Find researchers, publications, and clinical trials with our powerful search
            </p>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-sm text-muted-foreground">
              Connect with healthcare professionals and researchers
            </p>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <FlaskConical className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Participate</h3>
            <p className="text-sm text-muted-foreground">
              Join clinical trials and contribute to medical research
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}