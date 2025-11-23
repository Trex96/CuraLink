'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ResearcherTrialCard } from '@/components/trial/ResearcherTrialCard';
import { ImportTrialsDialog } from '@/components/trial/ImportTrialsDialog';
import { TrialDetailsEditor } from '@/components/trial/TrialDetailsEditor';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface Trial {
  _id: string;
  nctNumber: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  lastUpdated: string;
  locations: Array<{ address?: string }>;
  enrollment?: number;
  summary?: string;
}

export default function ResearcherTrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchTrials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trials/researcher/mine');
      if (response.ok) {
        const data = await response.json();
        setTrials(data.trials);
      }
    } catch (error) {
      console.error('Error fetching trials:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrials();
  }, [fetchTrials]);

  const handleEditClick = (trial: Trial) => {
    setEditingTrial(trial);
    setIsEditOpen(true);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="My Clinical Trials"
          description="Manage your clinical trials, update status, and track enrollment."
          className="mb-0"
        />
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.href = '/dashboard/researcher/trials/create'}
            variant="default"
          >
            Create New Trial
          </Button>
          <ImportTrialsDialog onImportSuccess={fetchTrials} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : trials.length === 0 ? (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>No trials found</AlertTitle>
          <AlertDescription>
            You haven&apos;t linked any clinical trials to your profile yet. Use the &quot;Import / Link Trials&quot; button to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trials.map((trial) => (
            <ResearcherTrialCard
              key={trial._id}
              trial={trial}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      )}

      <TrialDetailsEditor
        trial={editingTrial}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSaveSuccess={fetchTrials}
      />
    </div>
  );
}