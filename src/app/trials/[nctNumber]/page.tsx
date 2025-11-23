'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { TrialDetails } from '@/components/trial/TrialDetails';
import { LocationsList } from '@/components/trial/LocationsList';
import { EligibilityCheckerDialog } from '@/components/trial/EligibilityCheckerDialog';
import { toast } from 'sonner';
import { ClinicalTrial } from '@/types';
import { getCurrentLocation } from '@/lib/utils/location';

interface Trial extends ClinicalTrial {
  isFavorite?: boolean;
  distance?: number;
  matchPercentage?: number;
}

export default function TrialDetailPage({ params }: { params: Promise<{ nctNumber: string }> }) {
  const { nctNumber } = use(params);
  const router = useRouter();
  const [trial, setTrial] = useState<Trial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchTrial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/trials/${nctNumber}`);
      if (!res.ok) throw new Error('Failed to fetch trial');

      const data = await res.json();
      setTrial({
        ...data.trial,
        isFavorite: data.isFavorite
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trial');
      toast.error('Failed to load trial');
    } finally {
      setLoading(false);
    }
  }, [nctNumber]);

  const getUserLocation = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      setUserLocation({
        lat: position.latitude,
        lng: position.longitude
      });
    } catch (err) {
      console.error('Failed to get user location:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrial();
    getUserLocation();
  }, [nctNumber, fetchTrial, getUserLocation]);

  const handleFavoriteToggle = async (trialId: string) => {
    try {
      const res = await fetch('/api/trials/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trialId })
      });

      if (!res.ok) throw new Error('Failed to update favorite status');

      const data = await res.json();

      if (trial) {
        setTrial({
          ...trial,
          isFavorite: data.isFavorite
        });
      }

      toast.success(
        data.isFavorite
          ? 'Trial added to favorites'
          : 'Trial removed from favorites'
      );
    } catch (err) {
      toast.error('Failed to update favorite status');
      console.error(err);
    }
  };

  const handleShare = async (trialId: string) => {
    try {
      const res = await fetch('/api/trials/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trialId,
          method: 'link'
        })
      });

      if (!res.ok) throw new Error('Failed to share trial');

      const data = await res.json();

      // Copy link to clipboard
      await navigator.clipboard.writeText(data.shareLink);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to share trial');
      console.error(err);
    }
  };

  const handleEligibilityCheck = (result: {
    isEligible: boolean;
    matchPercentage: number;
    matchedCriteria: string[];
    unmatchedCriteria: string[];
  }) => {
    // Handle the eligibility check result
    console.log('Eligibility check result:', result);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to trials
        </Button>

        <div className="space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ))}
          </div>

          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to trials
        </Button>

        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Error Loading Trial</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchTrial}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to trials
        </Button>

        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Trial Not Found</h2>
          <p className="text-muted-foreground">The requested trial could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to trials
      </Button>

      <TrialDetails
        trial={trial}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
        userLocation={userLocation || undefined}
      />

      <div className="flex justify-center mt-6">
        <EligibilityCheckerDialog
          trial={trial}
          onEligibilityCheck={handleEligibilityCheck}
        />
      </div>

    </div>
  );
}