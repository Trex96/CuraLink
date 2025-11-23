'use client';

import { PageHeader } from '@/components/ui/page-header';
import { ForumLeaderboard } from '@/components/forum/analytics';
import { UserEngagementScore } from '@/components/forum/user';
import { ForumStats } from '@/components/forum/analytics';

export default function ForumLeaderboardPage() {
  return (
    <div className="container py-8">
      <PageHeader 
        title="Community Leaderboard" 
        description="Recognizing our most active and engaged community members."
      />
      
      <div className="mb-8">
        <UserEngagementScore />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ForumLeaderboard />
        </div>
        <div>
          <ForumStats />
        </div>
      </div>
    </div>
  );
}