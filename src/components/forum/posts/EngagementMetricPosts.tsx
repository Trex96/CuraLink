'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getPostsByEngagementMetrics } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface EngagementMetricPostsProps {
  metrics: {
    minReplies?: number;
    minUpvotes?: number;
    minViews?: number;
  };
}

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: string[];
  authorId: {
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt: string;
  replyCount: number;
  isResearcherVerified?: boolean;
}

export function EngagementMetricPosts({ metrics }: EngagementMetricPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByEngagementMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const postsByMetrics = await getPostsByEngagementMetrics(metrics);
      setPosts(postsByMetrics);
    } catch (error) {
      console.error('Error fetching posts by engagement metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [metrics]);
  
  useEffect(() => {
    fetchPostsByEngagementMetrics();
  }, [metrics, fetchPostsByEngagementMetrics]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Popular Posts</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Popular Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts match the engagement criteria.</p>
      )}
    </div>
  );
}