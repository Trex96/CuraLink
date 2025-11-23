'use client';

import { useState, useEffect } from 'react';
import { ResearcherOnlyThread } from './ResearcherOnlyThread';
import { Button } from '@/components/ui/button';
import { getResearcherThreads } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface Thread {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: string[];
  authorId: {
    firstName: string;
    lastName: string;
    institution: string;
  };
  createdAt: string;
  replyCount: number;
  isResearcherVerified?: boolean;
}

export function ResearcherThreadsDashboard() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchThreads();
  }, []);
  
  const fetchThreads = async () => {
    try {
      setLoading(true);
      const data = await getResearcherThreads();
      setThreads(data.posts);
    } catch (error) {
      console.error('Error fetching researcher threads:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Researcher Discussions</h3>
        <Button size="sm">New Thread</Button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <ResearcherOnlyThread key={thread._id} thread={thread} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No researcher discussions yet.</p>
              <p className="text-sm mt-2">Start a new thread to discuss research topics with other professionals.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}