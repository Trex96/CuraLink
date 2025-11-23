'use client';

import { useState, useEffect, useCallback } from 'react';
import { ForumPostCard } from '@/components/forum/PostCard';
import { getPostsByDateRange } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface DateRangePostsProps {
  startDate: string;
  endDate: string;
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

export function DateRangePosts({ startDate, endDate }: DateRangePostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPostsByDateRange = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostsByDateRange(startDate, endDate);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts by date range:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);
  
  useEffect(() => {
    fetchPostsByDateRange();
  }, [startDate, endDate, fetchPostsByDateRange]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Posts from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Posts from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <ForumPostCard key={post._id} post={post} />
        ))
      ) : (
        <p className="text-muted-foreground text-sm">No posts found in this date range.</p>
      )}
    </div>
  );
}