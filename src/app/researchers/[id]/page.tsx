'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, FlaskConical } from 'lucide-react';

// Import the new components
import { ResearcherHeader } from '@/components/researcher-profile/ResearcherHeader';
import { ResearcherBio } from '@/components/researcher-profile/ResearcherBio';
import { ExpertiseSection } from '@/components/researcher-profile/ExpertiseSection';
import { PublicationsList } from '@/components/researcher-profile/PublicationsList';
import { TrialsList } from '@/components/researcher-profile/TrialsList';
import { RequestExpertButton } from '@/components/researcher-profile/RequestExpertButton';
import { ContactSection } from '@/components/researcher-profile/ContactSection';
import { Researcher, Publication, Trial } from '@/components/researcher-profile/types';

export default function ResearcherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  // const [isRequesting, setIsRequesting] = useState(false);
  // const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  useEffect(() => {
    const fetchResearcherData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/researchers/${id}`);
        if (!res.ok) throw new Error('Failed to fetch researcher data');
        const data = await res.json();
        setResearcher(data.researcher);
        setPublications(data.publications);
        setTrials(data.trials);
        setIsFavorite(data.isFavorite);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load researcher data');
      } finally {
        setLoading(false);
      }
    };

    fetchResearcherData();
  }, [id]);

  const handleFavoriteToggle = async () => {
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemType: 'researcher',
          itemId: id
        }),
      });
      
      if (!res.ok) throw new Error('Failed to update favorite status');
      
      const data = await res.json();
      setIsFavorite(data.isFavorite);
      
      toast.success(
        data.isFavorite 
          ? 'Researcher added to favorites' 
          : 'Researcher removed from favorites'
      );
    } catch (err) {
      toast.error('Failed to update favorite status');
      console.error(err);
    }
  };

  const handleRequestExpert = async (message: string) => {
    try {
      // setIsRequesting(true);
      
      const res = await fetch(`/api/researchers/${id}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      if (!res.ok) throw new Error('Failed to send request');
      
      toast.success('Request sent successfully!');
      return true;
    } catch (err) {
      toast.error('Failed to send request');
      console.error(err);
      return false;
    } finally {
      // setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search results
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Publications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Trials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search results
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Failed to load researcher profile: {error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Back to search results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!researcher) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search results
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Researcher Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The requested researcher could not be found.</p>
            <Button onClick={() => router.back()} className="mt-4">
              Back to search results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to search results
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Researcher Header */}
          <Card>
            <CardContent className="p-6">
              <ResearcherHeader 
                researcher={researcher}
                isFavorite={isFavorite}
                onFavoriteToggle={handleFavoriteToggle}
                onRequestExpert={() => {}}
              />
            </CardContent>
          </Card>
          
          {/* Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle>Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResearcherBio bio={researcher.bio} />
            </CardContent>
          </Card>
          
          {/* Expertise Section */}
          <Card>
            <CardHeader>
              <CardTitle>Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpertiseSection expertise={researcher.expertise} />
            </CardContent>
          </Card>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactSection researcher={researcher} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Publications and Trials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Publications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PublicationsList publications={publications} />
          </CardContent>
        </Card>
        
        {/* Active Trials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="mr-2 h-5 w-5" />
              Active Trials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrialsList trials={trials} />
          </CardContent>
        </Card>
      </div>
      
      {/* Request Expert Dialog */}
      <RequestExpertButton 
        researcher={researcher!} 
        onSendRequest={handleRequestExpert} 
      />
    </div>
  );
}