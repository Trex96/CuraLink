'use client';

import { PageHeader } from '@/components/ui/page-header';
import { UserForumStats } from '@/components/forum/user';
import { UserEngagementScore } from '@/components/forum/user';
import { UserBadges } from '@/components/forum/user';
import { UserRecentActivity } from '@/components/forum/user';

export default function ForumProfilePage() {
  return (
    <div className="container py-8">
      <PageHeader 
        title="Your Forum Profile" 
        description="View your forum activity, achievements, and engagement."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <UserForumStats />
        </div>
        <div>
          <UserEngagementScore />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UserBadges />
        <UserRecentActivity />
      </div>
    </div>
  );
}