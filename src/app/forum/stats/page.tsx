'use client';

import { PageHeader } from '@/components/ui/page-header';
import { ForumStats } from '@/components/forum/analytics';
import { CategoryStats } from '@/components/forum/categories';
import { TrendingPosts } from '@/components/forum/posts';
import { MostUpvotedPosts } from '@/components/forum/posts';
import { MostCommentedPosts } from '@/components/forum/posts';

export default function ForumStatsPage() {
  return (
    <div className="container py-8">
      <PageHeader 
        title="Forum Statistics" 
        description="Explore community engagement and popular discussions."
      />
      
      <div className="mb-8">
        <ForumStats />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryStats />
        <TrendingPosts />
        <MostUpvotedPosts />
        <MostCommentedPosts />
      </div>
    </div>
  );
}