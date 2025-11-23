'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrialFilters } from '@/components/trial/TrialFilters';
import { TrialCard } from '@/components/trial/TrialCard';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { ClinicalTrial } from '@/types';

interface Trial extends ClinicalTrial {
  isFavorite?: boolean;
  distance?: number;
  matchPercentage?: number;
}

export default function TrialsBrowsePage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    condition: '',
    status: '',
    phase: '',
    location: '',
    radius: 50,
    sortBy: 'relevance'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        condition: filters.condition,
        status: filters.status,
        phase: filters.phase,
        location: filters.location,
        radius: filters.radius.toString(),
        sortBy: filters.sortBy
      });

      const res = await fetch(`/api/trials?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch trials');

      const data = await res.json();
      // Filter out trials without nctNumber to prevent errors
      const validTrials = (data.trials || []).filter((t: Trial) => t.nctNumber);
      setTrials(validTrials);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trials');
      toast.error('Failed to load trials');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchTrials();
  }, [filters, page, fetchTrials]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleFavoriteToggle = async (trialId: string) => {
    try {
      const res = await fetch('/api/trials/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trialId })
      });

      if (!res.ok) throw new Error('Failed to update favorite status');

      const data = await res.json();

      // Update the trial in the list
      setTrials(prev => prev.map(trial =>
        trial._id === trialId ? { ...trial, isFavorite: data.isFavorite } : trial
      ));

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

  if (error && !loading) {
    return (
      <div className="container py-8">
        <PageHeader
          title="Clinical Trials"
          description="Browse and search for clinical trials"
        />
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Failed to load trials: {error}</p>
            <Button onClick={fetchTrials} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <PageHeader
        title="Clinical Trials"
        description="Browse and search for clinical trials"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <TrialFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Trials List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-4 w-1/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2">No trials found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={() => handleFilterChange({
                  condition: '',
                  status: '',
                  phase: '',
                  location: '',
                  radius: 50,
                  sortBy: 'relevance'
                })}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trials.map((trial) => (
                  <TrialCard
                    key={trial._id}
                    trial={{
                      ...trial,
                      isFavorite: trial.isFavorite,
                      distance: trial.distance,
                      matchPercentage: trial.matchPercentage
                    }}
                    onFavoriteToggle={handleFavoriteToggle}
                    onShare={handleShare}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>

                  <span className="flex items-center px-4">
                    Page {page} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}