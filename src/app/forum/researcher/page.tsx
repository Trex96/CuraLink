'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UnansweredQuestionsWidget } from '@/components/forum/posts';
import { MyAnswersWidget } from '@/components/forum/posts';
import { ReputationBadge } from '@/components/forum/utilities';
import { QuickResponseTemplates } from '@/components/forum/utilities';
import { getResearcherStats } from '@/lib/services/forum';

export default function ResearcherForumDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    reputation: 0,
    answered: 0,
    unanswered: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (session?.user) {
          const data = await getResearcherStats((session.user as { id: string }).id);
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching researcher stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  return (
    <div className="container py-8">
      <PageHeader 
        title="Researcher Forum Dashboard" 
        description="Manage your professional discussions and help patients with your expertise."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <div className="flex items-center gap-2">
                <ReputationBadge reputation={stats.reputation} />
                <span className="text-2xl font-bold">{stats.reputation}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.answered}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unanswered in Your Field</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.unanswered}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <UnansweredQuestionsWidget />
          <MyAnswersWidget />
        </div>
        
        <div className="space-y-6">
          <QuickResponseTemplates />
        </div>
      </div>
    </div>
  );
}